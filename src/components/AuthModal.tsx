import React, { useState } from 'react';
import { Mail, Lock, User, Phone, MapPin, X, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { login } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const payload =
        mode === 'login'
          ? { email, password }
          : { email, password, name, phone, city, address };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      login(data.token, data.user);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#FDFBF7] rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-[#F5EFEB] relative overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-[#7D6E73] hover:text-[#2D2527] hover:bg-[#FAF6F0]"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Tab switcher */}
        <div className="flex border-b border-[#EFE7DE] mb-6">
          <button
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`flex-1 py-3 text-sm font-semibold text-center border-b-2 transition-all ${
              mode === 'login'
                ? 'border-[#2D2527] text-[#2D2527]'
                : 'border-transparent text-[#7D6E73] hover:text-[#2D2527]'
            }`}
          >
            Customer Sign In
          </button>
          <button
            onClick={() => {
              setMode('register');
              setError(null);
            }}
            className={`flex-1 py-3 text-sm font-semibold text-center border-b-2 transition-all ${
              mode === 'register'
                ? 'border-[#2D2527] text-[#2D2527]'
                : 'border-transparent text-[#7D6E73] hover:text-[#2D2527]'
            }`}
          >
            Create Account
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-[#3D3336] mb-1">Full Name *</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Fatima Ali"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#EFE7DE] text-sm text-[#2D2527] focus:outline-none focus:border-[#C59B27]"
                />
                <User className="w-4 h-4 text-[#7D6E73] absolute left-3.5 top-3" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#3D3336] mb-1">Email Address *</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#EFE7DE] text-sm text-[#2D2527] focus:outline-none focus:border-[#C59B27]"
              />
              <Mail className="w-4 h-4 text-[#7D6E73] absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#3D3336] mb-1">Password *</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#EFE7DE] text-sm text-[#2D2527] focus:outline-none focus:border-[#C59B27]"
              />
              <Lock className="w-4 h-4 text-[#7D6E73] absolute left-3.5 top-3" />
            </div>
          </div>

          {mode === 'register' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-[#3D3336] mb-1">Phone Number (Pakistan)</label>
                <div className="relative">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0300-1234567"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#EFE7DE] text-sm text-[#2D2527] focus:outline-none focus:border-[#C59B27]"
                  />
                  <Phone className="w-4 h-4 text-[#7D6E73] absolute left-3.5 top-3" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#3D3336] mb-1">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Lahore"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#EFE7DE] text-sm text-[#2D2527] focus:outline-none focus:border-[#C59B27]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#3D3336] mb-1">Street Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Area / House"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#EFE7DE] text-sm text-[#2D2527] focus:outline-none focus:border-[#C59B27]"
                  />
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#2D2527] to-[#45383B] text-[#FAF6F0] font-semibold text-sm hover:from-[#3D3336] hover:to-[#574A4E] transition-all shadow-md disabled:opacity-50 mt-2"
          >
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create My Account'}
          </button>
        </form>
      </div>
    </div>
  );
};
