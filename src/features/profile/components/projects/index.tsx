import { supabase } from "@/lib/supabase";

import { Panel, PanelHeader, PanelTitle } from "../panel";
import { ProjectsGallery } from "./projects-gallery";

export async function Projects() {
  // Fetch project images from Supabase
  const { data: images } = await supabase
    .from("project_images")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <Panel id="projects" className="scroll-mt-22 overflow-hidden">
      <PanelHeader>
        <PanelTitle>Projects</PanelTitle>
      </PanelHeader>

      <div className="px-6">
        <ProjectsGallery images={images || []} />
      </div>
    </Panel>
  );
}
