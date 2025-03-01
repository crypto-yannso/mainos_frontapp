'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../lib/AuthContext';
import { getUserReports } from '../../../lib/dbUtils';
import { FaPlus, FaDownload, FaEye, FaTrash } from 'react-icons/fa';

type Report = {
  id: string;
  title: string;
  type: string;
  format: string;
  created_at: string;
  status: string;
};

export default function ReportsPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const { data, error } = await getUserReports();
        
        if (error) {
          throw error;
        }
        
        setReports(data || []);
      } catch (err: any) {
        console.error('Erreur lors de la récupération des rapports:', err);
        setError(err.message || 'Une erreur est survenue lors de la récupération des rapports');
      } finally {
        setLoading(false);
      }
    };
    
    fetchReports();
  }, [user]);

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
    <div className="max-w-4xl mx-auto px-4 py-8">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Mes rapports</h1>
        <Link 
          href="/create-report" 
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <FaPlus />
          <span>Nouveau rapport</span>
        </Link>
      </header>
      
      {error && (
        <div className="p-4 mb-4 rounded-md bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100">
          {error}
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center py-8">
          <p>Chargement des rapports...</p>
        </div>
      ) : reports.length > 0 ? (
        <div className="bg-[#1E1E1E] rounded-lg border border-gray-800 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-800">
                <th className="py-3 px-4 text-left">Titre</th>
                <th className="py-3 px-4 text-left">Type</th>
                <th className="py-3 px-4 text-left">Date</th>
                <th className="py-3 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.id} className="border-t border-gray-800">
                  <td className="py-3 px-4">{report.title}</td>
                  <td className="py-3 px-4">{report.type}</td>
                  <td className="py-3 px-4">{formatDate(report.created_at)}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/report-result/${report.id}`}
                        className="p-1.5 text-blue-500 hover:text-blue-600 transition-colors"
                        title="Voir le rapport"
                      >
                        <FaEye />
                      </Link>
                      <button
                        className="p-1.5 text-green-500 hover:text-green-600 transition-colors"
                        title="Télécharger"
                      >
                        <FaDownload />
                      </button>
                      <button
                        className="p-1.5 text-red-500 hover:text-red-600 transition-colors"
                        title="Supprimer"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-[#1E1E1E] rounded-lg border border-gray-800 p-8 text-center">
          <p className="text-gray-400 mb-4">Vous n'avez pas encore de rapports</p>
          <Link
            href="/create-report"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <FaPlus />
            <span>Créer votre premier rapport</span>
          </Link>
        </div>
      )}
    </div>
  );
} 