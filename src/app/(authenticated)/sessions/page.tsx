'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../lib/AuthContext';
import { getUserSessionHistory, endUserSession, UserSession } from '../../../lib/sessionUtils';
import { FaDesktop, FaMobile, FaTablet, FaClock, FaCheckCircle, FaTimesCircle, FaTrash } from 'react-icons/fa';

export default function UserSessionsPage() {
  const { user, currentSessionId } = useAuth();
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchSessions();
  }, [user]);

  const fetchSessions = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await getUserSessionHistory();
      
      if (error) throw error;
      
      setSessions(data || []);
    } catch (err: any) {
      console.error('Erreur lors de la récupération des sessions:', err);
      setError(err.message || 'Une erreur est survenue lors de la récupération des sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleEndSession = async (sessionId: string) => {
    if (sessionId === currentSessionId) {
      setMessage({
        type: 'error',
        text: 'Vous ne pouvez pas mettre fin à votre session actuelle ici. Utilisez le bouton de déconnexion.'
      });
      return;
    }
    
    try {
      setLoading(true);
      const { error } = await endUserSession(sessionId);
      
      if (error) throw error;
      
      // Mettre à jour la liste des sessions
      setMessage({
        type: 'success',
        text: 'Session terminée avec succès'
      });
      
      await fetchSessions();
    } catch (err: any) {
      console.error('Erreur lors de la fermeture de la session:', err);
      setMessage({
        type: 'error',
        text: err.message || 'Une erreur est survenue lors de la fermeture de la session'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getDeviceIcon = (userAgent: string) => {
    if (!userAgent) return <FaDesktop />;
    
    const isMobile = /mobile|android|iphone/i.test(userAgent);
    const isTablet = /ipad|tablet/i.test(userAgent);
    
    if (isTablet) return <FaTablet />;
    if (isMobile) return <FaMobile />;
    return <FaDesktop />;
  };

  const getDeviceName = (userAgent: string) => {
    if (!userAgent) return 'Appareil inconnu';
    
    let deviceName = 'Ordinateur';
    
    if (/mobile|android|iphone/i.test(userAgent)) {
      deviceName = 'Mobile';
    } else if (/ipad|tablet/i.test(userAgent)) {
      deviceName = 'Tablette';
    }
    
    // Détecter le navigateur
    let browserName = '';
    if (/chrome/i.test(userAgent)) browserName = 'Chrome';
    else if (/firefox/i.test(userAgent)) browserName = 'Firefox';
    else if (/safari/i.test(userAgent) && !/chrome/i.test(userAgent)) browserName = 'Safari';
    else if (/edge/i.test(userAgent)) browserName = 'Edge';
    else if (/opera/i.test(userAgent) || /opr/i.test(userAgent)) browserName = 'Opera';
    else browserName = 'Navigateur';
    
    // Détecter l'OS
    let os = '';
    if (/windows/i.test(userAgent)) os = 'Windows';
    else if (/macintosh|mac os/i.test(userAgent)) os = 'macOS';
    else if (/linux/i.test(userAgent)) os = 'Linux';
    else if (/android/i.test(userAgent)) os = 'Android';
    else if (/iphone|ipad|ipod/i.test(userAgent)) os = 'iOS';
    
    return `${deviceName} - ${browserName} sur ${os}`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Mes sessions</h1>
        <p className="text-gray-400">
          Gérez vos sessions de connexion et la sécurité de votre compte
        </p>
      </header>
      
      {message && (
        <div className={`p-3 mb-6 rounded-md ${
          message.type === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
        }`}>
          {message.text}
        </div>
      )}
      
      {error && (
        <div className="p-4 mb-4 rounded-md bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100">
          {error}
        </div>
      )}
      
      <div className="bg-[#1E1E1E] shadow rounded-lg border border-gray-800 p-6">
        <h2 className="text-xl font-semibold mb-4">Sessions actives</h2>
        
        {loading ? (
          <div className="flex justify-center py-6">
            <p>Chargement des sessions...</p>
          </div>
        ) : sessions.length > 0 ? (
          <div className="space-y-4">
            {sessions.map((session) => (
              <div 
                key={session.id} 
                className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-lg border ${
                  session.id === currentSessionId 
                    ? 'bg-blue-900/20 border-blue-600/50' 
                    : 'bg-gray-800/20 border-gray-700'
                }`}
              >
                <div className="flex items-center gap-4 mb-3 sm:mb-0">
                  <div className="p-3 bg-gray-800 rounded-full">
                    {getDeviceIcon(session.user_agent || '')}
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {getDeviceName(session.user_agent || '')}
                      </span>
                      {session.id === currentSessionId && (
                        <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">
                          Session actuelle
                        </span>
                      )}
                    </div>
                    
                    <div className="text-sm text-gray-400 mt-1">
                      <div className="flex items-center gap-1">
                        <FaClock className="text-xs" />
                        <span>Dernière activité: {formatDate(session.last_active)}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        {session.is_active 
                          ? <FaCheckCircle className="text-green-500 text-xs" /> 
                          : <FaTimesCircle className="text-red-500 text-xs" />
                        }
                        <span>Statut: {session.is_active ? 'Active' : 'Terminée'}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {session.is_active && session.id !== currentSessionId && (
                  <button
                    onClick={() => handleEndSession(session.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
                  >
                    <FaTrash className="text-xs" />
                    <span>Terminer la session</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-400">
            <p>Aucune session trouvée</p>
          </div>
        )}
        
        <div className="mt-8">
          <h3 className="text-lg font-medium mb-2">À propos des sessions</h3>
          <p className="text-gray-400 text-sm mb-4">
            Les sessions sont créées lorsque vous vous connectez à votre compte. Vous pouvez voir toutes vos sessions
            actives et mettre fin à celles que vous ne reconnaissez pas pour renforcer la sécurité de votre compte.
          </p>
          <p className="text-gray-400 text-sm">
            Si vous ne reconnaissez pas une session, nous vous recommandons de la terminer immédiatement et de changer votre mot de passe.
          </p>
        </div>
      </div>
    </div>
  );
} 