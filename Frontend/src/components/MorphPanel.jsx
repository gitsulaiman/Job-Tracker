import { AnimatePresence, motion } from 'framer-motion';

// A button that smoothly morphs into a panel, and back, using a shared layoutId.
export function MorphPanel({ open, onOpenChange, triggerLabel, children }) {
  return (
    <AnimatePresence initial={false} mode="popLayout">
      {!open ? (
        <motion.button
          key="trigger"
          layoutId="morph-panel"
          onClick={() => onOpenChange(true)}
          whileTap={{ scale: 0.98 }}
          transition={{ type: 'spring', bounce: 0.15, duration: 0.45 }}
          className="w-full rounded-full bg-neutral-950 text-white py-3.5 text-sm font-medium tracking-wide hover:bg-neutral-800 transition-colors"
        >
          {triggerLabel}
        </motion.button>
      ) : (
        <motion.div
          key="panel"
          layoutId="morph-panel"
          transition={{ type: 'spring', bounce: 0.15, duration: 0.45 }}
          className="rounded-2xl bg-neutral-950 text-white p-6"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}