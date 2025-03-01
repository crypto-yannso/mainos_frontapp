'use client';

import { useAuth } from '../../lib/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Navigation from '../../components/Navigation';

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
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

  if (!user && !loading) {
    return null; // Laisser le useEffect rediriger vers /auth
  }

  return (
    <div className="flex min-h-screen">
      <Navigation />
      <main className="ml-64 flex-1 bg-[#121212]">
        {children}
      </main>
    </div>
  );
} 