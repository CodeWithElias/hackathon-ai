import React, { useState } from 'react';
import { Settings, Key, Info, CheckCircle, AlertTriangle, Sliders } from 'lucide-react';
import { CLARIFAI_CONFIG, isClarifaiConfigured } from '../../config/clarifai';
import ClarifaiAdvancedConfig from './ClarifaiAdvancedConfig';

interface ClarifaiConfigProps {
  onClose: () => void;
}

const ClarifaiConfig: React.FC<ClarifaiConfigProps> = ({ onClose }) => {
  const [apiKey, setApiKey] = useState(CLARIFAI_CONFIG.API_KEY);
  const [isValid, setIsValid] = useState(isClarifaiConfigured());
  const [showSuccess, setShowSuccess] = useState(false);
  const [showAdvancedConfig, setShowAdvancedConfig] = useState(false);

  const handleSave = () => {
    // En una aplicación real, esto se guardaría en una base de datos o variables de entorno
    // Por ahora, solo validamos el formato
    if (apiKey && apiKey !== 'YOUR_CLARIFAI_API_KEY' && apiKey.length > 20) {
      setIsValid(true);
      setShowSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } else {
      setIsValid(false);
    }
  };

  if (showAdvancedConfig) {
    return (
      <ClarifaiAdvancedConfig onClose={() => setShowAdvancedConfig(false)} />
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Settings className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Configurar Clarifai AI
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
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-5 h-5 text-blue-600" />
              <h3 className="font-medium text-gray-900">Configuración Requerida</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Para usar el análisis de IA avanzado, necesitas una API key gratuita de Clarifai.
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-blue-900 mb-2">Cómo obtener tu API key gratuita:</h4>
              <ol className="text-sm text-blue-800 space-y-1">
                <li>1. Ve a <a href="https://clarifai.com/" target="_blank" rel="noopener noreferrer" className="underline">clarifai.com</a></li>
                <li>2. Crea una cuenta gratuita</li>
                <li>3. Ve a tu perfil y copia tu API key</li>
                <li>4. Pega la API key en el campo de abajo</li>
              </ol>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="font-medium text-green-900">Plan Gratuito</span>
              </div>
              <p className="text-sm text-green-800">
                Incluye 5,000 llamadas por mes sin costo. Perfecto para desarrollo y pruebas.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4" />
                  API Key de Clarifai
                </div>
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Pega tu API key aquí"
                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 ${
                  !isValid && apiKey !== 'YOUR_CLARIFAI_API_KEY' ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {!isValid && apiKey !== 'YOUR_CLARIFAI_API_KEY' && (
                <p className="text-sm text-red-600 mt-1">
                  API key inválida. Verifica que sea correcta.
                </p>
              )}
            </div>

            {showSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-green-800 font-medium">
                    ¡Configuración guardada exitosamente!
                  </span>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                onClick={handleSave}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Guardar Configuración
              </button>
              <button
                onClick={() => setShowAdvancedConfig(true)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <Sliders className="w-4 h-4" />
                Avanzado
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClarifaiConfig; 