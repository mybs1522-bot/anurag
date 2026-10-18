"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { useState } from "react";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/cn";

const CATEGORIES = [
  "All",
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
}

export function ProjectsGallery({ images }: { images: ProjectImage[] }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const filteredImages =
    activeCategory === "All"
      ? images
      : images.filter((img) => img.category === activeCategory);

  return (
    <div className="flex flex-col">
      {/* Scrollable Category Tabs */}
      <div className="sticky top-12 z-10 -mx-6 bg-background/80 px-6 py-4 backdrop-blur-md">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                activeCategory === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Masonry Grid */}
      {filteredImages.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          No projects found in this category yet.
        </div>
      ) : (
        <div className="columns-2 gap-4 space-y-4 md:columns-3 pt-4 pb-6">
          {filteredImages.map((img) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              key={img.id}
              className="group relative cursor-zoom-in overflow-hidden rounded-xl bg-muted break-inside-avoid"
              onClick={() => setSelectedImage(img.image_url)}
            >
              <Image
                src={img.image_url}
                alt={img.category}
                width={500}
                height={500}
                className="h-auto w-full object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
            </motion.div>
          ))}
        </div>
      )}

      {/* Fullscreen Image Viewer */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] p-0 border-none bg-transparent shadow-none [&>button]:text-white [&>button]:bg-black/50 [&>button]:rounded-full [&>button]:hover:bg-black/70">
          {selectedImage && (
            <div className="relative flex h-[80vh] w-full items-center justify-center">
              <Image
                src={selectedImage}
                alt="Fullscreen Project View"
                fill
                className="object-contain"
                sizes="90vw"
                quality={100}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
