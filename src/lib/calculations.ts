import type { Bill, Patient, Payment } from '@/types/clinic';

export const sumAmounts = (items: { amount: number }[]) => items.reduce((sum, item) => sum + item.amount, 0);

export const billTotal = (bill: Bill) => sumAmounts(bill.items);

export const billPaid = (bill: Bill, payments: Payment[]) =>
  sumAmounts(payments.filter((payment) => payment.bill_id === bill.id));

export const billDue = (bill: Bill, payments: Payment[]) => billTotal(bill) - billPaid(bill, payments);

export const totalOutstanding = (bills: Bill[], payments: Payment[]) =>
  bills.reduce((sum, bill) => sum + billDue(bill, payments), 0);

export const incomeIn = (payments: Payment[], month: string) =>
  sumAmounts(payments.filter((payment) => payment.payment_date.startsWith(month)));

export const incomeOn = (payments: Payment[], date: string) =>
  sumAmounts(payments.filter((payment) => payment.payment_date === date));

export const expensesIn = (expenses: { expense_date: string; amount: number }[], month: string) =>
  sumAmounts(expenses.filter((expense) => expense.expense_date.startsWith(month)));

export const findPatientName = (patients: Patient[], id: string) =>
  patients.find((patient) => patient.id === id)?.name ?? 'Deleted patient';
