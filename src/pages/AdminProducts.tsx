import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/landing/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { TagInput } from "@/components/ui/tag-input";
import { FieldHelp } from "@/components/ui/field-help";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, BarChart3, ShieldCheck, ImageIcon } from "lucide-react";

const DEFAULT_PRODUCT_IMAGE = "/placeholder.svg";

interface Product {
  id: string;
  name: string;
  category: string;
  tier: string;
  brand: string | null;
  description: string | null;
  price_display: string | null;
  purchase_url: string | null;
  payment_link: string | null;
  image_url: string | null;
  target_scalp_types: string[];
  target_symptoms: string[];
  is_active: boolean;
  sort_order: number;
}

interface ClickStats {
  product_id: string;
  views: number;
  purchase_clicks: number;
}

const emptyProduct = {
  name: "",
  category: "shampoo",
  tier: "budget",
  brand: "",
  description: "",
  price_display: "",
  purchase_url: "",
  payment_link: "",
  image_url: "",
  target_scalp_types: [] as string[],
  target_symptoms: [] as string[],
  is_active: true,
  sort_order: 0,
};

const AdminProducts = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [clickStats, setClickStats] = useState<ClickStats[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyProduct);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/auth"); return; }

    const checkAdmin = async () => {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin");

      if (data && data.length > 0) {
        setIsAdmin(true);
        fetchProducts();
        fetchClickStats();
      }
      setChecking(false);
    };
    checkAdmin();
  }, [user, authLoading]);

  const fetchProducts = async () => {
    const { data } = await supabase.from("products").select("*").order("sort_order");
    if (data) setProducts(data as unknown as Product[]);
  };

  const fetchClickStats = async () => {
    const { data } = await supabase.from("product_clicks").select("product_id, click_type");
    if (data) {
      const stats: Record<string, ClickStats> = {};
      data.forEach((click: any) => {
        if (!stats[click.product_id]) {
          stats[click.product_id] = { product_id: click.product_id, views: 0, purchase_clicks: 0 };
        }
        if (click.click_type === "view") stats[click.product_id].views++;
        if (click.click_type === "purchase_click") stats[click.product_id].purchase_clicks++;
      });
      setClickStats(Object.values(stats));
    }
  };

  const getStats = (productId: string) => clickStats.find((s) => s.product_id === productId) || { views: 0, purchase_clicks: 0 };

  const openEdit = (product: Product) => {
    setEditing(product);
    setForm({
      name: product.name,
      category: product.category,
      tier: product.tier,
      brand: product.brand || "",
      description: product.description || "",
      price_display: product.price_display || "",
      purchase_url: product.purchase_url || "",
      payment_link: product.payment_link || "",
      image_url: product.image_url || "",
      target_scalp_types: product.target_scalp_types,
      target_symptoms: product.target_symptoms,
      is_active: product.is_active,
      sort_order: product.sort_order,
    });
    setDialogOpen(true);
  };

  const openNew = () => {
    setEditing(null);
    setForm(emptyProduct);
    setDialogOpen(true);
  };

  const saveProduct = async () => {
    const payload = {
      ...form,
      image_url: form.image_url || null,
      payment_link: form.payment_link || null,
      target_scalp_types: form.target_scalp_types,
      target_symptoms: form.target_symptoms,
    };

    if (editing) {
      const { error } = await supabase.from("products").update(payload).eq("id", editing.id);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Updated", description: `${form.name} saved.` });
    } else {
      const { error } = await supabase.from("products").insert(payload);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Created", description: `${form.name} added.` });
    }
    setDialogOpen(false);
    fetchProducts();
  };

  const deleteProduct = async (id: string) => {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Deleted" });
    fetchProducts();
  };

  const toggleActive = async (product: Product) => {
    await supabase.from("products").update({ is_active: !product.is_active }).eq("id", product.id);
    fetchProducts();
  };

  if (checking || authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground font-body">Checking permissions…</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 flex flex-col items-center justify-center gap-4">
          <ShieldCheck className="h-16 w-16 text-muted-foreground" />
          <h1 className="font-display text-2xl font-bold text-foreground">Admin Access Required</h1>
          <p className="text-muted-foreground font-body">You don't have permission to access this page.</p>
          <Button variant="outline" onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 container mx-auto px-4 max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Product Management</h1>
            <p className="text-muted-foreground font-body text-sm mt-1">Manage recommended products and track performance.</p>
          </div>
          <Button variant="hero" onClick={openNew}><Plus className="mr-2 h-4 w-4" /> Add Product</Button>
        </div>

        {/* Products List */}
        <div className="space-y-3">
          {products.map((product) => {
            const stats = getStats(product.id);
            const imgSrc = product.image_url || DEFAULT_PRODUCT_IMAGE;
            return (
              <Card key={product.id} className={`shadow-card ${!product.is_active ? "opacity-50" : ""}`}>
                <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      <img
                        src={imgSrc}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_PRODUCT_IMAGE; }}
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-display font-bold text-foreground">{product.name}</span>
                        <Badge variant="outline" className="text-xs">{product.category}</Badge>
                        <Badge variant="secondary" className="text-xs">{product.tier}</Badge>
                        {!product.is_active && <Badge variant="destructive" className="text-xs">Inactive</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground font-body mt-1">{product.brand} · {product.price_display}</p>
                      <div className="flex gap-4 mt-1 text-xs text-muted-foreground font-body">
                        <span><BarChart3 className="inline h-3 w-3 mr-1" />{stats.views} views</span>
                        <span>{stats.purchase_clicks} clicks</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={product.is_active} onCheckedChange={() => toggleActive(product)} />
                    <Button variant="ghost" size="sm" onClick={() => openEdit(product)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => deleteProduct(product.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Add/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display">{editing ? "Edit Product" : "Add Product"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="prod-name">Product Name <span className="text-destructive">*</span></Label>
                <FieldHelp id="prod-name-desc">The display name shown on recommendations and dashboards.</FieldHelp>
                <Input
                  id="prod-name"
                  aria-describedby="prod-name-desc"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Rosemary Scalp Serum"
                  maxLength={120}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="prod-brand">Brand</Label>
                <FieldHelp id="prod-brand-desc">Manufacturer or brand label.</FieldHelp>
                <Input
                  id="prod-brand"
                  aria-describedby="prod-brand-desc"
                  value={form.brand}
                  onChange={(e) => setForm({ ...form, brand: e.target.value })}
                  placeholder="e.g. WishCare"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Category</Label>
                  <FieldHelp>Main product type — drives filters & icons.</FieldHelp>
                  <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="shampoo">Shampoo</SelectItem>
                      <SelectItem value="serum">Serum</SelectItem>
                      <SelectItem value="oil">Oil</SelectItem>
                      <SelectItem value="supplement">Supplement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Tier</Label>
                  <FieldHelp>Price segment — used in plan-based recommendations.</FieldHelp>
                  <Select value={form.tier} onValueChange={(v) => setForm({ ...form, tier: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="budget">Budget</SelectItem>
                      <SelectItem value="mid-range">Mid-Range</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="prod-desc">Description</Label>
                <FieldHelp id="prod-desc-desc">Short benefits summary shown under the product name.</FieldHelp>
                <Textarea
                  id="prod-desc"
                  aria-describedby="prod-desc-desc"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  maxLength={500}
                  placeholder="e.g. Strengthens roots, reduces shedding within 4 weeks…"
                />
              </div>

              {/* Image Upload or URL */}
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5">
                  <ImageIcon className="h-4 w-4" /> Product Image
                </Label>
                <FieldHelp>Upload a square image (JPG / PNG) or paste a public URL. Falls back to a placeholder if empty.</FieldHelp>
                <div className="flex gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    className="flex-1"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const ext = file.name.split(".").pop();
                      const path = `products/${Date.now()}.${ext}`;
                      const { error } = await supabase.storage.from("product-images").upload(path, file);
                      if (error) {
                        toast({ title: "Upload failed", description: error.message, variant: "destructive" });
                        return;
                      }
                      const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(path);
                      setForm({ ...form, image_url: urlData.publicUrl });
                      toast({ title: "Image uploaded" });
                    }}
                  />
                </div>
                <Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="Or paste URL (leave blank for default)" />
                {(form.image_url || DEFAULT_PRODUCT_IMAGE) && (
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted">
                    <img
                      src={form.image_url || DEFAULT_PRODUCT_IMAGE}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_PRODUCT_IMAGE; }}
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="prod-price">Price Display</Label>
                  <FieldHelp id="prod-price-desc">Free-form text shown to users (any currency / units).</FieldHelp>
                  <Input id="prod-price" aria-describedby="prod-price-desc" value={form.price_display} onChange={(e) => setForm({ ...form, price_display: e.target.value })} placeholder="₹499" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="prod-sort">Sort Order</Label>
                  <FieldHelp id="prod-sort-desc">Lower numbers appear first.</FieldHelp>
                  <Input id="prod-sort" aria-describedby="prod-sort-desc" type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="prod-url">Purchase URL</Label>
                <FieldHelp id="prod-url-desc">External page where users can read more or buy.</FieldHelp>
                <Input id="prod-url" aria-describedby="prod-url-desc" value={form.purchase_url} onChange={(e) => setForm({ ...form, purchase_url: e.target.value })} placeholder="https://..." />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="prod-pay">Payment Link</Label>
                <FieldHelp id="prod-pay-desc">Direct checkout URL (e.g. Razorpay link). Optional.</FieldHelp>
                <Input id="prod-pay" aria-describedby="prod-pay-desc" value={form.payment_link} onChange={(e) => setForm({ ...form, payment_link: e.target.value })} placeholder="https://rzp.io/..." />
              </div>
              <div className="space-y-1.5">
                <Label>Target Scalp Types</Label>
                <FieldHelp>
                  Scalp types this product is recommended for. Type a value and press <kbd className="px-1 rounded bg-muted text-[10px]">Enter</kbd> or <kbd className="px-1 rounded bg-muted text-[10px]">,</kbd> to add a tag. Duplicates are ignored.
                </FieldHelp>
                <TagInput
                  value={form.target_scalp_types}
                  onChange={(tags) => setForm({ ...form, target_scalp_types: tags })}
                  placeholder="Dry Scalp, Oily Scalp, Sensitive Scalp"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Target Symptoms</Label>
                <FieldHelp>
                  Symptoms this product helps with. Press <kbd className="px-1 rounded bg-muted text-[10px]">Enter</kbd> or <kbd className="px-1 rounded bg-muted text-[10px]">,</kbd> to add. Pasting a comma-separated list also works.
                </FieldHelp>
                <TagInput
                  value={form.target_symptoms}
                  onChange={(tags) => setForm({ ...form, target_symptoms: tags })}
                  placeholder="Hair Fall, Dandruff, Itching, Redness"
                />
              </div>
              <div className="sticky bottom-0 -mx-6 px-6 py-3 bg-background border-t">
                <Button variant="hero" className="w-full" onClick={saveProduct} disabled={!form.name.trim()}>
                  {editing ? "Save Changes" : "Add Product"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminProducts;
