import Link from "next/link";
import { nav } from "@/lib/site";

export default function NotFound() {
  return (
    <div className="page band">
      <p className="label text-accent">404</p>
      <h1 className="display mt-4 max-w-[18ch] text-[2.4rem] sm:text-[3.2rem]">
        Nothing lives at this address.
      </h1>
      <p className="prose-col mt-5 text-[1.05rem] leading-relaxed text-muted">
        Either it has not been written yet, or the link has drifted. The roadmap is the best guess at
        which of those it is.
      </p>
      <ul className="mt-8 grid gap-px border border-rule bg-rule sm:grid-cols-2 lg:grid-cols-4">
        {nav.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className="group block bg-raised p-5">
              <span className="display text-[1.2rem]">
                <span className="link-underline">{item.label}</span>
              </span>
              <span className="mt-1.5 block text-[0.88rem] text-muted">{item.blurb}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
