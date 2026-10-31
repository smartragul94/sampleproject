import { supabase } from '@/lib/supabase';
import type { BillInput, PaymentInput } from '@/types/clinic';

export async function createBill(input: BillInput): Promise<string> {
  const { data, error } = await supabase.from('bills').insert(input).select('id').single();
  if (error) throw error;
  const id = (data as { id?: unknown } | null)?.id;
  if (typeof id !== 'string') throw new Error('The bill was saved but could not be read back.');
  return id;
}

export async function deleteBill(id: string) {
  const { error } = await supabase.from('bills').delete().eq('id', id);
  if (error) throw error;
}

export async function addPayment(input: PaymentInput) {
  const { error } = await supabase.from('payments').insert(input);
  if (error) throw error;
}
