import { supabase } from './supabase';
import { createMainosReport, getMainosReport, mapReportTypeToMainosType, mapFormatToMainosFormat } from './mainosApi';

// Type de base pour tous les rapports
export type ReportType = {
  id?: string;
  user_id: string;
  title: string;
  type: string;
  content?: string;
  format?: string;
  status?: string;
  created_at?: string;
  mainos_report_id?: string; // Nouvel attribut pour stocker l'ID du rapport Mainos
};

// Créer un nouveau rapport
export const createReport = async (reportData: Omit<ReportType, 'user_id'>) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { 
      error: { message: 'Utilisateur non authentifié' },
      data: null 
    };
  }
  
  try {
    // Préparer les données pour l'API Mainos
    const mainosRequest = {
      topic: reportData.title,
      type_rapport: mapReportTypeToMainosType(reportData.type),
      ton: 'professionnel', // Par défaut, peut être personnalisé
      longueur: 'moyenne', // Par défaut, peut être personnalisé
      format_sortie: [mapFormatToMainosFormat(reportData.format || 'text')],
      benchmark_qualite: true
    };
    
    // Appeler l'API Mainos pour créer le rapport
    const mainosResponse = await createMainosReport(mainosRequest);
    
    // Stocker les informations du rapport dans Supabase
    const { data, error } = await supabase
      .from('reports')
      .insert({
        user_id: user.id,
        title: reportData.title,
        type: reportData.type,
        content: reportData.content || '',
        format: reportData.format || 'text',
        status: 'processing', // Commencer par "processing" puisque le rapport est en cours de génération
        created_at: new Date().toISOString(),
        mainos_report_id: mainosResponse.report_id // Stocker l'ID du rapport Mainos
      })
      .select();
      
    return { data, error, mainosReportId: mainosResponse.report_id };
  } catch (error: any) {
    console.error('Erreur lors de la création du rapport:', error);
    return { 
      error: { message: error.message || 'Erreur lors de la création du rapport' }, 
      data: null 
    };
  }
};

// Récupérer tous les rapports d'un utilisateur
export const getUserReports = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { 
      error: { message: 'Utilisateur non authentifié' }, 
      data: null 
    };
  }
  
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
    
  return { data, error };
};

// Récupérer un rapport spécifique par ID
export const getReportById = async (reportId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { 
      error: { message: 'Utilisateur non authentifié' },
      data: null 
    };
  }
  
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('id', reportId)
    .eq('user_id', user.id)
    .single();
    
  return { data, error };
};

// Mettre à jour un rapport existant
export const updateReport = async (reportId: string, updates: Partial<ReportType>) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { 
      error: { message: 'Utilisateur non authentifié' },
      data: null 
    };
  }
  
  const { data, error } = await supabase
    .from('reports')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', reportId)
    .eq('user_id', user.id)
    .select();
    
  return { data, error };
};

// Supprimer un rapport
export const deleteReport = async (reportId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { 
      error: { message: 'Utilisateur non authentifié' } 
    };
  }
  
  const { error } = await supabase
    .from('reports')
    .delete()
    .eq('id', reportId)
    .eq('user_id', user.id);
    
  return { error };
};

// Fonction pour insérer une conversation
export const insertConversation = async (message: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: { message: 'Utilisateur non authentifié' } };
  }
  
  const { data, error } = await supabase
    .from('conversations')
    .insert({
      user_id: user.id,
      message,
    })
    .select();
    
  return { data, error };
};

// Fonction pour récupérer les conversations d'un utilisateur
export const getUserConversations = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: { message: 'Utilisateur non authentifié' } };
  }
  
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
    
  return { data, error };
};

// Fonction pour vérifier et mettre à jour le statut d'un rapport
export const checkReportStatus = async (reportId: string, mainosReportId: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { 
        error: { message: 'Utilisateur non authentifié' },
        data: null,
        reportStatus: 'error'
      };
    }
    
    // Récupérer le rapport depuis l'API Mainos
    const mainosReport = await getMainosReport(mainosReportId);
    
    // Mettre à jour le rapport dans Supabase
    if (mainosReport.contenu) {
      const { data, error } = await supabase
        .from('reports')
        .update({
          content: JSON.stringify(mainosReport.contenu),
          status: 'completed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', reportId)
        .eq('user_id', user.id)
        .select();
        
      return { data, error, reportStatus: 'completed' };
    }
    
    return { data: null, error: null, reportStatus: 'processing' };
  } catch (error: any) {
    console.error('Erreur lors de la vérification du statut du rapport:', error);
    return { 
      error: { message: error.message || 'Erreur lors de la vérification du statut du rapport' }, 
      data: null,
      reportStatus: 'error'
    };
  }
}; 