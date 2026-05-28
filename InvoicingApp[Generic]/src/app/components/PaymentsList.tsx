import React, { useState } from 'react';
import { AdminLayout } from './AdminLayout';
import { Search, DollarSign, Calendar, Download } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface PaymentsListProps {
  onNavigate: (view: string, options?: any) => void;
  onLogout: () => void;
}

export function PaymentsList({ onNavigate, onLogout }: PaymentsListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const payments = [
    { id: 'PAY-001', invoiceId: 'INV-001', client: 'Acme Corp', amount: '$2,500.00', method: 'Bank Transfer', date: '2026-02-01', status: 'Completed' },
    { id: 'PAY-002', invoiceId: 'INV-006', client: 'Startup Labs', amount: '$1,200.00', method: 'Credit Card', date: '2026-02-11', status: 'Completed' },
    { id: 'PAY-003', invoiceId: 'INV-002', client: 'TechStart Inc', amount: '$900.00', method: 'Check', date: '2026-02-08', status: 'Processing' },
    { id: 'PAY-004', invoiceId: 'INV-007', client: 'Global Solutions', amount: '$3,200.00', method: 'Bank Transfer', date: '2026-02-10', status: 'Completed' },
    { id: 'PAY-005', invoiceId: 'INV-005', client: 'Enterprise Co', amount: '$5,400.00', method: 'Wire Transfer', date: '2026-02-12', status: 'Completed' },
    { id: 'PAY-006', invoiceId: 'INV-008', client: 'Local Business', amount: '$750.00', method: 'Credit Card', date: '2026-02-09', status: 'Failed' },
  ];

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.invoiceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.client.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesMethod = methodFilter === 'all' || payment.method.toLowerCase().replace(/\s/g, '-') === methodFilter;
    
    // Date range filtering
    let matchesDateRange = true;
    if (startDate || endDate) {
      const paymentDate = new Date(payment.date);
      
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        matchesDateRange = paymentDate >= start && paymentDate <= end;
      } else if (startDate) {
        const start = new Date(startDate);
        matchesDateRange = paymentDate >= start;
      } else if (endDate) {
        const end = new Date(endDate);
        matchesDateRange = paymentDate <= end;
      }
    }
    
    return matchesSearch && matchesMethod && matchesDateRange;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-gray-800 text-white';
      case 'Processing': return 'bg-gray-300 text-gray-900';
      case 'Failed': return 'bg-gray-500 text-white';
      default: return 'bg-gray-200 text-gray-900';
    }
  };

  const clearDateFilters = () => {
    setStartDate('');
    setEndDate('');
  };

  const downloadCSV = () => {
    // Create CSV header
    const headers = ['Payment ID', 'Invoice', 'Client', 'Amount', 'Method', 'Date', 'Status'];
    
    // Create CSV rows from filtered payments
    const rows = filteredPayments.map(payment => [
      payment.id,
      payment.invoiceId,
      payment.client,
      payment.amount,
      payment.method,
      payment.date,
      payment.status
    ]);
    
    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `payments_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(16);
    doc.text('Payments Report', 105, 15, { align: 'center' });
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 105, 22, { align: 'center' });
    
    // Prepare table data
    const headers = [['Payment ID', 'Invoice', 'Client', 'Amount', 'Method', 'Date', 'Status']];
    const data = filteredPayments.map(payment => [
      payment.id,
      payment.invoiceId,
      payment.client,
      payment.amount,
      payment.method,
      payment.date,
      payment.status
    ]);
    
    // Add table
    autoTable(doc, {
      head: headers,
      body: data,
      startY: 30,
      theme: 'grid',
      headStyles: { fillColor: [200, 200, 200], textColor: [0, 0, 0] },
      styles: { fontSize: 9 },
    });
    
    // Save PDF
    doc.save(`payments_report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const downloadBulkPDF = () => {
    const doc = new jsPDF();
    
    filteredPayments.forEach((payment, index) => {
      if (index > 0) {
        doc.addPage();
      }
      
      // Payment Header
      doc.setFontSize(16);
      doc.text('PAYMENT RECEIPT', 105, 20, { align: 'center' });
      doc.setFontSize(12);
      doc.text(`Payment ID: ${payment.id}`, 105, 30, { align: 'center' });
      doc.text(`Date: ${payment.date}`, 105, 40, { align: 'center' });
      
      // Company info
      doc.setFontSize(14);
      doc.text('Your Company Name', 10, 60);
      doc.setFontSize(12);
      doc.text('456 Business Ave', 10, 70);
      doc.text('San Francisco, CA 94102', 10, 80);
      
      // Payment details
      doc.setFontSize(14);
      doc.text('Payment Details:', 10, 100);
      doc.setFontSize(12);
      doc.text(`Client: ${payment.client}`, 10, 110);
      doc.text(`Invoice: ${payment.invoiceId}`, 10, 120);
      doc.text(`Amount: ${payment.amount}`, 10, 130);
      doc.text(`Payment Method: ${payment.method}`, 10, 140);
      doc.text(`Status: ${payment.status}`, 10, 150);
      
      // Add a simple table
      const headers = [['Description', 'Amount']];
      const data = [
        ['Payment for ' + payment.invoiceId, payment.amount]
      ];
      
      autoTable(doc, {
        head: headers,
        body: data,
        startY: 170,
        theme: 'grid',
        headStyles: { fillColor: [200, 200, 200], textColor: [0, 0, 0] },
      });
      
      // Add notes
      const startY = (doc as any).lastAutoTable.finalY + 20;
      doc.setFontSize(10);
      doc.text('Thank you for your payment.', 10, startY);
      doc.text(`This receipt was generated on ${new Date().toLocaleDateString()}`, 10, startY + 10);
    });
    
    // Save PDF
    doc.save(`payments_bulk_detailed_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const downloadBulkCSV = () => {
    const lines: string[] = [];
    
    filteredPayments.forEach((payment, index) => {
      if (index > 0) {
        lines.push('');
        lines.push('='.repeat(80));
        lines.push('');
      }
      
      lines.push('PAYMENT RECEIPT');
      lines.push('');
      lines.push(`Payment ID,${payment.id}`);
      lines.push(`Date,${payment.date}`);
      lines.push(`Status,${payment.status}`);
      lines.push('');
      lines.push('FROM:,Your Company Name');
      lines.push(',456 Business Ave');
      lines.push(',San Francisco CA 94102');
      lines.push('');
      lines.push('PAYMENT DETAILS:');
      lines.push(`Client,${payment.client}`);
      lines.push(`Invoice,${payment.invoiceId}`);
      lines.push(`Amount,${payment.amount}`);
      lines.push(`Payment Method,${payment.method}`);
      lines.push('');
      lines.push('TRANSACTION:');
      lines.push('Description,Amount');
      lines.push(`Payment for ${payment.invoiceId},${payment.amount}`);
      lines.push('');
      lines.push('Thank you for your payment.');
    });
    
    const csvContent = lines.join('\n');
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `payments_bulk_detailed_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculate summary stats
  const totalReceived = payments
    .filter(p => p.status === 'Completed')
    .reduce((sum, p) => sum + parseFloat(p.amount.replace(/[$,]/g, '')), 0);
  
  const totalProcessing = payments
    .filter(p => p.status === 'Processing')
    .reduce((sum, p) => sum + parseFloat(p.amount.replace(/[$,]/g, '')), 0);

  const hasPayments = payments.length > 0;

  return (
    <AdminLayout currentPage="payments" onNavigate={onNavigate} onLogout={onLogout}>
      <div>
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <h1>Payments</h1>
              <p className="text-gray-600 mt-1">Track all payment transactions</p>
            </div>
            {filteredPayments.length > 0 && (
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  onClick={downloadCSV}
                  className="bg-white border border-gray-300 text-gray-900 hover:bg-gray-50"
                >
                  <Download className="w-4 h-4 mr-2" />
                  CSV
                </Button>
                <Button
                  onClick={downloadPDF}
                  className="bg-white border border-gray-300 text-gray-900 hover:bg-gray-50"
                >
                  <Download className="w-4 h-4 mr-2" />
                  PDF
                </Button>
                <Button
                  onClick={downloadBulkPDF}
                  className="bg-white border border-gray-300 text-gray-900 hover:bg-gray-50"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Bulk PDF ({filteredPayments.length})
                </Button>
                <Button
                  onClick={downloadBulkCSV}
                  className="bg-white border border-gray-300 text-gray-900 hover:bg-gray-50"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Bulk CSV ({filteredPayments.length})
                </Button>
              </div>
            )}
          </div>
        </div>

        {hasPayments ? (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <div className="bg-white border border-gray-300 rounded p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Total Received</span>
                  <DollarSign className="w-5 h-5 text-gray-400" />
                </div>
                <div className="text-2xl font-semibold text-gray-900">
                  ${totalReceived.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-gray-500 mt-1">This month</p>
              </div>

              <div className="bg-white border border-gray-300 rounded p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Processing</span>
                  <Calendar className="w-5 h-5 text-gray-400" />
                </div>
                <div className="text-2xl font-semibold text-gray-900">
                  ${totalProcessing.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-gray-500 mt-1">Pending clearance</p>
              </div>

              <div className="bg-white border border-gray-300 rounded p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Transactions</span>
                  <DollarSign className="w-5 h-5 text-gray-400" />
                </div>
                <div className="text-2xl font-semibold text-gray-900">{payments.length}</div>
                <p className="text-xs text-gray-500 mt-1">This month</p>
              </div>
            </div>

            {/* Filters */}
            <div className="mb-6 space-y-4">
              {/* Search and Method Filter Row */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search by payment ID, invoice, or client..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="w-full sm:w-48">
                  <Select value={methodFilter} onValueChange={setMethodFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Methods</SelectItem>
                      <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
                      <SelectItem value="credit-card">Credit Card</SelectItem>
                      <SelectItem value="wire-transfer">Wire Transfer</SelectItem>
                      <SelectItem value="check">Check</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Date Range Filter Row */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-gray-50 border border-gray-300 rounded">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span className="font-medium">Date Range:</span>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
                  <div className="flex-1 sm:max-w-[180px]">
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      placeholder="Start date"
                    />
                  </div>
                  <span className="text-gray-500 text-center sm:text-left">to</span>
                  <div className="flex-1 sm:max-w-[180px]">
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      placeholder="End date"
                    />
                  </div>
                  {(startDate || endDate) && (
                    <Button
                      onClick={clearDateFilters}
                      className="text-sm text-gray-600 hover:text-gray-900 underline bg-transparent border-none shadow-none"
                    >
                      Clear dates
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Payments Table */}
            <div className="bg-white border border-gray-300 rounded">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-300 bg-gray-50">
                      <th className="px-4 sm:px-6 py-3 text-left text-sm font-semibold text-gray-900">Payment ID</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-sm font-semibold text-gray-900 hidden sm:table-cell">Invoice</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-sm font-semibold text-gray-900">Client</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-sm font-semibold text-gray-900">Amount</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-sm font-semibold text-gray-900 hidden md:table-cell">Method</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-sm font-semibold text-gray-900 hidden lg:table-cell">Date</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-sm font-semibold text-gray-900 hidden sm:table-cell">Status</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayments.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center justify-center text-gray-500">
                            <Search className="w-12 h-12 mb-3 text-gray-400" />
                            <p className="text-sm">No payments found matching your filters</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredPayments.map((payment) => (
                        <tr key={payment.id} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="px-4 sm:px-6 py-4 text-sm text-gray-900 font-medium">{payment.id}</td>
                          <td className="px-4 sm:px-6 py-4 text-sm text-gray-600 hidden sm:table-cell">{payment.invoiceId}</td>
                          <td className="px-4 sm:px-6 py-4 text-sm text-gray-900">{payment.client}</td>
                          <td className="px-4 sm:px-6 py-4 text-sm text-gray-900 font-medium">{payment.amount}</td>
                          <td className="px-4 sm:px-6 py-4 text-sm text-gray-600 hidden md:table-cell">{payment.method}</td>
                          <td className="px-4 sm:px-6 py-4 text-sm text-gray-600 hidden lg:table-cell">{payment.date}</td>
                          <td className="px-4 sm:px-6 py-4 hidden sm:table-cell">
                            <span className={`inline-flex px-2 py-1 text-xs rounded ${getStatusColor(payment.status)}`}>
                              {payment.status}
                            </span>
                          </td>
                          <td className="px-4 sm:px-6 py-4">
                            <button
                              onClick={() => onNavigate('payment-details', { paymentId: payment.id })}
                              className="text-sm text-gray-900 underline hover:no-underline"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {filteredPayments.length > 0 && (
                <div className="px-4 sm:px-6 py-4 border-t border-gray-300 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-600">
                  <div>Showing {filteredPayments.length} of {payments.length} payments</div>
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
          /* Empty State */
          <div className="bg-white border border-gray-300 rounded p-8 sm:p-12 text-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
              <DollarSign className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">No payments yet</h3>
            <p className="text-sm text-gray-600">Payment transactions will appear here once invoices are paid</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}