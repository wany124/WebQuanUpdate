interface PageHeaderProps {
  title: string;
  subtitle?: string;
  /** Short label shown in the floating section plate at the bottom edge. Optional. */
  sectionLabel?: string;
}

export function PageHeader({ title, subtitle, sectionLabel }: PageHeaderProps) {
  return (
    <header className="relative pt-8 md:pt-10 pb-16 md:pb-20 text-center bg-[#2c3340]">
      <div className="relative max-w-[68em] mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-bold uppercase tracking-[0.18em] text-white whitespace-nowrap text-[clamp(0.7rem,2.4vw,1.875rem)]">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-3 text-sm md:text-base text-white/70">{subtitle}</p>
        )}
      </div>

      {/* Floating section plate — light box, no bottom border (blends into section below) */}
      {sectionLabel && (
        <div className="absolute left-1/2 -translate-x-1/2 -bottom-5 z-10 px-10 py-2.5 bg-white border-t border-x border-border shadow-md">
          <span className="text-xs tracking-[0.25em] font-bold text-foreground uppercase">
            {sectionLabel}
          </span>
        </div>
      )}
    </header>
  );
}
