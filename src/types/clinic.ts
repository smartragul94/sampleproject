export type Sex = 'F' | 'M' | 'O';
export type AppointmentStatus = 'Scheduled' | 'Arrived' | 'Done' | 'Cancelled';
export type PaymentMode = 'Cash' | 'UPI' | 'Card';
export type ViewKey = 'home' | 'appointments' | 'patients' | 'billing' | 'accounts';

export const APPOINTMENT_STATUSES: AppointmentStatus[] = ['Scheduled', 'Arrived', 'Done', 'Cancelled'];
export const PAYMENT_MODES: PaymentMode[] = ['Cash', 'UPI', 'Card'];
export const EXPENSE_CATEGORIES = ['Lab', 'Materials', 'Rent', 'Salary', 'Utilities', 'Other'];
export const SEX_OPTIONS: { value: Sex; label: string }[] = [
  { value: 'F', label: 'Female' },
  { value: 'M', label: 'Male' },
  { value: 'O', label: 'Other' },
];

export interface Patient {
  id: string;
  name: string;
  age: number | null;
  sex: Sex | null;
  phone: string | null;
  address: string | null;
  medical_history: string | null;
  registered_on: string;
}

export type PatientInput = Omit<Patient, 'id' | 'registered_on'>;

export interface Appointment {
  id: string;
  patient_id: string;
  appointment_date: string;
  appointment_time: string;
  reason: string | null;
  status: AppointmentStatus;
}

export type AppointmentInput = Omit<Appointment, 'id' | 'status'>;

export interface CaseSheet {
  id: string;
  patient_id: string;
  visit_date: string;
  chief_complaint: string | null;
  teeth: string | null;
  diagnosis: string | null;
  treatment: string | null;
  prescription: string | null;
  next_visit: string | null;
}

export type CaseSheetInput = Omit<CaseSheet, 'id'>;

export interface BillItem {
  name: string;
  amount: number;
}

export interface Bill {
  id: string;
  patient_id: string;
  bill_date: string;
  items: BillItem[];
}

export type BillInput = Omit<Bill, 'id'>;

export interface Payment {
  id: string;
  bill_id: string;
  payment_date: string;
  amount: number;
  mode: PaymentMode;
}

export type PaymentInput = Omit<Payment, 'id'>;

export interface Expense {
  id: string;
  expense_date: string;
  category: string;
  amount: number;
  note: string | null;
}

export type ExpenseInput = Omit<Expense, 'id'>;

export interface ClinicData {
  patients: Patient[];
  appointments: Appointment[];
  caseSheets: CaseSheet[];
  bills: Bill[];
  payments: Payment[];
  expenses: Expense[];
  monthlyTarget: number;
}
