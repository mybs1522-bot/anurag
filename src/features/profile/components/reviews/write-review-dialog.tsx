"use client";

import { Loader2, MessageSquare, Star } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";

export function WriteReviewDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !content.trim()) {
      toast.error("Please provide your name and review content.");
      return;
    }

    setSubmitting(true);

    const { error } = await supabase.from("reviews").insert({
      name: name.trim(),
      role: role.trim() || null,
      content: content.trim(),
      rating,
    });

    setSubmitting(false);

    if (error) {
      toast.error("Failed to submit review. Please try again.");
      console.error(error);
    } else {
      toast.success("Your review has been submitted and is pending approval!");
      onClose();
      // Reset form
      setName("");
      setRole("");
      setContent("");
      setRating(5);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Write a Review</DialogTitle>
          <DialogDescription>
            Share your experience working with me!
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="review-name">Your Name</Label>
            <Input
              id="review-name"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="review-role">Your Role (Optional)</Label>
            <Input
              id="review-role"
              placeholder="e.g. Client, Architect, Colleague"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Rating</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`size-6 ${
                      star <= rating
                        ? "fill-orange-400 text-orange-400"
                        : "fill-muted text-muted"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="review-content">Your Review</Label>
            <textarea
              id="review-content"
              className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="What was it like working with me?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <MessageSquare className="mr-2 size-4" />
            )}
            Submit Review
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
