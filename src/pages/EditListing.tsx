import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import { Camera, X, Loader2, Trash2 } from "lucide-react";

const categories = [
  { value: "parrots", label: "Parrots" },
  { value: "pigeons", label: "Pigeons" },
  { value: "hens", label: "Hens" },
  { value: "exotic", label: "Exotic Birds" },
  { value: "others", label: "Others" },
];

const EditListing = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [newPhotos, setNewPhotos] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const [existingPhotos, setExistingPhotos] = useState<{ id: string; url: string }[]>([]);
  const [photosToDelete, setPhotosToDelete] = useState<string[]>([]);
  const [form, setForm] = useState({
    title: "",
    category: "parrots",
    species: "",
    age: "",
    price: "",
    city: "",
    description: "",
    health_info: "",
  });

  useEffect(() => {
    const fetchListing = async () => {
      if (!user || !id) return;
      const { data, error } = await supabase
        .from("listings")
        .select("*, listing_photos(*)")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

      if (error || !data) {
        toast({ title: "Listing not found", variant: "destructive" });
        navigate("/dashboard");
        return;
      }

      setForm({
        title: data.title || "",
        category: data.category || "parrots",
        species: data.species || "",
        age: data.age || "",
        price: String(data.price || ""),
        city: data.city || "",
        description: data.description || "",
        health_info: data.health_info || "",
      });
      setExistingPhotos(data.listing_photos?.map((p: any) => ({ id: p.id, url: p.url })) || []);
      setFetching(false);
    };
    fetchListing();
  }, [id, user]);

  const handlePhotoAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const totalPhotos = existingPhotos.length - photosToDelete.length + newPhotos.length + files.length;
    if (totalPhotos > 6) {
      toast({ title: "Max 6 photos allowed", variant: "destructive" });
      return;
    }
    setNewPhotos((prev) => [...prev, ...files]);
    files.forEach((f) => {
      const reader = new FileReader();
      reader.onload = (ev) => setNewPreviews((prev) => [...prev, ev.target?.result as string]);
      reader.readAsDataURL(f);
    });
  };

  const removeNewPhoto = (i: number) => {
    setNewPhotos((prev) => prev.filter((_, idx) => idx !== i));
    setNewPreviews((prev) => prev.filter((_, idx) => idx !== i));
  };

  const markExistingPhotoForDelete = (photoId: string) => {
    setPhotosToDelete((prev) => [...prev, photoId]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !id) return;
    setLoading(true);

    try {
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

      const { error } = await supabase
        .from("listings")
        .update({
          title: form.title.trim(),
          category: form.category as any,
          species: form.species.trim() || null,
          age: form.age.trim() || null,
          price: Number(form.price),
          city: form.city.trim() || null,
          description: form.description.trim() || null,
          health_info: form.health_info.trim() || null,
        })
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;

      // Delete removed photos
      for (const photoId of photosToDelete) {
        await supabase.from("listing_photos").delete().eq("id", photoId);
      }

      // Upload new photos
      for (const file of newPhotos) {
        const ext = file.name.split(".").pop();
        const path = `${id}/${crypto.randomUUID()}.${ext}`;
        const { error: uploadErr } = await supabase.storage.from("listing-photos").upload(path, file);
        if (uploadErr) continue;
        const { data: urlData } = supabase.storage.from("listing-photos").getPublicUrl(path);
        await supabase.from("listing_photos").insert({ listing_id: id, url: urlData.publicUrl });
      }

      toast({ title: "Listing updated!" });
      navigate("/dashboard");
    } catch (err: any) {
      toast({ title: "Error", description: sanitizeError(err), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 container max-w-2xl">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="h-64 bg-muted rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  const activeExistingPhotos = existingPhotos.filter((p) => !photosToDelete.includes(p.id));
  const totalPhotos = activeExistingPhotos.length + newPhotos.length;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20">
        <div className="container max-w-2xl py-8">
          <h1 className="font-display text-2xl font-bold text-foreground mb-6">Edit Listing</h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label>Photos (max 6)</Label>
              <div className="flex flex-wrap gap-3 mt-2">
                {activeExistingPhotos.map((p) => (
                  <div key={p.id} className="relative w-24 h-24 rounded-lg overflow-hidden border border-border">
                    <img src={p.url} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => markExistingPhotoForDelete(p.id)} className="absolute top-1 right-1 p-0.5 rounded-full bg-destructive text-destructive-foreground">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {newPreviews.map((p, i) => (
                  <div key={`new-${i}`} className="relative w-24 h-24 rounded-lg overflow-hidden border border-border">
                    <img src={p} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeNewPhoto(i)} className="absolute top-1 right-1 p-0.5 rounded-full bg-destructive text-destructive-foreground">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {totalPhotos < 6 && (
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
              <Input id="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className="mt-1.5" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category *</Label>
                <select id="category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="mt-1.5 w-full h-10 px-3 rounded-md border border-input bg-background text-sm">
                  {categories.map((c) => (<option key={c.value} value={c.value}>{c.label}</option>))}
                </select>
              </div>
              <div>
                <Label htmlFor="species">Species</Label>
                <Input id="species" value={form.species} onChange={(e) => setForm({ ...form, species: e.target.value })} className="mt-1.5" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="age">Age</Label>
                <Input id="age" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="price">Price (Rs.) *</Label>
                <Input id="price" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required min={0} className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <Input id="city" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="mt-1.5" />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} className="mt-1.5" />
            </div>

            <div>
              <Label htmlFor="health">Health & Vaccination Info</Label>
              <Textarea id="health" value={form.health_info} onChange={(e) => setForm({ ...form, health_info: e.target.value })} rows={3} className="mt-1.5" />
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="outline" className="flex-1" onClick={() => navigate("/dashboard")}>Cancel</Button>
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default EditListing;
