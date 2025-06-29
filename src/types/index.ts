export interface User {
  id: string;
  phone: string;
  ci: string;
  email: string;
  role: 'user' | 'operator';
  isBlocked: boolean;
  createdAt: string;
}

export interface Hospital {
  id: string;
  name: string;
  location: {
    latitude: number;
    longitude: number;
  };
  type: 'privado';
  adminPhone: string;
  entityId: string;
  email: string;
  operatorId: string;
}

export interface Ambulance {
  id: string;
  plateNumber: string;
  status: 'disponible' | 'en uso';
  hospitalId: string;
  driverId?: string;
}

export interface Driver {
  id: string;
  firstName: string;
  lastName: string;
  licenseNumber: string;
  hospitalId: string;
  ambulanceId?: string;
}

export interface EmergencyReport {
  id: string;
  userId: string;
  userPhone: string;
  userName: string;
  timestamp: string;
  location: {
    latitude: number;
    longitude: number;
  };
  description?: string;
  accidentType: string;
  injuredCount: number;
  triageAnswers: Record<string, string>;
  imageUrl: string;
  aiAnalysis: {
    imageDescription: string;
    triageLevel: 'Rojo' | 'Amarillo' | 'Verde';
    justification: string;
    isFakeAlarm: boolean;
  };
  status: 'Pendiente' | 'En Despacho' | 'Falsa Alarma' | 'Atendido';
  assignedAmbulanceId?: string;
  dispatchTime?: string;
  hospitalId?: string;
}

export interface AuthContextType {
  user: User | null;
  hospital: Hospital | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: any, isOperator?: boolean) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}