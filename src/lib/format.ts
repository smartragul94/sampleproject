const rupees = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

export const formatINR = (amount: number) => rupees.format(amount);

export function toISODate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export const todayISO = () => toISODate(new Date());

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '';
  return new Date(`${iso}T00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatWeekday(iso: string): string {
  return new Date(`${iso}T00:00`).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  return `${hours % 12 || 12}:${String(minutes).padStart(2, '0')} ${period}`;
}

export function monthLabel(month: string): string {
  return new Date(`${month}-01T00:00`).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}

export function recentMonths(count: number): string[] {
  const now = new Date();
  return Array.from({ length: count }, (_, i) =>
    toISODate(new Date(now.getFullYear(), now.getMonth() - i, 1)).slice(0, 7),
  );
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return (parts[0]?.[0] ?? '?').concat(parts.length > 1 ? parts[parts.length - 1][0] : '').toUpperCase();
}

export function greetingForNow(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}
