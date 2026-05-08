import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, User, Facebook, Twitter, Chrome as Google } from 'lucide-react';
import { useTranslation } from '../contexts/TranslationContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export const Auth: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { login } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError(t.auth.errorEmpty);
      return;
    }

    if (!agree && username !== 'admin') {
      setError(t.auth.errorTerms);
      return;
    }

    // Admin bypass or mock auth
    login();
    navigate('/home');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="min-h-[100dvh] bg-white p-6 flex flex-col justify-center"
    >
      <div className="w-full max-w-sm mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-[#1a00b2]">{t.auth.login}</h1>
          <p className="text-gray-500">Pamasahe PH</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <Input 
              icon={<User size={20} />}
              placeholder={t.auth.username}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <div className="space-y-1">
              <Input 
                type="password"
                icon={<Lock size={20} />}
                placeholder={t.auth.password}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <div className="flex justify-end">
                <button type="button" className="text-xs text-[#1a00b2] font-medium hover:underline">
                  {t.auth.forgotPassword}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <input 
              type="checkbox" 
              id="terms"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-[#1a00b2] focus:ring-[#1a00b2]"
            />
            <label htmlFor="terms" className="text-sm text-gray-600">
              {t.auth.terms}
            </label>
          </div>

          {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

          <div className="pt-2">
            <Button type="submit" fullWidth size="lg">
              {t.auth.submit}
            </Button>
          </div>
        </form>

        <div className="space-y-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">{t.auth.or}</span>
            </div>
          </div>

          <div className="flex flex-col items-center space-y-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{t.auth.socialLogin}</p>
            <div className="flex space-x-6">
              <button className="p-3 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all active:scale-95">
                <Facebook className="text-[#1877F2]" size={24} />
              </button>
              <button className="p-3 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all active:scale-95">
                <Google className="text-[#EA4335]" size={24} />
              </button>
              <button className="p-3 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all active:scale-95">
                <Twitter className="text-black" size={24} />
              </button>
            </div>
          </div>

          <div className="text-center pt-2">
            <p className="text-sm text-gray-600">
              {t.auth.noAccount}{' '}
              <button className="text-[#1a00b2] font-bold hover:underline">
                {t.auth.signup}
              </button>
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
