"use client";

import { useState } from "react";
import Image from "next/image";
import type { Photo } from "@/util/gallery";

/**
 * Photos laid out like a darkroom contact sheet. Selecting a print enlarges
 * it in place (full row width) instead of opening a modal; selecting it
 * again, or Escape, puts it back.
 */
export function ContactSheet({ photos, empty }: { photos: Photo[]; empty?: string }) {
  const [open, setOpen] = useState<number | null>(null);

  if (!photos.length) {
    return (
      <div className="rs-sheet rs-sheet--empty" role="note">
        {Array.from({ length: 6 }, (_, i) => (
          <span key={i} className="rs-sheet-blank" aria-hidden="true" />
        ))}
        <p>{empty ?? "No photos yet."}</p>
      </div>
    );
  }

  return (
    <ul className="rs-sheet">
      {photos.map((p, i) => {
        const isOpen = open === i;
        return (
          <li key={p.src} className="rs-print" data-open={isOpen || undefined}>
            <button
              type="button"
              className="rs-print-btn"
              aria-expanded={isOpen}
              aria-label={`${p.alt}${isOpen ? " (enlarged, select to shrink)" : " (select to enlarge)"}`}
              onClick={() => setOpen(isOpen ? null : i)}
              onKeyDown={(e) => {
                if (e.key === "Escape" && isOpen) {
                  e.preventDefault();
                  e.stopPropagation();
                  setOpen(null);
                }
              }}
            >
              <Image
                src={p.src}
                alt={p.alt}
                width={p.width}
                height={p.height}
                sizes={isOpen ? "(min-width: 1024px) 55vw, 100vw" : "(min-width: 1024px) 18vw, 45vw"}
                loading="lazy"
              />
              <span className="rs-print-no" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}A
              </span>
            </button>
            {(p.caption || p.meta) && (
              <p className="rs-print-caption">
                {p.caption}
                {p.meta && <span>{p.meta}</span>}
              </p>
            )}
          </li>
        );
      })}
    </ul>
  );
}
