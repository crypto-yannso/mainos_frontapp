import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  return await handleRequest(request, 'POST');
}

export async function GET(request: NextRequest) {
  return await handleRequest(request, 'GET');
}

export async function PUT(request: NextRequest) {
  return await handleRequest(request, 'PUT');
}

export async function DELETE(request: NextRequest) {
  return await handleRequest(request, 'DELETE');
}

async function handleRequest(request: NextRequest, method: string) {
  const searchParams = request.nextUrl.searchParams;
  const endpoint = searchParams.get('endpoint');
  const apiKey = process.env.NEXT_PUBLIC_MAINOS_API_KEY;
  const apiUrl = process.env.NEXT_PUBLIC_MAINOS_API_URL || 'http://127.0.0.1:8080';
  
  if (!apiKey) {
    return NextResponse.json({ error: 'Clé API non configurée' }, { status: 500 });
  }
  
  // Déterminer l'URL cible
  let targetUrl = '';
  if (!endpoint) {
    targetUrl = `${apiUrl}/api/rapport`;
  } else {
    targetUrl = `${apiUrl}/api/${endpoint}`;
  }
  
  // Ajouter les paramètres de requête, en excluant 'endpoint'
  const queryParams = new URLSearchParams();
  searchParams.forEach((value, key) => {
    if (key !== 'endpoint') {
      queryParams.append(key, value);
    }
  });
  
  if (queryParams.size > 0) {
    targetUrl = `${targetUrl}?${queryParams.toString()}`;
  }
  
  console.log(`Requête proxy vers: ${targetUrl}, méthode: ${method}`);
  
  try {
    const fetchOptions: RequestInit = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey
      }
    };
    
    // Ajouter le corps de la requête pour les méthodes non-GET
    if (method !== 'GET') {
      try {
        const body = await request.json();
        fetchOptions.body = JSON.stringify(body);
      } catch (e) {
        // Si request.json() échoue, essayer de lire le texte brut
        const text = await request.text();
        if (text) {
          fetchOptions.body = text;
        }
      }
    }
    
    const response = await fetch(targetUrl, fetchOptions);
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    } else if (contentType && contentType.includes('application/pdf')) {
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      
      return new NextResponse(arrayBuffer, {
        status: response.status,
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': response.headers.get('Content-Disposition') || 'attachment'
        }
      });
    } else {
      // Fallback pour les autres types de contenu
      const text = await response.text();
      return new NextResponse(text, {
        status: response.status,
        headers: {
          'Content-Type': contentType || 'text/plain'
        }
      });
    }
  } catch (error: any) {
    console.error('Erreur proxy Mainos:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la communication avec l\'API Mainos', details: error.message },
      { status: 500 }
    );
  }
} 