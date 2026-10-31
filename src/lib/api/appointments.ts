import { supabase } from '@/lib/supabase';
import type { AppointmentInput, AppointmentStatus } from '@/types/clinic';

export async function createAppointment(input: AppointmentInput) {
  const { error } = await supabase.from('appointments').insert(input);
  if (error) throw error;
}

export async function setAppointmentStatus(id: string, status: AppointmentStatus) {
  const { error } = await supabase.from('appointments').update({ status }).eq('id', id);
  if (error) throw error;
}

export async function deleteAppointment(id: string) {
  const { error } = await supabase.from('appointments').delete().eq('id', id);
  if (error) throw error;
}
