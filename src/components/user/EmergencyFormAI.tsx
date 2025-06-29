import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Camera, Send, Loader, AlertTriangle, CheckCircle, XCircle, Brain, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getCurrentLocation } from '../../utils/validation';
import { analyzeImageWithVertexAI, detectFakeAlarmWithVertexAI, generateMedicalDescription } from '../../utils/vertexAI';
import { EmergencyReport } from '../../types';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { LatLng } from 'leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import VertexAIConfig from './VertexAIConfig';
import { isGoogleCloudConfigured } from '../../config/googleCloud';

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface EmergencyFormProps {
  onClose: () => void;
  onReportSubmitted: () => void;
}

const EmergencyForm: React.FC<EmergencyFormProps> = ({ onClose, onReportSubmitted }) => {

  const [position, setPosition] = useState<LatLng | null>(null);
  const [mapCenter, setMapCenter] = useState<LatLng | null>(null);

  const LocationMarker: React.FC = () => {
    useMapEvents({
      click(e) {
        setPosition(e.latlng);
      },
    });

    return position ? <Marker position={position} icon={L.icon({
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
    })} /> : null;
  };

  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showBlockedMessage, setShowBlockedMessage] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showGoogleCloudConfig, setShowGoogleCloudConfig] = useState(!isGoogleCloudConfigured());
  const [reportId, setReportId] = useState('');

  const [formData, setFormData] = useState({
    location: { latitude: 0, longitude: 0 },
    description: '',
    imageFile: null as File | null,
    imagePreview: ''
  });

  // Datos generados por IA
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [aiGeneratedDescription, setAiGeneratedDescription] = useState('');
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);

  useEffect(() => {
    captureLocation();
  }, []);

  useEffect(() => {
    if (position) {
      setFormData(prev => ({
        ...prev,
        location: { latitude: position.lat, longitude: position.lng }
      }));
    }
  }, [position]);

  const captureLocation = async () => {
    try {
      const location = await getCurrentLocation();
      const latLng = new LatLng(location.latitude, location.longitude);
      setPosition(latLng);
      setMapCenter(latLng);
    } catch (error) {
      console.error('Error capturing location:', error);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        imageFile: file,
        imagePreview: URL.createObjectURL(file)
      }));

      // Analizar imagen automáticamente con IA
      setIsAnalyzing(true);
      setIsGeneratingDescription(true);
      try {
        // Generar descripción médica
        const description = await generateMedicalDescription(file);
        setAiGeneratedDescription(description);
        setFormData(prev => ({ ...prev, description: description }));
        
        // Analizar imagen para triaje y otros datos
        const analysis = await analyzeImageWithVertexAI(file);
        setAiAnalysis(analysis);
        
        // Verificar si es falsa alarma
        const isFake = await detectFakeAlarmWithVertexAI(file, description);
        if (isFake) {
          setShowBlockedMessage(true);
          return;
        }
      } catch (error) {
        console.error('Error en análisis de IA:', error);
      } finally {
        setIsAnalyzing(false);
        setIsGeneratingDescription(false);
      }
    }
  };

  const validateCurrentStep = () => {
    switch (step) {
      case 1:
        return position !== null;
      case 2:
        return formData.imageFile !== null && aiAnalysis !== null;
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    if (!formData.imageFile || !user || !aiAnalysis) return;

    setIsSubmitting(true);

    try {
      // Create emergency report with AI analysis
      const newReport: EmergencyReport = {
        id: Date.now().toString(),
        userId: user.id,
        userPhone: user.phone,
        userName: user.email,
        timestamp: new Date().toISOString(),
        location: formData.location,
        description: formData.description,
        accidentType: aiAnalysis.accidentType,
        injuredCount: aiAnalysis.injuredCount,
        triageAnswers: aiAnalysis.triageAnswers,
        imageUrl: formData.imagePreview,
        aiAnalysis: {
          imageDescription: aiAnalysis.imageDescription,
          triageLevel: aiAnalysis.triageLevel,
          justification: aiAnalysis.justification,
          isFakeAlarm: aiAnalysis.isFakeAlarm
        },
        status: 'Pendiente'
      };

      // Save report
      const reports = JSON.parse(localStorage.getItem('emergencyReports') || '[]');
      reports.push(newReport);
      localStorage.setItem('emergencyReports', JSON.stringify(reports));

      setReportId(newReport.id);
      setShowSuccessMessage(true);

    } catch (error) {
      console.error('Error submitting report:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showBlockedMessage) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-600 mb-4">Cuenta Bloqueada</h2>
          <p className="text-gray-700 mb-6">
            Nuestro sistema de IA ha detectado que este reporte es una falsa alarma o broma. 
            Tu cuenta ha sido bloqueada permanentemente por uso indebido del sistema de emergencias.
          </p>
          <p className="text-sm text-gray-600 mb-4">
            Los reportes falsos comprometen recursos de emergencia y pueden poner en riesgo vidas humanas.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700"
          >
            Entendido
          </button>
        </div>
      </div>
    );
  }

  if (showSuccessMessage) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-green-600 mb-4">Reporte Enviado</h2>
          <p className="text-gray-700 mb-4">
            Tu reporte de emergencia ha sido recibido exitosamente. Una ambulancia está siendo evaluada para el despacho.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600">ID de Reporte:</p>
            <p className="font-mono text-lg font-bold text-gray-900">#{reportId.slice(-8)}</p>
          </div>
          <button
            onClick={onReportSubmitted}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700"
          >
            Ver Mis Reportes
          </button>
        </div>
      </div>
    );
  }

  if (showGoogleCloudConfig) {
    return (
      <VertexAIConfig onClose={() => setShowGoogleCloudConfig(false)} />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-red-600 text-white p-4">
        <div className="max-w-md mx-auto flex items-center gap-4">
          <button onClick={onClose} className="p-2 hover:bg-red-700 rounded-lg">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold">Reporte de Emergencia</h1>
            <p className="text-red-100">Paso {step} de 2</p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="max-w-md mx-auto">
          <div className="flex">
            {[1, 2].map((stepNum) => (
              <div
                key={stepNum}
                className={`flex-1 h-2 ${
                  stepNum <= step ? 'bg-red-600' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4">
        {/* Step 1: Location */}
        {step === 1 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-center mb-6">
              <MapPin className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900">Ubicación de la Emergencia</h2>
              <p className="text-gray-600 mt-2">Capturando tu ubicación GPS automáticamente</p>
            </div>

            <div>
              <MapContainer
                center={mapCenter || new LatLng(-17.7833, -63.1821)}
                zoom={15}
                style={{ height: '400px', width: '100%' }}
                zoomControl={true}
                scrollWheelZoom={false}
              >
                <TileLayer 
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
                />
                <LocationMarker />
              </MapContainer>

              <input
                type="text"
                value={position ? `${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}` : ''}
                readOnly
                className="mt-4 w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                placeholder="Esperando ubicación..."
              />
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!position}
              className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              Continuar
            </button>
          </div>
        )}

        {/* Step 2: Image Upload and AI Analysis */}
        {step === 2 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-center mb-6">
              <Brain className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900">Análisis Inteligente</h2>
              <p className="text-gray-600 mt-2">Sube una imagen para análisis automático y generación de descripción médica</p>
            </div>

            <div className="space-y-6">
              {/* AI Generated Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <FileText size={16} />
                  Descripción Médica Generada por IA
                </label>
                {isGeneratingDescription ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <Loader className="animate-spin text-blue-600" size={20} />
                      <div>
                        <h4 className="font-medium text-blue-800">Generando descripción médica</h4>
                        <p className="text-sm text-blue-700">Analizando imagen para crear descripción profesional...</p>
                      </div>
                    </div>
                  </div>
                ) : aiGeneratedDescription ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Brain className="text-green-600 mt-0.5" size={20} />
                      <div className="flex-1">
                        <h4 className="font-medium text-green-800 mb-2">Descripción Médica Generada</h4>
                        <p className="text-green-900 text-sm leading-relaxed">{aiGeneratedDescription}</p>
                        <p className="text-xs text-green-700 mt-2">
                          Esta descripción ha sido generada automáticamente por IA para optimizar la atención médica.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                    <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600 text-sm">
                      La descripción médica se generará automáticamente después de subir la imagen
                    </p>
                  </div>
                )}
              </div>

              {/* Image Upload */}
              <div>
                <label className="block w-full">
                  <div className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    formData.imageFile ? 'border-green-300 bg-green-50' : 'border-gray-300 hover:border-red-400 hover:bg-red-50'
                  }`}>
                    {formData.imagePreview ? (
                      <div>
                        <img
                          src={formData.imagePreview}
                          alt="Preview"
                          className="max-w-full h-40 object-cover mx-auto rounded-lg mb-4"
                        />
                        <p className="text-sm text-green-600 font-medium">Imagen cargada correctamente</p>
                      </div>
                    ) : (
                      <div>
                        <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">Toca para subir imagen</p>
                        <p className="text-xs text-gray-500 mt-2">JPG, PNG o GIF hasta 5MB</p>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    required
                  />
                </label>
              </div>

              {/* AI Analysis Results */}
              {isAnalyzing && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <Loader className="animate-spin text-blue-600" size={20} />
                    <div>
                      <h4 className="font-medium text-blue-800">Analizando imagen con IA</h4>
                      <p className="text-sm text-blue-700">Determinando gravedad y generando datos de triaje...</p>
                    </div>
                  </div>
                </div>
              )}

              {aiAnalysis && !isAnalyzing && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Brain className="text-green-600 mt-0.5" size={20} />
                    <div className="flex-1">
                      <h4 className="font-medium text-green-800">Análisis Completado</h4>
                      <div className="mt-2 space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-green-700">Tipo de accidente:</span>
                          <span className="font-medium text-green-900">{aiAnalysis.accidentType}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-green-700">Heridos:</span>
                          <span className="font-medium text-green-900">{aiAnalysis.injuredCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-green-700">Nivel de triaje:</span>
                          <span className={`font-medium ${
                            aiAnalysis.triageLevel === 'Rojo' ? 'text-red-600' :
                            aiAnalysis.triageLevel === 'Amarillo' ? 'text-yellow-600' :
                            'text-green-600'
                          }`}>
                            {aiAnalysis.triageLevel}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-green-700">Confianza:</span>
                          <span className="font-medium text-green-900">{aiAnalysis.confidence}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* AI Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Brain className="text-blue-600 mt-0.5" size={20} />
                  <div>
                    <h4 className="font-medium text-blue-800">Análisis Inteligente Automático</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Nuestro sistema de IA analizará automáticamente la imagen para:
                    </p>
                    <ul className="text-sm text-blue-700 mt-2 space-y-1">
                      <li>• Generar descripción médica profesional</li>
                      <li>• Determinar gravedad de la emergencia</li>
                      <li>• Identificar tipo de accidente y número de heridos</li>
                      <li>• Proporcionar respuestas de triaje automático</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setStep(1)}
                className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-medium hover:bg-gray-300"
              >
                Anterior
              </button>
              <button
                onClick={handleSubmit}
                disabled={!formData.imageFile || !aiAnalysis || isSubmitting}
                className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader className="animate-spin" size={20} />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    Enviar Reporte
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Warning */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-yellow-600 mt-0.5" size={18} />
            <div>
              <h4 className="font-medium text-yellow-800">Advertencia Importante</h4>
              <p className="text-xs text-yellow-700 mt-1">
                Los reportes falsos serán detectados automáticamente y resultarán en el bloqueo permanente de tu cuenta. 
                Solo usa esta aplicación para emergencias médicas reales.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyForm; 