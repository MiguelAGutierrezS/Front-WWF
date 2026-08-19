import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ArrowLeft, Loader } from 'lucide-react';
import { authService } from '../services/authService';
import { userService } from '../services/userService';
import { useAuthStore } from '../store/useAuthStore';

export const AuthLayout = () => {
  const navigate = useNavigate();
  const { setSession } = useAuthStore();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    institucion: '',
    sexo: 'O'
  });

  const handleChange = (e) => {
    setFormData(prev => ({...prev, [e.target.name]: e.target.value}));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      let authResponse;
      if (isLogin) {
        authResponse = await authService.login({ email: formData.email, password: formData.password });
      } else {
        authResponse = await authService.register(formData);
      }

      const { user, tokens } = authResponse.data || authResponse;
      setSession(user, tokens);

      // Claim anonymous data
      const anonId = localStorage.getItem('wwf_anon_session_id');
      if (anonId) {
        try {
          await userService.claimAnonSession(anonId);
        } catch (claimErr) {
          console.warn('Could not claim anonymous data', claimErr);
        }
      }

      navigate('/');
    } catch (err) {
      setErrorMsg(err.message || 'Error en la autenticación. Verifica tus datos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-900 flex items-center justify-center relative overflow-hidden bg-[url('https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?q=80&w=2000')] bg-cover bg-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-0"></div>

      {/* Back to map button */}
      <Link to="/" className="absolute top-6 left-6 z-20">
        <Button variant="secondary" className="rounded-full">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Volver al Mapa
        </Button>
      </Link>
      
      <div className="z-10 bg-black/60 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl w-full max-w-md">
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </h2>
          <p className="text-gray-400 text-sm">
            {isLogin 
              ? 'Ingresa tus credenciales de investigador.' 
              : 'Regístrate para validar especies y gestionar cámaras.'}
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {errorMsg && (
            <div className="bg-red-500/20 border border-red-500/30 text-red-400 p-3 rounded-lg text-sm text-center">
              {errorMsg}
            </div>
          )}

          {!isLogin && (
            <div>
              <label className="block text-white/70 text-xs font-semibold mb-1 uppercase tracking-wider">Nombre Completo</label>
              <input 
                type="text" 
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                required
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors cursor-text"
                placeholder="Ej. Jane Goodall"
              />
            </div>
          )}
          
          <div>
            <label className="block text-white/70 text-xs font-semibold mb-1 uppercase tracking-wider">Correo Electrónico</label>
            <input 
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors cursor-text"
              placeholder="investigador@wwf.org"
            />
          </div>

          <div>
            <label className="block text-white/70 text-xs font-semibold mb-1 uppercase tracking-wider">Contraseña</label>
            <input 
              type="password" 
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors cursor-text"
              placeholder="••••••••"
            />
          </div>

          <Button type="submit" disabled={loading} variant="primary" className="w-full py-3 mt-4 text-lg font-bold bg-[#00ff88] text-black hover:bg-[#00cc6a] shadow-[0_0_15px_rgba(0,255,136,0.3)] cursor-pointer flex justify-center items-center">
            {loading ? <Loader className="w-5 h-5 animate-spin" /> : (isLogin ? 'Ingresar' : 'Registrarse')}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm">
            {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes una cuenta?'}
            <button 
              onClick={() => setIsLogin(!isLogin)} 
              className="ml-2 text-primary font-semibold hover:underline cursor-pointer"
            >
              {isLogin ? 'Regístrate aquí' : 'Inicia Sesión'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
