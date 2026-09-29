import Link from "next/link";
import { ChevronRight } from "lucide-react";

export type Crumb = {
  label: string;
  href?: string;
};

export function Trail({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-[12px] md:text-sm">
      {items.map((item, index) => {
        const last = index === items.length - 1;
        return (
          <span key={`${item.label}-${index}`} className="inline-flex items-center gap-1">
            {index > 0 && (
              <ChevronRight className="h-3.5 w-3.5 text-[var(--color-curie-muted)]" aria-hidden />
            )}
            {item.href && !last ? (
              <Link
                href={item.href}
                className="font-semibold text-[var(--color-navy)] hover:underline"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={last ? "font-semibold text-[var(--color-navy)]" : "text-[var(--color-curie-muted)]"}
                aria-current={last ? "page" : undefined}
              >
                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
