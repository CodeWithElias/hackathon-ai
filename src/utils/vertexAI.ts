// Vertex AI Service para análisis de emergencias usando AI Studio
import { 
  GOOGLE_CLOUD_CONFIG, 
  VERTEX_AI_PROMPTS, 
  getGoogleCloudApiKey, 
  getGoogleCloudProjectId,
  VERTEX_AI_ENDPOINTS 
} from '../config/googleCloud';

export interface VertexAIAnalysis {
  imageDescription: string;
  triageLevel: 'Rojo' | 'Amarillo' | 'Verde';
  justification: string;
  isFakeAlarm: boolean;
  triageAnswers: {
    conscious: 'Sí' | 'No';
    breathing: 'Sí' | 'No';
    movement: 'Sí' | 'No';
    bleeding: 'Sí' | 'No';
  };
  accidentType: string;
  injuredCount: number;
  confidence: number;
  detectedObjects: string[];
  medicalIndicators: string[];
  vertexAIResponse: any;
}

// Función para convertir imagen a base64
const imageToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Extraer solo la parte base64 (sin el prefijo data:image/...;base64,)
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Función para hacer llamada a Vertex AI API
const callVertexAIAPI = async (prompt: string, imageBase64?: string): Promise<any> => {
  const apiKey = getGoogleCloudApiKey();
  const model = GOOGLE_CLOUD_CONFIG.MODEL_NAME;
  
  // Construir el endpoint de Gemini API
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  
  const requestBody: any = {
    contents: [{
      parts: [
        { text: prompt }
      ]
    }],
    generationConfig: {
      temperature: 0.1,
      topK: 32,
      topP: 1,
      maxOutputTokens: 2048,
    },
    safetySettings: [
      {
        category: "HARM_CATEGORY_HARASSMENT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE"
      },
      {
        category: "HARM_CATEGORY_HATE_SPEECH",
        threshold: "BLOCK_MEDIUM_AND_ABOVE"
      },
      {
        category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE"
      },
      {
        category: "HARM_CATEGORY_DANGEROUS_CONTENT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE"
      }
    ]
  };

  // Si hay imagen, agregarla al request
  if (imageBase64) {
    requestBody.contents[0].parts.push({
      inline_data: {
        mime_type: "image/jpeg",
        data: imageBase64
      }
    });
  }

  try {
    console.log('Llamando a Gemini API:', {
      endpoint: endpoint.split('?')[0], // Sin mostrar la API key
      model,
      hasImage: Boolean(imageBase64)
    });

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error en Gemini API:', response.status, errorText);
      throw new Error(`Error en Gemini API: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Respuesta de Gemini API:', data);
    return data;
  } catch (error) {
    console.error('Error llamando a Gemini API:', error);
    throw error;
  }
};

// Función para parsear respuesta JSON de Vertex AI
const parseVertexAIResponse = (response: any): any => {
  try {
    const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error('Respuesta vacía de Vertex AI');
    }

    console.log('Texto de respuesta de Vertex AI:', text);

    // Intentar extraer JSON de la respuesta
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      console.log('JSON parseado de Vertex AI:', parsed);
      return parsed;
    }

    // Si no hay JSON, intentar parsear la respuesta como texto
    return {
      imageDescription: text,
      triageLevel: 'Amarillo',
      justification: 'Análisis automático realizado con Vertex AI',
      isFakeAlarm: false,
      triageAnswers: {
        conscious: 'Sí',
        breathing: 'Sí',
        movement: 'Sí',
        bleeding: 'No'
      },
      accidentType: 'Otro',
      injuredCount: 1,
      confidence: 50,
      detectedObjects: [],
      medicalIndicators: []
    };
  } catch (error) {
    console.error('Error parseando respuesta de Vertex AI:', error);
    throw error;
  }
};

// Función principal de análisis con Vertex AI
export const analyzeImageWithVertexAI = async (
  imageFile: File
): Promise<VertexAIAnalysis> => {
  try {
    console.log('Iniciando análisis con Vertex AI:', imageFile.name);
    
    // Convertir imagen a base64
    const base64Image = await imageToBase64(imageFile);
    
    // Llamar a Vertex AI con prompt de análisis de emergencia
    const response = await callVertexAIAPI(VERTEX_AI_PROMPTS.EMERGENCY_ANALYSIS, base64Image);
    
    console.log('Respuesta completa de Vertex AI:', response);
    
    // Parsear respuesta
    const analysis = parseVertexAIResponse(response);
    
    // Validar y completar análisis
    const validatedAnalysis = validateAndCompleteAnalysis(analysis, imageFile.name);
    
    console.log('Análisis completado con Vertex AI:', validatedAnalysis);
    return validatedAnalysis;
    
  } catch (error) {
    console.error('Error en análisis con Vertex AI:', error);
    
    // Fallback en caso de error
    return {
      imageDescription: 'Error en el análisis con Vertex AI. Se requiere evaluación manual.',
      triageLevel: 'Amarillo',
      justification: 'Análisis automático no disponible',
      isFakeAlarm: false,
      triageAnswers: {
        conscious: 'Sí',
        breathing: 'Sí',
        movement: 'Sí',
        bleeding: 'No'
      },
      accidentType: 'Otro',
      injuredCount: 1,
      confidence: 0,
      detectedObjects: [],
      medicalIndicators: [],
      vertexAIResponse: null
    };
  }
};

// Función para validar y completar análisis
const validateAndCompleteAnalysis = (analysis: any, fileName: string): VertexAIAnalysis => {
  // Validar campos requeridos
  const validated: VertexAIAnalysis = {
    imageDescription: analysis.imageDescription || 'Análisis automático realizado con Vertex AI',
    triageLevel: validateTriageLevel(analysis.triageLevel),
    justification: analysis.justification || 'Análisis automático realizado con Vertex AI',
    isFakeAlarm: Boolean(analysis.isFakeAlarm),
    triageAnswers: validateTriageAnswers(analysis.triageAnswers),
    accidentType: validateAccidentType(analysis.accidentType),
    injuredCount: validateInjuredCount(analysis.injuredCount),
    confidence: validateConfidence(analysis.confidence),
    detectedObjects: Array.isArray(analysis.detectedObjects) ? analysis.detectedObjects : [],
    medicalIndicators: Array.isArray(analysis.medicalIndicators) ? analysis.medicalIndicators : [],
    vertexAIResponse: analysis
  };

  // Verificar si es falsa alarma basado en nombre de archivo
  if (isFakeAlarmByFileName(fileName)) {
    validated.isFakeAlarm = true;
    validated.triageLevel = 'Verde';
    validated.justification = 'Nombre de archivo sugiere falsa alarma';
  }

  return validated;
};

// Funciones de validación
const validateTriageLevel = (level: any): 'Rojo' | 'Amarillo' | 'Verde' => {
  if (level === 'Rojo' || level === 'Amarillo' || level === 'Verde') {
    return level;
  }
  return 'Amarillo';
};

const validateTriageAnswers = (answers: any): {
  conscious: 'Sí' | 'No';
  breathing: 'Sí' | 'No';
  movement: 'Sí' | 'No';
  bleeding: 'Sí' | 'No';
} => {
  return {
    conscious: answers?.conscious === 'No' ? 'No' : 'Sí',
    breathing: answers?.breathing === 'No' ? 'No' : 'Sí',
    movement: answers?.movement === 'No' ? 'No' : 'Sí',
    bleeding: answers?.bleeding === 'Sí' ? 'Sí' : 'No'
  };
};

const validateAccidentType = (type: any): string => {
  const validTypes = ['Choque de Vehículos', 'Caída', 'Quemadura', 'Atropello', 'Otro'];
  if (validTypes.includes(type)) {
    return type;
  }
  return 'Otro';
};

const validateInjuredCount = (count: any): number => {
  const num = parseInt(count);
  if (isNaN(num) || num < 1) return 1;
  if (num > 20) return 20;
  return num;
};

const validateConfidence = (confidence: any): number => {
  const num = parseInt(confidence);
  if (isNaN(num) || num < 0) return 0;
  if (num > 100) return 100;
  return num;
};

const isFakeAlarmByFileName = (fileName: string): boolean => {
  const fakeKeywords = ['meme', 'fake', 'broma', 'chiste', 'test', 'prueba', 'joke', 'funny'];
  return fakeKeywords.some(keyword => fileName.toLowerCase().includes(keyword));
};

// Función para detectar falsas alarmas con Vertex AI
export const detectFakeAlarmWithVertexAI = async (
  imageFile: File,
  description: string
): Promise<boolean> => {
  try {
    console.log('Detectando falsa alarma con Vertex AI:', imageFile.name);
    
    // Convertir imagen a base64
    const base64Image = await imageToBase64(imageFile);
    
    // Llamar a Vertex AI con prompt de detección de falsas alarmas
    const response = await callVertexAIAPI(VERTEX_AI_PROMPTS.FAKE_ALARM_DETECTION, base64Image);
    
    console.log('Respuesta de detección de falsa alarma:', response);
    
    // Parsear respuesta
    const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      return false;
    }
    
    // Verificar si la respuesta indica falsa alarma
    const isFake = text.toLowerCase().includes('true') || 
                   text.toLowerCase().includes('falsa') ||
                   text.toLowerCase().includes('broma');
    
    console.log('Detección de falsa alarma con Vertex AI:', isFake);
    return isFake;
    
  } catch (error) {
    console.error('Error detectando falsa alarma con Vertex AI:', error);
    return false;
  }
};

// Función para análisis médico específico con Vertex AI
export const analyzeMedicalTriageWithVertexAI = async (
  imageFile: File
): Promise<{
  triageLevel: 'Rojo' | 'Amarillo' | 'Verde';
  justification: string;
  confidence: number;
}> => {
  try {
    console.log('Analizando triaje médico con Vertex AI:', imageFile.name);
    
    // Convertir imagen a base64
    const base64Image = await imageToBase64(imageFile);
    
    // Llamar a Vertex AI con prompt médico
    const response = await callVertexAIAPI(VERTEX_AI_PROMPTS.MEDICAL_TRIAGE, base64Image);
    
    console.log('Respuesta de triaje médico con Vertex AI:', response);
    
    // Parsear respuesta
    const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      return {
        triageLevel: 'Amarillo',
        justification: 'Análisis no disponible',
        confidence: 0
      };
    }
    
    // Determinar nivel de triaje basado en la respuesta
    let triageLevel: 'Rojo' | 'Amarillo' | 'Verde' = 'Amarillo';
    let confidence = 70;
    
    if (text.toLowerCase().includes('rojo') || text.toLowerCase().includes('crítica')) {
      triageLevel = 'Rojo';
      confidence = 85;
    } else if (text.toLowerCase().includes('verde') || text.toLowerCase().includes('menor')) {
      triageLevel = 'Verde';
      confidence = 75;
    }
    
    return {
      triageLevel,
      justification: text,
      confidence
    };
    
  } catch (error) {
    console.error('Error en análisis médico con Vertex AI:', error);
    return {
      triageLevel: 'Amarillo',
      justification: 'Error en análisis médico',
      confidence: 0
    };
  }
};

// Función para obtener información del modelo Vertex AI
export const getVertexAIModelInfo = () => {
  return {
    model: GOOGLE_CLOUD_CONFIG.MODEL_NAME,
    features: GOOGLE_CLOUD_CONFIG.FEATURES,
    freeTierLimit: GOOGLE_CLOUD_CONFIG.FREE_TIER_LIMIT,
    location: GOOGLE_CLOUD_CONFIG.LOCATION,
    endpoint: GOOGLE_CLOUD_CONFIG.VERTEX_AI_ENDPOINT,
    projectId: getGoogleCloudProjectId()
  };
};

// Función para probar la conexión con Vertex AI
export const testVertexAIConnection = async (): Promise<{
  success: boolean;
  message: string;
  details?: any;
}> => {
  try {
    console.log('Probando conexión con Vertex AI...');
    
    const response = await callVertexAIAPI('Responde solo con "OK" si puedes leer este mensaje.');
    
    if (response.candidates?.[0]?.content?.parts?.[0]?.text) {
      return {
        success: true,
        message: 'Conexión exitosa con Vertex AI',
        details: {
          model: GOOGLE_CLOUD_CONFIG.MODEL_NAME,
          location: GOOGLE_CLOUD_CONFIG.LOCATION,
          response: response.candidates[0].content.parts[0].text
        }
      };
    } else {
      return {
        success: false,
        message: 'Respuesta inesperada de Vertex AI'
      };
    }
  } catch (error) {
    console.error('Error probando conexión con Vertex AI:', error);
    return {
      success: false,
      message: `Error de conexión: ${error instanceof Error ? error.message : 'Error desconocido'}`
    };
  }
};

// Función para generar descripción médica concisa
export const generateMedicalDescription = async (
  imageFile: File
): Promise<string> => {
  try {
    console.log('Generando descripción médica para:', imageFile.name);
    
    // Convertir imagen a base64
    const base64Image = await imageToBase64(imageFile);
    
    const prompt = `
Como médico de emergencias, analiza esta imagen y genera una descripción médica concisa y profesional que sea útil para el personal hospitalario.

La descripción debe incluir:
- Tipo de emergencia/accidente
- Número aproximado de personas involucradas
- Gravedad aparente de las lesiones
- Elementos médicos relevantes visibles
- Cualquier factor de riesgo adicional

Responde SOLO con la descripción médica, sin formato JSON, en máximo 2-3 oraciones. Sé específico y profesional.

Ejemplo de formato:
"Accidente vehicular con 2 personas involucradas. Una persona visiblemente inconsciente en el suelo con posible trauma craneal. Vehículo con daños moderados en la parte frontal."

Analiza la imagen y proporciona una descripción similar.
`;
    
    // Llamar a Gemini API
    const response = await callVertexAIAPI(prompt, base64Image);
    
    // Extraer el texto de la respuesta
    const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) {
      throw new Error('No se pudo generar descripción médica');
    }
    
    console.log('Descripción médica generada:', text);
    return text.trim();
    
  } catch (error) {
    console.error('Error generando descripción médica:', error);
    return 'Descripción no disponible - requiere evaluación manual';
  }
}; 