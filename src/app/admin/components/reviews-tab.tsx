"use client";

import {
  Check,
  CheckCircle,
  Edit2,
  Loader2,
  MessageSquare,
  Plus,
  Star,
  Trash2,
  X,
  XCircle,
  RefreshCw,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";

export interface Review {
  id: string;
  name: string;
  role: string | null;
  content: string;
  rating: number;
  status: "pending" | "approved" | "rejected";
  avatar_url?: string | null;
  created_at: string;
}

const EMPTY_FORM = {
  name: "",
  role: "",
  content: "",
  rating: 5,
  status: "approved" as "pending" | "approved" | "rejected",
  avatar_url: "",
};

export function ReviewsTab() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/reviews");
      const json = await res.json();
      if (json.reviews && Array.isArray(json.reviews) && json.reviews.length > 0) {
        setReviews(json.reviews);
        // Sync to browser localStorage so client supabase is aligned
        if (typeof window !== "undefined") {
          try {
            const stored = window.localStorage.getItem("architect_demo_db");
            const parsed = stored ? JSON.parse(stored) : {};
            parsed.reviews = json.reviews;
            window.localStorage.setItem("architect_demo_db", JSON.stringify(parsed));
          } catch {}
        }
      } else {
        const { data } = await supabase
          .from("reviews")
          .select("*")
          .order("created_at", { ascending: false });
        setReviews((data as Review[]) || []);
      }
    } catch {
      const { data } = await supabase
        .from("reviews")
        .select("*")
        .order("created_at", { ascending: false });
      setReviews((data as Review[]) || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const openAddDialog = () => {
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEditDialog = (review: Review) => {
    setEditingId(review.id);
    setFormData({
      name: review.name,
      role: review.role || "",
      content: review.content,
      rating: review.rating || 5,
      status: review.status || "approved",
      avatar_url: review.avatar_url || "",
    });
    setDialogOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.content.trim()) {
      toast.error("Please fill in Name and Review Content");
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        // Edit existing review
        const payload = {
          id: editingId,
          name: formData.name.trim(),
          role: formData.role.trim() || "Client",
          content: formData.content.trim(),
          rating: Number(formData.rating),
          status: formData.status,
          avatar_url:
            formData.avatar_url.trim() ||
            `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(formData.name.trim())}`,
        };

        await fetch("/api/admin/reviews", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        await supabase.from("reviews").update(payload).eq("id", editingId);
        toast.success("Review updated successfully! Synced to homepage.");
      } else {
        // Create new review
        const payload = {
          name: formData.name.trim(),
          role: formData.role.trim() || "Client",
          content: formData.content.trim(),
          rating: Number(formData.rating),
          status: formData.status,
          avatar_url:
            formData.avatar_url.trim() ||
            `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(formData.name.trim())}`,
        };

        const res = await fetch("/api/admin/reviews", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json();

        if (json.review) {
          await supabase.from("reviews").insert(json.review);
        }

        toast.success("New review added! Synced to homepage.");
      }

      setDialogOpen(false);
      await fetchReviews();
    } catch (err: any) {
      console.error("Save review error:", err);
      toast.error(err.message || "Failed to save review");
    } finally {
      setSubmitting(false);
    }
  };

  const updateStatus = async (id: string, status: "approved" | "rejected") => {
    try {
      await fetch("/api/admin/reviews", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });

      await supabase.from("reviews").update({ status }).eq("id", id);
      toast.success(`Review marked as ${status}! Synced to homepage.`);
      await fetchReviews();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const deleteReview = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;

    try {
      await fetch(`/api/admin/reviews?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });

      await supabase.from("reviews").delete().eq("id", id);
      toast.success("Review deleted from database");
      await fetchReviews();
    } catch (err) {
      toast.error("Failed to delete review");
    }
  };

  const handleSyncAllReviews = async () => {
    setLoading(true);
    try {
      // Clear localStorage cache to force fresh sync from database
      if (typeof window !== "undefined") {
        const stored = window.localStorage.getItem("architect_demo_db");
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            delete parsed.reviews;
            window.localStorage.setItem("architect_demo_db", JSON.stringify(parsed));
          } catch {}
        }
      }
      await fetchReviews();
      toast.success("All 13 homepage reviews loaded & synced!");
    } catch {
      toast.error("Failed to sync reviews");
    } finally {
      setLoading(false);
    }
  };

  const approvedCount = reviews.filter((r) => r.status === "approved").length;
  const avgRating =
    approvedCount > 0
      ? (
          reviews
            .filter((r) => r.status === "approved")
            .reduce((acc, r) => acc + (r.rating || 5), 0) / approvedCount
        ).toFixed(1)
      : "5.0";

  return (
    <div className="space-y-6">
      {/* Header and stats */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Review Management &amp; Sync</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {reviews.length} Total Reviews ({approvedCount} Approved, {avgRating}★ Average)
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSyncAllReviews}
            disabled={loading}
            className="gap-1.5 text-xs text-primary border-primary/40 hover:bg-primary/10"
          >
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
            Sync All 13 Live Reviews
          </Button>
          <Button size="sm" onClick={openAddDialog} className="gap-1.5 text-xs">
            <Plus className="size-4" />
            Add Review
          </Button>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reviewer</TableHead>
              <TableHead className="w-28">Rating</TableHead>
              <TableHead>Review Content</TableHead>
              <TableHead className="w-24">Status</TableHead>
              <TableHead className="text-right w-36">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-28 text-center">
                  <Loader2 className="mx-auto size-6 animate-spin text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : reviews.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-36 text-center text-muted-foreground p-6"
                >
                  <p className="mb-3 text-sm">No reviews in database.</p>
                  <Button
                    size="sm"
                    onClick={handleSyncAllReviews}
                    className="gap-1.5 text-xs"
                  >
                    <RefreshCw className="size-3.5" />
                    Load All 13 Client Reviews from Website
                  </Button>
                </TableCell>
              </TableRow>
            ) : (
              reviews.map((review) => (
                <TableRow key={review.id} className="hover:bg-muted/40 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {/* Avatar preview */}
                      <div className="size-9 rounded-full overflow-hidden bg-muted border border-border shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={
                            review.avatar_url ||
                            `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(review.name)}`
                          }
                          alt={review.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-foreground">
                          {review.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {review.role || "Client"}
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center text-amber-500 text-xs">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`size-3.5 ${
                            i < review.rating
                              ? "fill-amber-400 text-amber-400"
                              : "text-muted-foreground/30"
                          }`}
                        />
                      ))}
                      <span className="ml-1 font-bold text-foreground tabular-nums">
                        {review.rating}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <p className="line-clamp-2 text-xs text-muted-foreground leading-relaxed max-w-md">
                      &ldquo;{review.content}&rdquo;
                    </p>
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant={
                        review.status === "approved"
                          ? "default"
                          : review.status === "rejected"
                          ? "destructive"
                          : "secondary"
                      }
                      className="capitalize text-[11px]"
                    >
                      {review.status}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-foreground hover:bg-muted"
                        onClick={() => openEditDialog(review)}
                        title="Edit Review"
                      >
                        <Edit2 className="size-3.5" />
                      </Button>

                      {review.status !== "approved" ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                          onClick={() => updateStatus(review.id, "approved")}
                          title="Approve & Show on Website"
                        >
                          <CheckCircle className="size-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                          onClick={() => updateStatus(review.id, "rejected")}
                          title="Hide / Reject"
                        >
                          <XCircle className="size-4" />
                        </Button>
                      )}

                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={() => deleteReview(review.id)}
                        title="Delete Review"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add / Edit Review Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="size-5 text-primary" />
              {editingId ? "Edit Client Review" : "Add New Client Review"}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? "Update client feedback. Changes will sync immediately to the live website."
                : "Create a new testimonial to showcase on the home page."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleFormSubmit} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="review-name" className="text-xs">Client Name</Label>
                <Input
                  id="review-name"
                  placeholder="e.g. Vikram Singhania"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="review-role" className="text-xs">Client Role / Location</Label>
                <Input
                  id="review-role"
                  placeholder="e.g. Villa Owner, Alibaug"
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Rating Stars Selector */}
            <div className="space-y-1.5">
              <Label className="text-xs">Rating (1 to 5 Stars)</Label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData({ ...formData, rating: star })}
                    className="p-1 rounded hover:bg-muted transition-colors cursor-pointer"
                  >
                    <Star
                      className={`size-6 ${
                        star <= formData.rating
                          ? "fill-amber-400 text-amber-400"
                          : "text-muted-foreground/30"
                      }`}
                    />
                  </button>
                ))}
                <span className="text-sm font-semibold ml-2">
                  {formData.rating} out of 5
                </span>
              </div>
            </div>

            {/* Review Content */}
            <div className="space-y-1.5">
              <Label htmlFor="review-content" className="text-xs">Review Content</Label>
              <Textarea
                id="review-content"
                rows={3}
                placeholder="What did the client say about your design services, estimation, or advice?"
                value={formData.content}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                required
              />
            </div>

            {/* Avatar URL & Status */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="review-avatar" className="text-xs">Avatar URL (Optional)</Label>
                <Input
                  id="review-avatar"
                  placeholder="https://... (or auto)"
                  value={formData.avatar_url}
                  onChange={(e) =>
                    setFormData({ ...formData, avatar_url: e.target.value })
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="review-status" className="text-xs">Status</Label>
                <select
                  id="review-status"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as "pending" | "approved" | "rejected",
                    })
                  }
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="approved">Approved (Live on Site)</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected (Hidden)</option>
                </select>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting && (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                )}
                {editingId ? "Update Review" : "Add Review"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
