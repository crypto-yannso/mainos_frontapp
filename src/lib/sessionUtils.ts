import { supabase } from './supabase';

/**
 * Type pour les données de session utilisateur
 */
export type UserSession = {
  id: string;
  user_id: string;
  ip_address?: string;
  user_agent?: string;
  last_active: string;
  created_at: string;
  is_active: boolean;
  metadata?: any;
};

/**
 * Crée une nouvelle entrée de session pour un utilisateur
 * @param metadata Données supplémentaires à stocker avec la session
 * @returns L'objet session créé ou une erreur
 */
export const createUserSession = async (metadata?: any) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { 
      error: { message: 'Utilisateur non authentifié' },
      data: null 
    };
  }
  
  // Récupérer des informations du navigateur côté client
  let userAgent = '';
  let ipAddress = '';
  
  if (typeof window !== 'undefined') {
    userAgent = window.navigator.userAgent;
  }

  const { data, error } = await supabase
    .from('user_sessions')
    .insert({
      user_id: user.id,
      ip_address: ipAddress,
      user_agent: userAgent,
      last_active: new Date().toISOString(),
      created_at: new Date().toISOString(),
      is_active: true,
      metadata: metadata || {}
    })
    .select();
    
  return { data, error };
};

/**
 * Met à jour la dernière activité de la session courante
 * @param sessionId ID de la session à mettre à jour
 * @returns Résultat de la mise à jour
 */
export const updateSessionActivity = async (sessionId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { 
      error: { message: 'Utilisateur non authentifié' },
      data: null 
    };
  }
  
  const { data, error } = await supabase
    .from('user_sessions')
    .update({
      last_active: new Date().toISOString()
    })
    .eq('id', sessionId)
    .eq('user_id', user.id)
    .select();
    
  return { data, error };
};

/**
 * Termine une session utilisateur (par exemple lors de la déconnexion)
 * @param sessionId ID de la session à terminer
 * @returns Résultat de la clôture de session
 */
export const endUserSession = async (sessionId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { 
      error: { message: 'Utilisateur non authentifié' }  
    };
  }
  
  const { data, error } = await supabase
    .from('user_sessions')
    .update({
      is_active: false,
      last_active: new Date().toISOString()
    })
    .eq('id', sessionId)
    .eq('user_id', user.id)
    .select();
    
  return { data, error };
};

/**
 * Récupère toutes les sessions actives d'un utilisateur
 */
export const getUserActiveSessions = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { 
      error: { message: 'Utilisateur non authentifié' },
      data: null 
    };
  }
  
  const { data, error } = await supabase
    .from('user_sessions')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('last_active', { ascending: false });
    
  return { data, error };
};

/**
 * Récupère l'historique complet des sessions d'un utilisateur
 */
export const getUserSessionHistory = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { 
      error: { message: 'Utilisateur non authentifié' },
      data: null 
    };
  }
  
  const { data, error } = await supabase
    .from('user_sessions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
    
  return { data, error };
}; 