import Link from "next/link";
import { site } from "@/lib/site";
import { NavLinks } from "./NavLinks";
import { ThemeControls } from "./ThemeControls";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-rule bg-bg/85 backdrop-blur-md">
      <div className="page flex h-14 items-center justify-between gap-4">
        <Link href="/" className="group flex items-baseline gap-2">
          <span className="display text-[1.35rem] leading-none">{site.name}</span>
          <span
            aria-hidden="true"
            className="hidden h-1.5 w-1.5 shrink-0 translate-y-[-2px] bg-accent transition-transform group-hover:scale-150 sm:block"
          />
        </Link>

        <div className="flex items-center gap-3 sm:gap-6">
          <NavLinks className="hidden items-center gap-4 sm:flex lg:gap-6" />
          <ThemeControls />
        </div>
      </div>

      {/* Small screens: nav gets its own row rather than being crushed. */}
      <div className="border-t border-rule sm:hidden">
        <NavLinks className="page flex items-center justify-between py-2" />
      </div>
    </header>
  );
}
