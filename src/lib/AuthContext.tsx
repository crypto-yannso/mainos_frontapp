'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { createUserSession, endUserSession } from './sessionUtils';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  currentSessionId: string | null;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<any>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  useEffect(() => {
    // Vérifier l'état de l'authentification actuelle
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        
        // Si l'utilisateur est authentifié, créer ou récupérer une session
        if (user) {
          await initSession(user);
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de l\'utilisateur :', error);
      } finally {
        setLoading(false);
      }
    };

    // Initialiser une session pour un utilisateur authentifié
    const initSession = async (user: User) => {
      try {
        // Vérifier s'il existe déjà un ID de session dans le localStorage
        const existingSessionId = localStorage.getItem('userSessionId');
        
        if (existingSessionId) {
          // Utiliser l'ID de session existant
          setCurrentSessionId(existingSessionId);
        } else {
          // Créer une nouvelle session
          const { data, error } = await createUserSession({
            auth_method: 'email_password'
          });
          
          if (error) throw error;
          
          if (data && data.length > 0) {
            const sessionId = data[0].id;
            setCurrentSessionId(sessionId);
            localStorage.setItem('userSessionId', sessionId);
          }
        }
      } catch (error) {
        console.error('Erreur lors de l\'initialisation de la session :', error);
      }
    };

    // Écouter les changements d'état d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const newUser = session?.user ?? null;
      setUser(newUser);
      
      if (newUser) {
        await initSession(newUser);
      } else {
        // Si déconnexion, terminer la session
        const sessionId = localStorage.getItem('userSessionId');
        if (sessionId) {
          await endUserSession(sessionId);
          localStorage.removeItem('userSessionId');
          setCurrentSessionId(null);
        }
      }
      
      setLoading(false);
    });

    checkUser();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    return supabase.auth.signInWithPassword({ email, password });
  };

  const signUp = async (email: string, password: string) => {
    return supabase.auth.signUp({ email, password });
  };

  const signOut = async () => {
    // Terminer la session avant de se déconnecter
    const sessionId = localStorage.getItem('userSessionId');
    if (sessionId) {
      await endUserSession(sessionId);
      localStorage.removeItem('userSessionId');
      setCurrentSessionId(null);
    }
    
    return supabase.auth.signOut();
  };

  const value = {
    user,
    loading,
    currentSessionId,
    signIn,
    signUp,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
} 