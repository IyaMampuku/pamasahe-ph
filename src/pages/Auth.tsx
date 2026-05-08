import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
          <Input 
            icon={<User size={20} />}
            placeholder={t.auth.username}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <Input 
            type="password"
            icon={<Lock size={20} />}
            placeholder={t.auth.password}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

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

          <div className="pt-4">
            <Button type="submit" fullWidth size="lg">
              {t.auth.submit}
            </Button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};
