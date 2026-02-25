import { cn } from '@/lib/utils';

type Tone = 'emerald' | 'amber' | 'electric';

interface SignalPillProps {
  label: string;
  tone?: Tone;
}

const toneClasses: Record<Tone, string> = {
  emerald: 'border-signal/40 bg-signal/10 text-signal',
  amber: 'border-ember/40 bg-ember/10 text-ember',
  electric: 'border-electric/40 bg-electric/10 text-electric'
};

export default function SignalPill({ label, tone = 'emerald' }: SignalPillProps) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full border px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.12em]',
        toneClasses[tone]
      )}
    >
      {label}
    </span>
  );
}
