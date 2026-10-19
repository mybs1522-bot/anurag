import { ToggleTheme } from "@/components/toggle-theme";
import { SimpleTooltip } from "@/components/ui/tooltip";
import { USER } from "@/data/user";
import { supabase } from "@/lib/supabase";
import { FlipSentences } from "@/registry/flip-sentences";

import { ChanhDaiAvatar } from "./chanhdai-avatar";
import { ChanhDaiCoverHello } from "./chanhdai-cover-hello";
import { VerifiedIcon } from "./verified-icon";

export async function Header() {
  let displayName = USER.displayName;
  let bio = USER.bio;
  let flipSentences: string[] = [bio, ...USER.flipSentences];
  let avatar: string | undefined = undefined;
  let coverImage: string | undefined = undefined;
  let coverPosition: string | undefined = undefined;

  try {
    const tenantId = process.env.NEXT_PUBLIC_TENANT_ID || "tenant_demo";
    const { data } = await supabase.from("profile").select("*").eq("tenant_id", tenantId).limit(1).single();
    if (data?.display_name || data?.displayName) {
      displayName = data.display_name || data.displayName;
    }
    if (data?.bio) {
      bio = data.bio;
    }
    if (data?.avatar) {
      avatar = data.avatar;
    }
    if (data?.cover_image) {
      coverImage = data.cover_image;
    }
    if (data?.cover_position) {
      coverPosition = data.cover_position;
    }
    if (data?.flip_sentences && Array.isArray(data.flip_sentences) && data.flip_sentences.length > 0) {
      flipSentences = data.flip_sentences;
    } else {
      flipSentences = [bio, ...USER.flipSentences];
    }
  } catch {
    // fallback
  }

  return (
    <header className="relative mt-2">
      <div className="screen-line-before flex h-12 items-center justify-end border-x border-grid px-2">
        <ToggleTheme />
      </div>

      <ChanhDaiCoverHello initialCover={coverImage} initialPosition={coverPosition} />

      <div className="screen-line-after flex border-x border-grid">
        <div className="relative shrink-0 border-r border-grid">
          <div className="mx-[2px] my-[3px]">
            <ChanhDaiAvatar
              initialAvatar={avatar}
              displayName={displayName}
              className="size-32 rounded-full ring-1 ring-border ring-offset-2 ring-offset-background sm:size-40"
            />
          </div>
        </div>

        <div className="flex flex-1 flex-col">
          <div className="flex grow"></div>

          <div className="border-t border-grid">
            <h1 className="flex items-center pl-4 font-heading text-3xl font-medium">
              {displayName}
              &nbsp;
              <SimpleTooltip
                content={`Official website of ${displayName}`}
              >
                <VerifiedIcon className="size-[0.6em] translate-y-px text-info" />
              </SimpleTooltip>
            </h1>

            <div className="h-12 border-t border-grid py-1 pl-4 sm:h-auto">
              <FlipSentences sentences={flipSentences} />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
