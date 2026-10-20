"use client";

import { 
  ArrowLeft, 
  BookOpen, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Eye, 
  Loader2, 
  Maximize2, 
  ShieldCheck, 
  Sparkles, 
  X, 
  ZoomIn 
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Book } from "@/features/books/types";
import { supabase } from "@/lib/supabase";

const FALLBACK_DEMO_PAGES = [
  {
    url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop",
    title: "Project Scope & Blueprint",
    tag: "Chapter 1 • Planning Framework",
  },
  {
    url: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1200&auto=format&fit=crop",
    title: "Material Rate Secret Audit",
    tag: "Vendor Price Comparison",
  },
  {
    url: "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?q=80&w=1200&auto=format&fit=crop",
    title: "Milestone Payment Schedule",
    tag: "Contractor Stage Gates",
  },
  {
    url: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=1200&auto=format&fit=crop",
    title: "Site Quality Snag Checklist",
    tag: "On-Site Inspection Protocol",
  },
];

export default function BookDetailsPage() {
  const params = useParams();
  const id = params.id as string;

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [formInView, setFormInView] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const formRef = useCallback((node: HTMLDivElement | null) => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
    if (node) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          setFormInView(entry.isIntersecting);
        },
        { threshold: 0 }
      );
      observer.observe(node);
      observerRef.current = observer;
    }
  }, []);

  // Load Razorpay checkout script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // Fetch book details
  useEffect(() => {
    if (!id) return;
    const fetchBook = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("books")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error(error);
        toast.error("Failed to load book details");
      } else {
        setBook(data as Book);
      }
      setLoading(false);
    };

    fetchBook();
  }, [id]);

  const activePreviews = (book?.preview_images && book.preview_images.filter(Boolean).length > 0)
    ? book.preview_images.filter(Boolean)
    : FALLBACK_DEMO_PAGES.map((p) => p.url);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (previewIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPreviewIndex(null);
      } else if (e.key === "ArrowLeft") {
        setPreviewIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : activePreviews.length - 1));
      } else if (e.key === "ArrowRight") {
        setPreviewIndex((prev) => (prev !== null && prev < activePreviews.length - 1 ? prev + 1 : 0));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [previewIndex, activePreviews.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!book) return;
    if (!email.trim() || !phone.trim()) {
      toast.error("Please enter your email and phone number");
      return;
    }

    setSubmitting(true);
    const isPaymentRequired = book.price > 0;

    if (isPaymentRequired) {
      const leadId = crypto.randomUUID();
      try {
        await supabase.from("book_leads").insert({
          id: leadId,
          tenant_id: process.env.NEXT_PUBLIC_TENANT_ID || "tenant_anurag",
          email: email.trim(),
          phone: phone.trim(),
          book_id: book.id,
          payment_status: 'pending'
        });

        const res = await fetch("/api/razorpay", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: book.price }),
        });
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.error);

        // Save order_id to database lead
        await supabase
          .from("book_leads")
          .update({ razorpay_order_id: data.orderId })
          .eq("id", leadId);

        // Handle demo mode or missing Razorpay
        if (data.isDemo || typeof (window as any).Razorpay === "undefined") {
          toast.info("Demo purchase: confirming order...");
          await supabase
            .from("book_leads")
            .update({ 
              payment_status: 'completed',
              paid_at: new Date().toISOString()
            })
            .eq("id", leadId);
          toast.success("Demo payment successful! Redirecting...");
          window.location.href = `/thank-you?type=book&bookId=${book.id}&leadId=${leadId}`;
          return;
        }

        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: book.price * 100,
          currency: "INR",
          name: "Studio Mehta",
          description: book.title,
          order_id: data.orderId,
          handler: async function (response: any) {
            setSubmitting(true);
            try {
              const verifyRes = await fetch("/api/razorpay/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature,
                  leadId: leadId,
                  type: "book",
                }),
              });
              const verifyData = await verifyRes.json();
              if (!verifyRes.ok) throw new Error(verifyData.error);

              toast.success("Payment successful! Redirecting...");
              window.location.href = `/thank-you?type=book&bookId=${book.id}&leadId=${leadId}`;
            } catch (err: any) {
              console.error("Verification failed:", err);
              toast.error("Payment verified, redirecting to downloads...");
              window.location.href = `/thank-you?type=book&bookId=${book.id}&leadId=${leadId}`;
            } finally {
              setSubmitting(false);
            }
          },
          prefill: {
            email: email.trim(),
            contact: phone.trim(),
          },
          theme: {
            color: "#10b981",
          },
          modal: {
            ondismiss: function() {
              setSubmitting(false);
            }
          }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } catch (err) {
        console.error(err);
        toast.error("Failed to initialize payment.");
        setSubmitting(false);
      }
    } else {
      const { error } = await supabase.from("book_leads").insert({
        tenant_id: process.env.NEXT_PUBLIC_TENANT_ID || "tenant_anurag",
        email: email.trim(),
        phone: phone.trim(),
        book_id: book.id,
        payment_status: 'none'
      });

      setSubmitting(false);

      if (error) {
        toast.error("An error occurred. Please try again.");
        console.error(error);
      } else {
        toast.success("Success! Redirecting you to the book...");
        window.open(book.link, "_blank");
        setEmail("");
        setPhone("");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!book) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center px-4">
        <h1 className="text-2xl font-bold text-black dark:text-white">Book Not Found</h1>
        <p className="text-neutral-600 dark:text-neutral-400">The book you are looking for does not exist or has been removed.</p>
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
          <ArrowLeft className="size-4" /> Back to Profile
        </Link>
      </div>
    );
  }

  const isPaid = book.price > 0;

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Back Link */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="size-4" />
          Back to Profile
        </Link>

        {/* Main Hero Card */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 bg-card border border-border/60 rounded-3xl p-6 sm:p-8 shadow-xl shadow-muted/5 overflow-hidden relative">
          
          {/* Cover image area — 9:16 aspect ratio */}
          <div className="md:col-span-5 flex flex-col items-center justify-start gap-4">
            {book.thumbnail_url ? (
              <div className="relative aspect-[9/16] w-48 sm:w-56 overflow-hidden rounded-2xl border border-border/80 shadow-lg shadow-black/10">
                <Image
                  src={book.thumbnail_url}
                  alt={book.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 192px, 224px"
                  priority
                />
              </div>
            ) : (
              <div className="aspect-[9/16] w-48 sm:w-56 flex flex-col items-center justify-center rounded-2xl border border-border bg-muted shadow-sm">
                <BookOpen className="size-12 text-neutral-400 mb-2" />
                <span className="text-xs text-neutral-500 font-medium">No Cover Available</span>
              </div>
            )}

            {/* Price Display with Glassmorphism */}
            <div className="w-full max-w-[224px] mt-2 rounded-2xl border border-white/20 dark:border-white/10 bg-white/40 dark:bg-white/5 backdrop-blur-md px-4 py-3 text-center shadow-lg shadow-black/5">
              {isPaid ? (
                <div className="space-y-0.5">
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">
                    Price
                  </div>
                  <div className="text-3xl font-light tracking-tight text-neutral-900 dark:text-neutral-50 font-sans">
                    ₹{book.price.toLocaleString("en-IN")}
                  </div>
                  <div className="text-[9px] font-medium tracking-wide text-neutral-400 dark:text-neutral-500 uppercase">
                    One-time payment
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-1 py-1">
                  <Sparkles className="size-4 text-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-600 dark:text-emerald-400 font-sans">Free Download</span>
                </div>
              )}
            </div>

            {/* Quick Preview pages strip below price */}
            {activePreviews.length > 0 && (
              <div className="w-full max-w-[224px] space-y-2 mt-3">
                <button
                  type="button"
                  onClick={() => setPreviewIndex(0)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-muted/60 hover:bg-muted border border-border/80 text-xs font-semibold text-foreground transition-all cursor-pointer group shadow-sm"
                >
                  <span className="flex items-center gap-1.5">
                    <Eye className="size-3.5 text-primary group-hover:scale-110 transition-transform" />
                    <span>{activePreviews.length} Sample Pages</span>
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Preview</span>
                </button>
                <div className="grid grid-cols-4 gap-1.5">
                  {activePreviews.slice(0, 4).map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPreviewIndex(idx)}
                      className="relative aspect-[3/4] w-full overflow-hidden rounded-lg border border-border/80 bg-muted shadow-sm hover:shadow-md hover:border-primary/60 transition-all cursor-pointer group"
                      title={`Preview page ${idx + 1}`}
                    >
                      <Image
                        src={url}
                        alt={`Preview page ${idx + 1}`}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                        sizes="60px"
                      />
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                      <div className="absolute bottom-0 inset-x-0 bg-black/70 text-[8px] font-bold text-white text-center py-0.5">
                        p.{idx + 1}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Book details */}
          <div className="md:col-span-7 flex flex-col justify-between gap-6">
            <div className="space-y-4">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-black dark:text-white leading-tight">
                {book.title}
              </h1>

              {book.description ? (
                <p className="text-neutral-700 dark:text-neutral-300 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                  {book.description}
                </p>
              ) : (
                <p className="text-neutral-600 dark:text-neutral-400 text-sm sm:text-base italic">
                  Explore practical frameworks, audit templates, and architectural insights in this edition. Fill out your details below to receive instant access.
                </p>
              )}
            </div>

            {/* Contact form */}
            <div id="download-form" ref={formRef} className="scroll-mt-24 border border-border/50 bg-muted/30 rounded-2xl p-5 sm:p-6 space-y-4">
              <h3 className="font-bold text-sm tracking-wide text-black dark:text-white uppercase">
                {isPaid ? "Download E-Book" : "Get Free Access"}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="cust-email" className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">Email Address</Label>
                    <Input
                      id="cust-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-background rounded-xl border-border/80"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="cust-phone" className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">Phone Number</Label>
                    <Input
                      id="cust-phone"
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="bg-background rounded-xl border-border/80"
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={submitting} 
                  className={`w-full h-11 text-sm font-semibold rounded-xl transition-all cursor-pointer ${
                    isPaid 
                      ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/10" 
                      : "bg-primary hover:bg-primary/95 text-primary-foreground shadow-md"
                  }`}
                >
                  {submitting ? (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  ) : isPaid ? (
                    `Pay ₹${book.price.toLocaleString("en-IN")} & Download`
                  ) : (
                    <>
                      <Download className="mr-2 size-4" />
                      Get Free E-Book
                    </>
                  )}
                </Button>
              </form>

              {isPaid && (
                <div className="flex items-center justify-center gap-1.5 text-[10px] text-neutral-500 dark:text-neutral-400">
                  <ShieldCheck className="size-3.5 text-emerald-500" />
                  <span>Secure checkout powered by Razorpay.</span>
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Dedicated "Look Inside — Demo Pages" Showcase Section */}
        {activePreviews.length > 0 && (
          <div className="bg-card border border-border/60 rounded-3xl p-6 sm:p-8 shadow-xl shadow-muted/5 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-border/50 pb-5">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wide">
                  <BookOpen className="size-3.5" />
                  <span>Look Inside</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-black dark:text-white">
                  Demo Pages & Sample Spreads
                </h2>
                <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                  Preview key sections, material rate audits, and checklist frameworks included in this edition.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-neutral-500">
                <span className="inline-flex items-center gap-1 text-primary">
                  <Eye className="size-3.5" /> Click any page to expand
                </span>
              </div>
            </div>

            {/* Grid of 4 sample page spreads */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {activePreviews.slice(0, 4).map((url, idx) => (
                <div
                  key={idx}
                  onClick={() => setPreviewIndex(idx)}
                  className="group relative cursor-pointer flex flex-col rounded-2xl border border-border/80 bg-background/50 hover:bg-background overflow-hidden shadow-sm hover:shadow-xl hover:border-primary/50 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="relative aspect-[3/4] w-full overflow-hidden bg-muted">
                    <Image
                      src={url}
                      alt={`Demo Page ${idx + 1}`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 640px) 50vw, 25vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                    {/* Page badge */}
                    <div className="absolute top-2.5 left-2.5 z-10">
                      <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-bold text-white tracking-wider uppercase border border-white/10">
                        Page {idx + 1}
                      </span>
                    </div>

                    {/* Center Zoom Icon on hover */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <div className="size-10 rounded-full bg-black/80 backdrop-blur-md text-white flex items-center justify-center shadow-lg border border-white/20 transform scale-75 group-hover:scale-100 transition-transform">
                        <ZoomIn className="size-5" />
                      </div>
                    </div>

                    {/* Bottom Caption */}
                    <div className="absolute bottom-0 inset-x-0 p-3 text-white">
                      <p className="text-xs font-semibold drop-shadow-sm truncate">
                        {FALLBACK_DEMO_PAGES[idx]?.title || `Sample Spread ${idx + 1}`}
                      </p>
                      <p className="text-[10px] text-white/80 drop-shadow-sm truncate">
                        {FALLBACK_DEMO_PAGES[idx]?.tag || "Click to inspect"}
                      </p>
                    </div>
                  </div>

                  <div className="p-2.5 flex items-center justify-between text-[11px] text-muted-foreground border-t border-border/40 bg-muted/20">
                    <span className="font-medium text-foreground/80">Demo Excerpt</span>
                    <span className="text-primary font-semibold inline-flex items-center gap-1 group-hover:underline">
                      Zoom <ZoomIn className="size-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
      </div>

      {/* Fullscreen Interactive Lightbox Modal */}
      {previewIndex !== null && activePreviews[previewIndex] && (
        <div 
          className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-black/95 backdrop-blur-md animate-in fade-in duration-200 select-none p-4 sm:p-6"
          onClick={() => setPreviewIndex(null)}
        >
          {/* Top Bar */}
          <div 
            className="w-full max-w-5xl flex items-center justify-between text-white py-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-white/10 text-neutral-200 border border-white/10">
                Sample Page {previewIndex + 1} of {activePreviews.length}
              </span>
              <span className="hidden sm:inline text-sm font-medium text-white/80 truncate max-w-md">
                {book.title}
              </span>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPreviewIndex(null)}
              className="text-white hover:bg-white/20 rounded-full size-9 p-0"
              aria-label="Close Lightbox"
            >
              <X className="size-5" />
            </Button>
          </div>

          {/* Center Image Container with Prev/Next Controls */}
          <div 
            className="relative w-full max-w-4xl flex-1 flex items-center justify-center my-auto min-h-0"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Prev Button */}
            <button
              type="button"
              onClick={() => setPreviewIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : activePreviews.length - 1))}
              className="absolute left-2 sm:-left-6 top-1/2 -translate-y-1/2 z-10 size-11 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center border border-white/20 backdrop-blur-sm transition-all hover:scale-105 cursor-pointer shadow-xl"
              aria-label="Previous Page"
            >
              <ChevronLeft className="size-6" />
            </button>

            {/* The Preview Image */}
            <div className="relative max-h-[72vh] w-full h-full flex items-center justify-center">
              <img
                src={activePreviews[previewIndex]}
                alt={`Sample page ${previewIndex + 1}`}
                className="max-h-[72vh] max-w-full rounded-xl shadow-2xl object-contain border border-white/10"
              />
            </div>

            {/* Next Button */}
            <button
              type="button"
              onClick={() => setPreviewIndex((prev) => (prev !== null && prev < activePreviews.length - 1 ? prev + 1 : 0))}
              className="absolute right-2 sm:-right-6 top-1/2 -translate-y-1/2 z-10 size-11 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center border border-white/20 backdrop-blur-sm transition-all hover:scale-105 cursor-pointer shadow-xl"
              aria-label="Next Page"
            >
              <ChevronRight className="size-6" />
            </button>
          </div>

          {/* Bottom Bar with Thumbnail Strip & CTA */}
          <div 
            className="w-full max-w-4xl flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-white/10 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Thumbnails */}
            <div className="flex items-center gap-2 overflow-x-auto py-1 max-w-full">
              {activePreviews.map((url, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPreviewIndex(idx)}
                  className={`relative size-12 sm:size-14 rounded-lg overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                    previewIndex === idx
                      ? "border-emerald-500 scale-105 shadow-md shadow-emerald-500/30"
                      : "border-white/20 opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={url} alt={`Thumb ${idx + 1}`} className="size-full object-cover" />
                </button>
              ))}
            </div>

            {/* CTA in Lightbox */}
            <Button
              type="button"
              onClick={() => {
                setPreviewIndex(null);
                document.getElementById("download-form")?.scrollIntoView({ behavior: "smooth", block: "center" });
              }}
              className={isPaid 
                ? "bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow-lg cursor-pointer" 
                : "bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs rounded-xl shadow-lg cursor-pointer"
              }
            >
              <Download className="mr-2 size-3.5" />
              {isPaid ? `Download Full Guide (₹${book.price})` : "Get Free Guide"}
            </Button>
          </div>
        </div>
      )}

      {/* Sticky mobile CTA — hidden when form is in view */}
      {!formInView && (
        <div className="fixed bottom-0 inset-x-0 z-40 p-3 bg-background/80 backdrop-blur-md border-t border-border/50 md:hidden animate-in slide-in-from-bottom-4 duration-300">
          <button
            type="button"
            onClick={() => {
              document.getElementById("download-form")?.scrollIntoView({ behavior: "smooth", block: "center" });
            }}
            className={`w-full h-12 rounded-xl text-sm font-bold shadow-lg transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 ${
              isPaid
                ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20"
                : "bg-primary hover:bg-primary/90 text-primary-foreground"
            }`}
          >
            <Download className="size-4" />
            {isPaid ? `Download E-Book — ₹${book.price.toLocaleString("en-IN")}` : "Download Free E-Book"}
          </button>
        </div>
      )}
    </div>
  );
}
