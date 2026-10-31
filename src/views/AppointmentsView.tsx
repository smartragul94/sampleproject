import { useState } from 'react';
import { CalendarPlus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useClinic } from '@/context/clinicContext';
import Modal from '@/components/ui/Modal';
import AppointmentList from '@/components/appointments/AppointmentList';
import AppointmentForm from '@/components/forms/AppointmentForm';
import { formatWeekday, toISODate, todayISO } from '@/lib/format';
import { fieldClass, iconButton, primaryButton } from '@/lib/ui';

interface AppointmentsViewProps {
  onOpenPatient: (patientId: string) => void;
}

export default function AppointmentsView({ onOpenPatient }: AppointmentsViewProps) {
  const { data } = useClinic();
  const [date, setDate] = useState(todayISO());
  const [booking, setBooking] = useState(false);

  const shiftDate = (days: number) => {
    const next = new Date(`${date}T00:00`);
    next.setDate(next.getDate() + days);
    setDate(toISODate(next));
  };

  const dayList = data.appointments.filter((a) => a.appointment_date === date);
  const upcoming = data.appointments.filter(
    (a) => a.appointment_date > date && a.status === 'Scheduled',
  );

  return (
    <div className="space-y-8 animate-fade-up">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">Schedule</p>
          <h1 className="text-2xl font-bold text-slate-900">{formatWeekday(date)}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" aria-label="Previous day" onClick={() => shiftDate(-1)} className={iconButton}>
            <ChevronLeft size={18} aria-hidden="true" />
          </button>
          <input
            type="date"
            aria-label="Choose date"
            value={date}
            onChange={(e) => e.target.value && setDate(e.target.value)}
            className={`${fieldClass} w-auto py-2`}
          />
          <button type="button" aria-label="Next day" onClick={() => shiftDate(1)} className={iconButton}>
            <ChevronRight size={18} aria-hidden="true" />
          </button>
          <button type="button" onClick={() => setBooking(true)} className={primaryButton}>
            <CalendarPlus size={16} aria-hidden="true" />
            Book visit
          </button>
        </div>
      </header>

      <AppointmentList
        appointments={dayList}
        allowDelete
        onOpenPatient={onOpenPatient}
        emptyText="Nothing booked for this day."
      />

      {upcoming.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Upcoming scheduled visits</h2>
          <AppointmentList appointments={upcoming} showDate allowDelete onOpenPatient={onOpenPatient} />
        </section>
      )}

      {booking && (
        <Modal title="Book appointment" onClose={() => setBooking(false)}>
          <AppointmentForm defaultDate={date} onDone={() => setBooking(false)} />
        </Modal>
      )}
    </div>
  );
}
