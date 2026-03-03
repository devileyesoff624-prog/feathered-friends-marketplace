import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { sanitizeError } from "@/lib/sanitize-error";
import { findRestrictedSpecies } from "@/lib/restricted-species";
import { Camera, X, Loader2 } from "lucide-react";

const categories = [
  { value: "parrots", label: "Parrots" },
  { value: "pigeons", label: "Pigeons" },
  { value: "hens", label: "Hens" },
  { value: "exotic", label: "Exotic Birds" },
  { value: "others", label: "Others" },
];

const CreateListing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [form, setForm] = useState({
    title: "",
    category: "parrots" as string,
    species: "",
    age: "",
    price: "",
    city: "",
    description: "",
    health_info: "",
  });

  const handlePhotoAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (photos.length + files.length > 6) {
      toast({ title: "Max 6 photos allowed", variant: "destructive" });
      return;
    }
    setPhotos((prev) => [...prev, ...files]);
    files.forEach((f) => {
      const reader = new FileReader();
      reader.onload = (ev) => setPreviews((prev) => [...prev, ev.target?.result as string]);
      reader.readAsDataURL(f);
    });
  };

  const removePhoto = (i: number) => {
    setPhotos((prev) => prev.filter((_, idx) => idx !== i));
    setPreviews((prev) => prev.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      // Check for restricted species client-side
      const combinedText = `${form.title} ${form.species} ${form.description}`;
      const restricted = findRestrictedSpecies(combinedText);
      if (restricted) {
        toast({
          title: "Protected Species",
          description: `"${restricted}" is a protected/endangered species and cannot be listed for sale.`,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const { data: listing, error } = await supabase
        .from("listings")
        .insert({
          user_id: user.id,
          title: form.title.trim(),
          category: form.category as any,
          species: form.species.trim() || null,
          age: form.age.trim() || null,
          price: Number(form.price),
          city: form.city.trim() || null,
          description: form.description.trim() || null,
          health_info: form.health_info.trim() || null,
        })
        .select()
        .single();

      if (error) throw error;

      // Upload photos
      for (const file of photos) {
        const ext = file.name.split(".").pop();
        const path = `${listing.id}/${crypto.randomUUID()}.${ext}`;
        const { error: uploadErr } = await supabase.storage.from("listing-photos").upload(path, file);
        if (uploadErr) continue;

        const { data: urlData } = supabase.storage.from("listing-photos").getPublicUrl(path);
        await supabase.from("listing_photos").insert({
          listing_id: listing.id,
          url: urlData.publicUrl,
        });
      }

      toast({ title: "Listing created!", description: "Your bird listing is now live." });
      navigate("/dashboard");
    } catch (err: any) {
      toast({ title: "Error", description: sanitizeError(err), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20">
        <div className="container max-w-2xl py-8">
          <h1 className="font-display text-2xl font-bold text-foreground mb-6">List Your Bird</h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Photos */}
            <div>
              <Label>Photos (max 6)</Label>
              <div className="flex flex-wrap gap-3 mt-2">
                {previews.map((p, i) => (
                  <div key={i} className="relative w-24 h-24 rounded-lg overflow-hidden border border-border">
                    <img src={p} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removePhoto(i)} className="absolute top-1 right-1 p-0.5 rounded-full bg-destructive text-destructive-foreground">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {photos.length < 6 && (
                  <label className="w-24 h-24 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors">
                    <Camera className="w-5 h-5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground mt-1">Add</span>
                    <input type="file" accept="image/*" multiple onChange={handlePhotoAdd} className="hidden" />
                  </label>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="title">Title *</Label>
              <Input id="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required placeholder="e.g. Beautiful Green Budgie" className="mt-1.5" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category *</Label>
                <select
                  id="category"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="mt-1.5 w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                >
                  {categories.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="species">Species</Label>
                <Input id="species" value={form.species} onChange={(e) => setForm({ ...form, species: e.target.value })} placeholder="e.g. Budgerigar" className="mt-1.5" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="age">Age</Label>
                <Input id="age" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} placeholder="e.g. 6 months" className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="price">Price (PKR) *</Label>
                <Input id="price" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required min={0} className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <Input id="city" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="e.g. Miami" className="mt-1.5" />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} placeholder="Describe your bird..." className="mt-1.5" />
            </div>

            <div>
              <Label htmlFor="health">Health & Vaccination Info</Label>
              <Textarea id="health" value={form.health_info} onChange={(e) => setForm({ ...form, health_info: e.target.value })} rows={3} placeholder="Vaccination status, health records..." className="mt-1.5" />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Publishing...</> : "Publish Listing"}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default CreateListing;
