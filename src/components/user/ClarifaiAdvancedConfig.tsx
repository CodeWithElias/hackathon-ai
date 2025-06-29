import React, { useState } from 'react';
import { Settings, Sliders, Target, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { CLARIFAI_THRESHOLDS, validateThresholds } from '../../config/clarifaiThresholds';

interface ClarifaiAdvancedConfigProps {
  onClose: () => void;
}

const ClarifaiAdvancedConfig: React.FC<ClarifaiAdvancedConfigProps> = ({ onClose }) => {
  const [thresholds, setThresholds] = useState(CLARIFAI_THRESHOLDS);
  const [activeTab, setActiveTab] = useState('fake-alarm');
  const [showSuccess, setShowSuccess] = useState(false);
  const [validationIssues, setValidationIssues] = useState<string[]>([]);

  const handleThresholdChange = (path: string, value: number) => {
    const newThresholds = { ...thresholds };
    const keys = path.split('.');
    let current: any = newThresholds;
    
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
    setThresholds(newThresholds);
    
    // Validar umbrales
    const issues = validateThresholds();
    setValidationIssues(issues);
  };

  const handleSave = () => {
    // En una aplicación real, esto se guardaría en localStorage o una base de datos
    localStorage.setItem('clarifaiThresholds', JSON.stringify(thresholds));
    setShowSuccess(true);
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  const handleReset = () => {
    setThresholds(CLARIFAI_THRESHOLDS);
    setValidationIssues([]);
  };

  const renderThresholdInput = (label: string, path: string, value: number, min: number = 0, max: number = 100, step: number = 0.1) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => handleThresholdChange(path, parseFloat(e.target.value))}
          className="flex-1"
        />
        <span className="text-sm font-mono text-gray-600 min-w-[60px]">
          {value.toFixed(1)}
        </span>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Sliders className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Configuración Avanzada de Clarifai
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
              <h3 className="font-medium text-gray-900">Ajuste de Precisión</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Ajusta los umbrales para mejorar la precisión del análisis de IA según tus necesidades específicas.
            </p>
            
            {validationIssues.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="text-red-600" size={18} />
                  <h4 className="font-medium text-red-900">Problemas de Configuración</h4>
                </div>
                <ul className="text-red-700 text-sm space-y-1">
                  {validationIssues.map((issue, index) => (
                    <li key={index}>• {issue}</li>
                  ))}
                </ul>
              </div>
            )}

            {showSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="text-green-600" size={18} />
                  <span className="text-green-800 font-medium">
                    ¡Configuración guardada exitosamente!
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="flex space-x-8">
              {[
                { id: 'fake-alarm', label: 'Falsas Alarmas', icon: AlertTriangle },
                { id: 'accident-type', label: 'Tipos de Accidente', icon: Target },
                { id: 'triage', label: 'Nivel de Triaje', icon: Settings },
                { id: 'confidence', label: 'Confianza', icon: CheckCircle }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon size={16} />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            {activeTab === 'fake-alarm' && (
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Detección de Falsas Alarmas</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {renderThresholdInput(
                    'Puntuación mínima para falsa alarma',
                    'FAKE_ALARM.MIN_SCORE',
                    thresholds.FAKE_ALARM.MIN_SCORE,
                    1,
                    20,
                    1
                  )}
                  {renderThresholdInput(
                    'Umbral NSFW',
                    'FAKE_ALARM.NSFW_THRESHOLD',
                    thresholds.FAKE_ALARM.NSFW_THRESHOLD,
                    0.1,
                    1,
                    0.1
                  )}
                  {renderThresholdInput(
                    'Umbral comida',
                    'FAKE_ALARM.FOOD_THRESHOLD',
                    thresholds.FAKE_ALARM.FOOD_THRESHOLD,
                    0.1,
                    1,
                    0.1
                  )}
                  {renderThresholdInput(
                    'Umbral eventos sociales',
                    'FAKE_ALARM.SOCIAL_EVENT_THRESHOLD',
                    thresholds.FAKE_ALARM.SOCIAL_EVENT_THRESHOLD,
                    0.1,
                    1,
                    0.1
                  )}
                </div>
              </div>
            )}

            {activeTab === 'accident-type' && (
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Detección de Tipos de Accidente</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {renderThresholdInput(
                    'Umbral vehículo (choque)',
                    'ACCIDENT_TYPE.VEHICLE_CRASH.VEHICLE_CONCEPT_THRESHOLD',
                    thresholds.ACCIDENT_TYPE.VEHICLE_CRASH.VEHICLE_CONCEPT_THRESHOLD,
                    0.1,
                    1,
                    0.1
                  )}
                  {renderThresholdInput(
                    'Umbral fuego (quemadura)',
                    'ACCIDENT_TYPE.BURN.FIRE_CONCEPT_THRESHOLD',
                    thresholds.ACCIDENT_TYPE.BURN.FIRE_CONCEPT_THRESHOLD,
                    0.1,
                    1,
                    0.1
                  )}
                  {renderThresholdInput(
                    'Umbral persona (caída)',
                    'ACCIDENT_TYPE.FALL.PERSON_CONCEPT_THRESHOLD',
                    thresholds.ACCIDENT_TYPE.FALL.PERSON_CONCEPT_THRESHOLD,
                    0.1,
                    1,
                    0.1
                  )}
                  {renderThresholdInput(
                    'Máximo heridos',
                    'INJURED_COUNT.MAX_INJURED_COUNT',
                    thresholds.INJURED_COUNT.MAX_INJURED_COUNT,
                    1,
                    50,
                    1
                  )}
                </div>
              </div>
            )}

            {activeTab === 'triage' && (
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Nivel de Triaje</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {renderThresholdInput(
                    'Puntuación mínima triaje rojo',
                    'TRIAGE_LEVEL.RED.MIN_SEVERITY_SCORE',
                    thresholds.TRIAGE_LEVEL.RED.MIN_SEVERITY_SCORE,
                    5,
                    30,
                    1
                  )}
                  {renderThresholdInput(
                    'Umbral sangre',
                    'TRIAGE_LEVEL.RED.BLOOD_CONCEPT_THRESHOLD',
                    thresholds.TRIAGE_LEVEL.RED.BLOOD_CONCEPT_THRESHOLD,
                    0.1,
                    1,
                    0.1
                  )}
                  {renderThresholdInput(
                    'Umbral fuego',
                    'TRIAGE_LEVEL.RED.FIRE_CONCEPT_THRESHOLD',
                    thresholds.TRIAGE_LEVEL.RED.FIRE_CONCEPT_THRESHOLD,
                    0.1,
                    1,
                    0.1
                  )}
                  {renderThresholdInput(
                    'Umbral lesión',
                    'TRIAGE_LEVEL.RED.INJURY_CONCEPT_THRESHOLD',
                    thresholds.TRIAGE_LEVEL.RED.INJURY_CONCEPT_THRESHOLD,
                    0.1,
                    1,
                    0.1
                  )}
                </div>
              </div>
            )}

            {activeTab === 'confidence' && (
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Cálculo de Confianza</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {renderThresholdInput(
                    'Peso conceptos',
                    'CONFIDENCE.CONCEPT_WEIGHT',
                    thresholds.CONFIDENCE.CONCEPT_WEIGHT,
                    0.1,
                    1,
                    0.1
                  )}
                  {renderThresholdInput(
                    'Bonus por cara',
                    'CONFIDENCE.FACE_BONUS_PER_FACE',
                    thresholds.CONFIDENCE.FACE_BONUS_PER_FACE,
                    1,
                    20,
                    1
                  )}
                  {renderThresholdInput(
                    'Máximo bonus caras',
                    'CONFIDENCE.MAX_FACE_BONUS',
                    thresholds.CONFIDENCE.MAX_FACE_BONUS,
                    10,
                    100,
                    5
                  )}
                  {renderThresholdInput(
                    'Bonus por color',
                    'CONFIDENCE.COLOR_BONUS_PER_COLOR',
                    thresholds.CONFIDENCE.COLOR_BONUS_PER_COLOR,
                    1,
                    20,
                    1
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 border-t border-gray-200 mt-6">
            <button
              onClick={handleSave}
              disabled={validationIssues.length > 0}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Guardar Configuración
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Restablecer
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
  );
};

export default ClarifaiAdvancedConfig; 