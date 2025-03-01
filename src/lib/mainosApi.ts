import { ReportType } from './dbUtils';

// Types pour l'API Mainos
export type MainosRequestType = {
  topic: string;
  type_rapport: string;
  ton?: string;
  longueur?: string;
  format_sortie: string[];
  benchmark_qualite?: boolean;
  options_specifiques?: Record<string, any>;
};

export type MainosResponseType = {
  report_id: string;
  status: string;
  message: string;
};

export type MainosReportType = {
  report_id: string;
  topic: string;
  type_rapport: string;
  contenu: {
    title: string;
    sections: any;
    sources: any[];
    metadata: any;
  };
  metadata: {
    ton: string;
    longueur: string;
    generated_at: string;
  };
  benchmark_score?: number;
  formats_disponibles: string[];
};

// Configuration de base de l'API
// Utiliser le proxy API de Next.js pour contourner les problèmes CORS
// Adapter le chemin pour être compatible avec le App Router
const API_BASE_URL = '/api/proxy-mainos';
const API_KEY = process.env.NEXT_PUBLIC_MAINOS_API_KEY || '';

// Fonction pour créer un rapport via l'API Mainos
export const createMainosReport = async (requestData: MainosRequestType): Promise<MainosResponseType> => {
  try {
    const response = await fetch(`${API_BASE_URL}?endpoint=rapport`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY
      },
      body: JSON.stringify(requestData)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Erreur inconnue' }));
      throw new Error(errorData.message || 'Erreur lors de la création du rapport');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Erreur API Mainos:', error);
    throw error;
  }
};

// Fonction pour récupérer un rapport spécifique
export const getMainosReport = async (reportId: string): Promise<MainosReportType> => {
  try {
    const response = await fetch(`${API_BASE_URL}?endpoint=rapport/${reportId}`, {
      headers: {
        'X-API-Key': API_KEY
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Erreur inconnue' }));
      throw new Error(errorData.message || 'Erreur lors de la récupération du rapport');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Erreur API Mainos:', error);
    throw error;
  }
};

// Fonction pour télécharger un rapport dans un format spécifique
export const downloadMainosReport = async (reportId: string, format: string = 'pdf'): Promise<Blob> => {
  try {
    const response = await fetch(`${API_BASE_URL}?endpoint=rapport/${reportId}/download&format=${format}`, {
      headers: {
        'X-API-Key': API_KEY
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Erreur inconnue' }));
      throw new Error(errorData.message || 'Erreur lors du téléchargement du rapport');
    }

    return await response.blob();
  } catch (error: any) {
    console.error('Erreur API Mainos:', error);
    throw error;
  }
};

// Fonction pour mapper les types de rapports de l'application aux types de l'API
export const mapReportTypeToMainosType = (type: string): string => {
  const typeMapping: Record<string, string> = {
    'Analyse de marché': 'analyse_marche',
    'Rapport SWOT': 'analyse_swot',
    'Newsletter': 'newsletter',
    'Cours/Tutoriel': 'tutoriel'
  };
  
  return typeMapping[type] || 'analyse_marche';
};

// Fonction pour mapper les formats de l'application aux formats de l'API
export const mapFormatToMainosFormat = (format: string): string => {
  const formatMapping: Record<string, string> = {
    'PDF': 'pdf',
    'DOCX': 'docx',
    'MD': 'markdown',
    'PPTX': 'pptx',
    'Text': 'text'
  };
  
  return formatMapping[format] || 'text';
}; 