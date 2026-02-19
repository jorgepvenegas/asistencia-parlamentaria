interface TooltipRow {
  label: string;
  value: string;
  color: string;
}

interface HoverTooltipProps {
  x: number;
  y: number;
  title: string;
  subheader: string;
  rows: TooltipRow[];
}

export default function HoverTooltip({ x, y, title, subheader, rows }: HoverTooltipProps) {
  // NOTE: Dynamic positioning requires inline styles.
  // Consider migrating to a tooltip library (e.g., Floating UI, Tippy.js)
  // for better positioning and accessibility in the future.
  return (
    <div
      className="fixed bg-white text-black border border-border shadow-lg p-4 pointer-events-none z-50 min-w-[200px] flex flex-col gap-2"
      style={{
        top: y + 16,
        left: x + 16,
      }}
    >
      <div className="flex flex-col">
        <span className="font-display text-xs font-semibold pb-0.5 text-black">{title}</span>
        <span className="font-display text-xs font-semibold mb-1 border-b border-border pb-2 text-subtle">
          {subheader}
        </span>
      </div>
      {rows.map(({ label, value, color }) => (
        <div key={label} className="flex justify-between gap-6 items-center">
          <div className="flex items-center gap-1.5">
            <div style={{ width: 8, height: 8, background: color }} className="shrink-0" />
            <span className="font-mono text-xs text-subtle">{label}</span>
          </div>
          <span className="font-mono text-xs font-semibold text-black">{value}</span>
        </div>
      ))}
    </div>
  );
}
