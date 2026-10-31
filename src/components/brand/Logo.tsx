interface LogoProps {
  subtitle?: boolean;
  className?: string;
}

export default function Logo({ subtitle = true, className = '' }: LogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img
        src="/icon.svg"
        alt=""
        width={44}
        height={44}
        className="h-11 w-11 shrink-0 rounded-2xl shadow-lg shadow-brand-700/30 ring-1 ring-white/40"
      />
      <span className="leading-tight">
        <span className="block text-lg font-bold tracking-tight text-slate-900">Vedanthika</span>
        {subtitle && (
          <span className="block text-xs font-medium text-slate-500">Dental Clinic &amp; Implant Center</span>
        )}
      </span>
    </div>
  );
}
