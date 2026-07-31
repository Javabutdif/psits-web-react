import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, FolderOpen } from "lucide-react";
import { createTemplate, updateTemplate } from "../../../certificate/api/certificate.api";
import { showToast } from "@/utils/alertHelper";
import type { ICertificateTemplate } from "../../../certificate/types/certificate.types";
import { AssetFileSelectorDialog } from "./AssetFileSelectorDialog";

interface CreateTemplateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
  editData?: ICertificateTemplate | null;
}

interface Signee {
  name: string;
  designation: string;
  e_sig: string;
  e_sigKey?: string;
}

interface KeyValue {
  key: string;
  value: string;
}

const isSignatureKey = (key: string, signeeKeys?: Set<string>): boolean => {
  if (signeeKeys && signeeKeys.has(key)) return true;
  const lower = key.toLowerCase();
  return (
    lower.startsWith("sig_") ||
    (lower.startsWith("sig") && lower.length <= 5) ||
    lower.endsWith("_sig") ||
    lower.endsWith("_signature") ||
    lower.includes("signature") ||
    lower.includes("e_sig") ||
    lower.includes("esig")
  );
};

export const CreateTemplateDialog: React.FC<CreateTemplateDialogProps> = ({
  isOpen,
  onClose,
  onCreated,
  editData,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    ejsRelativePath: "",
  });

  const [signees, setSignees] = useState<Signee[]>([]);
  const [images, setImages] = useState<KeyValue[]>([]);
  const [fonts, setFonts] = useState<KeyValue[]>([]);

  const [selectorOpen, setSelectorOpen] = useState(false);
  const [selectorFilter, setSelectorFilter] = useState<"image" | "font" | "ejs" | "">("");
  const [selectorCallback, setSelectorCallback] = useState<(path: string) => void>(() => () => {});

  const openSelector = (
    filterType: "image" | "font" | "ejs" | "",
    onSelect: (path: string) => void
  ) => {
    setSelectorFilter(filterType);
    setSelectorCallback(() => onSelect);
    setSelectorOpen(true);
  };


  // Pre-populate data if editing
  useEffect(() => {
    if (isOpen && editData) {
      setFormData({
        name: editData.name || "",
        description: editData.description || "",
        ejsRelativePath: editData.ejsRelativePath || "",
      });
      const imgMap = editData.defaultImages || {};
      const signeeKeys = new Set(
        editData.defaultSignees?.map((s) => s.e_sig).filter((s): s is string => !!s)
      );

      setSignees(
        editData.defaultSignees?.map((s, idx) => ({
          ...s,
          e_sigKey: s.e_sig || `sig_${idx}`,
          e_sig: s.e_sig && imgMap[s.e_sig] ? (imgMap[s.e_sig] as string) : (s.e_sig?.includes("/") || s.e_sig?.includes(".") ? s.e_sig : ""),
        })) || []
      );

      setImages(
        Object.entries(imgMap)
          .filter(([key]) => !isSignatureKey(key, signeeKeys))
          .map(([key, value]) => ({ key, value: value as string }))
      );

      const fontMap = editData.defaultFonts || {};
      setFonts(Object.entries(fontMap).map(([key, value]) => ({ key, value: value as string })));
    } else if (isOpen && !editData) {
      // Reset if creating new
      setFormData({ name: "", description: "", ejsRelativePath: "" });
      setSignees([]);
      setImages([]);
      setFonts([]);
    }
  }, [isOpen, editData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const addSignee = () =>
    setSignees([
      ...signees,
      {
        name: "",
        designation: "",
        e_sig: "",
        e_sigKey: `sig_${signees.length}`,
      },
    ]);
  const updateSignee = (index: number, field: keyof Signee, value: string) => {
    const newSignees = [...signees];
    newSignees[index][field] = value;
    setSignees(newSignees);
  };
  const removeSignee = (index: number) => setSignees(signees.filter((_, i) => i !== index));

  const addImage = () => setImages([...images, { key: "", value: "" }]);
  const updateImage = (index: number, field: keyof KeyValue, value: string) => {
    const newImages = [...images];
    newImages[index][field] = value;
    setImages(newImages);
  };
  const removeImage = (index: number) => setImages(images.filter((_, i) => i !== index));

  const addFont = () => setFonts([...fonts, { key: "", value: "" }]);
  const updateFont = (index: number, field: keyof KeyValue, value: string) => {
    const newFonts = [...fonts];
    newFonts[index][field] = value;
    setFonts(newFonts);
  };
  const removeFont = (index: number) => setFonts(fonts.filter((_, i) => i !== index));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.ejsRelativePath) {
      showToast("error", "Name and Path are required.");
      return;
    }

    const baseImages = images
      .filter((curr) => curr.key && curr.value && !isSignatureKey(curr.key))
      .reduce((acc, curr) => {
        acc[curr.key] = curr.value;
        return acc;
      }, {} as Record<string, string>);

    const formattedSignees = signees
      .filter((s) => s.name && s.designation)
      .map((s, idx) => {
        const sigKey = s.e_sigKey || `sig_${idx}`;
        if (s.e_sig) {
          baseImages[sigKey] = s.e_sig;
        }
        return {
          name: s.name,
          designation: s.designation,
          e_sig: s.e_sig ? sigKey : "",
        };
      });

    const payload = {
      ...formData,
      defaultSignees: formattedSignees,
      defaultImages: baseImages,
      defaultFonts: fonts.reduce((acc, curr) => {
        if (curr.key && curr.value) acc[curr.key] = curr.value;
        return acc;
      }, {} as Record<string, string>),
    };

    try {
      setLoading(true);
      if (editData && editData._id) {
        const res = await updateTemplate(editData._id, payload);
        if (res.success) {
          showToast("success", "Template updated successfully.");
          onCreated();
          onClose();
        } else {
          showToast("error", res.message || "Failed to update template.");
        }
      } else {
        const res = await createTemplate(payload);
        if (res.success) {
          showToast("success", "Template created successfully.");
          onCreated();
          onClose();
        } else {
          showToast("error", res.message || "Failed to create template.");
        }
      }
    } catch (error: any) {
      showToast("error", error?.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto overflow-x-hidden">
        <DialogHeader>
          <DialogTitle>{editData ? "Edit Certificate Template" : "Create Certificate Template"}</DialogTitle>
          <DialogDescription>
            {editData 
              ? "Update the details and default mappings for this template." 
              : "Manually enter the details of the EJS template located in the server-side assets folder."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4 w-full max-w-full min-w-0">
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Basic Info</h3>
            <div className="space-y-2">
              <Label htmlFor="name">Template Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Default Certificate Template"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Template description..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ejsRelativePath">EJS Relative Path (from assets) *</Label>
              <div className="flex gap-2">
                <Input
                  id="ejsRelativePath"
                  name="ejsRelativePath"
                  value={formData.ejsRelativePath}
                  onChange={handleChange}
                  placeholder="e.g. templates/certificates/certificate.ejs"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    openSelector("ejs", (path) =>
                      setFormData((prev) => ({ ...prev, ejsRelativePath: path }))
                    )
                  }
                >
                  <FolderOpen className="w-4 h-4 mr-2" />
                  Browse...
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-4 w-full max-w-full min-w-0">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-semibold text-lg">Signees</h3>
              <Button type="button" variant="outline" size="sm" onClick={addSignee}>
                <Plus className="w-4 h-4 mr-2" /> Add Signee
              </Button>
            </div>
            <div className="bg-blue-50/70 border border-blue-200 text-blue-900 text-xs p-3 rounded-md leading-relaxed">
              <strong>Note:</strong> Select the signature image file directly from server assets. This signature will be automatically mapped to the template&apos;s signature image dictionary without creating a duplicate entry in the Images section below.
            </div>
            <div className="overflow-x-auto pb-2 space-y-2 w-full max-w-full min-w-0">
              {signees.map((signee, index) => (
                <div key={index} className="flex gap-2 items-start min-w-[650px]">
                  <Input
                    className="min-w-[130px] flex-1"
                    placeholder="Name"
                    value={signee.name}
                    onChange={(e) => updateSignee(index, "name", e.target.value)}
                  />
                  <Input
                    className="min-w-[130px] flex-1"
                    placeholder="Designation"
                    value={signee.designation}
                    onChange={(e) => updateSignee(index, "designation", e.target.value)}
                  />
                  <Input
                    className="w-28 min-w-[100px]"
                    placeholder="E-Sig Key"
                    value={signee.e_sigKey || ""}
                    onChange={(e) => updateSignee(index, "e_sigKey", e.target.value)}
                    title="E-Sig key name used in EJS template (e.g., sig_0)"
                  />
                  <div className="flex gap-1 flex-[1.5] min-w-[200px]">
                    <Input
                      placeholder="Signature Image Path (e.g. images/sigs/sig.png)"
                      value={signee.e_sig}
                      onChange={(e) => updateSignee(index, "e_sig", e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      title="Browse Server Assets"
                      onClick={() => openSelector("image", (path) => updateSignee(index, "e_sig", path))}
                    >
                      <FolderOpen className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeSignee(index)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-semibold text-lg">Images</h3>
              <Button type="button" variant="outline" size="sm" onClick={addImage}>
                <Plus className="w-4 h-4 mr-2" /> Add Image
              </Button>
            </div>
            <div className="bg-blue-50/70 border border-blue-200 text-blue-900 text-xs p-3 rounded-md leading-relaxed">
              <strong>Note:</strong> The <strong>Key</strong> must match the image variable name used in your EJS template (e.g., if your EJS uses <code className="bg-blue-100 px-1 py-0.5 rounded font-mono">images.bottom_logos</code>, use <code className="bg-blue-100 px-1 py-0.5 rounded font-mono">bottom_logos</code> as the Key).
            </div>
            {images.map((img, index) => (
              <div key={index} className="flex gap-2 items-start">
                <Input placeholder="Key (e.g., logo)" value={img.key} onChange={(e) => updateImage(index, "key", e.target.value)} />
                <div className="flex gap-1 flex-1">
                  <Input placeholder="Relative Path (e.g. images/logo.png)" value={img.value} onChange={(e) => updateImage(index, "value", e.target.value)} />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    title="Browse Server Assets"
                    onClick={() => openSelector("image", (path) => updateImage(index, "value", path))}
                  >
                    <FolderOpen className="w-4 h-4" />
                  </Button>
                </div>
                <Button type="button" variant="ghost" size="icon" onClick={() => removeImage(index)}>
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-semibold text-lg">Fonts</h3>
              <Button type="button" variant="outline" size="sm" onClick={addFont}>
                <Plus className="w-4 h-4 mr-2" /> Add Font
              </Button>
            </div>
            <div className="bg-blue-50/70 border border-blue-200 text-blue-900 text-xs p-3 rounded-md leading-relaxed">
              <strong>Note:</strong> The <strong>Font Family</strong> key must match the font name referenced in your EJS template&apos;s <code className="bg-blue-100 px-1 py-0.5 rounded font-mono">@font-face</code> or CSS styles (e.g., if your EJS uses <code className="bg-blue-100 px-1 py-0.5 rounded font-mono">fonts.Outfit</code>, use <code className="bg-blue-100 px-1 py-0.5 rounded font-mono">Outfit</code> as the Key).
            </div>
            {fonts.map((font, index) => (
              <div key={index} className="flex gap-2 items-start">
                <Input placeholder="Font Family" value={font.key} onChange={(e) => updateFont(index, "key", e.target.value)} />
                <div className="flex gap-1 flex-1">
                  <Input placeholder="Relative Path (e.g. fonts/Arial.ttf)" value={font.value} onChange={(e) => updateFont(index, "value", e.target.value)} />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    title="Browse Server Assets"
                    onClick={() => openSelector("font", (path) => updateFont(index, "value", path))}
                  >
                    <FolderOpen className="w-4 h-4" />
                  </Button>
                </div>
                <Button type="button" variant="ghost" size="icon" onClick={() => removeFont(index)}>
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (editData ? "Updating..." : "Creating...") : editData ? "Finish Editing" : "Create Template"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
    <AssetFileSelectorDialog
      isOpen={selectorOpen}
      onClose={() => setSelectorOpen(false)}
      filterType={selectorFilter}
      onSelect={(path) => {
        selectorCallback(path);
      }}
    />
    </>
  );
};
