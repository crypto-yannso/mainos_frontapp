'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../lib/AuthContext';
import { 
  FaHome, 
  FaClipboardList, 
  FaPlus, 
  FaCog, 
  FaSignOutAlt, 
  FaSignInAlt,
  FaUser,
  FaKey,
  FaComments
} from 'react-icons/fa';

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.push('/auth');
  };

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') {
      return true;
    }
    if (path !== '/' && pathname.startsWith(path)) {
      return true;
    }
    return false;
  };

  // Navigation principale
  const navItems = [
    { href: '/', label: 'Accueil', icon: <FaHome className="w-5 h-5" /> },
    { href: '/reports', label: 'Rapports', icon: <FaClipboardList className="w-5 h-5" /> },
    { href: '/create-report', label: 'Créer', icon: <FaPlus className="w-5 h-5" /> },
    { href: '/conversations', label: 'Conversations', icon: <FaComments className="w-5 h-5" /> },
  ];

  // Navigation des paramètres (séparée pour meilleure organisation)
  const settingsItems = [
    { href: '/settings', label: 'Paramètres', icon: <FaCog className="w-5 h-5" /> },
    { href: '/sessions', label: 'Sessions', icon: <FaKey className="w-5 h-5" /> }
  ];

  return (
    <nav className="bg-[#1E1E1E] border-r border-gray-800 h-screen w-64 fixed left-0 top-0 overflow-y-auto">
      <div className="p-4">
        <h1 className="text-xl font-bold mb-6">MainOS</h1>
        
        <div className="mb-8">
          {user ? (
            <Link href="/settings" className="block py-3 px-4 rounded-lg bg-gray-800/50 hover:bg-gray-800/80 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <FaUser className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium truncate">{user.email}</p>
                  <p className="text-xs text-gray-400 mt-1">Profil utilisateur</p>
                </div>
              </div>
            </Link>
          ) : (
            <div className="py-3 px-4 rounded-lg bg-gray-800/50">
              <p className="text-sm text-gray-400">Non connecté</p>
            </div>
          )}
        </div>

        {/* Navigation principale */}
        <div className="mb-6">
          <h2 className="text-xs uppercase text-gray-500 font-medium mb-2 px-4">Navigation</h2>
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                    isActive(item.href)
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Navigation des paramètres */}
        {user && (
          <div className="mb-6">
            <h2 className="text-xs uppercase text-gray-500 font-medium mb-2 px-4">Compte</h2>
            <ul className="space-y-2">
              {settingsItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                      isActive(item.href)
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="mt-4 pt-4 border-t border-gray-800">
          {user ? (
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 px-4 py-2 w-full text-left rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            >
              <FaSignOutAlt className="w-5 h-5" />
              <span>Déconnexion</span>
            </button>
          ) : (
            <Link
              href="/auth"
              className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            >
              <FaSignInAlt className="w-5 h-5" />
              <span>Connexion</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
} 