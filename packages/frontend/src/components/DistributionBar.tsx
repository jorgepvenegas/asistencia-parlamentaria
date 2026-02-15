import { ATTENDANCE_COLORS } from "../constants/colors";

interface DistributionBarProps {
  a: number;
  b: number;
  c: number;
  d: number;
  height?: number;
}

export default function DistributionBar({ a, b, c, d, height = 12 }: DistributionBarProps) {
  return (
    <div style={{ flex: 1, display: "flex", height, overflow: "hidden" }}>
      <div style={{ flex: a, background: ATTENDANCE_COLORS.attendance, height: "100%" }} />
      <div style={{ flex: b, background: ATTENDANCE_COLORS.justified, height: "100%" }} />
      <div style={{ flex: c, background: ATTENDANCE_COLORS.unjustified, height: "100%" }} />
      <div style={{ flex: d, background: ATTENDANCE_COLORS.noJust, height: "100%" }} />
    </div>
  );
}
