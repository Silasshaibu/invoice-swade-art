import React, { useState } from 'react';
import { AdminLayout } from './AdminLayout';
import { Search, Plus, Edit, Trash2, Users } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';

interface ClientListProps {
  onNavigate: (view: string, options?: any) => void;
  onLogout: () => void;
}

export function ClientList({ onNavigate, onLogout }: ClientListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const clients = [
    { id: '1', name: 'Acme Corp', email: 'contact@acme.com', phone: '(555) 123-4567' },
    { id: '2', name: 'TechStart Inc', email: 'hello@techstart.com', phone: '(555) 234-5678' },
    { id: '3', name: 'Global Solutions', email: 'info@global.com', phone: '(555) 345-6789' },
    { id: '4', name: 'Local Business', email: 'owner@local.biz', phone: '(555) 456-7890' },
    { id: '5', name: 'Enterprise Co', email: 'sales@enterprise.com', phone: '(555) 567-8901' },
    { id: '6', name: 'Startup Labs', email: 'team@startuplabs.io', phone: '(555) 678-9012' },
  ];

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Empty state condition
  const hasClients = clients.length > 0;

  return (
    <AdminLayout currentPage="clients" onNavigate={onNavigate} onLogout={onLogout}>
      <div>
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1>Clients</h1>
            <p className="text-gray-600 mt-1">Manage your client database</p>
          </div>
          <Button
            onClick={() => onNavigate('client-form', { clientId: null, edit: false })}
            className="bg-gray-900 text-white hover:bg-gray-800"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Client
          </Button>
        </div>

        {hasClients ? (
          <>
            {/* Search */}
            <div className="mb-6 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search clients by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Client Table */}
            <div className="bg-white border border-gray-300 rounded">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-300 bg-gray-50">
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Phone</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredClients.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center justify-center text-gray-500">
                            <Search className="w-12 h-12 mb-3 text-gray-400" />
                            <p className="text-sm">No clients found matching "{searchQuery}"</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredClients.map((client) => (
                        <tr key={client.id} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-900 font-medium">{client.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{client.email}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{client.phone}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => onNavigate('client-form', { clientId: client.id, edit: true })}
                                className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                                title="Edit client"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                                title="Delete client"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {filteredClients.length > 0 && (
                <div className="px-6 py-4 border-t border-gray-300 flex items-center justify-between text-sm text-gray-600">
                  <div>Showing {filteredClients.length} of {clients.length} clients</div>
                  <div className="flex items-center gap-2">
                    <button 
                      disabled 
                      className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Empty State - No clients exist */
          <div className="bg-white border border-gray-300 rounded p-12 text-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">No clients yet</h3>
            <p className="text-sm text-gray-600 mb-4">Get started by adding your first client</p>
            <Button
              onClick={() => onNavigate('client-form', { clientId: null, edit: false })}
              className="bg-gray-900 text-white hover:bg-gray-800"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Client
            </Button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}