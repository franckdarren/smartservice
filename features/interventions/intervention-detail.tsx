"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Upload, Trash2, Calendar, User, Wrench, MapPin, FileText } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { uploadInterventionPhoto, deleteInterventionPhoto, updateIntervention } from "@/server/actions/interventions";
import { toast } from "sonner";

interface InterventionDetailProps {
  intervention: {
    id: string;
    appointmentId: string;
    notes: string | null;
    photosBefore: string[] | null;
    photosAfter: string[] | null;
    customerName: string | null;
    customerPhone: string | null;
    customerAddress: string | null;
    serviceName: string | null;
    servicePrice: number | null;
    scheduledAt: Date | null;
    appointmentNotes: string | null;
    technicianName: string | null;
  };
}

export function InterventionDetail({ intervention }: InterventionDetailProps) {
  const [notes, setNotes] = useState(intervention.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [uploadingBefore, setUploadingBefore] = useState(false);
  const [uploadingAfter, setUploadingAfter] = useState(false);
  const [photosBefore, setPhotosBefore] = useState<string[]>(intervention.photosBefore ?? []);
  const [photosAfter, setPhotosAfter] = useState<string[]>(intervention.photosAfter ?? []);
  const fileBeforeRef = useRef<HTMLInputElement>(null);
  const fileAfterRef = useRef<HTMLInputElement>(null);

  async function saveNotes() {
    setSaving(true);
    const fd = new FormData();
    fd.set("appointmentId", intervention.appointmentId);
    fd.set("notes", notes);
    const result = await updateIntervention(intervention.id, fd);
    setSaving(false);
    if (result?.error) toast.error(result.error);
    else toast.success("Notes sauvegardées");
  }

  async function handleUpload(files: FileList | null, phase: "before" | "after") {
    if (!files || files.length === 0) return;
    const setter = phase === "before" ? setUploadingBefore : setUploadingAfter;
    setter(true);

    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.set("photo", file);
      const result = await uploadInterventionPhoto(intervention.id, fd, phase);
      if (result?.error) {
        toast.error(result.error);
      } else if (result?.url) {
        if (phase === "before") setPhotosBefore((prev) => [...prev, result.url!]);
        else setPhotosAfter((prev) => [...prev, result.url!]);
        toast.success("Photo ajoutée");
      }
    }
    setter(false);
  }

  async function handleDelete(url: string, phase: "before" | "after") {
    const result = await deleteInterventionPhoto(intervention.id, url, phase);
    if (result?.error) {
      toast.error(result.error);
    } else {
      if (phase === "before") setPhotosBefore((prev) => prev.filter((u) => u !== url));
      else setPhotosAfter((prev) => prev.filter((u) => u !== url));
      toast.success("Photo supprimée");
    }
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Infos du RDV */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Détails du rendez-vous</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-muted-foreground text-xs">Client</p>
              <p className="font-medium">{intervention.customerName ?? "—"}</p>
              {intervention.customerPhone && (
                <p className="text-muted-foreground">{intervention.customerPhone}</p>
              )}
            </div>
          </div>

          {intervention.scheduledAt && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-muted-foreground text-xs">Date</p>
                <p className="font-medium">
                  {format(new Date(intervention.scheduledAt), "dd MMMM yyyy à HH:mm", { locale: fr })}
                </p>
              </div>
            </div>
          )}

          {intervention.serviceName && (
            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-muted-foreground text-xs">Service</p>
                <p className="font-medium">{intervention.serviceName}</p>
                {intervention.servicePrice !== null && (
                  <p className="text-muted-foreground">
                    {new Intl.NumberFormat("fr-FR").format(intervention.servicePrice)} FCFA
                  </p>
                )}
              </div>
            </div>
          )}

          {intervention.customerAddress && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-muted-foreground text-xs">Adresse</p>
                <p className="font-medium">{intervention.customerAddress}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Notes technicien
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Description du travail effectué, pièces remplacées, observations..."
            rows={5}
          />
          <Button size="sm" onClick={saveNotes} disabled={saving}>
            {saving ? "Sauvegarde..." : "Sauvegarder les notes"}
          </Button>
        </CardContent>
      </Card>

      {/* Photos avant */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Photos avant intervention</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <input
            ref={fileBeforeRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleUpload(e.target.files, "before")}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileBeforeRef.current?.click()}
            disabled={uploadingBefore}
          >
            <Upload className="h-4 w-4 mr-2" />
            {uploadingBefore ? "Envoi..." : "Ajouter des photos"}
          </Button>

          {photosBefore.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {photosBefore.map((url) => (
                <div key={url} className="relative group aspect-square">
                  <img
                    src={url}
                    alt="Photo avant"
                    className="w-full h-full object-cover rounded-md"
                  />
                  <button
                    onClick={() => handleDelete(url, "before")}
                    className="absolute top-1 right-1 bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Aucune photo avant</p>
          )}
        </CardContent>
      </Card>

      {/* Photos après */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Photos après intervention</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <input
            ref={fileAfterRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleUpload(e.target.files, "after")}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileAfterRef.current?.click()}
            disabled={uploadingAfter}
          >
            <Upload className="h-4 w-4 mr-2" />
            {uploadingAfter ? "Envoi..." : "Ajouter des photos"}
          </Button>

          {photosAfter.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {photosAfter.map((url) => (
                <div key={url} className="relative group aspect-square">
                  <img
                    src={url}
                    alt="Photo après"
                    className="w-full h-full object-cover rounded-md"
                  />
                  <button
                    onClick={() => handleDelete(url, "after")}
                    className="absolute top-1 right-1 bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Aucune photo après</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
