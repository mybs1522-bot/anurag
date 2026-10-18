"use client";

import { PenLine } from "lucide-react";
import React, { useState } from "react";

import { Button } from "@/components/ui/button";

import { WriteReviewDialog } from "./write-review-dialog";

export function WriteReviewButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)} className="gap-2">
        <PenLine className="size-4" />
        Write a Review
      </Button>

      <WriteReviewDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}
