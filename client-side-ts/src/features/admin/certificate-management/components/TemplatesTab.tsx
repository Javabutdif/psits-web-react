import React, { useEffect, useState } from "react";
import type { ICertificateTemplate } from "../../../certificate/types/certificate.types";
import { getActiveTemplates, getTemplatePreview } from "../../../certificate/api/certificate.api";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CreateTemplateDialog } from "./CreateTemplateDialog";
import { showToast } from "@/utils/alertHelper";
import { useAdminPermissions } from "@/features/admin/hooks/useAdminPermissions";
import { Eye, Loader2, Edit } from "lucide-react";

export const TemplatesTab: React.FC = () => {
  const { canManageCertificates } = useAdminPermissions();
  const [templates, setTemplates] = useState<ICertificateTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [previewingId, setPreviewingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<ICertificateTemplate | null>(null);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await getActiveTemplates();
      if (response.success) {
        setTemplates(response.templates);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async (templateId: string) => {
    try {
      setPreviewingId(templateId);
      const rawBlob = await getTemplatePreview(templateId);
      const pdfBlob = new Blob([rawBlob], { type: "application/pdf" });
      const url = URL.createObjectURL(pdfBlob);
      window.open(url, "_blank");
      
      // Clean up the object URL after a short delay
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch (error: any) {
      console.error("Preview failed:", error);
      showToast("error", "Failed to generate preview. Check template configurations.");
    } finally {
      setPreviewingId(null);
    }
  };

  const handleOpenCreate = () => {
    if (!canManageCertificates) return;
    setEditData(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (template: ICertificateTemplate) => {
    if (!canManageCertificates) return;
    setEditData(template);
    setIsDialogOpen(true);
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="heading-3">Certificate Templates</h2>
        {canManageCertificates && (
          <Button onClick={handleOpenCreate}>Create New Template</Button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="flex flex-col">
              <CardHeader>
                <Skeleton className="h-6 w-3/4 rounded" />
              </CardHeader>
              <CardContent className="flex-1">
                <Skeleton className="h-4 w-full rounded mb-2" />
                <Skeleton className="h-4 w-5/6 rounded mb-4" />
                <Skeleton className="h-8 w-full rounded" />
              </CardContent>
              <CardFooter className="pt-0 flex gap-2">
                <Skeleton className="h-10 flex-1 rounded" />
                <Skeleton className="h-10 flex-1 rounded" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.length === 0 ? (
            <p className="text-muted-foreground">No active templates found.</p>
          ) : (
            templates.map((template) => (
              <Card key={template._id} className="flex flex-col">
                <CardHeader>
                  <CardTitle>{template.name}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm text-muted-foreground mb-4">{template.description}</p>
                  <p className="text-xs text-muted-foreground break-all bg-accent p-2 rounded">
                    Path: {template.ejsRelativePath}
                  </p>
                </CardContent>
                <CardFooter className="pt-0 flex gap-2">
                  {canManageCertificates && (
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleOpenEdit(template)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  )}
                  <Button
                    variant="secondary"
                    className="flex-1"
                    disabled={previewingId === template._id}
                    onClick={() => handlePreview(template._id)}
                  >
                    {previewingId === template._id ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Eye className="w-4 h-4 mr-2" />
                    )}
                    {previewingId === template._id ? "Generating..." : "Preview"}
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      )}

      <CreateTemplateDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onCreated={fetchTemplates}
        editData={editData}
      />
    </div>
  );
};
