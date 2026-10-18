"use client";

import { Link as LinkIcon,Loader2, Trash2, Upload } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

const CATEGORIES = [
  "Offices",
  "Villas",
  "Bedroom",
  "Washroom",
  "Living Room",
  "Kitchen",
  "Children Room",
];

interface ProjectImage {
  id: string;
  category: string;
  image_url: string;
  created_at: string;
}

export function ProjectsTab() {
  const [images, setImages] = useState<ProjectImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [addingUrl, setAddingUrl] = useState(false);

  const fetchImages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("project_images")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to fetch project images");
      console.error(error);
    } else {
      setImages(data as ProjectImage[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fileExt = file.name.split(".").pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `${selectedCategory.toLowerCase().replace(" ", "-")}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("project-images")
      .upload(filePath, file);

    if (uploadError) {
      toast.error("Failed to upload image");
      console.error(uploadError);
      setUploading(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from("project-images")
      .getPublicUrl(filePath);

    const { error: dbError } = await supabase.from("project_images").insert([
      {
        category: selectedCategory,
        image_url: publicUrlData.publicUrl,
      },
    ]);

    if (dbError) {
      toast.error("Failed to save image record");
      console.error(dbError);
    } else {
      toast.success("Image uploaded successfully!");
      fetchImages();
    }
    setUploading(false);
    
    // Reset file input
    e.target.value = "";
  };

  const handleAddUrl = async () => {
    if (!imageUrlInput.trim()) {
      toast.error("Please enter a valid URL");
      return;
    }

    setAddingUrl(true);
    let finalUrl = imageUrlInput.trim();

    // Convert Google Drive links to direct image links
    const gdriveRegex = /(?:drive\.google\.com\/file\/d\/|drive\.google\.com\/open\?id=)([^/&?]+)/;
    const match = finalUrl.match(gdriveRegex);
    if (match && match[1]) {
      finalUrl = `https://drive.google.com/uc?export=view&id=${match[1]}`;
    }

    const { error: dbError } = await supabase.from("project_images").insert([
      {
        category: selectedCategory,
        image_url: finalUrl,
      },
    ]);

    if (dbError) {
      toast.error("Failed to save image record");
      console.error(dbError);
    } else {
      toast.success("Image URL added successfully!");
      fetchImages();
      setImageUrlInput("");
    }
    setAddingUrl(false);
  };

  const deleteImage = async (id: string, imageUrl: string) => {
    if (!window.confirm("Are you sure you want to delete this image?")) return;

    // Delete from storage
    // Url format: https://.../project-images/category/filename.ext
    const pathParts = imageUrl.split("/project-images/");
    if (pathParts.length > 1) {
      const filePath = pathParts[1];
      await supabase.storage.from("project-images").remove([filePath]);
    }

    // Delete from DB
    const { error } = await supabase
      .from("project_images")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete image record");
    } else {
      toast.success("Image deleted");
      fetchImages();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight">Project Images</h2>
        <Button variant="outline" onClick={fetchImages}>
          Refresh
        </Button>
      </div>

      <div className="flex items-center gap-4 rounded-md border border-border bg-card p-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Category</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="flex h-10 w-[200px] items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex flex-col gap-1.5 pt-[22px]">
          <Button asChild disabled={uploading || addingUrl} className="cursor-pointer">
            <label>
              {uploading ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Upload className="mr-2 size-4" />
              )}
              {uploading ? "Uploading..." : "Upload Image"}
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleUpload}
                disabled={uploading || addingUrl}
              />
            </label>
          </Button>
        </div>

        <div className="hidden sm:block border-l border-border h-10 self-end mx-2"></div>

        <div className="flex-1 flex flex-col gap-1.5 pt-[22px]">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Or paste Google Drive / Image URL..."
              value={imageUrlInput}
              onChange={(e) => setImageUrlInput(e.target.value)}
              disabled={uploading || addingUrl}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <Button
              onClick={handleAddUrl}
              disabled={!imageUrlInput.trim() || uploading || addingUrl}
              variant="outline"
            >
              {addingUrl ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <LinkIcon className="mr-2 size-4" />
              )}
              Add URL
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      ) : images.length === 0 ? (
        <div className="rounded-md border border-border bg-card p-8 text-center text-muted-foreground">
          No project images found. Upload some to get started!
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {images.map((image) => (
            <div
              key={image.id}
              className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-muted"
            >
              <Image
                src={image.image_url}
                alt={image.category}
                fill
                className="object-cover transition-transform group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, 33vw"
              />
              <div className="absolute inset-0 flex flex-col justify-between bg-black/50 p-2 opacity-0 transition-opacity group-hover:opacity-100">
                <span className="rounded bg-black/70 px-1.5 py-0.5 text-xs font-medium text-white w-fit">
                  {image.category}
                </span>
                <Button
                  variant="destructive"
                  size="icon"
                  className="size-8 self-end"
                  onClick={() => deleteImage(image.id, image.image_url)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
