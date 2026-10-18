import Link from "next/link";
import { USER } from "@/data/user";

export function Footer() {
  return (
    <footer className="screen-line-before border-x border-grid py-8 pb-[calc(2rem+env(safe-area-inset-bottom,0px))]">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 font-mono text-xs text-muted-foreground">
        <div>
          <span>© {new Date().getFullYear()} {USER.displayName}. All rights reserved.</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/refund-policy"
            className="transition-colors hover:text-foreground underline underline-offset-4"
          >
            Refund Policy
          </Link>
          <span>•</span>
          <a
            href="mailto:contact@studiomehta.com"
            className="transition-colors hover:text-foreground"
          >
            contact@studiomehta.com
          </a>
        </div>
      </div>
    </footer>
  );
}
