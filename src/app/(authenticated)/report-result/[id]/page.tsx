'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getReportById } from '../../../../lib/dbUtils';
import { downloadMainosReport } from '../../../../lib/mainosApi';
import { FaDownload, FaSpinner } from 'react-icons/fa';

export default function ReportResultPage() {
  const params = useParams();
  const reportId = params.id as string;
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  
  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const { data, error } = await getReportById(reportId);
        
        if (error) throw error;
        
        setReport(data);
      } catch (err: any) {
        console.error('Erreur lors de la récupération du rapport:', err);
        setError(err.message || 'Une erreur est survenue lors de la récupération du rapport');
      } finally {
        setLoading(false);
      }
    };
    
    fetchReport();
  }, [reportId]);
  
  const handleDownload = async (format: string) => {
    if (!report || !report.mainos_report_id) return;
    
    try {
      setDownloading(true);
      const blob = await downloadMainosReport(report.mainos_report_id, format.toLowerCase());
      
      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${report.title}.${format.toLowerCase()}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      console.error('Erreur lors du téléchargement du rapport:', err);
      setError(err.message || 'Une erreur est survenue lors du téléchargement du rapport');
    } finally {
      setDownloading(false);
    }
  };
  
  // Fonction pour rendre le contenu du rapport
  const renderReportContent = () => {
    if (!report || !report.content) return null;
    
    try {
      // Si le contenu est stocké sous forme de chaîne JSON, le parser
      const content = typeof report.content === 'string' 
        ? JSON.parse(report.content) 
        : report.content;
      
      return (
        <div className="mt-6">
          <h1 className="text-2xl font-bold mb-4">{content.title || report.title}</h1>
          
          {/* Afficher les sections */}
          {content.sections && Object.entries(content.sections).map(([key, section]: [string, any]) => (
            <div key={key} className="mb-6">
              <h2 className="text-xl font-semibold mb-3">{section.title}</h2>
              <div className="prose prose-invert max-w-none">
                {section.content}
              </div>
            </div>
          ))}
          
          {/* Afficher les sources si disponibles */}
          {content.sources && content.sources.length > 0 && (
            <div className="mt-8 border-t border-gray-700 pt-4">
              <h2 className="text-lg font-semibold mb-3">Sources</h2>
              <ul className="list-disc pl-5 space-y-1">
                {content.sources.map((source: any, index: number) => (
                  <li key={index} className="text-sm text-gray-400">
                    {source.title} {source.url && <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">[lien]</a>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      );
    } catch (err) {
      console.error('Erreur lors du parsing du contenu:', err);
      return <p className="text-red-500">Erreur lors de l'affichage du contenu du rapport</p>;
    }
  };
  
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 flex justify-center">
        <p>Chargement du rapport...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-4 rounded-md">
          {error}
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{report?.title}</h1>
        
        <div className="flex gap-2">
          <button
            onClick={() => handleDownload('pdf')}
            disabled={downloading || report?.status === 'processing'}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {downloading ? <FaSpinner className="animate-spin" /> : <FaDownload />}
            <span>PDF</span>
          </button>
          
          <button
            onClick={() => handleDownload(report?.format || 'markdown')}
            disabled={downloading || report?.status === 'processing'}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors disabled:opacity-50"
          >
            {downloading ? <FaSpinner className="animate-spin" /> : <FaDownload />}
            <span>{report?.format || 'Format original'}</span>
          </button>
        </div>
      </div>
      
      <div className="bg-[#1E1E1E] border border-gray-800 rounded-lg p-6">
        {report?.status === 'processing' ? (
          <div className="text-center py-12">
            <div className="mx-auto w-16 h-16 border-4 border-t-gray-500 border-r-gray-500 border-b-gray-800 border-l-gray-800 rounded-full animate-spin mb-4"></div>
            <h2 className="text-lg font-medium mb-2">Génération en cours</h2>
            <p className="text-gray-400">Votre rapport est en cours de création, veuillez patienter...</p>
          </div>
        ) : renderReportContent()}
      </div>
    </div>
  );
} 