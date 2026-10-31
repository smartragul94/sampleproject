/*
# Create clinic management schema

Plain-English summary: adds everything the Vedhanthika clinic app stores -- patients, appointments, OP case sheets, bills, bill payments, expenses and a monthly income target. Every row belongs to the signed-in user who created it, and users can only see and change their own rows.

1. New Tables
- `patients`: name, age, sex, phone, address, medical history, registration date.
- `appointments`: patient, date, time, reason, status (Scheduled, Arrived, Done, Cancelled).
- `case_sheets`: OP case sheet per visit (complaint, teeth, diagnosis, treatment, prescription, next visit).
- `bills`: patient, bill date, itemised treatments stored as a list of name and amount.
- `payments`: money received against a bill (date, amount, mode).
- `expenses`: clinic expenses by date and category.
- `clinic_settings`: one row per user holding the monthly income target.

2. Security
- Row level security enabled on every table.
- Access granted to the `authenticated` role only; the app requires sign-in.
- Each table has separate select, insert, update and delete policies that check `auth.uid() = user_id`.
- `user_id` defaults to the signed-in user so inserts do not need to send it.

3. Important notes
- Deleting a patient removes their appointments, case sheets, bills and payments (cascade).
- Deleting a bill removes its payments (cascade).
- Amounts are stored as whole rupees in numeric form to avoid rounding issues.
*/

CREATE TABLE IF NOT EXISTS patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  age integer CHECK (age IS NULL OR (age >= 0 AND age <= 150)),
  sex text CHECK (sex IS NULL OR sex IN ('F', 'M', 'O')),
  phone text,
  address text,
  medical_history text,
  registered_on date NOT NULL DEFAULT current_date,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  appointment_date date NOT NULL,
  appointment_time time NOT NULL,
  reason text,
  status text NOT NULL DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'Arrived', 'Done', 'Cancelled')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS case_sheets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  visit_date date NOT NULL,
  chief_complaint text,
  teeth text,
  diagnosis text,
  treatment text,
  prescription text,
  next_visit date,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  bill_date date NOT NULL,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  bill_id uuid NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
  payment_date date NOT NULL,
  amount numeric(12, 2) NOT NULL CHECK (amount > 0),
  mode text NOT NULL CHECK (mode IN ('Cash', 'UPI', 'Card')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  expense_date date NOT NULL,
  category text NOT NULL,
  amount numeric(12, 2) NOT NULL CHECK (amount > 0),
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS clinic_settings (
  user_id uuid PRIMARY KEY DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  monthly_target numeric(12, 2) NOT NULL DEFAULT 0 CHECK (monthly_target >= 0),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_patients_user ON patients(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_user_date ON appointments(user_id, appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_case_sheets_patient ON case_sheets(patient_id);
CREATE INDEX IF NOT EXISTS idx_bills_user ON bills(user_id);
CREATE INDEX IF NOT EXISTS idx_bills_patient ON bills(patient_id);
CREATE INDEX IF NOT EXISTS idx_payments_bill ON payments(bill_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_date ON payments(user_id, payment_date);
CREATE INDEX IF NOT EXISTS idx_expenses_user_date ON expenses(user_id, expense_date);

ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_sheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_settings ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON patients, appointments, case_sheets, bills, payments, expenses, clinic_settings TO authenticated;

DROP POLICY IF EXISTS "select_own_patients" ON patients;
CREATE POLICY "select_own_patients" ON patients FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_patients" ON patients;
CREATE POLICY "insert_own_patients" ON patients FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_patients" ON patients;
CREATE POLICY "update_own_patients" ON patients FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_patients" ON patients;
CREATE POLICY "delete_own_patients" ON patients FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "select_own_appointments" ON appointments;
CREATE POLICY "select_own_appointments" ON appointments FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_appointments" ON appointments;
CREATE POLICY "insert_own_appointments" ON appointments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_appointments" ON appointments;
CREATE POLICY "update_own_appointments" ON appointments FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_appointments" ON appointments;
CREATE POLICY "delete_own_appointments" ON appointments FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "select_own_case_sheets" ON case_sheets;
CREATE POLICY "select_own_case_sheets" ON case_sheets FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_case_sheets" ON case_sheets;
CREATE POLICY "insert_own_case_sheets" ON case_sheets FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_case_sheets" ON case_sheets;
CREATE POLICY "update_own_case_sheets" ON case_sheets FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_case_sheets" ON case_sheets;
CREATE POLICY "delete_own_case_sheets" ON case_sheets FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "select_own_bills" ON bills;
CREATE POLICY "select_own_bills" ON bills FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_bills" ON bills;
CREATE POLICY "insert_own_bills" ON bills FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_bills" ON bills;
CREATE POLICY "update_own_bills" ON bills FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_bills" ON bills;
CREATE POLICY "delete_own_bills" ON bills FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "select_own_payments" ON payments;
CREATE POLICY "select_own_payments" ON payments FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_payments" ON payments;
CREATE POLICY "insert_own_payments" ON payments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_payments" ON payments;
CREATE POLICY "update_own_payments" ON payments FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_payments" ON payments;
CREATE POLICY "delete_own_payments" ON payments FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "select_own_expenses" ON expenses;
CREATE POLICY "select_own_expenses" ON expenses FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_expenses" ON expenses;
CREATE POLICY "insert_own_expenses" ON expenses FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_expenses" ON expenses;
CREATE POLICY "update_own_expenses" ON expenses FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_expenses" ON expenses;
CREATE POLICY "delete_own_expenses" ON expenses FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "select_own_settings" ON clinic_settings;
CREATE POLICY "select_own_settings" ON clinic_settings FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_settings" ON clinic_settings;
CREATE POLICY "insert_own_settings" ON clinic_settings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_settings" ON clinic_settings;
CREATE POLICY "update_own_settings" ON clinic_settings FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_settings" ON clinic_settings;
CREATE POLICY "delete_own_settings" ON clinic_settings FOR DELETE TO authenticated USING (auth.uid() = user_id);
