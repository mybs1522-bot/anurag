"use client";

import { Building2, Check, Copy, ExternalLink, Loader2, Plus, RefreshCw, Trash2, Users, Calendar, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TenantItem {
  id: string;
  slug: string;
  name: string;
  custom_domain?: string | null;
  admin_password?: string;
  google_calendar_id?: string | null;
  created_at?: string;
  profile?: {
    display_name?: string;
    email?: string;
    phone?: string;
    job_title?: string;
  };
  leadsCount?: number;
  servicesCount?: number;
}

export function TenantsTab() {
  const [tenants, setTenants] = useState<TenantItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form fields
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    email: "",
    phone: "",
    adminPassword: "admin" + Math.floor(100 + Math.random() * 900),
    googleCalendarId: "",
  });

  const loadTenants = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/tenants");
      const data = await res.json();
      if (data.tenants) {
        setTenants(data.tenants);
      }
    } catch {
      toast.error("Failed to load tenants");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTenants();
  }, []);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const autoSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]/g, "-")
      .slice(0, 15);
    setFormData((prev) => ({
      ...prev,
      name: val,
      slug: prev.slug === "" || prev.slug === autoSlug.slice(0, -1) ? autoSlug : prev.slug,
    }));
  };

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.slug.trim()) {
      toast.error("Studio Name and Slug are required");
      return;
    }

    setCreating(true);
    try {
      const res = await fetch("/api/admin/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        toast.error(data.error || "Failed to create tenant");
        return;
      }

      toast.success(`Tenant "${data.name}" provisioned successfully in Supabase!`);
      setShowModal(false);
      setFormData({
        name: "",
        slug: "",
        email: "",
        phone: "",
        adminPassword: "admin" + Math.floor(100 + Math.random() * 900),
        googleCalendarId: "",
      });
      loadTenants();
    } catch {
      toast.error("Network error while creating tenant");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (id === "tenant_demo") {
      toast.error("The default master demo tenant cannot be deleted");
      return;
    }

    if (!confirm(`Are you sure you want to delete "${name}"? All their services, reviews, and leads will be permanently removed.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/tenants?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Tenant "${name}" deleted`);
        loadTenants();
      } else {
        toast.error(data.error || "Failed to delete tenant");
      }
    } catch {
      toast.error("Error deleting tenant");
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Building2 className="size-5 text-primary" />
            Architects & Tenants Directory
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage white-label architect accounts stored in your Supabase database. Add new clients with 1-click.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadTenants} disabled={loading} className="gap-1.5 text-xs">
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button size="sm" onClick={() => setShowModal(true)} className="gap-1.5 text-xs bg-primary text-primary-foreground shadow">
            <Plus className="size-3.5" />
            + New Architect / Tenant
          </Button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-border bg-card/50 flex items-center gap-3">
          <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
            <Building2 className="size-5" />
          </div>
          <div>
            <div className="text-2xl font-black">{tenants.length}</div>
            <div className="text-xs text-muted-foreground font-medium">Total Provisioned Tenants</div>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card/50 flex items-center gap-3">
          <div className="size-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-bold">
            <ShieldCheck className="size-5" />
          </div>
          <div>
            <div className="text-2xl font-black">
              {tenants.reduce((acc, t) => acc + (t.servicesCount || 0), 0)}
            </div>
            <div className="text-xs text-muted-foreground font-medium">Active Services Seeded</div>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card/50 flex items-center gap-3">
          <div className="size-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 font-bold">
            <Users className="size-5" />
          </div>
          <div>
            <div className="text-2xl font-black">
              {tenants.reduce((acc, t) => acc + (t.leadsCount || 0), 0)}
            </div>
            <div className="text-xs text-muted-foreground font-medium">Total Captured Leads</div>
          </div>
        </div>
      </div>

      {/* Tenants Cards Grid */}
      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : tenants.length === 0 ? (
        <div className="text-center py-12 border border-dashed rounded-xl bg-card/30">
          <Building2 className="size-10 text-muted-foreground mx-auto mb-3 opacity-40" />
          <h3 className="font-semibold text-base">No tenants found</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Click "+ New Architect / Tenant" to create your first client setup.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tenants.map((t) => (
            <div
              key={t.id}
              className="border border-border rounded-xl p-5 bg-card/60 hover:bg-card transition shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                      {t.name}
                      {t.id === "tenant_demo" && (
                        <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                          Master Demo
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                      ID: <span className="text-foreground">{t.id}</span> • Slug: <span className="text-foreground">/{t.slug}</span>
                    </p>
                  </div>

                  {t.id !== "tenant_demo" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(t.id, t.name)}
                      className="size-8 text-muted-foreground hover:text-destructive"
                      title="Delete Tenant"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground my-3 bg-muted/40 p-3 rounded-lg border border-border/50">
                  <div>
                    <span className="font-semibold text-foreground">Email:</span>{" "}
                    {t.profile?.email || "—"}
                  </div>
                  <div>
                    <span className="font-semibold text-foreground">Phone:</span>{" "}
                    {t.profile?.phone || "—"}
                  </div>
                  <div>
                    <span className="font-semibold text-foreground">Services:</span>{" "}
                    {t.servicesCount || 0} active
                  </div>
                  <div>
                    <span className="font-semibold text-foreground">Admin Pass:</span>{" "}
                    <code className="bg-background px-1.5 py-0.5 rounded border border-border text-[11px] font-bold text-foreground">
                      {t.admin_password || "demo123"}
                    </code>
                  </div>
                </div>
              </div>

              {/* Vercel Env Helper */}
              <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs">
                <span className="text-muted-foreground truncate">
                  Vercel Env: <code className="text-foreground font-mono">NEXT_PUBLIC_TENANT_ID={t.id}</code>
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(`NEXT_PUBLIC_TENANT_ID=${t.id}`, t.id)}
                  className="h-7 text-[11px] gap-1 shrink-0 ml-2"
                >
                  {copiedId === t.id ? (
                    <>
                      <Check className="size-3 text-emerald-500" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="size-3" />
                      Copy Env
                    </>
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal / Dialog for New Tenant */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="size-5 text-primary" />
                <h3 className="font-bold text-lg">Provision New Architect</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowModal(false)}
                className="size-7 p-0 rounded-full"
              >
                ✕
              </Button>
            </div>

            <form onSubmit={handleCreateTenant} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="t-name" className="text-xs font-semibold">
                    Studio / Architect Name *
                  </Label>
                  <Input
                    id="t-name"
                    placeholder="e.g. Ar. Rohan Kulkarni & Associates"
                    value={formData.name}
                    onChange={handleNameChange}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="t-slug" className="text-xs font-semibold">
                    URL Slug / Identifier *
                  </Label>
                  <Input
                    id="t-slug"
                    placeholder="e.g. rohan-designs"
                    value={formData.slug}
                    onChange={(e) => setFormData((p) => ({ ...p, slug: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, "-") }))}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="t-pwd" className="text-xs font-semibold">
                    Admin Password
                  </Label>
                  <Input
                    id="t-pwd"
                    value={formData.adminPassword}
                    onChange={(e) => setFormData((p) => ({ ...p, adminPassword: e.target.value }))}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="t-email" className="text-xs font-semibold">
                    Contact Email
                  </Label>
                  <Input
                    id="t-email"
                    type="email"
                    placeholder="rohan@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="t-phone" className="text-xs font-semibold">
                    Contact Phone
                  </Label>
                  <Input
                    id="t-phone"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="t-calendar" className="text-xs font-semibold flex items-center gap-1.5">
                    <Calendar className="size-3.5 text-primary" />
                    Google Calendar ID (Optional)
                  </Label>
                  <Input
                    id="t-calendar"
                    placeholder="e.g. rohan@gmail.com"
                    value={formData.googleCalendarId}
                    onChange={(e) => setFormData((p) => ({ ...p, googleCalendarId: e.target.value }))}
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Consultation bookings will sync to this Google Calendar ID.
                  </p>
                </div>
              </div>

              <div className="bg-muted/40 p-3 rounded-lg border border-border/50 text-xs text-muted-foreground space-y-1">
                <div className="font-semibold text-foreground">Automatic Setup:</div>
                <div>✓ Creates tenant record in Supabase</div>
                <div>✓ Seeds starter Profile, 3 Consultation Services, & Sample Reviews</div>
                <div>✓ Ready for immediate deployment and lead capture</div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowModal(false)}
                  disabled={creating}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={creating} className="bg-primary text-primary-foreground gap-1.5">
                  {creating ? <Loader2 className="size-3.5 animate-spin" /> : <Building2 className="size-3.5" />}
                  {creating ? "Provisioning..." : "Create Tenant"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
