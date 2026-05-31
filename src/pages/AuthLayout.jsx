import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ArrowLeft } from 'lucide-react';

export const AuthLayout = () => {
  const [isLogin, setIsLogin] = useState(true);

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

        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          {!isLogin && (
            <div>
              <label className="block text-white/70 text-xs font-semibold mb-1 uppercase tracking-wider">Nombre Completo</label>
              <input 
                type="text" 
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors cursor-text"
                placeholder="Ej. Jane Goodall"
              />
            </div>
          )}
          
          <div>
            <label className="block text-white/70 text-xs font-semibold mb-1 uppercase tracking-wider">Correo Electrónico</label>
            <input 
              type="email" 
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors cursor-text"
              placeholder="investigador@wwf.org"
            />
          </div>

          <div>
            <label className="block text-white/70 text-xs font-semibold mb-1 uppercase tracking-wider">Contraseña</label>
            <input 
              type="password" 
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors cursor-text"
              placeholder="••••••••"
            />
          </div>

          <Button variant="primary" className="w-full py-3 mt-4 text-lg font-bold bg-[#00ff88] text-black hover:bg-[#00cc6a] shadow-[0_0_15px_rgba(0,255,136,0.3)] cursor-pointer">
            {isLogin ? 'Ingresar' : 'Registrarse'}
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
