import React from 'react';
import { X, MapPin, Clock, User, AlertTriangle, Image, Phone } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { EmergencyReport, Ambulance, Driver } from '../../types';
import customIcon from '../../leafletIcon';

interface ReportViewerProps {
  report: EmergencyReport;
  onClose: () => void;
  ambulances: Ambulance[];
  drivers: Driver[];
  onDispatch: (reportId: string, ambulanceId: string) => void;
  onMarkFalseAlarm: (reportId: string) => void;
  hasAvailableAmbulances: boolean;
}

const ReportViewer: React.FC<ReportViewerProps> = ({
  report,
  onClose,
  ambulances,
  drivers,
  onDispatch,
  onMarkFalseAlarm,
  hasAvailableAmbulances
}) => {
  const getDriverName = (ambulanceId: string) => {
    const driver = drivers.find(d => d.ambulanceId === ambulanceId);
    return driver ? `${driver.firstName} ${driver.lastName}` : 'Sin conductor';
  };

  const handleDispatch = (ambulanceId: string) => {
    onDispatch(report.id, ambulanceId);
    onClose();
  };

  const handleMarkFalse = () => {
    onMarkFalseAlarm(report.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Detalle del Reporte #{report.id.slice(-8)}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                report.status === 'Pendiente' ? 'bg-yellow-100 text-yellow-700' :
                report.status === 'En Despacho' ? 'bg-blue-100 text-blue-700' :
                report.status === 'Atendido' ? 'bg-green-100 text-green-700' :
                'bg-red-100 text-red-700'
              }`}>
                {report.status}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                report.aiAnalysis.triageLevel === 'Rojo' ? 'bg-red-100 text-red-700' :
                report.aiAnalysis.triageLevel === 'Amarillo' ? 'bg-yellow-100 text-yellow-700' :
                'bg-green-100 text-green-700'
              }`}>
                Triaje: {report.aiAnalysis.triageLevel}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column - Report Details */}
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Información Básica</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-gray-500" />
                    <span className="text-gray-600">Reportado:</span>
                    <span className="font-medium">{new Date(report.timestamp).toLocaleString('es-BO')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-gray-500" />
                    <span className="text-gray-600">Ubicación:</span>
                    <span className="font-medium">
                      {report.location.latitude.toFixed(6)}, {report.location.longitude.toFixed(6)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-gray-500" />
                    <span className="text-gray-600">Reportante:</span>
                    <span className="font-medium">{report.userName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-gray-500" />
                    <span className="text-gray-600">Teléfono:</span>
                    <span className="font-medium">{report.userPhone}</span>
                  </div>
                </div>
              </div>

              {/* Accident Details */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Detalles del Accidente</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-600">Tipo:</span>
                    <p className="font-medium">{report.accidentType}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Número de heridos:</span>
                    <p className="font-medium">{report.injuredCount}</p>
                  </div>
                  {report.description && (
                    <div>
                      <span className="text-sm text-gray-600">Descripción:</span>
                      <p className="font-medium">{report.description}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Triage Answers */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Evaluación Inicial</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {Object.entries(report.triageAnswers).map(([key, value]) => {
                    const questions = {
                      conscious: '¿Está consciente?',
                      breathing: '¿Respira normalmente?',
                      movement: '¿Puede moverse?',
                      bleeding: '¿Hay sangrado abundante?'
                    };
                    return (
                      <div key={key} className="flex justify-between">
                        <span className="text-gray-600">{questions[key as keyof typeof questions]}:</span>
                        <span className={`font-medium ${
                          value === 'No' && (key === 'conscious' || key === 'breathing') ? 'text-red-600' :
                          value === 'Sí' && key === 'bleeding' ? 'text-red-600' :
                          'text-gray-900'
                        }`}>
                          {value}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Dispatch Information */}
              {report.assignedAmbulanceId && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-3">Información de Despacho</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-blue-700">Ambulancia asignada:</span>
                      <p className="font-medium text-blue-900">
                        {ambulances.find(a => a.id === report.assignedAmbulanceId)?.plateNumber || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <span className="text-blue-700">Conductor:</span>
                      <p className="font-medium text-blue-900">
                        {getDriverName(report.assignedAmbulanceId)}
                      </p>
                    </div>
                    {report.dispatchTime && (
                      <div>
                        <span className="text-blue-700">Hora de despacho:</span>
                        <p className="font-medium text-blue-900">
                          {new Date(report.dispatchTime).toLocaleString('es-BO')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - AI Analysis and Image */}
            <div className="space-y-6">
              {/* Image */}
              {report.imageUrl && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Image size={18} />
                    Imagen del Accidente
                  </h3>
                  <img
                    src={report.imageUrl}
                    alt="Imagen del accidente"
                    className="w-full rounded-lg border"
                  />
                </div>
              )}

              {/* AI Analysis */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <AlertTriangle size={18} />
                  Análisis de IA
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-blue-700">Descripción visual:</span>
                    <p className="text-blue-900 mt-1">{report.aiAnalysis.imageDescription}</p>
                  </div>
                  <div>
                    <span className="text-sm text-blue-700">Nivel de triaje:</span>
                    <p className={`font-semibold mt-1 ${
                      report.aiAnalysis.triageLevel === 'Rojo' ? 'text-red-600' :
                      report.aiAnalysis.triageLevel === 'Amarillo' ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {report.aiAnalysis.triageLevel}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-blue-700">Justificación:</span>
                    <p className="text-blue-900 mt-1">{report.aiAnalysis.justification}</p>
                  </div>
                </div>
              </div>

              {/* Fake Alarm Warning */}
              {report.aiAnalysis.isFakeAlarm && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="text-red-600" size={18} />
                    <h3 className="font-semibold text-red-900">Alerta de Falsa Alarma</h3>
                  </div>
                  <p className="text-red-700 text-sm">
                    El sistema de IA ha detectado patrones que sugieren que este reporte podría ser una falsa alarma.
                    Revisa cuidadosamente antes de despachar recursos.
                  </p>
                </div>
              )}

              {/* Map with real coordinates */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <MapPin size={18} />
                  Ubicación en Mapa
                </h3>
                <div className="bg-white rounded-lg border overflow-hidden" style={{ height: '300px' }}>
                  <MapContainer
                    center={[report.location.latitude, report.location.longitude]}
                    zoom={15}
                    style={{ height: '100%', width: '100%' }}
                    zoomControl={true}
                    scrollWheelZoom={false}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker
                      position={[report.location.latitude, report.location.longitude]}
                      icon={customIcon}
                    >
                      <Popup>
                        <div className="text-center">
                          <strong>Reporte #{report.id.slice(-8)}</strong><br />
                          {report.accidentType}<br />
                          <small>
                            {report.location.latitude.toFixed(6)}, {report.location.longitude.toFixed(6)}
                          </small>
                        </div>
                      </Popup>
                    </Marker>
                  </MapContainer>
                </div>
                <div className="mt-2 text-xs text-gray-600 text-center">
                  Coordenadas: {report.location.latitude.toFixed(6)}, {report.location.longitude.toFixed(6)}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {report.status === 'Pendiente' && (
            <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200">
              {hasAvailableAmbulances ? (
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Despachar Ambulancia
                  </label>
                  <select
                    onChange={(e) => e.target.value && handleDispatch(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    defaultValue=""
                  >
                    <option value="">Seleccionar ambulancia...</option>
                    {ambulances
                      .filter(a => a.status === 'disponible')
                      .map(ambulance => (
                        <option key={ambulance.id} value={ambulance.id}>
                          {ambulance.plateNumber} - {getDriverName(ambulance.id)}
                        </option>
                      ))}
                  </select>
                </div>
              ) : (
                <div className="flex-1">
                  <button
                    disabled
                    className="w-full bg-gray-300 text-gray-500 py-3 px-4 rounded-lg font-medium cursor-not-allowed"
                  >
                    Sin Ambulancias Disponibles
                  </button>
                </div>
              )}

              <button
                onClick={handleMarkFalse}
                className="px-6 py-3 border border-red-300 text-red-600 rounded-lg font-medium hover:bg-red-50 transition-colors"
              >
                Marcar como Falsa Alarma
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportViewer;