import React, { useState } from 'react';
import { AdminLayout } from './AdminLayout';
import { Search, Plus, FileText, Calendar, Download, ChevronDown } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface InvoiceListProps {
  onNavigate: (view: string, options?: any) => void;
  onLogout: () => void;
}

export function InvoiceList({ onNavigate, onLogout }: InvoiceListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const invoices = [
    { id: 'INV-001', client: 'Acme Corp', total: '$2,500.00', status: 'Paid', issueDate: '2026-02-01', dueDate: '2026-02-15' },
    { id: 'INV-002', client: 'TechStart Inc', total: '$1,800.00', status: 'Sent', issueDate: '2026-02-03', dueDate: '2026-02-17' },
    { id: 'INV-003', client: 'Global Solutions', total: '$3,200.00', status: 'Overdue', issueDate: '2026-01-20', dueDate: '2026-02-03' },
    { id: 'INV-004', client: 'Local Business', total: '$950.00', status: 'Draft', issueDate: '2026-02-04', dueDate: '2026-02-18' },
    { id: 'INV-005', client: 'Enterprise Co', total: '$5,400.00', status: 'Sent', issueDate: '2026-02-05', dueDate: '2026-02-19' },
    { id: 'INV-006', client: 'Startup Labs', total: '$1,200.00', status: 'Paid', issueDate: '2026-01-28', dueDate: '2026-02-11' },
  ];

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.client.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || invoice.status.toLowerCase() === statusFilter.toLowerCase();
    
    // Date range filtering
    let matchesDateRange = true;
    if (startDate || endDate) {
      const invoiceDate = new Date(invoice.issueDate);
      
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        matchesDateRange = invoiceDate >= start && invoiceDate <= end;
      } else if (startDate) {
        const start = new Date(startDate);
        matchesDateRange = invoiceDate >= start;
      } else if (endDate) {
        const end = new Date(endDate);
        matchesDateRange = invoiceDate <= end;
      }
    }
    
    return matchesSearch && matchesStatus && matchesDateRange;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return 'bg-gray-800 text-white';
      case 'Sent': return 'bg-gray-300 text-gray-900';
      case 'Overdue': return 'bg-gray-500 text-white';
      case 'Draft': return 'bg-gray-100 text-gray-600 border border-gray-300';
      default: return 'bg-gray-200 text-gray-900';
    }
  };

  const clearDateFilters = () => {
    setStartDate('');
    setEndDate('');
  };

  const downloadCSV = () => {
    // Create CSV header
    const headers = ['Invoice #', 'Client', 'Status', 'Issue Date', 'Due Date', 'Total'];
    
    // Create CSV rows from filtered invoices
    const rows = filteredInvoices.map(invoice => [
      invoice.id,
      invoice.client,
      invoice.status,
      invoice.issueDate,
      invoice.dueDate,
      invoice.total
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
    link.setAttribute('download', `invoices_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    
    // Get page dimensions
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    
    // Define margins
    const margin = 15;
    const headerHeight = 35;
    const footerHeight = 15;
    
    // Header function
    const addHeader = () => {
      // Company logo placeholder (gray box)
      doc.setFillColor(180, 180, 180);
      doc.rect(margin, 10, 20, 20, 'F');
      
      // Company details next to logo
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Your Company Name', margin + 25, 15);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text('456 Business Ave, San Francisco, CA 94102', margin + 25, 20);
      doc.text('contact@company.com | +1 (555) 123-4567', margin + 25, 25);
      
      // Draw line below header
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, headerHeight, pageWidth - margin, headerHeight);
    };
    
    // Footer function
    const addFooter = (pageNum: number, totalPages: number) => {
      const footerY = pageHeight - footerHeight;
      
      // Draw line above footer
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, footerY, pageWidth - margin, footerY);
      
      // Footer text
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text(`© ${new Date().getFullYear()} Your Company Name. All rights reserved.`, margin, footerY + 6);
      doc.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, footerY + 6, { align: 'center' });
      doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth - margin, footerY + 6, { align: 'right' });
      
      // Reset text color
      doc.setTextColor(0, 0, 0);
    };
    
    // Add header
    addHeader();
    
    // Date range text
    let dateRangeText = 'Results of Invoices';
    if (startDate && endDate) {
      dateRangeText += ` between ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`;
    } else if (startDate) {
      dateRangeText += ` from ${new Date(startDate).toLocaleDateString()} onwards`;
    } else if (endDate) {
      dateRangeText += ` up to ${new Date(endDate).toLocaleDateString()}`;
    } else {
      dateRangeText += ' - All Dates';
    }
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(dateRangeText, pageWidth / 2, headerHeight + 10, { align: 'center' });
    
    // Prepare table data
    const headers = [['Invoice #', 'Client', 'Status', 'Issue Date', 'Due Date', 'Total']];
    const data = filteredInvoices.map(invoice => [
      invoice.id,
      invoice.client,
      invoice.status,
      invoice.issueDate,
      invoice.dueDate,
      invoice.total
    ]);
    
    // Add table
    autoTable(doc, {
      head: headers,
      body: data,
      startY: headerHeight + 15,
      margin: { left: margin, right: margin, bottom: footerHeight + 5 },
      theme: 'grid',
      headStyles: { fillColor: [200, 200, 200], textColor: [0, 0, 0] },
      styles: { fontSize: 9 },
      didDrawPage: (data) => {
        // Add footer to each page
        const pageCount = (doc as any).internal.getNumberOfPages();
        addFooter(data.pageNumber, pageCount);
      }
    });
    
    // Save PDF
    doc.save(`invoices_report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const downloadBulkPDF = () => {
    const doc = new jsPDF();
    
    filteredInvoices.forEach((invoice, index) => {
      if (index > 0) {
        doc.addPage();
      }
      
      // Invoice Header
      doc.setFontSize(16);
      doc.text('INVOICE', 105, 20, { align: 'center' });
      doc.setFontSize(12);
      doc.text(`Invoice #: ${invoice.id}`, 105, 30, { align: 'center' });
      doc.text(`Date: ${invoice.issueDate}`, 105, 40, { align: 'center' });
      doc.text(`Due: ${invoice.dueDate}`, 105, 50, { align: 'center' });
      
      // Company info
      doc.setFontSize(14);
      doc.text('Your Company Name', 10, 20);
      doc.setFontSize(12);
      doc.text('456 Business Ave', 10, 30);
      doc.text('San Francisco, CA 94102', 10, 40);
      
      // Client info
      doc.setFontSize(14);
      doc.text('Bill To:', 10, 70);
      doc.setFontSize(12);
      doc.text(invoice.client, 10, 80);
      
      // Mock line items for the invoice
      const lineItems = [
        { description: 'Service rendered', quantity: 1, unitPrice: 1000, tax: 10 }
      ];
      
      const total = parseFloat(invoice.total.replace(/[$,]/g, ''));
      const subtotal = total / 1.1; // Assuming 10% tax
      const tax = total - subtotal;
      
      // Add line items table
      const headers = [['Description', 'Qty', 'Unit Price', 'Tax %', 'Amount']];
      const data = lineItems.map(item => [
        item.description,
        item.quantity,
        `$${item.unitPrice.toFixed(2)}`,
        `${item.tax}%`,
        `$${subtotal.toFixed(2)}`
      ]);
      
      autoTable(doc, {
        head: headers,
        body: data,
        startY: 100,
        theme: 'grid',
        headStyles: { fillColor: [200, 200, 200], textColor: [0, 0, 0] },
      });
      
      // Add totals
      const startY = (doc as any).lastAutoTable.finalY + 10;
      doc.setFontSize(12);
      doc.text(`Subtotal: $${subtotal.toFixed(2)}`, 10, startY);
      doc.text(`Tax: $${tax.toFixed(2)}`, 10, startY + 10);
      doc.setFontSize(14);
      doc.text(`Total: ${invoice.total}`, 10, startY + 30);
      
      // Status
      doc.setFontSize(10);
      doc.text(`Status: ${invoice.status}`, 10, startY + 50);
    });
    
    // Save PDF
    doc.save(`invoices_bulk_detailed_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const downloadBulkCSV = () => {
    const lines: string[] = [];
    
    filteredInvoices.forEach((invoice, index) => {
      if (index > 0) {
        lines.push('');
        lines.push('='.repeat(80));
        lines.push('');
      }
      
      lines.push('INVOICE');
      lines.push('');
      lines.push(`Invoice #,${invoice.id}`);
      lines.push(`Issue Date,${invoice.issueDate}`);
      lines.push(`Due Date,${invoice.dueDate}`);
      lines.push(`Status,${invoice.status}`);
      lines.push('');
      lines.push('FROM:,Your Company Name');
      lines.push(',456 Business Ave');
      lines.push(',San Francisco CA 94102');
      lines.push('');
      lines.push('BILL TO:');
      lines.push(`Client,${invoice.client}`);
      lines.push('');
      
      // Mock line items
      const total = parseFloat(invoice.total.replace(/[$,]/g, ''));
      const subtotal = total / 1.1;
      const tax = total - subtotal;
      
      lines.push('LINE ITEMS:');
      lines.push('Description,Quantity,Unit Price,Tax %,Amount');
      lines.push(`Service rendered,1,$${subtotal.toFixed(2)},10%,$${subtotal.toFixed(2)}`);
      lines.push('');
      lines.push(`Subtotal,,,,$${subtotal.toFixed(2)}`);
      lines.push(`Tax,,,,$${tax.toFixed(2)}`);
      lines.push(`Total,,,,$${total.toFixed(2)}`);
    });
    
    const csvContent = lines.join('\n');
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `invoices_bulk_detailed_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Empty state condition
  const hasInvoices = invoices.length > 0;

  return (
    <AdminLayout currentPage="invoices" onNavigate={onNavigate} onLogout={onLogout}>
      <div>
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
            <div>
              <h1>Invoices</h1>
              <p className="text-gray-600 mt-1">Manage and track all invoices</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              {filteredInvoices.length > 0 && (
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
                    Bulk PDF
                  </Button>
                  <Button
                    onClick={downloadBulkCSV}
                    className="bg-white border border-gray-300 text-gray-900 hover:bg-gray-50"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Bulk CSV
                  </Button>
                </div>
              )}
              <Button
                onClick={() => onNavigate('invoice-form', { invoiceId: null, edit: false })}
                className="bg-gray-900 text-white hover:bg-gray-800"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Invoice
              </Button>
            </div>
          </div>
        </div>

        {hasInvoices ? (
          <>
            {/* Filters */}
            <div className="mb-6 space-y-4">
              {/* Search and Status Filter Row */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search by invoice # or client name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <div className="w-full sm:w-48">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="sent">Sent</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
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

            {/* Invoice Table */}
            <div className="bg-white border border-gray-300 rounded">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-300 bg-gray-50">
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Invoice #</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Client</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Issue Date</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Due Date</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Total</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInvoices.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center justify-center text-gray-500">
                            <Search className="w-12 h-12 mb-3 text-gray-400" />
                            <p className="text-sm">No invoices found matching your filters</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredInvoices.map((invoice) => (
                        <tr key={invoice.id} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-900 font-medium">{invoice.id}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{invoice.client}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2 py-1 text-xs rounded ${getStatusColor(invoice.status)}`}>
                              {invoice.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{invoice.issueDate}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{invoice.dueDate}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{invoice.total}</td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => onNavigate('invoice-details', { invoiceId: invoice.id })}
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
              {filteredInvoices.length > 0 && (
                <div className="px-6 py-4 border-t border-gray-300 flex items-center justify-between text-sm text-gray-600">
                  <div>Showing {filteredInvoices.length} of {invoices.length} invoices</div>
                  <div className="flex items-center gap-2">
                    <button 
                      disabled 
                      className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="px-3">Page 1 of 1</span>
                    <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Empty State - No invoices exist */
          <div className="bg-white border border-gray-300 rounded p-12 text-center">
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
    </AdminLayout>
  );
}