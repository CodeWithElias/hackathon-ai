import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Hospital, AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    const savedHospital = localStorage.getItem('currentHospital');
    
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      if (!userData.isBlocked) {
        setUser(userData);
      }
    }
    
    if (savedHospital) {
      setHospital(JSON.parse(savedHospital));
    }
    
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if user exists in localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const hospitals = JSON.parse(localStorage.getItem('hospitals') || '[]');
    
    const foundUser = users.find((u: User) => u.email === email);
    
    if (foundUser && !foundUser.isBlocked) {
      setUser(foundUser);
      localStorage.setItem('currentUser', JSON.stringify(foundUser));
      
      if (foundUser.role === 'operator') {
        const foundHospital = hospitals.find((h: Hospital) => h.operatorId === foundUser.id);
        if (foundHospital) {
          setHospital(foundHospital);
          localStorage.setItem('currentHospital', JSON.stringify(foundHospital));
        }
      }
      
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const register = async (userData: any, isOperator = false): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const hospitals = JSON.parse(localStorage.getItem('hospitals') || '[]');
    
    // Check if user already exists
    if (users.some((u: User) => u.email === userData.email || u.phone === userData.phone)) {
      setIsLoading(false);
      return false;
    }
    
    const newUser: User = {
      id: Date.now().toString(),
      ...userData,
      role: isOperator ? 'operator' : 'user',
      isBlocked: false,
      createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    if (isOperator) {
      const newHospital: Hospital = {
        id: Date.now().toString(),
        name: userData.hospitalName,
        location: userData.location,
        type: 'privado',
        adminPhone: userData.adminPhone,
        entityId: userData.entityId,
        email: userData.email,
        operatorId: newUser.id
      };
      
      hospitals.push(newHospital);
      localStorage.setItem('hospitals', JSON.stringify(hospitals));
      setHospital(newHospital);
      localStorage.setItem('currentHospital', JSON.stringify(newHospital));
    }
    
    setUser(newUser);
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    setIsLoading(false);
    return true;
  };

  const logout = () => {
    setUser(null);
    setHospital(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('currentHospital');
  };

  return (
    <AuthContext.Provider value={{
      user,
      hospital,
      login,
      register,
      logout,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
};