// Helper para generar UUIDs falsos pero consistentes
const uuid = (id) => `uuid-${id}`;

// 1. USUARIOS
export const users = [
  { id: uuid('u1'), full_name: 'Dra. Elena Silva', email: 'elena@wwf.org', institucion: 'WWF Conservación', sexo: 'F' },
  { id: uuid('u2'), full_name: 'Dr. Carlos Mendoza', email: 'cmendoza@bio.org', institucion: 'Instituto de Biología', sexo: 'M' },
  { id: uuid('u3'), full_name: 'Ana Torres', email: 'atorres@parks.org', institucion: 'Parques Nacionales', sexo: 'F' },
  { id: uuid('u4'), full_name: 'Dr. Roberto Gómez', email: 'rgomez@amazon.org', institucion: 'Amazon Watch', sexo: 'M' },
  { id: uuid('u5'), full_name: 'Lic. Sofia Ramos', email: 'sramos@eco.org', institucion: 'EcoAndes', sexo: 'F' }
];

// 2. PROYECTOS
export const projects = [
  { 
    id: uuid('p1'), user_id: uuid('u1'), 
    title: 'Monitoreo de Jaguar en el Pantanal', 
    description: 'Estudio de densidad poblacional y uso de hábitat del jaguar en humedales.',
    objectives: 'Identificar rutas de movimiento y conflictos con ganadería.',
    expected_results: 'Mapa de calor de actividad, identificación de individuos clave.',
    status: 'public'
  },
  { 
    id: uuid('p2'), user_id: uuid('u2'), 
    title: 'Fauna Post-Incendios Chiquitanía', 
    description: 'Evaluación de recuperación de biomasa y retorno de mamíferos medianos y grandes.',
    objectives: 'Medir tasa de recuperación de herbívoros y depredadores.',
    expected_results: 'Catálogo de especies sobrevivientes y colonizadoras.',
    status: 'public'
  },
  { 
    id: uuid('p3'), user_id: uuid('u3'), 
    title: 'Corredor Biológico Mesoamericano', 
    description: 'Monitoreo continuo en reservas forestales conectadas.',
    objectives: 'Detectar presencia de cazadores y fauna endémica.',
    expected_results: 'Alerta temprana de invasiones, catálogo de biodiversidad.',
    status: 'private'
  },
  { 
    id: uuid('p4'), user_id: uuid('u4'), 
    title: 'Reserva Amazónica Norte', 
    description: 'Censo de tapires y grandes felinos en la cuenca amazónica.',
    objectives: 'Determinar impacto de la deforestación en áreas periféricas.',
    expected_results: 'Índice de abundancia relativa por temporada.',
    status: 'public'
  },
  { 
    id: uuid('p5'), user_id: uuid('u5'), 
    title: 'Protección Oso Andino', 
    description: 'Cámaras trampa en rutas de transición entre selva y montaña.',
    objectives: 'Confirmar paso del Oso Jucumari.',
    expected_results: 'Registros fotográficos de individuos para identificación.',
    status: 'public'
  },
  { 
    id: uuid('p6'), user_id: uuid('u1'), 
    title: 'Proyecto Piloto Ocelotes', 
    description: 'Monitoreo a pequeña escala en parches boscosos urbanos.',
    objectives: 'Evaluar conectividad genética.',
    expected_results: 'Planificación territorial urbana.',
    status: 'public'
  }
];

