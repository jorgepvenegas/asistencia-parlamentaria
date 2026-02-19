import { useState } from 'react';

const NAV_ITEMS = [
  { label: 'Partidos', href: '/partidos', active: false },
  { label: 'Diputados', href: '/diputados', active: false },
  { label: 'Acerca de', href: '/acerca-de', active: false },
];

export default function Navigation() {
  const [open, setOpen] = useState(false);

  return (
    <header className="bg-black relative">
      <div className="max-w-[1536px] mx-auto px-6 py-4 flex items-center justify-between box-border md:px-5 md:py-3.5">
        <a href="/" className="flex items-center gap-2.5 no-underline">
          <div className="bg-brand-red w-7 h-7 flex items-center justify-center">
            <span className="text-surface font-bold text-sm font-display">C</span>
          </div>
          <span className="text-surface font-semibold text-sm tracking-tight font-display">
            CongresoAbierto
          </span>
        </a>

        <nav className="hidden md:hidden lg:flex gap-8">
          {NAV_ITEMS.map(({ label, href, active }) => (
            <a
              key={label}
              href={href}
              className={`text-sm no-underline ${active ? 'text-surface font-medium' : 'text-muted font-normal'}`}
            >
              {label}
            </a>
          ))}
        </nav>

        <button
          onClick={() => setOpen((o) => !o)}
          className="lg:hidden bg-transparent border-0 cursor-pointer p-0 flex flex-col gap-1.5 items-end"
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
        >
          <span className="block w-5.5 h-0.5 bg-surface" />
          <span
            className="block h-0.5 bg-surface transition-all duration-200"
            style={{ width: open ? 22 : 14 }}
          />
          <span className="block w-5.5 h-0.5 bg-surface" />
        </button>
      </div>

      {open && (
        <nav className="lg:hidden flex flex-col bg-black border-t border-[#222] px-5 py-2">
          {NAV_ITEMS.map(({ label, href, active }) => (
            <a
              key={label}
              href={href}
              onClick={() => setOpen(false)}
              className={`text-sm no-underline py-3 border-b border-[#1a1a1a] ${active ? 'text-surface font-medium' : 'text-muted font-normal'}`}
            >
              {label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
