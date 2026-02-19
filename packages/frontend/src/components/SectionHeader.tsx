interface SectionHeaderProps {
  title: string;
  description?: string;
}

export default function SectionHeader({ title, description }: SectionHeaderProps) {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-[32px] font-semibold tracking-tight text-black m-0">{title}</h2>
      {description && <p className="text-base text-subtle m-0">{description}</p>}
    </div>
  );
}
