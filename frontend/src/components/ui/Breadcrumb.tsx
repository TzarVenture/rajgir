import Link from "next/link";
import { LuChevronRight } from "react-icons/lu";

export interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex flex-wrap items-center gap-1 text-xs font-medium text-charcoal-500">
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1">
              {item.href && !last ? (
                <Link href={item.href} className="-my-3 py-3 hover:text-brand-red hover:underline">
                  {item.label}
                </Link>
              ) : (
                <span aria-current={last ? "page" : undefined} className={last ? "text-charcoal-800" : undefined}>
                  {item.label}
                </span>
              )}
              {!last ? <LuChevronRight className="h-3.5 w-3.5 text-charcoal-300" aria-hidden /> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
