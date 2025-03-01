'use client';

import { useAuth } from '../../../lib/AuthContext';
import Chat from '../../../components/Chat';

export default function ConversationsPage() {
  const { user } = useAuth();
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Conversations</h1>
        <p className="text-gray-400">
          Gérez vos conversations et messages
        </p>
      </header>
      
      <div className="bg-[#1E1E1E] shadow rounded-lg border border-gray-800 p-6">
        <h2 className="text-xl font-semibold mb-4">Historique des conversations</h2>
        
        <div className="mt-4">
          <Chat />
        </div>
        
        <div className="mt-8">
          <h3 className="text-lg font-medium mb-2">À propos des conversations</h3>
          <p className="text-gray-400 text-sm mb-4">
            Vos conversations sont enregistrées et vous pouvez les consulter à tout moment.
            Toutes vos données sont sécurisées et respectent votre vie privée.
          </p>
        </div>
      </div>
    </div>
  );
} 