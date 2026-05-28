import React, { useState } from "react";
import { LoginPage } from "./components/LoginPage";
import { AdminDashboard } from "./components/AdminDashboard";
import { ClientList } from "./components/ClientList";
import { ClientForm } from "./components/ClientForm";
import { InvoiceList } from "./components/InvoiceList";
import { InvoiceForm } from "./components/InvoiceForm";
import { InvoiceDetails } from "./components/InvoiceDetails";
import { PublicInvoiceView } from "./components/PublicInvoiceView";
import { PaymentsList } from "./components/PaymentsList";
import { PaymentDetails } from "./components/PaymentDetails";
import { SettingsPage } from "./components/SettingsPage";

export default function App() {
  // Routing simulation
  const [currentView, setCurrentView] =
    useState<string>("login");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<
    string | null
  >(null);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<
    string | null
  >(null);
  const [selectedPaymentId, setSelectedPaymentId] = useState<
    string | null
  >(null);
  const [editMode, setEditMode] = useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
    setCurrentView("dashboard");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentView("login");
  };

  const navigate = (
    view: string,
    options?: {
      clientId?: string;
      invoiceId?: string;
      paymentId?: string;
      edit?: boolean;
    },
  ) => {
    setCurrentView(view);
    if (options?.clientId !== undefined)
      setSelectedClientId(options.clientId);
    if (options?.invoiceId !== undefined)
      setSelectedInvoiceId(options.invoiceId);
    if (options?.paymentId !== undefined)
      setSelectedPaymentId(options.paymentId);
    if (options?.edit !== undefined) setEditMode(options.edit);
  };

  // Public invoice view (no auth required)
  if (currentView === "public-invoice") {
    return (
      <PublicInvoiceView
        onBackToPortal={() => setCurrentView("login")}
      />
    );
  }

  // Login gate
  if (!isLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <LoginPage
          onLogin={handleLogin}
          onViewPublicInvoice={() =>
            setCurrentView("public-invoice")
          }
        />
      </div>
    );
  }

  // Admin views
  return (
    <>
      {currentView === "dashboard" && (
        <AdminDashboard
          onNavigate={navigate}
          onLogout={handleLogout}
        />
      )}
      {currentView === "clients" && (
        <ClientList
          onNavigate={navigate}
          onLogout={handleLogout}
        />
      )}
      {currentView === "client-form" && (
        <ClientForm
          clientId={selectedClientId}
          isEdit={editMode}
          onNavigate={navigate}
          onLogout={handleLogout}
        />
      )}
      {currentView === "invoices" && (
        <InvoiceList
          onNavigate={navigate}
          onLogout={handleLogout}
        />
      )}
      {currentView === "invoice-form" && (
        <InvoiceForm
          invoiceId={selectedInvoiceId}
          isEdit={editMode}
          onNavigate={navigate}
          onLogout={handleLogout}
        />
      )}
      {currentView === "invoice-details" && (
        <InvoiceDetails
          invoiceId={selectedInvoiceId || ""}
          onNavigate={navigate}
          onLogout={handleLogout}
        />
      )}
      {currentView === "payments" && (
        <PaymentsList
          onNavigate={navigate}
          onLogout={handleLogout}
        />
      )}
      {currentView === "payment-details" && (
        <PaymentDetails
          paymentId={selectedPaymentId || ""}
          onNavigate={navigate}
          onLogout={handleLogout}
        />
      )}
      {currentView === "settings" && (
        <SettingsPage
          onNavigate={navigate}
          onLogout={handleLogout}
        />
      )}
    </>
  );
}