import { LinkIcon, MapPinIcon } from "lucide-react";
import Image from "next/image";

import { USER } from "@/data/user";
import { urlToName } from "@/utils/url";

import { SOCIAL_LINKS } from "../../data/social-links";
import { Panel, PanelContent } from "../panel";
import { EmailItem } from "./email-item";
import { IntroItem } from "./intro-item";
import { JobItem } from "./job-item";

export function Overview() {
  return (
    <Panel>
      <h2 className="sr-only">Overview</h2>

      <PanelContent className="space-y-2">
        {USER.jobs.map((job, index) => {
          return (
            <JobItem
              key={index}
              title={job.title}
              company={job.company}
              website={job.website}
            />
          );
        })}

        <IntroItem icon={MapPinIcon} content={USER.address} />

        <EmailItem email={USER.email} />

        <IntroItem
          icon={LinkIcon}
          content={urlToName(USER.website)}
          href={USER.website}
        />
        
        <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-border mt-4">
          {SOCIAL_LINKS.map((link, index) => (
            <a
              key={index}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative size-10 shrink-0 transition-transform hover:scale-110"
              title={link.title}
            >
              <Image
                className="rounded-full object-cover"
                src={link.icon}
                alt={`${link.title} icon`}
                fill
                sizes="40px"
                quality={100}
              />
              <div className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-black/10 ring-inset dark:ring-white/10" />
            </a>
          ))}
        </div>
      </PanelContent>
    </Panel>
  );
}
