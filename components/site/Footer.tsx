import Link from "next/link";
import { site, nav } from "@/lib/site";

const socialLabels: Record<string, string> = {
  x: "X",
  linkedin: "LinkedIn",
  github: "GitHub",
};

export function Footer() {
  const socials = Object.entries(site.socials).filter(([, href]) => href);

  return (
    <footer className="mt-24 border-t border-rule">
      <div className="page grid gap-10 py-12 sm:grid-cols-[1fr_auto]">
        <div className="max-w-sm">
          <p className="display text-xl">{site.name}</p>
          <p className="mt-2 text-[0.95rem] leading-relaxed text-muted">{site.tagline}.</p>
          <p className="mt-4 font-mono text-[0.72rem] leading-relaxed text-faint">
            Everything here is written while learning it. If something is wrong, it is worth
            telling me — that is half the point of writing it down in public.
          </p>
        </div>

        <div className="flex gap-12">
          <div>
            <p className="label text-faint">Sections</p>
            <ul className="mt-3 space-y-1.5">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="font-mono text-[0.78rem] text-muted transition-colors hover:text-accent"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {socials.length > 0 && (
            <div>
              <p className="label text-faint">Elsewhere</p>
              <ul className="mt-3 space-y-1.5">
                {socials.map(([key, href]) => (
                  <li key={key}>
                    <a
                      href={href}
                      rel="me noreferrer"
                      target="_blank"
                      className="font-mono text-[0.78rem] text-muted transition-colors hover:text-accent"
                    >
                      {socialLabels[key] ?? key}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="page flex flex-wrap items-center justify-between gap-3 border-t border-rule py-5">
        <p className="font-mono text-[0.68rem] text-faint">
          © {new Date().getFullYear()} {site.name}
        </p>
        <p className="font-mono text-[0.68rem] text-faint">
          Built to be read, not to be impressive.
        </p>
      </div>
    </footer>
  );
}
