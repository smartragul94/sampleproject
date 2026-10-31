import { supabase } from '@/lib/supabase';
import type { Appointment, Bill, CaseSheet, ClinicData, Expense, Patient, Payment } from '@/types/clinic';

export async function fetchClinicData(): Promise<ClinicData> {
  const [patients, appointments, caseSheets, bills, payments, expenses, settings] = await Promise.all([
    supabase.from('patients').select('*').order('name'),
    supabase.from('appointments').select('*').order('appointment_date').order('appointment_time'),
    supabase.from('case_sheets').select('*').order('visit_date', { ascending: false }),
    supabase.from('bills').select('*').order('bill_date', { ascending: false }),
    supabase.from('payments').select('*'),
    supabase.from('expenses').select('*').order('expense_date', { ascending: false }),
    supabase.from('clinic_settings').select('monthly_target').maybeSingle(),
  ]);

  const failure = [patients, appointments, caseSheets, bills, payments, expenses, settings].find((r) => r.error);
  if (failure?.error) throw failure.error;

  return {
    patients: (patients.data ?? []) as Patient[],
    appointments: (appointments.data ?? []) as Appointment[],
    caseSheets: (caseSheets.data ?? []) as CaseSheet[],
    bills: (bills.data ?? []) as Bill[],
    payments: ((payments.data ?? []) as Payment[]).map((p) => ({ ...p, amount: Number(p.amount) })),
    expenses: ((expenses.data ?? []) as Expense[]).map((e) => ({ ...e, amount: Number(e.amount) })),
    monthlyTarget: Number(settings.data?.monthly_target ?? 0),
  };
}
