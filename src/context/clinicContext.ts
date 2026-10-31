import { createContext, useContext } from 'react';
import type { ClinicData } from '@/types/clinic';

export interface ClinicContextValue {
  data: ClinicData;
  save: (task: () => Promise<unknown>) => Promise<void>;
  runAction: (task: () => Promise<unknown>) => Promise<void>;
  actionError: string | null;
  dismissActionError: () => void;
}

export const ClinicContext = createContext<ClinicContextValue | null>(null);

export function useClinic(): ClinicContextValue {
  const value = useContext(ClinicContext);
  if (!value) throw new Error('useClinic must be used inside ClinicProvider');
  return value;
}
