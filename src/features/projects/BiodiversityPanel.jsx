import React, { useMemo } from 'react';

// Simulador del Backend para cálculos de biodiversidad
const simulateBackendBiodiversity = (sightings) => {
  // Contar individuos por especie (ni)
  const counts = {};
  sightings.forEach(s => {
    counts[s.common_name] = (counts[s.common_name] || 0) + 1;
  });

  const totalN = Object.values(counts).reduce((sum, val) => sum + val, 0);

  // Crear el array esperado
  return Object.entries(counts).map(([especie, ni]) => {
    const pi = ni / totalN;
    const pi_ln_pi = pi * Math.log(pi);
    const pi_cuadrado = pi * pi;
    
    return {
      especie,
      ni,
      pi: Number(pi.toFixed(4)),
      pi_ln_pi: Number(pi_ln_pi.toFixed(4)),
      pi_cuadrado: Number(pi_cuadrado.toFixed(4))
    };
  });
};

export const BiodiversityPanel = ({ sightings }) => {
  const { sValue, dominante, shannon, simpson } = useMemo(() => {
    if (!sightings || sightings.length === 0) return { sValue: 0, dominante: 'N/A', shannon: 0, simpson: 0 };
    
    const backendData = simulateBackendBiodiversity(sightings);

    // Lógica en React según requerimientos
    
    // ESPECIES (S)
    const especiesS = backendData.length;

    // ESPECIE DOMINANTE
    const especieDominante = backendData.reduce((prev, current) => (prev.ni > current.ni) ? prev : current).especie;

    // DIVERSIDAD (Shannon H')
    const sumaShannon = backendData.reduce((sum, item) => sum + item.pi_ln_pi, 0);
    const diversidadShannon = sumaShannon * -1;

    // EQUILIBRIO (Simpson D)
    const equilibrioSimpson = backendData.reduce((sum, item) => sum + item.pi_cuadrado, 0);

    return {
      sValue: especiesS,
      dominante: especieDominante,
      shannon: diversidadShannon.toFixed(2),
      simpson: equilibrioSimpson.toFixed(2)
    };
  }, [sightings]);

  if (!sightings || sightings.length === 0) return null;

  return (
    <div className="bg-gradient-to-br from-[#0a0f18] to-[#111827] p-5 rounded-3xl border border-white/5 shadow-inner flex-1 flex flex-col min-w-[300px] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px] pointer-events-none"></div>
      
      <div className="mb-4 relative z-10 flex items-center gap-2">
        <div className="w-1.5 h-6 bg-gradient-to-b from-[#00ff88] to-blue-500 rounded-full"></div>
        <h3 className="text-lg font-black text-white tracking-wide">
          Índices de Biodiversidad
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-4 flex-1 relative z-10">
        {/* Tarjeta 1 (Arriba Izquierda) */}
        <div className="bg-black/40 border border-white/5 rounded-2xl p-4 flex flex-col relative overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:bg-black/60 hover:border-blue-500/30 group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-blue-400/20"></div>
          <h4 className="text-gray-500 text-[10px] font-black tracking-widest uppercase mb-1 flex items-center justify-between">
            <span>Riqueza (S)</span>
            <span className="w-4 h-4 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">S</span>
          </h4>
          <div className="flex-1 flex items-center justify-start">
            <p className="text-4xl font-black text-white drop-shadow-md group-hover:text-blue-400 transition-colors">{sValue}</p>
          </div>
        </div>

        {/* Tarjeta 2 (Arriba Derecha) */}
        <div className="bg-black/40 border border-white/5 rounded-2xl p-4 flex flex-col relative overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:bg-black/60 hover:border-[#00ff88]/30 group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00ff88] to-[#00ff88]/20"></div>
          <h4 className="text-gray-500 text-[10px] font-black tracking-widest uppercase mb-1 flex items-center justify-between">
            <span>Diversidad (H')</span>
            <span className="w-4 h-4 bg-[#00ff88]/10 rounded-full flex items-center justify-center text-[#00ff88] group-hover:scale-110 transition-transform">H</span>
          </h4>
          <div className="flex-1 flex items-center justify-start">
            <p className="text-4xl font-black text-white drop-shadow-md group-hover:text-[#00ff88] transition-colors">{shannon}</p>
          </div>
        </div>

        {/* Tarjeta 3 (Abajo Izquierda) */}
        <div className="bg-black/40 border border-white/5 rounded-2xl p-4 flex flex-col relative overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:bg-black/60 hover:border-purple-500/30 group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-purple-400/20"></div>
          <h4 className="text-gray-500 text-[10px] font-black tracking-widest uppercase mb-1 flex items-center justify-between">
            <span>Equilibrio (D)</span>
            <span className="w-4 h-4 bg-purple-500/10 rounded-full flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">D</span>
          </h4>
          <div className="flex-1 flex items-center justify-start">
            <p className="text-4xl font-black text-white drop-shadow-md group-hover:text-purple-400 transition-colors">{simpson}</p>
          </div>
        </div>

        {/* Tarjeta 4 (Abajo Derecha) */}
        <div className="bg-black/40 border border-white/5 rounded-2xl p-4 flex flex-col relative overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:bg-black/60 hover:border-orange-500/30 group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-orange-400/20"></div>
          <h4 className="text-gray-500 text-[10px] font-black tracking-widest uppercase mb-1 flex items-center justify-between">
            <span>Dominante</span>
            <span className="w-4 h-4 bg-orange-500/10 rounded-full flex items-center justify-center text-orange-400 group-hover:scale-110 transition-transform">★</span>
          </h4>
          <div className="flex-1 flex items-center justify-start">
            <p className="text-2xl font-black text-orange-400 capitalize leading-tight break-words group-hover:text-orange-300 transition-colors">{dominante}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
