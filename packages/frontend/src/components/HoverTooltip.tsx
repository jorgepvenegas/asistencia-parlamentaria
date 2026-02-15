interface TooltipRow {
  label: string;
  value: string;
  color: string;
}

interface HoverTooltipProps {
  x: number;
  y: number;
  title: string;
  rows: TooltipRow[];
}

export default function HoverTooltip({ x, y, title, rows }: HoverTooltipProps) {
  return (
    <div
      style={{
        position: "fixed",
        top: y + 16,
        left: x + 16,
        background: "#FFF",
        color: "#000",
        border: "1px solid #E5E5E5",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        padding: "12px 16px",
        pointerEvents: "none",
        zIndex: 1000,
        minWidth: 200,
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <span
        style={{
          fontFamily: "'Sora', sans-serif",
          fontSize: 12,
          fontWeight: 600,
          marginBottom: 4,
          borderBottom: "1px solid #E5E5E5",
          paddingBottom: 8,
          color: "#000",
        }}
      >
        {title}
      </span>
      {rows.map(({ label, value, color }) => (
        <div key={label} style={{ display: "flex", justifyContent: "space-between", gap: 24, alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 8, height: 8, background: color, flexShrink: 0 }} />
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "#5E5E5E" }}>
              {label}
            </span>
          </div>
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, fontWeight: 600, color: "#000" }}>
            {value}
          </span>
        </div>
      ))}
    </div>
  );
}
