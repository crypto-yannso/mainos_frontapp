'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../lib/AuthContext';
import { supabase } from '../../../lib/supabase';
import { FaUser, FaCheck, FaKey, FaBell, FaMoon, FaShieldAlt, FaCog } from 'react-icons/fa';

export default function SettingsPage() {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    // Récupérer les informations de l'utilisateur
    const fetchUserProfile = async () => {
      if (!user) return;
      
      setEmail(user.email || '');
      
      try {
        // Récupérer le profil depuis Supabase
        const { data, error } = await supabase
          .from('profiles')
          .select('username, dark_mode, notifications')
          .eq('id', user.id)
          .single();
        
        if (error) {
          console.error('Erreur lors de la récupération du profil:', error);
          return;
        }
        
        if (data) {
          setUsername(data.username || '');
          setDarkMode(data.dark_mode || false);
          setNotifications(data.notifications || false);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du profil:', error);
      }
    };
    
    fetchUserProfile();
  }, [user]);

  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    setMessage(null);
    
    try {
      // Mettre à jour le profil dans Supabase
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          username,
          dark_mode: darkMode,
          notifications,
          updated_at: new Date().toISOString(),
        });
      
      if (error) throw error;
      
      setMessage({
        type: 'success',
        text: 'Paramètres enregistrés avec succès'
      });
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Une erreur est survenue lors de l\'enregistrement des paramètres'
      });
      console.error('Erreur lors de la mise à jour du profil:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderProfileSection = () => (
    <div className="space-y-6">
      {/* Avatar */}
      <div className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-[#242424] rounded-lg border border-gray-700">
        <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center">
          <FaUser className="text-white text-3xl" />
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h3 className="font-medium text-lg mb-1">{username || email}</h3>
          <p className="text-gray-400 text-sm mb-3">{email}</p>
          <button 
            className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors text-sm"
            onClick={() => alert("Fonctionnalité à venir")}
          >
            Modifier l'avatar
          </button>
        </div>
      </div>

      {/* Informations du compte */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Adresse e-mail
          </label>
          <input 
            type="email" 
            className="w-full rounded-md border border-gray-700 p-2 bg-gray-800 text-white"
            placeholder="votre@email.com"
            value={email}
            disabled
          />
          <p className="text-sm text-gray-400 mt-1">L'e-mail ne peut pas être modifié</p>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Nom d'utilisateur
          </label>
          <input 
            type="text" 
            className="w-full rounded-md border border-gray-700 p-2 bg-gray-800 text-white"
            placeholder="Nom d'utilisateur"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
      </div>
    </div>
  );

  const renderPreferencesSection = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex justify-between items-center py-3 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <FaMoon className="text-gray-400" />
            <div>
              <p className="font-medium">Mode sombre</p>
              <p className="text-sm text-gray-400">Activer le thème sombre pour l'interface</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer"
              checked={darkMode}
              onChange={(e) => setDarkMode(e.target.checked)}
            />
            <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
        
        <div className="flex justify-between items-center py-3 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <FaBell className="text-gray-400" />
            <div>
              <p className="font-medium">Notifications</p>
              <p className="text-sm text-gray-400">Recevoir des notifications par email</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer"
              checked={notifications}
              onChange={(e) => setNotifications(e.target.checked)}
            />
            <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Paramètres du compte</h1>
        <p className="text-gray-400">
          Gérez votre profil et vos préférences
        </p>
      </header>
      
      {message && (
        <div className={`p-3 mb-6 rounded-md ${
          message.type === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
        }`}>
          {message.text}
        </div>
      )}
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Navigation des paramètres */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-[#1E1E1E] shadow rounded-lg p-4 border border-gray-800 sticky top-4">
            <div className="space-y-1">
              <button 
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-md transition-colors text-left ${activeTab === 'profile' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
                onClick={() => setActiveTab('profile')}
              >
                <FaUser />
                <span>Profil</span>
              </button>
              <button 
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-md transition-colors text-left ${activeTab === 'preferences' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
                onClick={() => setActiveTab('preferences')}
              >
                <FaCog />
                <span>Préférences</span>
              </button>
              <button 
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-md transition-colors text-left ${activeTab === 'security' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
                onClick={() => setActiveTab('security')}
              >
                <FaShieldAlt />
                <span>Sécurité</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Contenu principal */}
        <div className="flex-1">
          <form onSubmit={saveSettings}>
            <div className="bg-[#1E1E1E] shadow rounded-lg p-6 border border-gray-800">
              {activeTab === 'profile' && renderProfileSection()}
              {activeTab === 'preferences' && renderPreferencesSection()}
              {activeTab === 'security' && (
                <div className="text-center py-6 text-gray-400">
                  <p>Les paramètres de sécurité seront bientôt disponibles.</p>
                </div>
              )}
              
              <div className="mt-6 flex justify-end">
                <button 
                  type="submit"
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
                  disabled={loading}
                >
                  {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
                  {!loading && <FaCheck />}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 