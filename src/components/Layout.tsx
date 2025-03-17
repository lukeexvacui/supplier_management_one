import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  History,
  Upload,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Fornecedores', href: '/suppliers', icon: Users },
    { name: 'Nova Avaliação', href: '/evaluate/new', icon: ClipboardList },
    { name: 'Histórico', href: '/history', icon: History },
    { name: 'Métricas', href: '/metrics', icon: TrendingUp },
    { name: 'Não Conformidades', href: '/non-conformities', icon: AlertTriangle },
    { name: 'Importar Dados', href: '/import', icon: Upload },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg">
          <div className="flex h-16 items-center justify-center border-b">
            <h1 className="text-xl font-bold text-gray-800">
              Gestão de Fornecedores
            </h1>
          </div>
          <nav className="mt-6">
            <div className="px-4 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center px-4 py-3 text-sm rounded-lg ${
                      location.pathname === item.href
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-auto">
          <header className="bg-white shadow-sm">
            <div className="px-8 py-4">
              <h2 className="text-2xl font-bold text-gray-800">
                {navigation.find((item) => item.href === location.pathname)?.name ||
                  'Dashboard'}
              </h2>
            </div>
          </header>
          <main className="p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}