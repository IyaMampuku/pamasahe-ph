import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, User } from 'lucide-react';
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

        <div className="space-y-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-4 text-xs font-bold text-gray-400 tracking-widest">{t.auth.socialLogin}</span>
            </div>
          </div>

          <div className="flex flex-col items-center">
            <div className="flex space-x-6">
              <button className="p-3 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all active:scale-95 bg-white">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" fill="#1877F2"/>
                </svg>
              </button>
              <button className="p-3 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all active:scale-95 bg-white">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              </button>
              <button className="p-3 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all active:scale-95 bg-white">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932 6.064-6.932zm-1.292 19.49h2.039L6.486 3.24H4.298l13.311 17.403z" fill="black"/>
                </svg>
              </button>
            </div>
          </div>

          <div className="text-center pt-2">
            <p className="text-sm text-gray-600 font-medium">
              {t.auth.noAccount}{' '}
              <Link to="/signup" className="text-[#1a00b2] font-bold hover:underline ml-1">
                {t.auth.signup}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </motion.div>

  );
};
