import { motion } from 'framer-motion';

// Pill tab bar: scrolls horizontally on narrow screens instead of wrapping
// or overflowing. Scrollbar is hidden across browsers but the scroll itself
// still works (including touch swipe / momentum scroll on iOS).
export function SegmentedTabs({ options, value, onChange }) {
  return (
    <div
      className="w-full md:w-auto overflow-x-auto scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      <div className="inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-neutral-100 p-1 min-w-max">
        {options.map((opt) => {
          const active = value === opt.key;
          return (
            <button
              key={opt.key}
              onClick={() => onChange(opt.key)}
              className="relative px-3 sm:px-4 py-1.5 text-sm font-medium rounded-full whitespace-nowrap transition-colors"
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
    </div>
  );
}
