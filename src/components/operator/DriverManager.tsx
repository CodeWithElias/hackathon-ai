import React, { useState } from 'react';
import { Plus, Edit, Trash2, User, Ambulance as AmbulanceIcon } from 'lucide-react';
import { Driver, Ambulance } from '../../types';

interface DriverManagerProps {
  drivers: Driver[];
  ambulances: Ambulance[];
  onUpdate: () => void;
  hospitalId: string;
}

const DriverManager: React.FC<DriverManagerProps> = ({
  drivers,
  ambulances,
  onUpdate,
  hospitalId
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    licenseNumber: '',
    ambulanceId: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const allDrivers = JSON.parse(localStorage.getItem('drivers') || '[]');
    
    if (editingDriver) {
      // Update existing driver
      const updatedDrivers = allDrivers.map((d: Driver) =>
        d.id === editingDriver.id
          ? { 
              ...d, 
              ...formData,
              ambulanceId: formData.ambulanceId || undefined
            }
          : d
      );
      localStorage.setItem('drivers', JSON.stringify(updatedDrivers));
    } else {
      // Add new driver
      const newDriver: Driver = {
        id: Date.now().toString(),
        hospitalId,
        firstName: formData.firstName,
        lastName: formData.lastName,
        licenseNumber: formData.licenseNumber,
        ambulanceId: formData.ambulanceId || undefined
      };
      allDrivers.push(newDriver);
      localStorage.setItem('drivers', JSON.stringify(allDrivers));
    }
    
    resetForm();
    onUpdate();
  };

  const handleEdit = (driver: Driver) => {
    setEditingDriver(driver);
    setFormData({
      firstName: driver.firstName,
      lastName: driver.lastName,
      licenseNumber: driver.licenseNumber,
      ambulanceId: driver.ambulanceId || ''
    });
    setShowForm(true);
  };

  const handleDelete = (driverId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este conductor?')) {
      const allDrivers = JSON.parse(localStorage.getItem('drivers') || '[]');
      const updatedDrivers = allDrivers.filter((d: Driver) => d.id !== driverId);
      localStorage.setItem('drivers', JSON.stringify(updatedDrivers));
      onUpdate();
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingDriver(null);
    setFormData({
      firstName: '',
      lastName: '',
      licenseNumber: '',
      ambulanceId: ''
    });
  };

  const getAmbulancePlate = (ambulanceId?: string) => {
    if (!ambulanceId) return 'Sin asignar';
    const ambulance = ambulances.find(a => a.id === ambulanceId);
    return ambulance ? ambulance.plateNumber : 'Sin asignar';
  };

  const getAvailableAmbulances = () => {
    return ambulances.filter(ambulance => {
      // If editing, include current ambulance
      if (editingDriver && editingDriver.ambulanceId === ambulance.id) {
        return true;
      }
      // Only show unassigned ambulances
      return !drivers.some(driver => driver.ambulanceId === ambulance.id);
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Gestión de Conductores</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus size={18} />
          Nuevo Conductor
        </button>
      </div>

      {/* Driver Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingDriver ? 'Editar Conductor' : 'Nuevo Conductor'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Juan"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Apellido
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Pérez"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Licencia de Conducir
                </label>
                <input
                  type="text"
                  value={formData.licenseNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, licenseNumber: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="123456789"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ambulancia Asignada (Opcional)
                </label>
                <select
                  value={formData.ambulanceId}
                  onChange={(e) => setFormData(prev => ({ ...prev, ambulanceId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Sin asignar</option>
                  {getAvailableAmbulances().map(ambulance => (
                    <option key={ambulance.id} value={ambulance.id}>
                      {ambulance.plateNumber} - {ambulance.status}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingDriver ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Drivers List */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Conductores Registrados</h3>
          <p className="text-gray-600 mt-1">Gestiona los conductores de ambulancia de tu hospital</p>
        </div>

        <div className="divide-y divide-gray-200">
          {drivers.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <User size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No hay conductores registrados</p>
              <p className="text-sm">Agrega tu primer conductor para comenzar</p>
            </div>
          ) : (
            drivers.map((driver) => (
              <div key={driver.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      driver.ambulanceId ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      <User 
                        size={24} 
                        className={driver.ambulanceId ? 'text-blue-600' : 'text-gray-600'} 
                      />
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 text-lg">
                        {driver.firstName} {driver.lastName}
                      </h4>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-sm text-gray-600">
                          Licencia: {driver.licenseNumber}
                        </span>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <AmbulanceIcon size={14} />
                          {getAmbulancePlate(driver.ambulanceId)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(driver)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(driver.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Driver Statistics */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{drivers.length}</p>
              <p className="text-gray-600">Total Conductores</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <AmbulanceIcon className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {drivers.filter(d => d.ambulanceId).length}
              </p>
              <p className="text-gray-600">Con Ambulancia</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <User className="text-yellow-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {drivers.filter(d => !d.ambulanceId).length}
              </p>
              <p className="text-gray-600">Sin Asignar</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverManager;