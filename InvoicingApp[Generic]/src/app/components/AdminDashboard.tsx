import React from 'react';
import { AdminLayout } from './AdminLayout';
import { DollarSign, FileText, AlertCircle, CheckCircle, Plus } from 'lucide-react';
import { Button } from './ui/button';

interface AdminDashboardProps {
  onNavigate: (view: string, options?: any) => void;
  onLogout: () => void;
}

export function AdminDashboard({ onNavigate, onLogout }: AdminDashboardProps) {
  const kpiCards = [
    { label: 'Revenue (This Month)', value: '$24,580', icon: DollarSign },
    { label: 'Outstanding Invoices', value: '12', icon: FileText },
    { label: 'Overdue Invoices', value: '3', icon: AlertCircle },
    { label: 'Paid Invoices', value: '45', icon: CheckCircle },
  ];

  const recentInvoices = [
    { id: 'INV-001', client: 'Acme Corp', status: 'Paid', total: '$2,500.00', dueDate: '2026-02-15' },
    { id: 'INV-002', client: 'TechStart Inc', status: 'Sent', total: '$1,800.00', dueDate: '2026-02-17' },
    { id: 'INV-003', client: 'Global Solutions', status: 'Overdue', total: '$3,200.00', dueDate: '2026-02-03' },
    { id: 'INV-004', client: 'Local Business', status: 'Draft', total: '$950.00', dueDate: '2026-02-18' },
    { id: 'INV-005', client: 'Enterprise Co', status: 'Sent', total: '$5,400.00', dueDate: '2026-02-19' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return 'bg-gray-800 text-white';
      case 'Sent': return 'bg-gray-300 text-gray-900';
      case 'Overdue': return 'bg-gray-500 text-white';
      case 'Draft': return 'bg-gray-100 text-gray-600 border border-gray-300';
      default: return 'bg-gray-200 text-gray-900';
    }
  };

  // Empty state condition
  const hasInvoices = recentInvoices.length > 0;

  return (
    <AdminLayout currentPage="dashboard" onNavigate={onNavigate} onLogout={onLogout}>
      <div>
        {/* Page Header */}
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1>Dashboard</h1>
            <p className="text-gray-600 mt-1">Overview of your invoicing activity</p>
          </div>
          <Button
            onClick={() => onNavigate('invoice-form', { invoiceId: null, edit: false })}
            className="bg-gray-900 text-white hover:bg-gray-800 w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Invoice
          </Button>
        </div>

        {/* KPI Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {kpiCards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.label} className="bg-white border border-gray-300 rounded p-6">
                <div className="flex items-center justify-between mb-4">
                  <Icon className="w-5 h-5 text-gray-600" />
                </div>
                <div className="text-3xl font-semibold text-gray-900 mb-1">{card.value}</div>
                <div className="text-sm text-gray-600">{card.label}</div>
              </div>
            );
          })}
        </div>

        {/* Recent Invoices Section */}
        <div className="bg-white border border-gray-300 rounded">
          <div className="p-4 sm:p-6 border-b border-gray-300">
            <h2>Recent Invoices</h2>
          </div>

          {hasInvoices ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-300 bg-gray-50">
                      <th className="px-4 sm:px-6 py-3 text-left text-sm font-semibold text-gray-900">Invoice #</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-sm font-semibold text-gray-900">Client</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-sm font-semibold text-gray-900 hidden sm:table-cell">Status</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-sm font-semibold text-gray-900">Total</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-sm font-semibold text-gray-900 hidden md:table-cell">Due Date</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentInvoices.map((invoice) => (
                      <tr key={invoice.id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-4 sm:px-6 py-4 text-sm text-gray-900 font-medium">{invoice.id}</td>
                        <td className="px-4 sm:px-6 py-4 text-sm text-gray-900">{invoice.client}</td>
                        <td className="px-4 sm:px-6 py-4 hidden sm:table-cell">
                          <span className={`inline-flex px-2 py-1 text-xs rounded ${getStatusColor(invoice.status)}`}>
                            {invoice.status}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-sm text-gray-900">{invoice.total}</td>
                        <td className="px-4 sm:px-6 py-4 text-sm text-gray-600 hidden md:table-cell">{invoice.dueDate}</td>
                        <td className="px-4 sm:px-6 py-4">
                          <button
                            onClick={() => onNavigate('invoice-details', { invoiceId: invoice.id })}
                            className="text-sm text-gray-900 underline hover:no-underline"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-4 text-center border-t border-gray-300">
                <button
                  onClick={() => onNavigate('invoices')}
                  className="text-sm text-gray-900 underline hover:no-underline"
                >
                  View All Invoices →
                </button>
              </div>
            </>
          ) : (
            /* Empty State */
            <div className="p-8 sm:p-12 text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">No invoices yet</h3>
              <p className="text-sm text-gray-600 mb-4">Create your first invoice to get started</p>
              <Button
                onClick={() => onNavigate('invoice-form', { invoiceId: null, edit: false })}
                className="bg-gray-900 text-white hover:bg-gray-800"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Invoice
              </Button>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}