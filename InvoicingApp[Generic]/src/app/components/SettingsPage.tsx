import React, { useState } from 'react';
import { AdminLayout } from './AdminLayout';
import { Building2, Mail, Phone, MapPin, Save, Upload, X, FileText, Eye } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';

interface SettingsPageProps {
  onNavigate: (view: string, options?: any) => void;
  onLogout: () => void;
}

export function SettingsPage({ onNavigate, onLogout }: SettingsPageProps) {
  // Company Information
  const [companyName, setCompanyName] = useState('Your Company Name');
  const [email, setEmail] = useState('contact@company.com');
  const [phone, setPhone] = useState('+1 (555) 123-4567');
  const [address, setAddress] = useState('123 Business St\nSuite 100\nCity, State 12345');
  const [taxId, setTaxId] = useState('12-3456789');
  const [website, setWebsite] = useState('www.company.com');
  const [logo, setLogo] = useState<string | null>(null);

  // Invoice Settings
  const [invoicePrefix, setInvoicePrefix] = useState('INV-');
  const [nextInvoiceNumber, setNextInvoiceNumber] = useState('007');
  const [paymentTerms, setPaymentTerms] = useState('14');
  const [currency, setCurrency] = useState('USD');
  const [notes, setNotes] = useState('Thank you for your business. Payment is due within 14 days.');

  // Notification Settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [invoiceSentNotif, setInvoiceSentNotif] = useState(true);
  const [paymentReceivedNotif, setPaymentReceivedNotif] = useState(true);
  const [overdueNotif, setOverdueNotif] = useState(true);

  // PDF Template Settings
  const [selectedTemplate, setSelectedTemplate] = useState('professional');
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null);

  const pdfTemplates = [
    {
      id: 'professional',
      name: 'Professional',
      description: 'Clean layout with company logo, centered dates, and detailed footer with bank information'
    },
    {
      id: 'classic',
      name: 'Classic',
      description: 'Traditional invoice format with simple header and basic company details'
    },
    {
      id: 'modern',
      name: 'Modern',
      description: 'Contemporary design with bold typography and minimalist aesthetic'
    },
    {
      id: 'compact',
      name: 'Compact',
      description: 'Space-efficient layout ideal for single-page invoices with multiple line items'
    }
  ];

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogo(null);
  };

  return (
    <AdminLayout currentPage="settings" onNavigate={onNavigate} onLogout={onLogout}>
      <div>
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1>Settings</h1>
          <p className="text-gray-600 mt-1">Manage system preferences and configuration</p>
        </div>

        <div className="space-y-6">
          {/* Company Information */}
          <div className="bg-white border border-gray-300 rounded">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-300">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">Company Information</h2>
              </div>
              <p className="text-sm text-gray-600 mt-1">Details displayed on invoices and communications</p>
            </div>
            <div className="p-4 sm:p-6">
              {/* Logo Upload Section - Full Width */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  Company Logo
                </label>
                <div className="flex flex-col sm:flex-row gap-4 items-start">
                  {/* Logo Preview */}
                  <div className="flex-shrink-0">
                    {logo ? (
                      <img
                        src={logo}
                        alt="Company Logo Preview"
                        className="w-24 h-24 object-contain border border-gray-300 rounded bg-white p-2"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-gray-400 rounded flex items-center justify-center">
                        <Upload className="w-8 h-8 text-gray-600" />
                      </div>
                    )}
                  </div>

                  {/* Upload Controls */}
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-3">
                      Upload your company logo to appear on invoices and the login page. Recommended size: 200x200px.
                    </p>
                    <div className="flex gap-2">
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                        <span className="inline-flex items-center px-4 py-2 border border-gray-300 rounded text-sm text-gray-700 bg-white hover:bg-gray-50">
                          <Upload className="w-4 h-4 mr-2" />
                          {logo ? 'Change Logo' : 'Upload Logo'}
                        </span>
                      </label>
                      {logo && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleRemoveLogo}
                          className="border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Company Details Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Company Name <span className="text-gray-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Enter company name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Tax ID / EIN
                  </label>
                  <Input
                    type="text"
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value)}
                    placeholder="12-3456789"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Email <span className="text-gray-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      placeholder="contact@company.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Phone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="pl-10"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Website
                  </label>
                  <Input
                    type="text"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="www.company.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Business Address
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="pl-10"
                      rows={3}
                      placeholder="Street address, City, State ZIP"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Invoice Settings */}
          <div className="bg-white border border-gray-300 rounded">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-300">
              <h2 className="text-lg font-semibold text-gray-900">Invoice Settings</h2>
              <p className="text-sm text-gray-600 mt-1">Configure default invoice behavior</p>
            </div>
            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Invoice Prefix
                  </label>
                  <Input
                    type="text"
                    value={invoicePrefix}
                    onChange={(e) => setInvoicePrefix(e.target.value)}
                    placeholder="INV-"
                  />
                  <p className="text-xs text-gray-500 mt-1">Prefix for invoice numbers (e.g. INV-001)</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Next Invoice Number
                  </label>
                  <Input
                    type="text"
                    value={nextInvoiceNumber}
                    onChange={(e) => setNextInvoiceNumber(e.target.value)}
                    placeholder="001"
                  />
                  <p className="text-xs text-gray-500 mt-1">Next sequential number to use</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Default Payment Terms (Days)
                  </label>
                  <Input
                    type="number"
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value)}
                    placeholder="14"
                  />
                  <p className="text-xs text-gray-500 mt-1">Number of days until payment is due</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Currency
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-900"
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="CAD">CAD - Canadian Dollar</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Default Invoice Notes
                  </label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    placeholder="Add default notes or payment instructions"
                  />
                  <p className="text-xs text-gray-500 mt-1">This text will appear at the bottom of all invoices</p>
                </div>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-white border border-gray-300 rounded">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-300">
              <h2 className="text-lg font-semibold text-gray-900">Notification Settings</h2>
              <p className="text-sm text-gray-600 mt-1">Manage email notifications and alerts</p>
            </div>
            <div className="p-4 sm:p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">Email Notifications</div>
                    <p className="text-sm text-gray-600">Receive email updates for important events</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={emailNotifications}
                      onChange={(e) => setEmailNotifications(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-gray-800 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                  </label>
                </div>
                
                <div className="pl-6 space-y-3 border-l-2 border-gray-200">
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-gray-900">Invoice sent confirmation</label>
                    <input
                      type="checkbox"
                      checked={invoiceSentNotif}
                      onChange={(e) => setInvoiceSentNotif(e.target.checked)}
                      disabled={!emailNotifications}
                      className="w-4 h-4 border-gray-300 rounded disabled:opacity-50"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-gray-900">Payment received</label>
                    <input
                      type="checkbox"
                      checked={paymentReceivedNotif}
                      onChange={(e) => setPaymentReceivedNotif(e.target.checked)}
                      disabled={!emailNotifications}
                      className="w-4 h-4 border-gray-300 rounded disabled:opacity-50"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-gray-900">Overdue invoice alerts</label>
                    <input
                      type="checkbox"
                      checked={overdueNotif}
                      onChange={(e) => setOverdueNotif(e.target.checked)}
                      disabled={!emailNotifications}
                      className="w-4 h-4 border-gray-300 rounded disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* PDF Template Settings */}
          <div className="bg-white border border-gray-300 rounded">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-300">
              <h2 className="text-lg font-semibold text-gray-900">PDF Template Settings</h2>
              <p className="text-sm text-gray-600 mt-1">Choose a template for your invoices</p>
            </div>
            <div className="p-4 sm:p-6">
              <div className="space-y-4">
                {pdfTemplates.map(template => (
                  <div key={template.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border border-gray-200 rounded hover:border-gray-400 transition-colors">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{template.name}</div>
                      <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPreviewTemplate(template.id)}
                        className="border-gray-300 text-gray-700 hover:bg-gray-50"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                      </Button>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="radio"
                          checked={selectedTemplate === template.id}
                          onChange={(e) => setSelectedTemplate(e.target.value)}
                          value={template.id}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-gray-800 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pb-8">
            <Button
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50 w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              className="bg-gray-900 text-white hover:bg-gray-800 w-full sm:w-auto"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>

        {/* Preview Modal */}
        {previewTemplate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-gray-300 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  {pdfTemplates.find(t => t.id === previewTemplate)?.name} Template Preview
                </h3>
                <button
                  onClick={() => setPreviewTemplate(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Body - Preview Content */}
              <div className="flex-1 overflow-auto p-6 bg-gray-50">
                <div className="bg-white border-2 border-gray-300 rounded p-8 max-w-3xl mx-auto">
                  {/* Template Preview Mockup */}
                  {previewTemplate === 'professional' && (
                    <div className="space-y-6">
                      {/* Header */}
                      <div className="flex justify-between items-start pb-4 border-b-2 border-gray-900">
                        <div>
                          <div className="w-16 h-16 bg-gray-400 rounded mb-2"></div>
                          <div className="text-xs text-gray-600">
                            <div className="h-2 bg-gray-300 w-32 mb-1"></div>
                            <div className="h-2 bg-gray-300 w-24 mb-1"></div>
                            <div className="h-2 bg-gray-300 w-28"></div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-400 mb-1">INVOICE</div>
                          <div className="h-2 bg-gray-300 w-24 ml-auto"></div>
                        </div>
                      </div>

                      {/* Date Section */}
                      <div className="flex justify-center gap-8 py-4">
                        <div className="text-center">
                          <div className="h-2 bg-gray-300 w-16 mx-auto mb-1"></div>
                          <div className="h-2 bg-gray-400 w-20 mx-auto"></div>
                        </div>
                        <div className="text-center">
                          <div className="h-2 bg-gray-300 w-16 mx-auto mb-1"></div>
                          <div className="h-2 bg-gray-400 w-20 mx-auto"></div>
                        </div>
                      </div>

                      {/* Bill To/From */}
                      <div className="grid grid-cols-2 gap-8 py-4">
                        <div>
                          <div className="h-3 bg-gray-400 w-16 mb-2"></div>
                          <div className="space-y-1">
                            <div className="h-2 bg-gray-300 w-32"></div>
                            <div className="h-2 bg-gray-300 w-28"></div>
                            <div className="h-2 bg-gray-300 w-24"></div>
                          </div>
                        </div>
                        <div>
                          <div className="h-3 bg-gray-400 w-16 mb-2"></div>
                          <div className="space-y-1">
                            <div className="h-2 bg-gray-300 w-32"></div>
                            <div className="h-2 bg-gray-300 w-28"></div>
                            <div className="h-2 bg-gray-300 w-24"></div>
                          </div>
                        </div>
                      </div>

                      {/* Line Items Table */}
                      <div className="border border-gray-300">
                        <div className="grid grid-cols-4 gap-4 p-3 bg-gray-200 border-b border-gray-300">
                          <div className="h-2 bg-gray-400 w-20"></div>
                          <div className="h-2 bg-gray-400 w-16"></div>
                          <div className="h-2 bg-gray-400 w-16"></div>
                          <div className="h-2 bg-gray-400 w-16 ml-auto"></div>
                        </div>
                        {[1, 2, 3].map(i => (
                          <div key={i} className="grid grid-cols-4 gap-4 p-3 border-b border-gray-200">
                            <div className="h-2 bg-gray-300 w-24"></div>
                            <div className="h-2 bg-gray-300 w-12"></div>
                            <div className="h-2 bg-gray-300 w-16"></div>
                            <div className="h-2 bg-gray-300 w-16 ml-auto"></div>
                          </div>
                        ))}
                      </div>

                      {/* Total */}
                      <div className="flex justify-end">
                        <div className="w-64 space-y-2 p-4 bg-gray-100 rounded">
                          <div className="flex justify-between">
                            <div className="h-2 bg-gray-300 w-16"></div>
                            <div className="h-2 bg-gray-300 w-20"></div>
                          </div>
                          <div className="flex justify-between pt-2 border-t-2 border-gray-900">
                            <div className="h-3 bg-gray-400 w-20"></div>
                            <div className="h-3 bg-gray-400 w-24"></div>
                          </div>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="pt-4 border-t border-gray-300 text-center">
                        <div className="h-2 bg-gray-300 w-32 mx-auto mb-2"></div>
                        <div className="h-2 bg-gray-300 w-48 mx-auto mb-1"></div>
                        <div className="h-2 bg-gray-300 w-40 mx-auto"></div>
                      </div>
                    </div>
                  )}

                  {previewTemplate === 'classic' && (
                    <div className="space-y-6">
                      {/* Simple Header */}
                      <div className="pb-4 border-b border-gray-300">
                        <div className="text-3xl font-bold text-gray-400 mb-4">INVOICE</div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <div className="h-2 bg-gray-300 w-32"></div>
                            <div className="h-2 bg-gray-300 w-28"></div>
                            <div className="h-2 bg-gray-300 w-24"></div>
                          </div>
                          <div className="text-right space-y-1">
                            <div className="h-2 bg-gray-300 w-24 ml-auto"></div>
                            <div className="h-2 bg-gray-300 w-28 ml-auto"></div>
                          </div>
                        </div>
                      </div>

                      {/* Bill To */}
                      <div>
                        <div className="h-3 bg-gray-400 w-16 mb-2"></div>
                        <div className="space-y-1">
                          <div className="h-2 bg-gray-300 w-32"></div>
                          <div className="h-2 bg-gray-300 w-28"></div>
                          <div className="h-2 bg-gray-300 w-24"></div>
                        </div>
                      </div>

                      {/* Line Items */}
                      <div className="border-t-2 border-b-2 border-gray-900 py-2">
                        <div className="grid grid-cols-3 gap-4 py-2 font-bold">
                          <div className="h-2 bg-gray-400 w-20"></div>
                          <div className="h-2 bg-gray-400 w-16"></div>
                          <div className="h-2 bg-gray-400 w-16 ml-auto"></div>
                        </div>
                        {[1, 2, 3].map(i => (
                          <div key={i} className="grid grid-cols-3 gap-4 py-2">
                            <div className="h-2 bg-gray-300 w-24"></div>
                            <div className="h-2 bg-gray-300 w-12"></div>
                            <div className="h-2 bg-gray-300 w-16 ml-auto"></div>
                          </div>
                        ))}
                      </div>

                      {/* Total */}
                      <div className="flex justify-end">
                        <div className="w-48 space-y-2">
                          <div className="flex justify-between pt-2 border-t border-gray-900">
                            <div className="h-3 bg-gray-400 w-16"></div>
                            <div className="h-3 bg-gray-400 w-20"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {previewTemplate === 'modern' && (
                    <div className="space-y-6">
                      {/* Modern Header with Bold Typography */}
                      <div className="pb-6">
                        <div className="flex items-end justify-between mb-6">
                          <div className="text-5xl font-bold text-gray-900">INVOICE</div>
                          <div className="h-3 bg-gray-300 w-24"></div>
                        </div>
                        <div className="h-1 bg-gray-900 w-full mb-6"></div>
                        <div className="grid grid-cols-2 gap-8">
                          <div>
                            <div className="h-2 bg-gray-400 w-12 mb-3"></div>
                            <div className="space-y-1">
                              <div className="h-2 bg-gray-300 w-28"></div>
                              <div className="h-2 bg-gray-300 w-24"></div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="h-2 bg-gray-400 w-12 mb-3 ml-auto"></div>
                            <div className="space-y-1">
                              <div className="h-2 bg-gray-300 w-28 ml-auto"></div>
                              <div className="h-2 bg-gray-300 w-24 ml-auto"></div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Client Info */}
                      <div className="bg-gray-100 p-6 rounded">
                        <div className="h-2 bg-gray-400 w-16 mb-3"></div>
                        <div className="space-y-1">
                          <div className="h-2 bg-gray-300 w-32"></div>
                          <div className="h-2 bg-gray-300 w-28"></div>
                        </div>
                      </div>

                      {/* Line Items - Minimal */}
                      <div className="space-y-2">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="flex justify-between py-3 border-b border-gray-200">
                            <div className="flex-1">
                              <div className="h-2 bg-gray-300 w-32 mb-1"></div>
                              <div className="h-2 bg-gray-300 w-48"></div>
                            </div>
                            <div className="h-2 bg-gray-300 w-20"></div>
                          </div>
                        ))}
                      </div>

                      {/* Total - Bold */}
                      <div className="bg-gray-900 text-white p-6 rounded">
                        <div className="flex justify-between items-center">
                          <div className="h-4 bg-gray-700 w-24"></div>
                          <div className="h-6 bg-gray-700 w-32"></div>
                        </div>
                      </div>
                    </div>
                  )}

                  {previewTemplate === 'compact' && (
                    <div className="space-y-4 text-sm">
                      {/* Compact Header */}
                      <div className="flex justify-between items-start pb-3 border-b border-gray-300">
                        <div>
                          <div className="text-xl font-bold text-gray-400 mb-1">INVOICE</div>
                          <div className="h-2 bg-gray-300 w-20"></div>
                        </div>
                        <div className="text-right text-xs">
                          <div className="space-y-1">
                            <div className="h-1.5 bg-gray-300 w-24 ml-auto"></div>
                            <div className="h-1.5 bg-gray-300 w-20 ml-auto"></div>
                            <div className="h-1.5 bg-gray-300 w-16 ml-auto"></div>
                          </div>
                        </div>
                      </div>

                      {/* Compact Info */}
                      <div className="grid grid-cols-3 gap-4 text-xs">
                        <div>
                          <div className="h-2 bg-gray-400 w-10 mb-1"></div>
                          <div className="space-y-0.5">
                            <div className="h-1.5 bg-gray-300 w-20"></div>
                            <div className="h-1.5 bg-gray-300 w-16"></div>
                          </div>
                        </div>
                        <div>
                          <div className="h-2 bg-gray-400 w-12 mb-1"></div>
                          <div className="h-1.5 bg-gray-300 w-16"></div>
                        </div>
                        <div>
                          <div className="h-2 bg-gray-400 w-10 mb-1"></div>
                          <div className="h-1.5 bg-gray-300 w-16"></div>
                        </div>
                      </div>

                      {/* Compact Table */}
                      <div className="text-xs">
                        <div className="grid grid-cols-5 gap-2 p-2 bg-gray-200 border-b border-gray-300">
                          <div className="h-1.5 bg-gray-400 w-16 col-span-2"></div>
                          <div className="h-1.5 bg-gray-400 w-8"></div>
                          <div className="h-1.5 bg-gray-400 w-12"></div>
                          <div className="h-1.5 bg-gray-400 w-12 ml-auto"></div>
                        </div>
                        {[1, 2, 3, 4, 5].map(i => (
                          <div key={i} className="grid grid-cols-5 gap-2 p-2 border-b border-gray-100">
                            <div className="h-1.5 bg-gray-300 w-20 col-span-2"></div>
                            <div className="h-1.5 bg-gray-300 w-6"></div>
                            <div className="h-1.5 bg-gray-300 w-10"></div>
                            <div className="h-1.5 bg-gray-300 w-12 ml-auto"></div>
                          </div>
                        ))}
                      </div>

                      {/* Compact Total */}
                      <div className="flex justify-end">
                        <div className="w-48 space-y-1 p-2 bg-gray-900 text-white rounded">
                          <div className="flex justify-between text-xs">
                            <div className="h-2 bg-gray-700 w-12"></div>
                            <div className="h-2 bg-gray-700 w-16"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-gray-300 flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setPreviewTemplate(null)}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setSelectedTemplate(previewTemplate);
                    setPreviewTemplate(null);
                  }}
                  className="bg-gray-900 text-white hover:bg-gray-800"
                >
                  Use This Template
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}