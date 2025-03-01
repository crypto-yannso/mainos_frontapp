import type { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import fs from 'fs';

// Simulation de l'API pour la récupération de rapports
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  
  if (req.method === 'GET') {
    // Simuler un délai de traitement
    await new Promise(resolve => setTimeout(resolve, 800));
    
    try {
      // Vérifier si l'endpoint demande le téléchargement du fichier
      if (req.query.download === 'true') {
        try {
          // Chemin vers un fichier PDF d'exemple (vous devrez créer ce fichier)
          // const filePath = path.join(process.cwd(), 'public', 'example-report.pdf');
          
          // Si vous n'avez pas de fichier PDF, générez une réponse simulée
          // Simulation d'un PDF (non valide, juste pour le test)
          const mockPdfContent = Buffer.from('Ceci est un PDF simulé pour le test', 'utf-8');
          
          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader('Content-Disposition', `attachment; filename="rapport-${id}.pdf"`);
          return res.send(mockPdfContent);
          
          // Version avec fichier réel:
          // return res.send(fs.readFileSync(filePath));
        } catch (error) {
          console.error('Erreur lors du téléchargement du rapport:', error);
          return res.status(404).json({ error: 'Rapport non trouvé' });
        }
      }
      
      // Réponse standard pour GET sans téléchargement
      return res.status(200).json({
        report_id: id,
        status: 'completed',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        report_url: `/api/mock-mainos/rapport/${id}?download=true`,
        metadata: {
          title: 'Rapport simulé',
          pages: 5,
          size: '1.2 MB'
        }
      });
    } catch (error) {
      console.error('Erreur dans la simulation API:', error);
      return res.status(500).json({ error: 'Erreur lors de la récupération du rapport' });
    }
  } else {
    // Méthode non autorisée
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 