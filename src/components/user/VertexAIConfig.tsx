import React, { useState } from 'react';
import { Settings, Key, Info, CheckCircle, AlertTriangle, Cloud, Brain, FileText, Copy, TestTube, Zap } from 'lucide-react';
import { isGoogleCloudConfigured, getGoogleCloudConfigInfo } from '../../config/googleCloud';
import { testVertexAIConnection } from '../../utils/vertexAI';

interface VertexAIConfigProps {
  onClose: () => void;
}

const VertexAIConfig: React.FC<VertexAIConfigProps> = ({ onClose }) => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    details?: any;
  } | null>(null);
  const configInfo = getGoogleCloudConfigInfo();

  const handleCopyEnvExample = () => {
    const envContent = `# Variables de Entorno para APIs
# Copia este archivo como .env y llena con tus valores reales

# Google Cloud Vertex AI API
VITE_GOOGLE_CLOUD_API_KEY=your_google_cloud_api_key_here
VITE_GOOGLE_CLOUD_PROJECT_ID=your_project_id_here
VITE_GOOGLE_CLOUD_LOCATION=us-central1
VITE_GOOGLE_CLOUD_MODEL=gemini-1.5-flash
VITE_VERTEX_AI_ENDPOINT=https://us-central1-aiplatform.googleapis.com

# Clarifai API (opcional - para comparación)
VITE_CLARIFAI_API_KEY=your_clarifai_api_key_here

# Configuración de la aplicación
VITE_APP_NAME=Alerta Médica Bolivia
VITE_APP_VERSION=2.0.0
VITE_APP_ENVIRONMENT=development`;

    navigator.clipboard.writeText(envContent).then(() => {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    });
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    
    try {
      const result = await testVertexAIConnection();
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        message: `Error de conexión: ${error instanceof Error ? error.message : 'Error desconocido'}`
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Cloud className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Configurar Vertex AI
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          {/* Estado de Configuración */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-5 h-5 text-blue-600" />
              <h3 className="font-medium text-gray-900">Estado de Configuración</h3>
            </div>
            
            <div className={`p-4 rounded-lg border ${
              configInfo.isConfigured 
                ? 'bg-green-50 border-green-200' 
                : 'bg-yellow-50 border-yellow-200'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {configInfo.isConfigured ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                )}
                <span className={`font-medium ${
                  configInfo.isConfigured ? 'text-green-900' : 'text-yellow-900'
                }`}>
                  {configInfo.isConfigured ? 'Configuración Completa' : 'Configuración Pendiente'}
                </span>
              </div>
              
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">API Key:</span>
                  <span className={configInfo.hasApiKey ? 'text-green-600' : 'text-red-600'}>
                    {configInfo.hasApiKey ? '✓ Configurada' : '✗ No configurada'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Project ID:</span>
                  <span className={configInfo.hasProjectId ? 'text-green-600' : 'text-red-600'}>
                    {configInfo.hasProjectId ? '✓ Configurado' : '✗ No configurado'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Modelo:</span>
                  <span className="text-gray-900">{configInfo.model}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Región:</span>
                  <span className="text-gray-900">{configInfo.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Endpoint:</span>
                  <span className="text-gray-900 text-xs">{configInfo.vertexAiEndpoint}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ambiente:</span>
                  <span className="text-gray-900">{configInfo.environment}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Prueba de Conexión */}
          {configInfo.isConfigured && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <TestTube className="w-5 h-5 text-blue-600" />
                <h3 className="font-medium text-gray-900">Prueba de Conexión</h3>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800 mb-3">
                  Prueba la conexión con Vertex AI para verificar que todo esté configurado correctamente.
                </p>
                
                <button
                  onClick={handleTestConnection}
                  disabled={isTesting}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isTesting ? (
                    <Loader className="animate-spin" size={16} />
                  ) : (
                    <Zap size={16} />
                  )}
                  {isTesting ? 'Probando...' : 'Probar Conexión'}
                </button>
                
                {testResult && (
                  <div className={`mt-3 p-3 rounded-lg border ${
                    testResult.success 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-center gap-2">
                      {testResult.success ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                      )}
                      <span className={`text-sm font-medium ${
                        testResult.success ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {testResult.message}
                      </span>
                    </div>
                    {testResult.details && (
                      <div className="mt-2 text-xs text-gray-600">
                        <div>Modelo: {testResult.details.model}</div>
                        <div>Región: {testResult.details.location}</div>
                        <div>Respuesta: {testResult.details.response}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Instrucciones */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-5 h-5 text-blue-600" />
              <h3 className="font-medium text-gray-900">Configuración con Vertex AI</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Vertex AI es la plataforma de IA más avanzada de Google. Proporciona acceso directo a los modelos 
              más potentes del mundo a través de AI Studio.
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-blue-900 mb-2">Pasos para configurar Vertex AI:</h4>
              <ol className="text-sm text-blue-800 space-y-1">
                <li>1. Ve a <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="underline">console.cloud.google.com</a></li>
                <li>2. Crea un proyecto o selecciona uno existente</li>
                <li>3. Habilita la API de Vertex AI</li>
                <li>4. Ve a AI Studio y configura tu modelo</li>
                <li>5. Crea credenciales de API</li>
                <li>6. Copia el archivo de ejemplo y configura las variables</li>
                <li>7. Reinicia la aplicación</li>
              </ol>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-4 h-4 text-green-600" />
                <span className="font-medium text-green-900">Vertex AI - Gemini 1.5 Flash</span>
              </div>
              <p className="text-sm text-green-800">
                Modelo de IA más avanzado del mundo con acceso directo a AI Studio. 
                Incluye 1,000 llamadas gratuitas por mes y análisis multimodal avanzado.
              </p>
            </div>
          </div>

          {/* Archivo de Variables de Entorno */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-gray-900">Archivo de Variables de Entorno</h3>
              <button
                onClick={handleCopyEnvExample}
                className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Copy size={14} />
                Copiar Ejemplo
              </button>
            </div>
            
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
              <div># Variables de Entorno para APIs</div>
              <div># Copia este archivo como .env y llena con tus valores reales</div>
              <div className="mt-2"></div>
              <div># Google Cloud Vertex AI API</div>
              <div>VITE_GOOGLE_CLOUD_API_KEY=your_google_cloud_api_key_here</div>
              <div>VITE_GOOGLE_CLOUD_PROJECT_ID=your_project_id_here</div>
              <div>VITE_GOOGLE_CLOUD_LOCATION=us-central1</div>
              <div>VITE_GOOGLE_CLOUD_MODEL=gemini-1.5-flash</div>
              <div>VITE_VERTEX_AI_ENDPOINT=https://us-central1-aiplatform.googleapis.com</div>
              <div className="mt-2"></div>
              <div># Clarifai API (opcional - para comparación)</div>
              <div>VITE_CLARIFAI_API_KEY=your_clarifai_api_key_here</div>
              <div className="mt-2"></div>
              <div># Configuración de la aplicación</div>
              <div>VITE_APP_NAME=Alerta Médica Bolivia</div>
              <div>VITE_APP_VERSION=2.0.0</div>
              <div>VITE_APP_ENVIRONMENT=development</div>
            </div>
          </div>

          {showSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-green-800 font-medium">
                  ¡Archivo de ejemplo copiado al portapapeles!
                </span>
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Entendido
            </button>
            <button
              onClick={() => window.open('https://console.cloud.google.com/', '_blank')}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Ir a Google Cloud
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VertexAIConfig; 