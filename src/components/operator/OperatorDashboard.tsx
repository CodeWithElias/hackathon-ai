import React, { useState, useEffect } from 'react';
import { 
  Ambulance, 
  Users, 
  AlertTriangle, 
  Plus, 
  Edit, 
  Trash2, 
  User as UserIcon,
  Bell,
  MapPin,
  Clock,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Ambulance as AmbulanceType, Driver, EmergencyReport } from '../../types';
import AmbulanceManager from './AmbulanceManager';
import DriverManager from './DriverManager';
import ReportViewer from './ReportViewer';

const OperatorDashboard: React.FC = () => {
  const { user, hospital, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'reports' | 'ambulances' | 'drivers'>('reports');
  const [ambulances, setAmbulances] = useState<AmbulanceType[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [reports, setReports] = useState<EmergencyReport[]>([]);
  const [pendingReports, setPendingReports] = useState<EmergencyReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<EmergencyReport | null>(null);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000); // Check for new reports every 5 seconds
    return () => clearInterval(interval);
  }, [hospital]);

  const loadData = () => {
    if (!hospital) return;

    // Load ambulances
    const storedAmbulances = JSON.parse(localStorage.getItem('ambulances') || '[]');
    const hospitalAmbulances = storedAmbulances.filter((a: AmbulanceType) => a.hospitalId === hospital.id);
    setAmbulances(hospitalAmbulances);

    // Load drivers
    const storedDrivers = JSON.parse(localStorage.getItem('drivers') || '[]');
    const hospitalDrivers = storedDrivers.filter((d: Driver) => d.hospitalId === hospital.id);
    setDrivers(hospitalDrivers);

    // Load reports
    const storedReports = JSON.parse(localStorage.getItem('emergencyReports') || '[]');
    setReports(storedReports);

    // Filter reports based on ambulance availability
    const availableAmbulances = hospitalAmbulances.filter(a => a.status === 'disponible');
    const canReceiveReports = availableAmbulances.length > 0;
    
    const pending = storedReports.filter((r: EmergencyReport) => 
      r.status === 'Pendiente' && (canReceiveReports || r.hospitalId === hospital.id)
    );
    setPendingReports(pending);
  };

  const hasAvailableAmbulances = ambulances.some(a => a.status === 'disponible');

  const dispatchAmbulance = (reportId: string, ambulanceId: string) => {
    // Update report status
    const updatedReports = reports.map(report => 
      report.id === reportId 
        ? { 
            ...report, 
            status: 'En Despacho' as const, 
            assignedAmbulanceId: ambulanceId,
            dispatchTime: new Date().toISOString(),
            hospitalId: hospital?.id
          }
        : report
    );
    localStorage.setItem('emergencyReports', JSON.stringify(updatedReports));

    // Update ambulance status
    const updatedAmbulances = ambulances.map(ambulance =>
      ambulance.id === ambulanceId
        ? { ...ambulance, status: 'en uso' as const }
        : ambulance
    );
    
    const allAmbulances = JSON.parse(localStorage.getItem('ambulances') || '[]');
    const finalAmbulances = allAmbulances.map((a: AmbulanceType) => 
      updatedAmbulances.find(ua => ua.id === a.id) || a
    );
    localStorage.setItem('ambulances', JSON.stringify(finalAmbulances));

    setReports(updatedReports);
    setAmbulances(updatedAmbulances);
    loadData();
  };

  const markAsFalseAlarm = (reportId: string) => {
    const updatedReports = reports.map(report => 
      report.id === reportId 
        ? { ...report, status: 'Falsa Alarma' as const }
        : report
    );
    localStorage.setItem('emergencyReports', JSON.stringify(updatedReports));
    setReports(updatedReports);
    loadData();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">H</span>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {hospital?.name || 'Centro de Despacho'}
                </h1>
                <p className="text-sm text-gray-600">Operador: {user?.email}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {pendingReports.length > 0 && (
                <div className="flex items-center gap-2 bg-red-100 text-red-700 px-3 py-1 rounded-full">
                  <Bell size={16} />
                  <span className="text-sm font-medium">{pendingReports.length} nuevos</span>
                </div>
              )}
              
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <UserIcon size={18} />
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { key: 'reports', label: 'Reportes', icon: AlertTriangle },
              { key: 'ambulances', label: 'Ambulancias', icon: Ambulance },
              { key: 'drivers', label: 'Conductores', icon: Users }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon size={18} />
                {label}
                {key === 'reports' && pendingReports.length > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
                    {pendingReports.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Availability Warning */}
        {!hasAvailableAmbulances && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-yellow-600 mt-0.5" size={20} />
              <div>
                <h3 className="font-medium text-yellow-800">Sin Ambulancias Disponibles</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  No hay ambulancias disponibles en este momento. Los nuevos reportes no podrán ser despachados 
                  hasta que haya al menos una ambulancia disponible. Registra ambulancias o cambia el estado 
                  de alguna a "disponible".
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Content based on active tab */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Reportes de Emergencia</h2>
              {pendingReports.length > 0 && (
                <div className="bg-red-100 text-red-700 px-4 py-2 rounded-lg">
                  <span className="font-medium">{pendingReports.length} reportes pendientes</span>
                </div>
              )}
            </div>

            {/* Pending Reports */}
            {pendingReports.length > 0 ? (
              <div className="grid gap-6">
                {pendingReports.map(report => (
                  <div key={report.id} className="bg-white rounded-lg shadow-sm border border-red-200">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            Nuevo Reporte - {report.accidentType}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            report.aiAnalysis.triageLevel === 'Rojo' ? 'bg-red-100 text-red-700' :
                            report.aiAnalysis.triageLevel === 'Amarillo' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {report.aiAnalysis.triageLevel}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">#{report.id.slice(-6)}</span>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock size={14} />
                            {new Date(report.timestamp).toLocaleString('es-BO')}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin size={14} />
                            {report.location.latitude.toFixed(4)}, {report.location.longitude.toFixed(4)}
                          </div>
                          <div className="text-sm">
                            <span className="font-medium text-gray-700">Reportante:</span>
                            <span className="ml-2">{report.userName} ({report.userPhone})</span>
                          </div>
                          <div className="text-sm">
                            <span className="font-medium text-gray-700">Heridos:</span>
                            <span className="ml-2">{report.injuredCount}</span>
                          </div>
                          {report.description && (
                            <div className="text-sm">
                              <span className="font-medium text-gray-700">Descripción:</span>
                              <p className="mt-1 text-gray-600">{report.description}</p>
                            </div>
                          )}
                        </div>

                        <div className="space-y-3">
                          {report.imageUrl && (
                            <div>
                              <img
                                src={report.imageUrl}
                                alt="Imagen del accidente"
                                className="w-full h-32 object-cover rounded-lg border"
                              />
                            </div>
                          )}
                          
                          <div className="bg-blue-50 rounded-lg p-3">
                            <h4 className="font-medium text-blue-800 mb-2">Análisis de IA</h4>
                            <p className="text-sm text-blue-700 mb-2">{report.aiAnalysis.imageDescription}</p>
                            <p className="text-xs text-blue-600">{report.aiAnalysis.justification}</p>
                          </div>

                          {report.aiAnalysis.isFakeAlarm && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                              <div className="flex items-center gap-2">
                                <AlertTriangle className="text-red-600" size={16} />
                                <span className="text-sm font-medium text-red-700">Sospecha de Broma</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-3 mt-6">
                        <button
                          onClick={() => setSelectedReport(report)}
                          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                        >
                          Ver Detalles Completos
                        </button>
                        
                        {hasAvailableAmbulances ? (
                          <select
                            onChange={(e) => e.target.value && dispatchAmbulance(report.id, e.target.value)}
                            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                            defaultValue=""
                          >
                            <option value="">Despachar Ambulancia</option>
                            {ambulances
                              .filter(a => a.status === 'disponible')
                              .map(ambulance => (
                                <option key={ambulance.id} value={ambulance.id}>
                                  {ambulance.plateNumber} - {drivers.find(d => d.ambulanceId === ambulance.id)?.firstName || 'Sin conductor'}
                                </option>
                              ))}
                          </select>
                        ) : (
                          <button
                            disabled
                            className="flex-1 bg-gray-300 text-gray-500 py-2 px-4 rounded-lg font-medium cursor-not-allowed"
                          >
                            Sin Ambulancias Disponibles
                          </button>
                        )}

                        <button
                          onClick={() => markAsFalseAlarm(report.id)}
                          className="px-4 py-2 border border-red-300 text-red-600 rounded-lg font-medium hover:bg-red-50 transition-colors"
                        >
                          Marcar como Falsa Alarma
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No hay reportes pendientes</h3>
                <p className="text-gray-600">Todos los reportes han sido atendidos o no hay nuevas emergencias.</p>
              </div>
            )}

            {/* All Reports History */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Historial de Reportes</h3>
              </div>
              <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                {reports.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <AlertTriangle size={48} className="mx-auto mb-4 text-gray-300" />
                    <p>No hay reportes registrados</p>
                  </div>
                ) : (
                  reports.slice(0, 10).map(report => (
                    <div key={report.id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{report.accidentType}</h4>
                          <p className="text-sm text-gray-600">
                            {new Date(report.timestamp).toLocaleString('es-BO')} - {report.userName}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            report.status === 'Pendiente' ? 'bg-yellow-100 text-yellow-700' :
                            report.status === 'En Despacho' ? 'bg-blue-100 text-blue-700' :
                            report.status === 'Atendido' ? 'bg-green-100 text-green-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {report.status}
                          </span>
                          <button
                            onClick={() => setSelectedReport(report)}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                            Ver
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ambulances' && (
          <AmbulanceManager 
            ambulances={ambulances}
            drivers={drivers}
            onUpdate={loadData}
            hospitalId={hospital?.id || ''}
          />
        )}

        {activeTab === 'drivers' && (
          <DriverManager 
            drivers={drivers}
            ambulances={ambulances}
            onUpdate={loadData}
            hospitalId={hospital?.id || ''}
          />
        )}
      </div>

      {/* Report Detail Modal */}
      {selectedReport && (
        <ReportViewer
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          ambulances={ambulances}
          drivers={drivers}
          onDispatch={dispatchAmbulance}
          onMarkFalseAlarm={markAsFalseAlarm}
          hasAvailableAmbulances={hasAvailableAmbulances}
        />
      )}
    </div>
  );
};

export default OperatorDashboard;