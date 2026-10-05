import { motion } from 'framer-motion';

// Pill tab bar with a sliding active-state background, shared layoutId drives the slide.
export function SegmentedTabs({ options, value, onChange }) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-neutral-100 p-1">
      {options.map((opt) => {
        const active = value === opt.key;
        return (
          <button
            key={opt.key}
            onClick={() => onChange(opt.key)}
            className="relative px-4 py-1.5 text-sm font-medium rounded-full transition-colors"
            style={{ color: active ? '#fff' : '#171717' }}
          >
            {active && (
              <motion.span
                layoutId="tab-pill"
                className="absolute inset-0 rounded-full bg-neutral-950"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
              />
            )}
            <span className="relative z-10">
              {opt.label}
              {opt.count !== undefined && <sup className="ml-1 opacity-70">{opt.count}</sup>}
            </span>
          </button>
        );
      })}
    </div>
  );
}