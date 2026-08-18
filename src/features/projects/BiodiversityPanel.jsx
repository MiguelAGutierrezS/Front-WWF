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
    <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex-1 flex flex-col min-w-[300px]">
      <div className="mb-3">
        <h3 className="text-lg font-bold text-white mb-2">
          Índice de Biodiversidad
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-4 flex-1">
        {/* Tarjeta 1 (Arriba Izquierda) */}
        <div className="bg-black/20 border border-white/5 rounded-xl p-3 flex flex-col relative overflow-hidden transition-colors text-center">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-transparent opacity-50"></div>
          <h4 className="text-gray-400 text-xs font-semibold tracking-wider uppercase mb-1">Estructura de gremio troficos</h4>
          <div className="flex-1 flex items-center justify-center">
            <p className="text-3xl font-extrabold text-white">{sValue}</p>
          </div>
        </div>

        {/* Tarjeta 2 (Arriba Derecha) */}
        <div className="bg-black/20 border border-white/5 rounded-xl p-3 flex flex-col relative overflow-hidden transition-colors text-center">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-transparent opacity-50"></div>
          <h4 className="text-gray-400 text-xs font-semibold tracking-wider uppercase mb-1">Diversidad (H')</h4>
          <div className="flex-1 flex items-center justify-center">
            <p className="text-3xl font-extrabold text-white">{shannon}</p>
          </div>
        </div>

        {/* Tarjeta 3 (Abajo Izquierda) */}
        <div className="bg-black/20 border border-white/5 rounded-xl p-3 flex flex-col relative overflow-hidden transition-colors text-center">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 to-transparent opacity-50"></div>
          <h4 className="text-gray-400 text-xs font-semibold tracking-wider uppercase mb-1">Equilibrio (D)</h4>
          <div className="flex-1 flex items-center justify-center">
            <p className="text-3xl font-extrabold text-white">{simpson}</p>
          </div>
        </div>

        {/* Tarjeta 4 (Abajo Derecha) */}
        <div className="bg-black/20 border border-white/5 rounded-xl p-3 flex flex-col relative overflow-hidden transition-colors text-center">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-transparent opacity-50"></div>
          <h4 className="text-gray-400 text-xs font-semibold tracking-wider uppercase mb-1">Dominante</h4>
          <div className="flex-1 flex items-center justify-center">
            <p className="text-xl font-extrabold text-primary capitalize leading-tight break-words">{dominante}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
