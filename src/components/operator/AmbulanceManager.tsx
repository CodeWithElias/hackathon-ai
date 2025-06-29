import React, { useState } from 'react';
import { Plus, Edit, Trash2, Ambulance as AmbulanceIcon, User } from 'lucide-react';
import { Ambulance, Driver } from '../../types';

interface AmbulanceManagerProps {
  ambulances: Ambulance[];
  drivers: Driver[];
  onUpdate: () => void;
  hospitalId: string;
}

const AmbulanceManager: React.FC<AmbulanceManagerProps> = ({
  ambulances,
  drivers,
  onUpdate,
  hospitalId
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingAmbulance, setEditingAmbulance] = useState<Ambulance | null>(null);
  const [formData, setFormData] = useState({
    plateNumber: '',
    status: 'disponible' as 'disponible' | 'en uso'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const allAmbulances = JSON.parse(localStorage.getItem('ambulances') || '[]');
    
    if (editingAmbulance) {
      // Update existing ambulance
      const updatedAmbulances = allAmbulances.map((a: Ambulance) =>
        a.id === editingAmbulance.id
          ? { ...a, ...formData }
          : a
      );
      localStorage.setItem('ambulances', JSON.stringify(updatedAmbulances));
    } else {
      // Add new ambulance
      const newAmbulance: Ambulance = {
        id: Date.now().toString(),
        hospitalId,
        ...formData
      };
      allAmbulances.push(newAmbulance);
      localStorage.setItem('ambulances', JSON.stringify(allAmbulances));
    }
    
    resetForm();
    onUpdate();
  };

  const handleEdit = (ambulance: Ambulance) => {
    setEditingAmbulance(ambulance);
    setFormData({
      plateNumber: ambulance.plateNumber,
      status: ambulance.status
    });
    setShowForm(true);
  };

  const handleDelete = (ambulanceId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta ambulancia?')) {
      const allAmbulances = JSON.parse(localStorage.getItem('ambulances') || '[]');
      const updatedAmbulances = allAmbulances.filter((a: Ambulance) => a.id !== ambulanceId);
      localStorage.setItem('ambulances', JSON.stringify(updatedAmbulances));
      
      // Remove driver assignment if exists
      const allDrivers = JSON.parse(localStorage.getItem('drivers') || '[]');
      const updatedDrivers = allDrivers.map((d: Driver) =>
        d.ambulanceId === ambulanceId ? { ...d, ambulanceId: undefined } : d
      );
      localStorage.setItem('drivers', JSON.stringify(updatedDrivers));
      
      onUpdate();
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingAmbulance(null);
    setFormData({
      plateNumber: '',
      status: 'disponible'
    });
  };

  const getDriverName = (ambulanceId: string) => {
    const driver = drivers.find(d => d.ambulanceId === ambulanceId);
    return driver ? `${driver.firstName} ${driver.lastName}` : 'Sin conductor';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Gestión de Ambulancias</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus size={18} />
          Nueva Ambulancia
        </button>
      </div>

      {/* Ambulance Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingAmbulance ? 'Editar Ambulancia' : 'Nueva Ambulancia'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Placa
                </label>
                <input
                  type="text"
                  value={formData.plateNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, plateNumber: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: ABC-123"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'disponible' | 'en uso' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="disponible">Disponible</option>
                  <option value="en uso">En uso</option>
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
                  {editingAmbulance ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ambulances List */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Ambulancias Registradas</h3>
          <p className="text-gray-600 mt-1">Gestiona las ambulancias de tu hospital</p>
        </div>

        <div className="divide-y divide-gray-200">
          {ambulances.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <AmbulanceIcon size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No hay ambulancias registradas</p>
              <p className="text-sm">Agrega tu primera ambulancia para comenzar</p>
            </div>
          ) : (
            ambulances.map((ambulance) => (
              <div key={ambulance.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      ambulance.status === 'disponible' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      <AmbulanceIcon 
                        size={24} 
                        className={ambulance.status === 'disponible' ? 'text-green-600' : 'text-red-600'} 
                      />
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 text-lg">{ambulance.plateNumber}</h4>
                      <div className="flex items-center gap-4 mt-1">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          ambulance.status === 'disponible' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {ambulance.status === 'disponible' ? 'Disponible' : 'En uso'}
                        </span>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <User size={14} />
                          {getDriverName(ambulance.id)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(ambulance)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(ambulance.id)}
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

      {/* Status Summary */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <AmbulanceIcon className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{ambulances.length}</p>
              <p className="text-gray-600">Total Ambulancias</p>
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
                {ambulances.filter(a => a.status === 'disponible').length}
              </p>
              <p className="text-gray-600">Disponibles</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AmbulanceIcon className="text-red-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {ambulances.filter(a => a.status === 'en uso').length}
              </p>
              <p className="text-gray-600">En Uso</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AmbulanceManager;