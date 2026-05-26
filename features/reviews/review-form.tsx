"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { submitReview } from "@/server/actions/reviews";

interface ReviewFormProps {
  token: string;
  customerName: string | null;
  serviceName: string | null;
  tenantName: string | null;
}

export function ReviewForm({ token, customerName, serviceName, tenantName }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      setError("Veuillez sélectionner une note");
      return;
    }

    setSubmitting(true);
    setError(null);

    const fd = new FormData();
    fd.set("rating", String(rating));
    if (comment) fd.set("comment", comment);

    const result = await submitReview(token, fd);
    setSubmitting(false);

    if (result?.error) setError(result.error);
    else setSuccess(true);
  }

  if (success) {
    return (
      <div className="text-center py-8 space-y-3">
        <div className="flex justify-center gap-1">
          {Array.from({ length: rating }).map((_, i) => (
            <Star key={i} className="h-6 w-6 fill-yellow-400 text-yellow-400" />
          ))}
        </div>
        <p className="text-lg font-semibold">Merci pour votre avis !</p>
        <p className="text-sm text-muted-foreground">
          Votre retour aide {tenantName} à s'améliorer.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-1">
          Comment s'est passée votre intervention ?
        </p>
        {serviceName && (
          <p className="font-medium">{serviceName}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Votre note *</Label>
        <div
          className="flex gap-2 justify-center"
          onMouseLeave={() => setHovered(0)}
        >
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHovered(star)}
              className="focus:outline-none transition-transform hover:scale-110"
            >
              <Star
                className={cn(
                  "h-9 w-9 transition-colors",
                  (hovered || rating) >= star
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-muted-foreground"
                )}
              />
            </button>
          ))}
        </div>
        {rating > 0 && (
          <p className="text-center text-sm text-muted-foreground">
            {["", "Très insatisfait", "Insatisfait", "Correct", "Satisfait", "Très satisfait"][rating]}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="comment">Commentaire (optionnel)</Label>
        <Textarea
          id="comment"
          placeholder="Partagez votre expérience..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          maxLength={500}
        />
        <p className="text-xs text-muted-foreground text-right">{comment.length}/500</p>
      </div>

      {error && (
        <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
          {error}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={submitting || rating === 0}>
        {submitting ? "Envoi en cours..." : "Soumettre mon avis"}
      </Button>
    </form>
  );
}
