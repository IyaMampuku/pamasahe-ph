import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, User, Mail, UserCircle } from 'lucide-react';
import { useTranslation } from '../contexts/TranslationContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export const Signup: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password || !confirmPassword) {
      setError(t.auth.errorEmpty);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!agree) {
      setError(t.auth.errorTerms);
      return;
    }

    // Mock signup
    navigate('/auth');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="min-h-[100dvh] bg-white p-6 flex flex-col justify-center"
    >
      <div className="w-full max-w-sm mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-[#1a00b2]">{t.auth.signup}</h1>
          <p className="text-gray-500">Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <Input 
              icon={<UserCircle size={20} />}
              placeholder={t.auth.name}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input 
              icon={<Mail size={20} />}
              placeholder={t.auth.email}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input 
              type="password"
              icon={<Lock size={20} />}
              placeholder={t.auth.password}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Input 
              type="password"
              icon={<Lock size={20} />}
              placeholder={t.auth.confirmPassword}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
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
              {t.auth.signup}
            </Button>
          </div>
        </form>

        <div className="text-center pt-2">
          <p className="text-sm text-gray-600 font-medium">
            {t.auth.haveAccount}{' '}
            <Link to="/auth" className="text-[#1a00b2] font-bold hover:underline ml-1">
              {t.auth.login}
            </Link>
          </p>
        </div>
      </div>
    </motion.div>
  );
};
