import React, { useState, useEffect } from 'react';
import { insertConversation, getUserConversations } from '../lib/dbUtils';
import { FaPaperPlane, FaSpinner, FaClock } from 'react-icons/fa';

export default function Chat() {
  const [message, setMessage] = useState('');
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true);
        const { data, error } = await getUserConversations();
        
        if (error) throw error;
        
        setConversations(data || []);
      } catch (err: any) {
        console.error('Erreur lors de la récupération des conversations:', err);
        setError(err.message || 'Une erreur est survenue lors de la récupération des conversations');
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  const handleSendMessage = async () => {
    if (message.trim() === '') return;

    try {
      setSending(true);
      const { error } = await insertConversation(message);
      
      if (error) throw error;
      
      setMessage('');
      const { data } = await getUserConversations();
      setConversations(data || []);
    } catch (err: any) {
      console.error('Erreur lors de l\'envoi du message:', err);
      setError(err.message || 'Une erreur est survenue lors de l\'envoi du message');
    } finally {
      setSending(false);
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

  return (
    <div className="flex flex-col h-full">
      {error && (
        <div className="p-3 mb-4 rounded-md bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100">
          {error}
        </div>
      )}
      
      <div className="flex-1 overflow-y-auto mb-4 space-y-3 max-h-96">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <FaSpinner className="animate-spin text-2xl text-gray-400" />
          </div>
        ) : conversations.length > 0 ? (
          conversations.map((conv) => (
            <div 
              key={conv.id} 
              className="p-4 rounded-lg bg-gray-800/50 border border-gray-700"
            >
              <p className="mb-2">{conv.message}</p>
              <div className="flex items-center text-xs text-gray-400">
                <FaClock className="mr-1" />
                <span>{formatDate(conv.created_at)}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-400">
            <p>Aucune conversation enregistrée</p>
          </div>
        )}
      </div>
      
      <div className="mt-4 flex">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Tapez votre message..."
          className="flex-1 p-3 bg-gray-800 border border-gray-700 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={sending}
        />
        <button 
          onClick={handleSendMessage}
          disabled={sending || message.trim() === ''}
          className="px-4 py-3 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 transition-colors disabled:bg-blue-800 disabled:opacity-50 flex items-center justify-center"
        >
          {sending ? (
            <FaSpinner className="animate-spin" />
          ) : (
            <FaPaperPlane />
          )}
        </button>
      </div>
    </div>
  );
} 