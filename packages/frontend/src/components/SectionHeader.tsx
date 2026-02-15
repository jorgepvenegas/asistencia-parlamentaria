interface SectionHeaderProps {
  title: string;
  description?: string;
}

export default function SectionHeader({ title, description }: SectionHeaderProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <h2
        style={{
          fontSize: 32,
          fontWeight: 600,
          letterSpacing: -2,
          color: "#000",
          margin: 0,
        }}
      >
        {title}
      </h2>
      {description && (
        <p style={{ fontSize: 16, color: "#5E5E5E", margin: 0 }}>{description}</p>
      )}
    </div>
  );
}
