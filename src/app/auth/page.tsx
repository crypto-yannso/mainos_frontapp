'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Auth from '../../components/Auth';
import { useAuth } from '../../lib/AuthContext';

export default function AuthPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    // Si l'utilisateur est déjà connecté, rediriger vers la page d'accueil
    if (user && !loading) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-full max-w-md text-center">
          <p className="text-lg">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">MainOS</h1>
        <p className="text-gray-600">Connectez-vous pour accéder à votre interface</p>
      </div>
      
      <Auth />
    </div>
  );
} 