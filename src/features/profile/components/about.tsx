import { Markdown } from "@/components/markdown";
import { Prose } from "@/components/ui/typography";
import { USER } from "@/data/user";
import { supabase } from "@/lib/supabase";

import { Panel, PanelContent, PanelHeader, PanelTitle } from "./panel";

export async function About() {
  let aboutText = USER.about;

  try {
    const tenantId = process.env.NEXT_PUBLIC_TENANT_ID || "tenant_anurag";
    const { data } = await supabase.from("profile").select("about").eq("tenant_id", tenantId).limit(1).single();
    if (data?.about) {
      aboutText = data.about;
    }
  } catch {
    // fallback
  }

  return (
    <Panel id="about" className="scroll-mt-22">
      <PanelHeader>
        <PanelTitle>About</PanelTitle>
      </PanelHeader>

      <PanelContent>
        <Prose className="prose-p:text-[13px] prose-p:leading-snug sm:prose-p:text-sm sm:prose-p:leading-normal">
          <Markdown>{aboutText}</Markdown>
        </Prose>
      </PanelContent>
    </Panel>
  );
}
