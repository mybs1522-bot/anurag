import React from "react";

import { supabase } from "@/lib/supabase";

import {
  REVIEWS_ROW_1,
  REVIEWS_ROW_2,
  REVIEWS_ROW_3,
} from "../../data/reviews";
import { Panel, PanelHeader, PanelTitle } from "../panel";
import { MarqueeRow, StaticRow } from "./marquee-row";
import { RatingSummary } from "./rating-summary";
import { WriteReviewButton } from "./write-review-button";

export async function Reviews() {
  const tenantId = process.env.NEXT_PUBLIC_TENANT_ID || "tenant_anurag";
  // Fetch approved reviews from database
  const { data: dbReviews } = await supabase
    .from("reviews")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  let allReviews: any[] = [];

  if (dbReviews && dbReviews.length > 0) {
    allReviews = dbReviews.map((review) => ({
      id: review.id,
      author: {
        name: review.name,
        username: review.name.replace(/\s+/g, "").toLowerCase(),
        title: review.role || "Client",
        avatar:
          review.avatar_url && !review.avatar_url.startsWith("/images/reviews")
            ? review.avatar_url
            : `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(review.name)}`,
      },
      content: review.content,
      rating: review.rating,
    }));
  } else {
    allReviews = [...REVIEWS_ROW_1, ...REVIEWS_ROW_2, ...REVIEWS_ROW_3];
  }

  // Distribute reviews across the 3 rows
  const row1 = allReviews.slice(0, 3);
  const row2 = allReviews.slice(3, 8);
  const row3 = allReviews.slice(8);

  return (
    <Panel id="reviews" className="scroll-mt-22">
      <PanelHeader className="flex flex-row items-center justify-between">
        <PanelTitle>Reviews</PanelTitle>
        <WriteReviewButton />
      </PanelHeader>

      {/* Star rating summary */}
      <RatingSummary reviews={allReviews} />

      <div className="space-y-4 py-4">
        {/* Row 1: Static */}
        {row1.length > 0 && <StaticRow reviews={row1} />}

        {/* Row 2: Scrolling left */}
        {row2.length > 0 && (
          <MarqueeRow reviews={row2} direction="left" duration={35} />
        )}

        {/* Row 3: Scrolling right */}
        {row3.length > 0 && (
          <MarqueeRow reviews={row3} direction="right" duration={35} />
        )}
      </div>
    </Panel>
  );
}
