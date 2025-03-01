'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../lib/AuthContext';
import { FaPlus, FaClipboardList, FaCog } from 'react-icons/fa';

export default function Dashboard() {
  const { user } = useAuth();
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Tableau de bord</h1>
        <p className="text-gray-400">
          Bienvenue, {user?.email}
        </p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link
          href="/create-report"
          className="flex flex-col items-center justify-center p-6 rounded-lg bg-[#1E1E1E] hover:bg-[#292929] transition-colors border border-gray-800"
        >
          <FaPlus className="w-8 h-8 mb-4 text-blue-500" />
          <h2 className="text-lg font-medium mb-1">Créer un rapport</h2>
          <p className="text-sm text-gray-400 text-center">
            Générer un nouveau rapport personnalisé
          </p>
        </Link>
        
        <Link
          href="/reports"
          className="flex flex-col items-center justify-center p-6 rounded-lg bg-[#1E1E1E] hover:bg-[#292929] transition-colors border border-gray-800"
        >
          <FaClipboardList className="w-8 h-8 mb-4 text-green-500" />
          <h2 className="text-lg font-medium mb-1">Mes rapports</h2>
          <p className="text-sm text-gray-400 text-center">
            Accéder à vos rapports sauvegardés
          </p>
        </Link>
        
        <Link
          href="/settings"
          className="flex flex-col items-center justify-center p-6 rounded-lg bg-[#1E1E1E] hover:bg-[#292929] transition-colors border border-gray-800"
        >
          <FaCog className="w-8 h-8 mb-4 text-purple-500" />
          <h2 className="text-lg font-medium mb-1">Paramètres</h2>
          <p className="text-sm text-gray-400 text-center">
            Gérer votre compte et vos préférences
          </p>
        </Link>
      </div>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Activité récente</h2>
        <div className="rounded-lg bg-[#1E1E1E] border border-gray-800 overflow-hidden">
          <div className="p-4 text-center text-gray-400">
            Aucune activité récente à afficher
          </div>
        </div>
      </section>
    </div>
  );
} 