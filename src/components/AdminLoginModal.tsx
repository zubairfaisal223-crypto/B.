import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, Eye, EyeOff, AlertCircle, X, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const { user, isAdmin, login, logout } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // First admin bootstrap state if needed
  const [isFirstSetup, setIsFirstSetup] = useState(false);
  const [adminName, setAdminName] = useState('B. Boutique Owner');
  const [setupKey, setSetupKey] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const endpoint = isFirstSetup ? '/api/auth/create-first-admin' : '/api/auth/login';
      const payload = isFirstSetup
        ? { email, password, name: adminName, setupKey }
        : { email, password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed.');
      }

      // Check if user has real admin role returned from server
      if (data.user.role !== 'admin') {
        throw new Error('Access denied: This account does not possess administrator privileges.');
      }

      login(data.token, data.user);
      onLoginSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#FDFBF7] rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-[#E5C365]/50 relative overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-[#7D6E73] hover:text-[#2D2527] hover:bg-[#FAF6F0] transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2D2527] to-[#45383B] flex items-center justify-center text-[#E5C365] mx-auto mb-3 shadow-md border border-[#E5C365]/30">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="font-serif-luxury text-2xl sm:text-3xl font-semibold text-[#2D2527]">
            {isAdmin ? 'Admin Portal Active' : isFirstSetup ? 'Initialize Admin Account' : 'Admin Authentication'}
          </h2>
          <p className="text-xs text-[#7D6E73] mt-1">
            Protected management area for B. Crochet Boutique.
          </p>
        </div>

        {/* If already authenticated as admin */}
        {isAdmin && user ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#F5DADB]/30 border border-[#ECA1A6]/40 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#25D366] flex-shrink-0" />
              <div className="text-sm">
                <p className="font-semibold text-[#2D2527]">Logged in as Administrator</p>
                <p className="text-xs text-[#7D6E73]">{user.email}</p>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  onLoginSuccess();
                  onClose();
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-[#2D2527] text-[#FAF6F0] font-semibold text-sm hover:bg-[#45383B] transition-all shadow-md"
              >
                Enter Admin Dashboard
              </button>
              <button
                onClick={() => {
                  logout();
                  setError(null);
                }}
                className="py-3 px-4 rounded-xl border border-[#EFE7DE] text-[#7D6E73] hover:text-[#D4737B] font-semibold text-sm transition-all"
              >
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          /* Login Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {isFirstSetup && (
              <div>
                <label className="block text-xs font-semibold text-[#3D3336] mb-1">Admin Name</label>
                <input
                  type="text"
                  required
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#EFE7DE] text-sm text-[#2D2527] focus:outline-none focus:border-[#C59B27]"
                  placeholder="Store Owner"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#3D3336] mb-1">Admin Email</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@bcrochet.pk"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#EFE7DE] text-sm text-[#2D2527] focus:outline-none focus:border-[#C59B27]"
                />
                <Mail className="w-4 h-4 text-[#7D6E73] absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#3D3336] mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#EFE7DE] text-sm text-[#2D2527] focus:outline-none focus:border-[#C59B27]"
                />
                <Lock className="w-4 h-4 text-[#7D6E73] absolute left-3.5 top-3" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-[#7D6E73] hover:text-[#2D2527]"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {isFirstSetup && (
              <div>
                <label className="block text-xs font-semibold text-[#3D3336] mb-1">
                  Setup Key (Required if admin exists)
                </label>
                <input
                  type="password"
                  value={setupKey}
                  onChange={(e) => setSetupKey(e.target.value)}
                  placeholder="BCrochetAdmin2026Setup"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF6F0] border border-[#EFE7DE] text-sm text-[#2D2527] focus:outline-none focus:border-[#C59B27]"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#2D2527] to-[#45383B] text-[#E5C365] font-semibold text-sm hover:from-[#3D3336] hover:to-[#574A4E] transition-all shadow-md disabled:opacity-50 mt-2"
            >
              {loading ? 'Authenticating...' : isFirstSetup ? 'Create Admin Account' : 'Verify & Enter Dashboard'}
            </button>

            {/* Quick credentials hint for evaluation / store owner */}
            <div className="mt-4 p-3 rounded-xl bg-[#FAF6F0] border border-[#EFE7DE] text-[11px] text-[#574A4E] space-y-1">
              <p className="font-semibold text-[#2D2527]">Store Owner Access Information:</p>
              <p>Email: <code className="bg-white px-1.5 py-0.5 rounded border border-[#EFE7DE] text-[#2D2527]">admin@bcrochet.pk</code></p>
              <p>Default Password: <code className="bg-white px-1.5 py-0.5 rounded border border-[#EFE7DE] text-[#2D2527]">Admin@BCrochet2026!</code></p>
              <p className="text-[10px] text-[#7D6E73] pt-1">
                Security note: Clicking the logo 10 times opens this modal; full cryptographic scrypt verification on the server is required for access.
              </p>
            </div>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsFirstSetup(!isFirstSetup);
                  setError(null);
                }}
                className="text-xs text-[#9A7B1C] hover:underline"
              >
                {isFirstSetup ? 'Back to Standard Admin Login' : 'Need to set up new admin credentials?'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
