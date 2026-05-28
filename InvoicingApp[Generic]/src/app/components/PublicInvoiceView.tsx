import React, { useState } from 'react';
import { Download, CheckCircle, Eye } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface PublicInvoiceViewProps {
  onBackToPortal: () => void;
}

export function PublicInvoiceView({ onBackToPortal }: PublicInvoiceViewProps) {
  const [token, setToken] = useState('');
  const [isValidToken, setIsValidToken] = useState(false);

  // Mock invoice data
  const invoice = {
    id: 'INV-001',
    status: 'Sent',
    company: {
      name: 'Your Company Name',
      address: '456 Business Ave',
      city: 'San Francisco, CA 94102',
    },
    client: {
      name: 'Acme Corp',
      email: 'contact@acme.com',
      address: '123 Business St, Suite 100',
      city: 'New York, NY 10001',
    },
    issueDate: '2026-02-01',
    dueDate: '2026-02-15',
    lineItems: [
      { description: 'Web Development Services', quantity: 40, rate: 100, amount: 4000 },
      { description: 'Design Consultation', quantity: 10, rate: 85, amount: 850 },
      { description: 'Hosting Setup', quantity: 1, rate: 250, amount: 250 },
    ],
    subtotal: 5100,
    tax: 408,
    total: 5508,
    notes: 'Payment due within 14 days',
    terms: 'Net 14',
  };

  const handleTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate token validation (any token works for demo)
    if (token.length > 0) {
      setIsValidToken(true);
    }
  };

  const handleDownloadPDF = () => {
    alert('Downloading invoice PDF...');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return 'bg-gray-800 text-white';
      case 'Sent': return 'bg-gray-300 text-gray-900';
      case 'Viewed': return 'bg-gray-300 text-gray-900';
      case 'Void': return 'bg-white text-gray-400 border border-gray-300';
      default: return 'bg-gray-200 text-gray-900';
    }
  };

  // Token Entry Screen
  if (!isValidToken) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="bg-white border border-gray-300 rounded p-8">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gray-400 rounded"></div>
            </div>

            <h1 className="text-center mb-2">Manual Invoice Access</h1>
            <p className="text-center text-gray-600 mb-6">
              Enter your invoice token below. Most users arrive via a direct link sent by email.
            </p>

            <form onSubmit={handleTokenSubmit} className="space-y-4">
              <div>
                <Label htmlFor="token">Invoice Token</Label>
                <Input
                  id="token"
                  type="text"
                  placeholder="abc123xyz789"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  required
                  className="mt-1"
                />
                <p className="text-xs text-gray-600 mt-1">
                  If you received an invoice email, use the "View Invoice" link instead
                </p>
              </div>

              <Button type="submit" className="w-full bg-gray-900 text-white hover:bg-gray-800">
                <Eye className="w-4 h-4 mr-2" />
                Access Invoice
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-300">
              <div className="bg-gray-50 border border-gray-300 rounded p-4 mb-4">
                <p className="text-xs text-gray-600">
                  <span className="font-semibold text-gray-900">Note:</span> This is a fallback access method. 
                  Typically, invoices are accessed via secure links sent directly to your email.
                </p>
              </div>
              <div className="text-center">
                <button
                  onClick={onBackToPortal}
                  className="text-sm text-gray-900 underline hover:no-underline"
                >
                  ← Back to Admin Login
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 text-center text-sm text-gray-600">
            <p>Demo: Enter any token to view sample invoice</p>
          </div>
        </div>
      </div>
    );
  }

  // Invoice Display Screen
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-300">
        <div className="max-w-5xl mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-400 rounded"></div>
            <div>
              <p className="font-semibold text-gray-900">Invoice {invoice.id}</p>
              <p className="text-sm text-gray-600">From {invoice.company.name}</p>
            </div>
          </div>
          <Button
            onClick={handleDownloadPDF}
            className="bg-gray-900 text-white hover:bg-gray-800"
          >
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto p-8">
        {/* Status Banner */}
        <div className="bg-white border border-gray-300 rounded p-6 mb-6">
          <div className="flex items-center gap-4">
            <CheckCircle className="w-8 h-8 text-gray-600" />
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-gray-900">Invoice Status:</h2>
                <span className={`inline-flex px-3 py-1 text-sm rounded ${getStatusColor(invoice.status)}`}>
                  {invoice.status}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                Due date: {invoice.dueDate} • Amount due: ${invoice.total.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Invoice Document */}
        <div className="bg-white border border-gray-300 rounded">
          {/* Invoice Header */}
          <div className="p-8 border-b border-gray-300">
            <div className="flex justify-between items-start">
              <div>
                <div className="w-16 h-16 bg-gray-400 rounded mb-4"></div>
                <p className="text-sm text-gray-600">From:</p>
                <p className="font-semibold text-gray-900">{invoice.company.name}</p>
                <p className="text-sm text-gray-600">{invoice.company.address}</p>
                <p className="text-sm text-gray-600">{invoice.company.city}</p>
              </div>
              <div className="text-right">
                <h2 className="text-gray-900 mb-2">INVOICE</h2>
                <p className="text-sm text-gray-600">Invoice #: {invoice.id}</p>
                <p className="text-sm text-gray-600">Date: {invoice.issueDate}</p>
                <p className="text-sm text-gray-600">Due: {invoice.dueDate}</p>
              </div>
            </div>
          </div>

          {/* Bill To */}
          <div className="p-8 border-b border-gray-300">
            <p className="text-sm text-gray-600 mb-2">Bill To:</p>
            <p className="font-semibold text-gray-900">{invoice.client.name}</p>
            <p className="text-sm text-gray-600">{invoice.client.address}</p>
            <p className="text-sm text-gray-600">{invoice.client.city}</p>
            <p className="text-sm text-gray-600">{invoice.client.email}</p>
          </div>

          {/* Line Items */}
          <div className="p-8 border-b border-gray-300">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className="pb-3 text-left text-sm font-semibold text-gray-900">Description</th>
                  <th className="pb-3 text-right text-sm font-semibold text-gray-900">Qty</th>
                  <th className="pb-3 text-right text-sm font-semibold text-gray-900">Rate</th>
                  <th className="pb-3 text-right text-sm font-semibold text-gray-900">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.lineItems.map((item, index) => (
                  <tr key={index} className="border-b border-gray-200">
                    <td className="py-3 text-sm text-gray-900">{item.description}</td>
                    <td className="py-3 text-sm text-gray-600 text-right">{item.quantity}</td>
                    <td className="py-3 text-sm text-gray-600 text-right">${item.rate.toFixed(2)}</td>
                    <td className="py-3 text-sm text-gray-900 text-right">${item.amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="mt-6 flex justify-end">
              <div className="w-80 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="text-gray-900">${invoice.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax (8%):</span>
                  <span className="text-gray-900">${invoice.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-300">
                  <span className="font-semibold text-gray-900">Amount Due:</span>
                  <span className="font-semibold text-gray-900 text-xl">${invoice.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes and Terms */}
          <div className="p-8">
            {invoice.notes && (
              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-900 mb-1">Notes:</p>
                <p className="text-sm text-gray-600">{invoice.notes}</p>
              </div>
            )}
            {invoice.terms && (
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-1">Payment Terms:</p>
                <p className="text-sm text-gray-600">{invoice.terms}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Questions about this invoice? Contact us at {invoice.company.name}
          </p>
          <button
            onClick={onBackToPortal}
            className="mt-4 text-sm text-gray-900 underline hover:no-underline"
          >
            ← Back to Portal
          </button>
        </div>
      </main>
    </div>
  );
}