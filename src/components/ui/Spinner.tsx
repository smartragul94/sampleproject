export default function Spinner() {
  return (
    <span
      role="status"
      aria-label="Loading"
      className="h-10 w-10 animate-spin rounded-full border-4 border-brand-100 border-t-brand-600"
    />
  );
}
