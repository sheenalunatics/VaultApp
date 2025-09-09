import React, { useState, useCallback } from 'react';
import { LockIcon, WarningIcon } from './Icons';
import { deriveKey, generateSalt, hashPassword, bufferToBase64, base64ToBuffer } from '../crypto';

interface AuthScreenProps {
  isSetup: boolean;
  onAuthSuccess: (key: CryptoKey) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ isSetup, onAuthSuccess }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSetup = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
        setError('Password must be at least 8 characters long.');
        return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const salt = generateSalt();
      const key = await deriveKey(password, salt);
      const verificationHash = await hashPassword(password, salt);
      
      window.localStorage.setItem('vault_salt', bufferToBase64(salt));
      window.localStorage.setItem('vault_hash', bufferToBase64(verificationHash));

      onAuthSuccess(key);
    } catch (err) {
      console.error(err);
      setError('An unexpected error occurred during setup.');
      setIsLoading(false);
    }
  }, [password, confirmPassword, onAuthSuccess]);

  const handleLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!password) {
      setError('Please enter your master password.');
      return;
    }

    setIsLoading(true);
    try {
        const saltB64 = window.localStorage.getItem('vault_salt');
        const storedHashB64 = window.localStorage.getItem('vault_hash');

        if (!saltB64 || !storedHashB64) {
            setError('Vault is not set up correctly. Please refresh.');
            setIsLoading(false);
            return;
        }

        const salt = new Uint8Array(base64ToBuffer(saltB64));
        const storedHash = base64ToBuffer(storedHashB64);

        const verificationHash = await hashPassword(password, salt);

        if (bufferToBase64(verificationHash) !== bufferToBase64(storedHash)) {
             setError('Incorrect master password.');
             setIsLoading(false);
             return;
        }

        const key = await deriveKey(password, salt);
        onAuthSuccess(key);

    } catch (err) {
        console.error(err);
        setError('Incorrect master password or corrupted data.');
        setIsLoading(false);
    }
  }, [password, onAuthSuccess]);

  const title = isSetup ? 'Create Your Vault' : 'Unlock Your Vault';
  const subtitle = isSetup
    ? 'Choose a strong, unique master password. This password is the only way to access your data and cannot be recovered.'
    : 'Enter your master password to decrypt and access your credentials.';

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
            <LockIcon className="w-12 h-12 text-brand-primary mx-auto" />
            <h1 className="text-3xl font-bold text-brand-text-primary tracking-tight mt-4">{title}</h1>
            <p className="text-brand-text-secondary mt-2">{subtitle}</p>
        </div>
        
        <div className="bg-brand-surface p-8 rounded-lg shadow-xl border border-brand-border">
          <form onSubmit={isSetup ? handleSetup : handleLogin} className="space-y-6">
            <div>
              <label htmlFor="master-password" className="block text-sm font-medium text-brand-text-secondary">Master Password</label>
              <input
                type="password"
                id="master-password"
                name="master-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="mt-1 block w-full bg-brand-bg border border-brand-border rounded-md shadow-sm py-2 px-3 text-brand-text-primary focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
              />
            </div>
            
            {isSetup && (
              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-brand-text-secondary">Confirm Master Password</label>
                <input
                  type="password"
                  id="confirm-password"
                  name="confirm-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  className="mt-1 block w-full bg-brand-bg border border-brand-border rounded-md shadow-sm py-2 px-3 text-brand-text-primary focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                />
              </div>
            )}

            {error && (
                <p className="text-sm text-red-500 text-center">{error}</p>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-primary hover:bg-brand-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary focus:ring-offset-brand-surface disabled:bg-brand-secondary disabled:cursor-not-allowed"
              >
                {isLoading ? 'Processing...' : (isSetup ? 'Create Vault' : 'Unlock')}
              </button>
            </div>
          </form>
        </div>
        
        {isSetup && (
             <div className="bg-yellow-100/10 border border-yellow-500/30 text-yellow-300 px-4 py-3 rounded-lg mt-6 flex items-start gap-3 shadow-sm text-sm" role="alert">
                <WarningIcon className="w-5 h-5 flex-shrink-0 mt-0.5 text-yellow-400" />
                <div>
                    <strong>Important:</strong> Your master password is never sent to any server. If you forget it, your encrypted data cannot be recovered. Store it safely.
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default AuthScreen;