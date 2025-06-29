import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, CheckCircle, XCircle, Plus, MapPin, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { EmergencyReport } from '../../types';
import EmergencyForm from './EmergencyFormAI';

const UserDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [showEmergencyForm, setShowEmergencyForm] = useState(false);
  const [userReports, setUserReports] = useState<EmergencyReport[]>([]);

  useEffect(() => {
    loadUserReports();
  }, [user]);

  const loadUserReports = () => {
    const reports = JSON.parse(localStorage.getItem('emergencyReports') || '[]');
    const filtered = reports.filter((report: EmergencyReport) => report.userId === user?.id);
    setUserReports(filtered.sort((a: EmergencyReport, b: EmergencyReport) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pendiente': return 'text-yellow-600 bg-yellow-100';
      case 'En Despacho': return 'text-blue-600 bg-blue-100';
      case 'Atendido': return 'text-green-600 bg-green-100';
      case 'Falsa Alarma': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pendiente': return <Clock size={16} />;
      case 'En Despacho': return <AlertTriangle size={16} />;
      case 'Atendido': return <CheckCircle size={16} />;
      case 'Falsa Alarma': return <XCircle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  if (showEmergencyForm) {
    return (
      <EmergencyForm
        onClose={() => setShowEmergencyForm(false)}
        onReportSubmitted={() => {
          setShowEmergencyForm(false);
          loadUserReports();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">+</span>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Alerta Médica Bolivia</h1>
                <p className="text-sm text-gray-600">Bienvenido, {user?.email}</p>
              </div>
            </div>
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Emergency Button */}
        <div className="text-center mb-8">
          <button
            onClick={() => setShowEmergencyForm(true)}
            className="inline-flex items-center gap-3 bg-red-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-red-700 focus:ring-4 focus:ring-red-200 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            <AlertTriangle size={24} />
            EMERGENCIA
          </button>
          <p className="text-gray-600 mt-4 max-w-md mx-auto">
            Presiona este botón solo en caso de emergencia médica real. 
            Los reportes falsos serán sancionados.
          </p>
        </div>

        {/* User Reports Section */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Mis Reportes Enviados</h2>
            <p className="text-gray-600 mt-1">Historial de todas tus emergencias reportadas</p>
          </div>

          <div className="divide-y divide-gray-200">
            {userReports.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <AlertTriangle size={48} className="mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No hay reportes</p>
                <p className="text-sm">Aún no has reportado ninguna emergencia</p>
              </div>
            ) : (
              userReports.map((report) => (
                <div key={report.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                          {getStatusIcon(report.status)}
                          {report.status}
                        </span>
                        <span className="text-xs text-gray-500">
                          #{report.id.slice(-6)}
                        </span>
                      </div>
                      
                      <h3 className="font-medium text-gray-900 mb-1">{report.accidentType}</h3>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                        <div className="flex items-center gap-1">
                          <Clock size={14} />
                          {new Date(report.timestamp).toLocaleString('es-BO')}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin size={14} />
                          {report.location.latitude.toFixed(4)}, {report.location.longitude.toFixed(4)}
                        </div>
                      </div>

                      {report.description && (
                        <p className="text-sm text-gray-700 mb-2">{report.description}</p>
                      )}

                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Heridos: {report.injuredCount}</span>
                        <span className={`font-medium ${
                          report.aiAnalysis.triageLevel === 'Rojo' ? 'text-red-600' :
                          report.aiAnalysis.triageLevel === 'Amarillo' ? 'text-yellow-600' :
                          'text-green-600'
                        }`}>
                          Triaje: {report.aiAnalysis.triageLevel}
                        </span>
                      </div>

                      {report.dispatchTime && (
                        <p className="text-xs text-blue-600 mt-2">
                          Ambulancia despachada: {new Date(report.dispatchTime).toLocaleString('es-BO')}
                        </p>
                      )}
                    </div>

                    {report.imageUrl && (
                      <div className="ml-4">
                        <img
                          src={report.imageUrl}
                          alt="Imagen del accidente"
                          className="w-16 h-16 object-cover rounded-lg border"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Warning Notice */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-yellow-600 mt-0.5" size={20} />
            <div>
              <h3 className="font-medium text-yellow-800">Advertencia de Uso Responsable</h3>
              <p className="text-sm text-yellow-700 mt-1">
                Los reportes falsos o bromas serán detectados automáticamente por nuestro sistema de IA. 
                Las cuentas que generen falsas alarmas serán bloqueadas permanentemente y podrán enfrentar 
                consecuencias legales. Use esta aplicación solo para emergencias médicas reales.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;