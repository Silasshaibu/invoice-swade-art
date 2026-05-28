import React from 'react';
import { AdminLayout } from './AdminLayout';
import { ArrowLeft, Download, CreditCard } from 'lucide-react';
import { Button } from './ui/button';

interface PaymentDetailsProps {
  paymentId: string;
  onNavigate: (view: string, options?: any) => void;
  onLogout: () => void;
}

export function PaymentDetails({ paymentId, onNavigate, onLogout }: PaymentDetailsProps) {
  // Mock data
  const payment = {
    id: 'PAY-001',
    invoiceId: 'INV-001',
    client: {
      name: 'Acme Corp',
      email: 'contact@acme.com',
    },
    amount: 2500.00,
    method: 'Bank Transfer',
    date: '2026-02-01',
    status: 'Completed',
    transactionId: 'TXN-9876543210',
    notes: 'Payment received via bank transfer for services rendered.',
    bankDetails: {
      accountLast4: '4567',
      bankName: 'Chase Bank',
      routingNumber: '****5678',
    },
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-gray-800 text-white';
      case 'Processing': return 'bg-gray-300 text-gray-900';
      case 'Failed': return 'bg-gray-500 text-white';
      default: return 'bg-gray-200 text-gray-900';
    }
  };

  const handleDownloadReceipt = () => {
    alert('Downloading payment receipt...');
  };

  return (
    <AdminLayout currentPage="payments" onNavigate={onNavigate} onLogout={onLogout}>
      <div>
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <button
            onClick={() => onNavigate('payments')}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Payments
          </button>
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1>{payment.id}</h1>
                <span className={`inline-flex px-3 py-1 text-sm rounded ${getStatusColor(payment.status)}`}>
                  {payment.status}
                </span>
              </div>
              <p className="text-gray-600">
                Payment received on {payment.date}
              </p>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
              <Button
                onClick={handleDownloadReceipt}
                className="bg-white border border-gray-300 text-gray-900 hover:bg-gray-50"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Receipt
              </Button>
              <Button
                onClick={() => onNavigate('invoice-details', { invoiceId: payment.invoiceId })}
                className="bg-gray-900 text-white hover:bg-gray-800"
              >
                View Invoice
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Payment Details Section */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-gray-300 rounded">
              {/* Payment Summary */}
              <div className="p-6 sm:p-8 border-b border-gray-300">
                <h2 className="text-gray-900 mb-6">Payment Summary</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Payment ID</p>
                    <p className="text-sm text-gray-900 font-medium">{payment.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Transaction ID</p>
                    <p className="text-sm text-gray-900 font-medium">{payment.transactionId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Amount Paid</p>
                    <p className="text-2xl text-gray-900 font-semibold">${payment.amount.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Payment Method</p>
                    <p className="text-sm text-gray-900 font-medium">{payment.method}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Payment Date</p>
                    <p className="text-sm text-gray-900 font-medium">{payment.date}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Status</p>
                    <span className={`inline-flex px-2 py-1 text-xs rounded ${getStatusColor(payment.status)}`}>
                      {payment.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Client Info */}
              <div className="p-6 sm:p-8 border-b border-gray-300">
                <h2 className="text-gray-900 mb-4">Client Information</h2>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Client Name</p>
                    <p className="text-sm text-gray-900 font-medium">{payment.client.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Email</p>
                    <p className="text-sm text-gray-900 font-medium">{payment.client.email}</p>
                  </div>
                  <div className="pt-2">
                    <p className="text-sm text-gray-600 mb-1">Related Invoice</p>
                    <button
                      onClick={() => onNavigate('invoice-details', { invoiceId: payment.invoiceId })}
                      className="text-sm text-gray-900 underline hover:no-underline"
                    >
                      {payment.invoiceId}
                    </button>
                  </div>
                </div>
              </div>

              {/* Payment Method Details */}
              <div className="p-6 sm:p-8 border-b border-gray-300">
                <h2 className="text-gray-900 mb-4">Payment Method Details</h2>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 font-medium mb-1">{payment.method}</p>
                    {payment.method === 'Bank Transfer' && payment.bankDetails && (
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>Bank: {payment.bankDetails.bankName}</p>
                        <p>Account: ****{payment.bankDetails.accountLast4}</p>
                        <p>Routing: {payment.bankDetails.routingNumber}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Notes */}
              {payment.notes && (
                <div className="p-6 sm:p-8">
                  <p className="text-sm font-semibold text-gray-900 mb-2">Notes</p>
                  <p className="text-sm text-gray-600">{payment.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Timeline Section */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-300 rounded p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Payment Timeline</h3>
              <div className="space-y-4">
                {/* Initiated */}
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-gray-900 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 font-medium">Payment Initiated</p>
                    <p className="text-xs text-gray-600">{payment.date} 09:15 AM</p>
                  </div>
                </div>

                {/* Processing */}
                {payment.status === 'Processing' || payment.status === 'Completed' ? (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-gray-900 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 font-medium">Processing</p>
                      <p className="text-xs text-gray-600">{payment.date} 09:16 AM</p>
                    </div>
                  </div>
                ) : null}

                {/* Completed */}
                {payment.status === 'Completed' ? (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-gray-900 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 font-medium">Payment Completed</p>
                      <p className="text-xs text-gray-600">{payment.date} 09:20 AM</p>
                      <p className="text-xs text-gray-500 mt-1">Transaction ID: {payment.transactionId}</p>
                    </div>
                  </div>
                ) : payment.status === 'Failed' ? (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-gray-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Payment Failed</p>
                      <p className="text-xs text-gray-600">{payment.date} 09:20 AM</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-gray-300 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Processing...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Status Info */}
            {payment.status === 'Completed' && (
              <div className="mt-6 bg-white border border-gray-300 rounded p-6">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-gray-800 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Payment Successful</h3>
                    <p className="text-sm text-gray-600">
                      This payment has been successfully processed and applied to invoice {payment.invoiceId}.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}