import React, { useState } from 'react';
import { LogOut, LayoutDashboard, Users, FileText, CreditCard, Settings, Menu, X } from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (view: string) => void;
  onLogout: () => void;
}

export function AdminLayout({ children, currentPage, onNavigate, onLogout }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  const handleNavigate = (view: string) => {
    onNavigate(view);
    closeSidebar();
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-white border-r border-gray-300 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-400 rounded"></div>
            <span className="font-semibold text-gray-900">Invoice Admin</span>
          </div>
          <button
            onClick={closeSidebar}
            className="lg:hidden p-1 text-gray-600 hover:text-gray-900"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="p-4 flex-1">
          <ul className="space-y-1">
            <li>
              <button
                onClick={() => handleNavigate('dashboard')}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded ${
                  currentPage === 'dashboard' 
                    ? 'bg-gray-200 text-gray-900' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <LayoutDashboard className="w-5 h-5" />
                <span>Dashboard</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNavigate('clients')}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded ${
                  currentPage === 'clients' || currentPage === 'client-form'
                    ? 'bg-gray-200 text-gray-900' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Users className="w-5 h-5" />
                <span>Clients</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNavigate('invoices')}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded ${
                  currentPage === 'invoices' || currentPage === 'invoice-form' || currentPage === 'invoice-details'
                    ? 'bg-gray-200 text-gray-900' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <FileText className="w-5 h-5" />
                <span>Invoices</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNavigate('payments')}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded ${
                  currentPage === 'payments'
                    ? 'bg-gray-200 text-gray-900' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <CreditCard className="w-5 h-5" />
                <span>Payments</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNavigate('settings')}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded ${
                  currentPage === 'settings'
                    ? 'bg-gray-200 text-gray-900' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Settings className="w-5 h-5" />
                <span>Settings</span>
              </button>
            </li>
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-300 bg-white">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
          >
            <LogOut className="w-5 h-5" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-gray-300 p-4 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSidebar}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gray-400 rounded"></div>
              <span className="font-semibold text-gray-900">Invoice Admin</span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}