// Generador de Cámaras y Especies para llenar la base de datos
const generateMockData = () => {
  const camera_stations = [];
  const species = [];
  let stationCounter = 1;
  let speciesCounter = 1;

  const projectCenters = {
    [uuid('p1')]: { lat: -16.29, lng: -63.59, cameras: 20 },
    [uuid('p2')]: { lat: -16.49, lng: -61.01, cameras: 15 },
    [uuid('p3')]: { lat: 9.93, lng: -84.09, cameras: 18 },
    [uuid('p4')]: { lat: -3.46, lng: -62.21, cameras: 12 },
    [uuid('p5')]: { lat: -14.15, lng: -68.85, cameras: 8 },
    [uuid('p6')]: { lat: -17.78, lng: -63.18, cameras: 5 }
  };

  const animalTypes = [
    { name: 'Jaguar', weight: 15, family: 'Felidae', genus: 'Panthera' },
    { name: 'Puma', weight: 20, family: 'Felidae', genus: 'Puma' },
    { name: 'Capibara', weight: 35, family: 'Caviidae', genus: 'Hydrochoerus' },
    { name: 'Tapir', weight: 15, family: 'Tapiridae', genus: 'Tapirus' },
    { name: 'Oso Hormiguero', weight: 10, family: 'Myrmecophagidae', genus: 'Myrmecophaga' },
    { name: 'Ocelote', weight: 8, family: 'Felidae', genus: 'Leopardus' },
    { name: 'Oso Andino', weight: 3, family: 'Ursidae', genus: 'Tremarctos' },
    { name: 'Mono Araña', weight: 12, family: 'Atelidae', genus: 'Ateles' },
    { name: 'Pecarí', weight: 25, family: 'Tayassuidae', genus: 'Pecari' }
  ];

  const getRandomAnimal = () => {
    const totalWeight = animalTypes.reduce((acc, curr) => acc + curr.weight, 0);
    let randomNum = Math.random() * totalWeight;
    for (let animal of animalTypes) {
      if (randomNum < animal.weight) return animal;
      randomNum -= animal.weight;
    }
    return { name: 'Animal Desconocido', family: 'Desconocido', genus: 'Desconocido' };
  };

  // Generar Estaciones
  for (const [projId, center] of Object.entries(projectCenters)) {
    for (let i = 0; i < center.cameras; i++) {
      const stId = uuid(`st${stationCounter}`);
      
      // Coordenadas esparcidas alrededor del centro
      const latOffset = (Math.random() - 0.5) * 0.15;
      const lngOffset = (Math.random() - 0.5) * 0.15;
      
      const deploymentDate = new Date(2025, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
      const isRetrieved = Math.random() > 0.7; // 30% chance to be retrieved
      
      let retrievalDate = null;
      if (isRetrieved) {
        retrievalDate = new Date(deploymentDate.getTime() + (Math.floor(Math.random() * 60) + 10) * 24 * 60 * 60 * 1000);
      }

      camera_stations.push({
        id: stId,
        project_id: projId,
        station_code: `CAM-${projId.replace('uuid-','')}-${i+1}`,
        location_name: `Estación Sector ${String.fromCharCode(65 + (i % 5))}`,
        latitude: center.lat + latOffset,
        longitude: center.lng + lngOffset,
        camera_brand: Math.random() > 0.5 ? 'Browning' : 'Bushnell',
        camera_model: 'Recon Force 4K',
        status: isRetrieved ? 'retrieved' : 'active',
        deployment_date: deploymentDate.toISOString().split('T')[0],
        ...(isRetrieved && { retrieval_date: retrievalDate.toISOString().split('T')[0] })
      });

      const numSightings = Math.floor(Math.random() * 19) + 2;
      for (let j = 0; j < numSightings; j++) {
        const date = new Date(2026, Math.floor(Math.random() * 6), Math.floor(Math.random() * 28) + 1, Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
        
        const hour = date.getHours();
        let periodo = 'Noche';
        if (hour >= 6 && hour < 14) periodo = 'Mañana';
        else if (hour >= 14 && hour < 20) periodo = 'Tarde';
        
        const temperatura = Math.floor(Math.random() * 26) + 15; // 15 to 40
        const animalData = getRandomAnimal();
        
        species.push({
          id: uuid(`sp${speciesCounter}`),
          station_id: stId,
          common_name: animalData.name,
          family: animalData.family,
          genus: animalData.genus,
          confidence_score: (Math.random() * 0.2 + 0.8).toFixed(2), // 80% to 100%
          detection_timestamp: date.toISOString(),
          periodo: periodo,
          temperatura: temperatura,
          image_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQYRM2jpS2-_NuMn1hQoiu6d_CHMCKhQZ6YKw&s'
        });
        speciesCounter++;
      }
      
      stationCounter++;
    }
  }

  return { camera_stations, species };
};

const generatedData = generateMockData();
export const camera_stations = generatedData.camera_stations;
export const species = generatedData.species;
