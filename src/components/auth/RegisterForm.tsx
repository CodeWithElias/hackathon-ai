import React, { useState } from 'react';
import { User, Building2, Phone, Mail, Lock, MapPin, Loader, CheckCircle, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { validatePhone, validateCI, validateEmail, getCurrentLocation } from '../../utils/validation';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin }) => {
  const { register, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'user' | 'operator'>('user');
  const [showVerification, setShowVerification] = useState(false);
  const [formData, setFormData] = useState({
    // User fields
    phone: '',
    ci: '',
    email: '',
    password: '',
    // Operator fields
    hospitalName: '',
    location: { latitude: 0, longitude: 0 },
    locationCaptured: false,
    adminPhone: '',
    entityId: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (activeTab === 'user') {
      if (!validatePhone(formData.phone)) {
        newErrors.phone = 'El teléfono debe tener exactamente 8 dígitos';
      }
      if (!validateCI(formData.ci)) {
        newErrors.ci = 'CI inválido. Formato: 7-8 dígitos + código de departamento (ej: 1234567SC)';
      }
    } else {
      if (!formData.hospitalName.trim()) {
        newErrors.hospitalName = 'El nombre del hospital es obligatorio';
      }
      if (!formData.locationCaptured) {
        newErrors.location = 'Debe capturar la ubicación GPS del hospital';
      }
      if (!validatePhone(formData.adminPhone)) {
        newErrors.adminPhone = 'El teléfono debe tener exactamente 8 dígitos';
      }
      if (!formData.entityId.trim()) {
        newErrors.entityId = 'El número de identificación es obligatorio';
      }
    }

    if (!validateEmail(formData.email)) {
      newErrors.email = 'Correo electrónico inválido';
    }
    if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCaptureLocation = async () => {
    try {
      const location = await getCurrentLocation();
      setFormData(prev => ({
        ...prev,
        location,
        locationCaptured: true
      }));
      setErrors(prev => ({ ...prev, location: '' }));
    } catch (error) {
      setErrors(prev => ({ ...prev, location: 'Error al capturar ubicación' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    // Show email verification simulation
    setShowVerification(true);
    
    // Simulate email verification delay
    setTimeout(async () => {
      const success = await register(formData, activeTab === 'operator');
      if (!success) {
        setErrors({ general: 'Error al registrar usuario. El correo o teléfono ya existe.' });
        setShowVerification(false);
      }
    }, 2000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (showVerification) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Verificación de Correo
        </h2>
        <p className="text-gray-600 mb-4">
          Se ha enviado un código de verificación a tu correo electrónico.
        </p>
        <div className="flex items-center justify-center">
          <Loader className="animate-spin text-blue-500" size={24} />
          <span className="ml-2 text-gray-600">Verificando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto bg-white rounded-lg shadow-lg p-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-white text-2xl font-bold">+</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Alerta Médica Bolivia</h1>
        <p className="text-gray-600">Crear Cuenta</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
        <button
          type="button"
          onClick={() => setActiveTab('user')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'user'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <User className="inline mr-2" size={16} />
          Usuario Final
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('operator')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'operator'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Building2 className="inline mr-2" size={16} />
          Operador Hospital
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.general && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <AlertTriangle size={16} />
            <span className="text-sm">{errors.general}</span>
          </div>
        )}

        {activeTab === 'user' ? (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono (8 dígitos)
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                    errors.phone ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="12345678"
                  maxLength={8}
                />
              </div>
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CI (Carnet de Identidad)
              </label>
              <input
                type="text"
                name="ci"
                value={formData.ci}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                  errors.ci ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="1234567SC"
                maxLength={10}
              />
              {errors.ci && <p className="text-red-500 text-xs mt-1">{errors.ci}</p>}
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del Hospital
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  name="hospitalName"
                  value={formData.hospitalName}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                    errors.hospitalName ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Hospital San Juan"
                />
              </div>
              {errors.hospitalName && <p className="text-red-500 text-xs mt-1">{errors.hospitalName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ubicación del Hospital
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCaptureLocation}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-red-500"
                >
                  <MapPin size={18} />
                  Capturar Ubicación GPS
                </button>
                {formData.locationCaptured && (
                  <div className="flex items-center text-green-600">
                    <CheckCircle size={18} />
                  </div>
                )}
              </div>
              {formData.locationCaptured && (
                <p className="text-xs text-gray-600 mt-1">
                  Ubicación: {formData.location.latitude.toFixed(4)}, {formData.location.longitude.toFixed(4)}
                </p>
              )}
              {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Hospital
              </label>
              <select
                name="hospitalType"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                value="privado"
                disabled
              >
                <option value="privado">Privado</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono Administrativo (8 dígitos)
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="tel"
                  name="adminPhone"
                  value={formData.adminPhone}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                    errors.adminPhone ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="12345678"
                  maxLength={8}
                />
              </div>
              {errors.adminPhone && <p className="text-red-500 text-xs mt-1">{errors.adminPhone}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número de Identificación de la Entidad
              </label>
              <input
                type="text"
                name="entityId"
                value={formData.entityId}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                  errors.entityId ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="123456789"
              />
              {errors.entityId && <p className="text-red-500 text-xs mt-1">{errors.entityId}</p>}
            </div>
          </>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Correo Electrónico
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                errors.email ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="ejemplo@correo.com"
            />
          </div>
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contraseña
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                errors.password ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="••••••••"
            />
          </div>
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
        >
          {isLoading ? (
            <>
              <Loader className="animate-spin" size={20} />
              Registrando...
            </>
          ) : (
            'Registrarse'
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-gray-600">
          ¿Ya tienes cuenta?{' '}
          <button
            onClick={onSwitchToLogin}
            className="text-red-600 hover:text-red-700 font-medium"
          >
            Inicia sesión aquí
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;