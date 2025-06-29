// Configuración de Google Cloud Vertex AI usando variables de entorno
// Para configurar:
// 1. Copia env.example como .env
// 2. Llena VITE_GOOGLE_CLOUD_API_KEY y VITE_GOOGLE_CLOUD_PROJECT_ID
// 3. Configura Vertex AI en AI Studio
// 4. Reinicia la aplicación

export const GOOGLE_CLOUD_CONFIG = {
  API_KEY: import.meta.env.VITE_GOOGLE_CLOUD_API_KEY || 'YOUR_GOOGLE_CLOUD_API_KEY',
  PROJECT_ID: import.meta.env.VITE_GOOGLE_CLOUD_PROJECT_ID || 'YOUR_PROJECT_ID',
  LOCATION: import.meta.env.VITE_GOOGLE_CLOUD_LOCATION || 'us-central1',
  MODEL_NAME: import.meta.env.VITE_GOOGLE_CLOUD_MODEL || 'gemini-2.0-flash',
  VERTEX_AI_ENDPOINT: import.meta.env.VITE_VERTEX_AI_ENDPOINT || 'https://generativelanguage.googleapis.com',
  FREE_TIER_LIMIT: 1000, // Llamadas gratuitas por mes
  FEATURES: {
    IMAGE_ANALYSIS: true,
    TEXT_GENERATION: true,
    EMERGENCY_ANALYSIS: true,
    FAKE_ALARM_DETECTION: true,
    MEDICAL_TRIAGE: true,
    VERTEX_AI_INTEGRATION: true
  }
};

// Función para validar si la API key está configurada
export const isGoogleCloudConfigured = (): boolean => {
  const apiKey = import.meta.env.VITE_GOOGLE_CLOUD_API_KEY;
  const projectId = import.meta.env.VITE_GOOGLE_CLOUD_PROJECT_ID;
  
  return Boolean(apiKey && 
         apiKey !== 'your_google_cloud_api_key_here' && 
         apiKey.length > 20 &&
         projectId && 
         projectId !== 'your_project_id_here');
};

// Función para obtener la API key
export const getGoogleCloudApiKey = (): string => {
  const apiKey = import.meta.env.VITE_GOOGLE_CLOUD_API_KEY;
  if (!apiKey || apiKey === 'your_google_cloud_api_key_here') {
    throw new Error('Google Cloud API key no está configurada. Por favor, configura VITE_GOOGLE_CLOUD_API_KEY en tu archivo .env');
  }
  return apiKey;
};

// Función para obtener el Project ID
export const getGoogleCloudProjectId = (): string => {
  const projectId = import.meta.env.VITE_GOOGLE_CLOUD_PROJECT_ID;
  if (!projectId || projectId === 'your_project_id_here') {
    throw new Error('Google Cloud Project ID no está configurado. Por favor, configura VITE_GOOGLE_CLOUD_PROJECT_ID en tu archivo .env');
  }
  return projectId;
};

// Función para obtener información de configuración
export const getGoogleCloudConfigInfo = () => {
  return {
    isConfigured: isGoogleCloudConfigured(),
    hasApiKey: Boolean(import.meta.env.VITE_GOOGLE_CLOUD_API_KEY),
    hasProjectId: Boolean(import.meta.env.VITE_GOOGLE_CLOUD_PROJECT_ID),
    location: GOOGLE_CLOUD_CONFIG.LOCATION,
    model: GOOGLE_CLOUD_CONFIG.MODEL_NAME,
    environment: import.meta.env.VITE_APP_ENVIRONMENT || 'development',
    vertexAiEndpoint: GOOGLE_CLOUD_CONFIG.VERTEX_AI_ENDPOINT
  };
};

// Configuración de prompts para Vertex AI
export const VERTEX_AI_PROMPTS = {
  EMERGENCY_ANALYSIS: `
Eres un experto en análisis de emergencias médicas. Analiza la imagen proporcionada y responde en formato JSON con la siguiente estructura:

{
  "imageDescription": "Descripción detallada de lo que ves en la imagen",
  "triageLevel": "Rojo|Amarillo|Verde",
  "justification": "Explicación detallada de por qué asignaste ese nivel de triaje",
  "isFakeAlarm": true/false,
  "triageAnswers": {
    "conscious": "Sí|No",
    "breathing": "Sí|No", 
    "movement": "Sí|No",
    "bleeding": "Sí|No"
  },
  "accidentType": "Choque de Vehículos|Caída|Quemadura|Atropello|Otro",
  "injuredCount": número,
  "confidence": número_entre_0_y_100,
  "detectedObjects": ["objeto1", "objeto2"],
  "medicalIndicators": ["indicador1", "indicador2"]
}

Consideraciones importantes:
- Rojo: Emergencia crítica que requiere atención inmediata
- Amarillo: Emergencia moderada que requiere atención pronta
- Verde: Emergencia menor o falsa alarma
- Falsa alarma: Si es una broma, meme, evento social, etc.
- Confianza: Basada en la claridad de la imagen y evidencia visible
`,

  FAKE_ALARM_DETECTION: `
Analiza esta imagen para determinar si es una falsa alarma o broma. Responde solo con "true" si es falsa alarma o "false" si es una emergencia real.

Indicadores de falsa alarma:
- Memes o bromas
- Eventos sociales (bodas, cumpleaños)
- Contenido de entretenimiento
- Moda o belleza
- Bienes raíces
- Celebridades
- Lugares turísticos
- Comida
- Dibujos o arte
- Texto que indique broma
`,

  MEDICAL_TRIAGE: `
Como experto médico, evalúa la gravedad de esta emergencia. Considera:

Factores de gravedad (Rojo):
- Sangrado abundante
- Persona inconsciente
- Dificultad respiratoria
- Múltiples heridos
- Fuego o quemaduras graves
- Atropello con vehículo

Factores moderados (Amarillo):
- Lesiones visibles
- Una persona herida
- Dolor evidente
- Necesidad de atención médica

Factores menores (Verde):
- Lesiones leves
- Sin evidencia de gravedad
- Posible falsa alarma

Responde con el nivel de triaje más apropiado.
`
};

// Configuración de modelos disponibles en Vertex AI
export const VERTEX_AI_MODELS = {
  GEMINI_2_0_FLASH: 'gemini-2.0-flash',
  GEMINI_1_5_FLASH: 'gemini-1.5-flash',
  GEMINI_1_5_PRO: 'gemini-1.5-pro',
  GEMINI_1_0_PRO: 'gemini-1.0-pro',
  GEMINI_1_5_FLASH_LATEST: 'gemini-1.5-flash-latest',
  GEMINI_1_5_PRO_LATEST: 'gemini-1.5-pro-latest'
};

// Configuración de regiones disponibles para Vertex AI
export const VERTEX_AI_REGIONS = {
  US_CENTRAL_1: 'us-central1',
  US_EAST_1: 'us-east1',
  US_WEST_1: 'us-west1',
  EUROPE_WEST_1: 'europe-west1',
  ASIA_SOUTHEAST_1: 'asia-southeast1',
  EUROPE_WEST_4: 'europe-west4',
  US_WEST_4: 'us-west4'
};

// Configuración de endpoints de Vertex AI
export const VERTEX_AI_ENDPOINTS = {
  US_CENTRAL_1: 'https://us-central1-aiplatform.googleapis.com',
  US_EAST_1: 'https://us-east1-aiplatform.googleapis.com',
  US_WEST_1: 'https://us-west1-aiplatform.googleapis.com',
  EUROPE_WEST_1: 'https://europe-west1-aiplatform.googleapis.com',
  ASIA_SOUTHEAST_1: 'https://asia-southeast1-aiplatform.googleapis.com'
}; 