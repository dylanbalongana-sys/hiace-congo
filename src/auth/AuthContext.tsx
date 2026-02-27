import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export type UserRole = 'owner' | 'collaborator' | null;

interface AuthContextType {
  role: UserRole;
  isAuthenticated: boolean;
  login: (pin: string) => { success: boolean; role: UserRole; error?: string };
  logout: () => void;
  ownerPin: string;
  collaboratorPin: string;
  setOwnerPin: (pin: string) => void;
  setCollaboratorPin: (pin: string) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const DEFAULT_OWNER_PIN = '1234';
const DEFAULT_COLLAB_PIN = '0000';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>(null);
  const [ownerPin, setOwnerPinState] = useState(() => {
    return localStorage.getItem('hiace_owner_pin') || DEFAULT_OWNER_PIN;
  });
  const [collaboratorPin, setCollaboratorPinState] = useState(() => {
    return localStorage.getItem('hiace_collab_pin') || DEFAULT_COLLAB_PIN;
  });

  useEffect(() => {
    const savedRole = sessionStorage.getItem('hiace_role') as UserRole;
    if (savedRole) setRole(savedRole);
  }, []);

  const login = (pin: string): { success: boolean; role: UserRole; error?: string } => {
    if (pin === ownerPin) {
      setRole('owner');
      sessionStorage.setItem('hiace_role', 'owner');
      return { success: true, role: 'owner' };
    } else if (pin === collaboratorPin) {
      setRole('collaborator');
      sessionStorage.setItem('hiace_role', 'collaborator');
      return { success: true, role: 'collaborator' };
    }
    return { success: false, role: null, error: 'PIN incorrect' };
  };

  const logout = () => {
    setRole(null);
    sessionStorage.removeItem('hiace_role');
  };

  const setOwnerPin = (pin: string) => {
    localStorage.setItem('hiace_owner_pin', pin);
    setOwnerPinState(pin);
  };

  const setCollaboratorPin = (pin: string) => {
    localStorage.setItem('hiace_collab_pin', pin);
    setCollaboratorPinState(pin);
  };

  return (
    <AuthContext.Provider value={{
      role, isAuthenticated: role !== null,
      login, logout,
      ownerPin, collaboratorPin,
      setOwnerPin, setCollaboratorPin,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
