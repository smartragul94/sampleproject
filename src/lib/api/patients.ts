import { supabase } from '@/lib/supabase';
import type { CaseSheetInput, PatientInput } from '@/types/clinic';

export async function savePatient(input: PatientInput, id?: string) {
  const request = id
    ? supabase.from('patients').update(input).eq('id', id)
    : supabase.from('patients').insert(input);
  const { error } = await request;
  if (error) throw error;
}

export async function deletePatient(id: string) {
  const { error } = await supabase.from('patients').delete().eq('id', id);
  if (error) throw error;
}

export async function createCaseSheet(input: CaseSheetInput) {
  const { error } = await supabase.from('case_sheets').insert(input);
  if (error) throw error;
}

export async function deleteCaseSheet(id: string) {
  const { error } = await supabase.from('case_sheets').delete().eq('id', id);
  if (error) throw error;
}
