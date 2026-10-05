// Minimal class-name combiner (stand-in for shadcn's cn helper)
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}