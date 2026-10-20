import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const tenantId = process.env.NEXT_PUBLIC_TENANT_ID || "tenant_anurag";

    const { data, error } = await supabase
      .from("profile")
      .select("*")
      .eq("tenant_id", tenantId)
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ profile: null });
    }

    return NextResponse.json({
      profile: {
        id: data.id,
        tenantId: data.tenant_id,
        displayName: data.display_name,
        jobTitle: data.job_title,
        bio: data.bio,
        avatar: data.avatar,
        coverImage: data.cover_image || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2000&auto=format&fit=crop",
        coverPosition: data.cover_position || "50%",
        flipSentences: data.flip_sentences || [
          "Luxury Residential Architect",
          "Turnkey Interior Designer",
          "Sustainable Space Planner",
          "ArchBIZ & BOQ Consultant",
        ],
        about: data.about,
        email: data.email,
        phone: data.phone,
        website: data.website,
        googleCalendarId: data.google_calendar_id,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to load profile" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const supabase = getSupabaseAdmin();
    const tenantId = process.env.NEXT_PUBLIC_TENANT_ID || "tenant_anurag";

    let avatarUrl = body.avatar || "";

    // If avatar is a base64 image data URI, upload it to Supabase Storage bucket 'project-images'
    if (avatarUrl && avatarUrl.startsWith("data:image/")) {
      try {
        const matches = avatarUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          const mimeType = matches[1];
          const base64Data = matches[2];
          const buffer = Buffer.from(base64Data, "base64");
          const ext = mimeType.split("/")[1] || "jpg";
          const fileName = `avatars/${tenantId}_${Date.now()}.${ext}`;

          const { error: uploadErr } = await supabase.storage
            .from("project-images")
            .upload(fileName, buffer, {
              contentType: mimeType,
              upsert: true,
            });

          if (!uploadErr) {
            const { data: publicUrlData } = supabase.storage
              .from("project-images")
              .getPublicUrl(fileName);
            if (publicUrlData?.publicUrl) {
              avatarUrl = publicUrlData.publicUrl;
            }
          } else {
            console.warn("Storage upload failed, fallback to direct text:", uploadErr.message);
          }
        }
      } catch (uploadException) {
        console.warn("Error processing avatar upload:", uploadException);
      }
    }

    let coverUrl = body.coverImage || "";
    if (coverUrl && coverUrl.startsWith("data:image/")) {
      try {
        const matches = coverUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          const mimeType = matches[1];
          const base64Data = matches[2];
          const buffer = Buffer.from(base64Data, "base64");
          const ext = mimeType.split("/")[1] || "jpg";
          const fileName = `covers/${tenantId}_${Date.now()}.${ext}`;

          const { error: uploadErr } = await supabase.storage
            .from("project-images")
            .upload(fileName, buffer, {
              contentType: mimeType,
              upsert: true,
            });

          if (!uploadErr) {
            const { data: publicUrlData } = supabase.storage
              .from("project-images")
              .getPublicUrl(fileName);
            if (publicUrlData?.publicUrl) {
              coverUrl = publicUrlData.publicUrl;
            }
          }
        }
      } catch (uploadException) {
        console.warn("Error processing cover upload:", uploadException);
      }
    }

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (body.displayName !== undefined) updates.display_name = body.displayName.trim();
    if (body.jobTitle !== undefined) updates.job_title = body.jobTitle.trim();
    if (body.bio !== undefined) updates.bio = body.bio.trim();
    if (avatarUrl !== undefined) updates.avatar = avatarUrl;
    if (coverUrl !== undefined && coverUrl !== "") updates.cover_image = coverUrl;
    if (body.coverPosition !== undefined) updates.cover_position = body.coverPosition;
    if (body.flipSentences !== undefined) {
      updates.flip_sentences = Array.isArray(body.flipSentences)
        ? body.flipSentences.map((s: string) => String(s).trim()).filter(Boolean)
        : String(body.flipSentences).split("\n").map((s) => s.trim()).filter(Boolean);
    }
    if (body.email !== undefined) updates.email = body.email.trim();
    if (body.phone !== undefined) updates.phone = body.phone.trim();
    if (body.about !== undefined) updates.about = body.about.trim();
    if (body.googleCalendarId !== undefined) updates.google_calendar_id = body.googleCalendarId.trim();

    // Check if profile exists
    const { data: existing } = await supabase
      .from("profile")
      .select("id")
      .eq("tenant_id", tenantId)
      .limit(1)
      .single();

    if (existing) {
      const { error: updErr } = await supabase
        .from("profile")
        .update(updates)
        .eq("tenant_id", tenantId);

      if (updErr) {
        return NextResponse.json({ error: updErr.message }, { status: 500 });
      }
    } else {
      const { error: insErr } = await supabase.from("profile").insert([
        {
          id: `profile_${tenantId}`,
          tenant_id: tenantId,
          ...updates,
        },
      ]);

      if (insErr) {
        return NextResponse.json({ error: insErr.message }, { status: 500 });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      avatar: avatarUrl,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update profile" }, { status: 500 });
  }
}
