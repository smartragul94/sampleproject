import { supabase } from '@/lib/supabase';
import type { ExpenseInput } from '@/types/clinic';

export async function createExpense(input: ExpenseInput) {
  const { error } = await supabase.from('expenses').insert(input);
  if (error) throw error;
}

export async function deleteExpense(id: string) {
  const { error } = await supabase.from('expenses').delete().eq('id', id);
  if (error) throw error;
}

export async function saveMonthlyTarget(amount: number) {
  const { error } = await supabase
    .from('clinic_settings')
    .upsert({ monthly_target: amount, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
  if (error) throw error;
}
