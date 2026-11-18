/**
 * Photo gallery content — one "roll" per track on the Photo Gallery record.
 *
 * To add photos:
 *   1. Drop the files in /public/gallery/<roll-id>/
 *   2. Add an entry below with its pixel width/height (keeps the layout from
 *      jumping while images lazy-load) and real alt text.
 *
 * Remote images also work if their host is listed in next.config.ts
 * (images.remotePatterns).
 */

export type Photo = {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
  /** Free-form EXIF-ish line, e.g. "35mm · f/2 · Osaka". */
  meta?: string;
};

export type Roll = {
  id: string;
  title: string;
  /** Shown under the roll title, e.g. "Spring 2026". */
  date?: string;
  note?: string;
  photos: Photo[];
};

export const ROLLS: Roll[] = [
  {
    id: "roll-01",
    title: "Roll 01",
    note: "Still in the developer. Prints coming soon.",
    photos: [
      // { src: "/gallery/roll-01/example.jpg", alt: "…", width: 1600, height: 1067, caption: "…" },
    ],
  },
];
