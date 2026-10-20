import Image from "next/image";
import Link from "next/link";
import { USER } from "@/data/user";
import { decodeEmail } from "@/utils/string";

export function Footer() {
  const email = USER.email ? decodeEmail(USER.email) : "anurag.mukhopadhyay@gmail.com";

  return (
    <footer className="screen-line-before border-x border-grid py-8 pb-[calc(2.5rem+env(safe-area-inset-bottom,0px))]">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 font-mono text-xs text-muted-foreground">
        <div>
          <span>© {new Date().getFullYear()} {USER.displayName}. All rights reserved.</span>
        </div>

        {/* Built by Connect */}
        <div className="flex items-center gap-1.5 font-sans transition-opacity hover:opacity-100 opacity-90">
          <span className="text-[11px] font-medium tracking-tight text-muted-foreground/80">
            Built by
          </span>
          <span className="inline-flex items-center">
            <Image
              src="/images/connect-logo-light.png"
              alt="Connect"
              width={75}
              height={25}
              className="h-[15px] w-auto dark:hidden object-contain"
              priority
            />
            <Image
              src="/images/connect-logo-dark.png"
              alt="Connect"
              width={75}
              height={25}
              className="h-[15px] w-auto hidden dark:inline-block object-contain"
              priority
            />
          </span>
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
            href={`mailto:${email}`}
            className="transition-colors hover:text-foreground"
          >
            {email}
          </a>
        </div>
      </div>
    </footer>
  );
}
