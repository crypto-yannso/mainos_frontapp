import type { NextApiRequest, NextApiResponse } from 'next';
import { v4 as uuidv4 } from 'uuid';

// Simulation de l'API pour la création de rapports
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    // Simuler un délai de traitement
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      // Récupérer les données de la requête
      const requestData = req.body;
      
      // Générer un ID unique pour le rapport
      const reportId = uuidv4();
      
      // Répondre avec les données du rapport créé
      return res.status(200).json({
        report_id: reportId,
        status: 'processing',
        message: 'Le rapport est en cours de génération'
      });
    } catch (error) {
      console.error('Erreur dans la simulation API:', error);
      return res.status(500).json({ error: 'Erreur lors de la création du rapport' });
    }
  } else {
    // Méthode non autorisée
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 