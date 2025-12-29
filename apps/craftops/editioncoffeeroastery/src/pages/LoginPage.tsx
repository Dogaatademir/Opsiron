import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Coffee, ArrowRight, AlertCircle, Lock, User } from 'lucide-react';
import { supabase } from '../context/supabase'; // Dosya yolunuz farklıysa burayı düzeltin (Örn: './supabase')

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Supabase üzerinden kullanıcı doğrulama
      // 'app_users' tablosunda kullanıcı adı ve şifresi eşleşen bir kayıt var mı?
      const { data, error: dbError } = await supabase
        .from('app_users')
        .select('*')
        .eq('username', username)
        .eq('password', password) // Şifreler veritabanında düz metin tutulduğu için doğrudan karşılaştırıyoruz
        .maybeSingle(); // Varsa tek kayıt, yoksa null döner

      if (dbError) {
        throw dbError;
      }

      if (data) {
        // Kullanıcı bulundu, giriş başarılı
        localStorage.setItem('isAuthenticated', 'true');
        navigate('/'); 
      } else {
        // Kullanıcı bulunamadı
        setError('Hatalı kullanıcı adı veya şifre.');
      }

    } catch (err) {
      console.error("Login Hatası:", err);
      setError('Bağlantı hatası veya sistemsel bir sorun oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6">
      
      {/* Main Card */}
      <div className="w-full max-w-md bg-white border border-neutral-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        
        {/* Header Section */}
        <div className="p-10 pb-0 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-neutral-900 text-white rounded-none mb-6">
            <Coffee size={24} strokeWidth={1.5} />
          </div>
          <h1 className="text-2xl font-light tracking-tight text-neutral-900">
            EDITION COFFEE
          </h1>
          <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 mt-2 font-medium">
            Roastery Management
          </p>
        </div>

        {/* Form Section */}
        <div className="p-10">
          <form onSubmit={handleLogin} className="space-y-6">
            
            {/* Username Input */}
            <div className="space-y-2">
              <label 
                htmlFor="username" 
                className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold block"
              >
                Kullanıcı Adı
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User size={16} className="text-neutral-300 group-focus-within:text-neutral-900 transition-colors" />
                </div>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 bg-neutral-50 border border-neutral-200 text-neutral-900 text-sm placeholder-neutral-400 focus:outline-none focus:border-neutral-900 focus:bg-white transition-colors"
                  placeholder="Kullanıcı Adı"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label 
                htmlFor="password" 
                className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold block"
              >
                Şifre
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={16} className="text-neutral-300 group-focus-within:text-neutral-900 transition-colors" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 bg-neutral-50 border border-neutral-200 text-neutral-900 text-sm placeholder-neutral-400 focus:outline-none focus:border-neutral-900 focus:bg-white transition-colors"
                  placeholder="••••"
                  required
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 text-red-600 text-xs">
                <AlertCircle size={14} />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full group flex items-center justify-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs uppercase tracking-widest font-medium py-4 transition-all ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Kontrol Ediliyor...' : 'Panele Giriş'}
              {!loading && <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>
        </div>

        {/* Footer with Branding */}
        <div className="bg-neutral-50 border-t border-neutral-200 p-4 text-center">
            <p className="text-[10px] text-neutral-400 font-light">
                Powered by <span className="font-bold text-neutral-600">CraftOps</span>
            </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;