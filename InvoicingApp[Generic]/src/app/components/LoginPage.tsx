import React, { useState } from 'react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { ArrowLeft } from 'lucide-react';

interface LoginPageProps {
  onLogin: () => void;
  onViewPublicInvoice: () => void;
}

export function LoginPage({ onLogin, onViewPublicInvoice }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin();
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setResetSent(true);
    // In a real app, this would send a reset email
    setTimeout(() => {
      setResetSent(false);
      setShowForgotPassword(false);
      setResetEmail('');
    }, 3000);
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white border border-gray-300 rounded p-8">
        {/* Logo placeholder */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-gray-400 rounded"></div>
        </div>

        {!showForgotPassword ? (
          <>
            <h1 className="text-center mb-2">Admin Login</h1>
            <p className="text-center text-gray-600 mb-6">Sign in to access the admin portal</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>

              <div className="flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-gray-600 hover:text-gray-900 underline"
                >
                  Forgot password?
                </button>
              </div>

              <Button type="submit" className="w-full bg-gray-900 text-white hover:bg-gray-800">
                Log In
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-300 text-center">
              <p className="text-sm text-gray-600 mb-2">Have an invoice link?</p>
              <button
                onClick={onViewPublicInvoice}
                className="text-sm text-gray-900 underline hover:no-underline"
              >
                View Public Invoice
              </button>
            </div>
          </>
        ) : (
          <>
            <button
              onClick={() => {
                setShowForgotPassword(false);
                setResetSent(false);
                setResetEmail('');
              }}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </button>

            <h1 className="text-center mb-2">Reset Password</h1>
            <p className="text-center text-gray-600 mb-6">
              Enter your email address and we'll send you a link to reset your password
            </p>

            {!resetSent ? (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <Label htmlFor="resetEmail">Email Address</Label>
                  <Input
                    id="resetEmail"
                    type="email"
                    placeholder="admin@example.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                    className="mt-1"
                  />
                </div>

                <Button type="submit" className="w-full bg-gray-900 text-white hover:bg-gray-800">
                  Send Reset Link
                </Button>
              </form>
            ) : (
              <div className="bg-gray-100 border border-gray-300 rounded p-4">
                <p className="text-sm text-gray-900 font-medium mb-1">Reset link sent!</p>
                <p className="text-sm text-gray-600">
                  We've sent a password reset link to <strong>{resetEmail}</strong>. 
                  Please check your inbox and follow the instructions.
                </p>
              </div>
            )}
          </>
        )}
      </div>

      <div className="mt-4 text-center text-sm text-gray-600">
        <p>Demo credentials: any email/password</p>
      </div>
    </div>
  );
}