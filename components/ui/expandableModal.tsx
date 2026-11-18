"use client";

import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { Icon } from "./icon";

/* ------------------------------------------------------------------ *
 * THEME: every visual class for the modal lives here.
 * ------------------------------------------------------------------ */
const theme = {
  wrapper: "fixed inset-0 z-10002 flex items-center justify-center p-4 md:p-8",
  backdrop: "absolute inset-0 bg-surface/70 backdrop-blur-md",
  panel:
    "relative w-full max-w-2xl max-h-[85dvh] overflow-y-auto bg-surface-container border border-white/10 border-t-white/20 border-l-white/20 rounded-xl p-8 md:p-10 shadow-[0_8px_48px_rgba(0,0,0,0.5)]",
  glow: "absolute top-0 right-0 w-48 h-48 bg-secondary/10 rounded-full blur-[60px] -mr-16 -mt-16 pointer-events-none",
  closeButton:
    "absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full border border-white/10 text-on-surface-variant hover:text-primary hover:bg-white/10 transition-colors cursor-pointer",
  headerIcon:
    "w-14 h-14 shrink-0 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-secondary",
  title: "font-headline-md text-headline-md text-primary",
  subtitle: "font-code text-code text-secondary",
  overview: "font-body-md text-body-md text-on-surface-variant mb-8",
  sectionHeading: "font-label-caps text-label-caps text-primary mb-3",
  listItem:
    "flex items-start gap-3 font-body-md text-body-md text-on-surface-variant",
  listIcon: "text-secondary text-[20px] mt-0.5",
  chipAccent:
    "font-label-caps text-label-caps text-secondary bg-secondary/10 px-3 py-1 rounded-full border border-secondary/20",
  chipNeutral:
    "font-code text-code text-on-surface-variant bg-white/5 px-3 py-1 rounded-full border border-white/10",
};

/* ------------------------------------------------------------------ *
 * Content shape: any modal body can be described with this.
 * ------------------------------------------------------------------ */
export type DetailSection = {
  heading: string;
  list?: string[];
  chips?: string[];
};

export type DetailContent = {
  overview: string;
  sections: DetailSection[];
  technologies: string[];
};

/* ------------------------------------------------------------------ *
 * Hook: tracks which item is open and where it expanded from.
 * ------------------------------------------------------------------ */
export function useExpandable<T>() {
  const [active, setActive] = useState<{ item: T; rect: DOMRect } | null>(null);
  const openFrom = useCallback((item: T, origin: Element) => {
    setActive({ item, rect: origin.getBoundingClientRect() });
  }, []);
  const close = useCallback(() => setActive(null), []);
  return { active, openFrom, close };
}

/* ------------------------------------------------------------------ *
 * Modal shell
 * ------------------------------------------------------------------ */
const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function flipTransform(panel: HTMLElement, from: DOMRect) {
  const to = panel.getBoundingClientRect();
  const dx = from.left - to.left;
  const dy = from.top - to.top;
  return `translate(${dx}px, ${dy}px) scale(${from.width / to.width}, ${
    from.height / to.height
  })`;
}

type ExpandableModalProps = {
  /** Must match the `id` passed to <ModalHeader>; used for aria-labelledby. */
  titleId: string;
  originRect: DOMRect;
  onClose: () => void;
  children: React.ReactNode;
};

export function ExpandableModal({
  titleId,
  originRect,
  onClose,
  children,
}: ExpandableModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const closingRef = useRef(false);

  // Expand from the origin card into the centered panel.
  useLayoutEffect(() => {
    const panel = panelRef.current;
    const backdrop = backdropRef.current;
    if (!panel || !backdrop || prefersReducedMotion()) return;

    panel.animate(
      [
        { transform: flipTransform(panel, originRect), opacity: 0.3 },
        { transform: "translate(0, 0) scale(1, 1)", opacity: 1 },
      ],
      { duration: 380, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
    );
    backdrop.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 250 });
  }, [originRect]);

  // Shrink back toward the card, then unmount.
  const requestClose = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;

    const panel = panelRef.current;
    const backdrop = backdropRef.current;
    if (!panel || !backdrop || prefersReducedMotion()) return onClose();

    backdrop.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: 250,
      fill: "forwards",
    });
    const anim = panel.animate(
      [
        { transform: "translate(0, 0) scale(1, 1)", opacity: 1 },
        { transform: flipTransform(panel, originRect), opacity: 0 },
      ],
      {
        duration: 280,
        easing: "cubic-bezier(0.64, 0, 0.78, 0)",
        fill: "forwards",
      },
    );
    anim.onfinish = onClose;
  }, [originRect, onClose]);

  // Focus management: move focus in, restore it to the trigger on unmount.
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    return () => previouslyFocused?.focus?.();
  }, []);

  // Escape closes, Tab is trapped inside the panel, page scroll is locked.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return requestClose();
      if (e.key !== "Tab") return;

      const panel = panelRef.current;
      if (!panel) return;
      const focusables = panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [requestClose]);

  // Portal escapes the backdrop-blur ancestors that would trap `fixed`.
  return createPortal(
    <div className={theme.wrapper}>
      <div
        ref={backdropRef}
        onClick={requestClose}
        aria-hidden="true"
        className={theme.backdrop}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        style={{ transformOrigin: "top left" }}
        className={theme.panel}
      >
        <div aria-hidden="true" className={theme.glow} />
        <button
          ref={closeRef}
          type="button"
          onClick={requestClose}
          aria-label="Close dialog"
          className={theme.closeButton}
        >
          <Icon name="close" className="text-[20px]" />
        </button>
        {children}
      </div>
    </div>,
    document.body,
  );
}

/* ------------------------------------------------------------------ *
 * Reusable modal content pieces
 * ------------------------------------------------------------------ */
export function ModalHeader({
  id,
  icon,
  title,
  subtitle,
  meta,
}: {
  id: string;
  icon?: string;
  title: string;
  subtitle?: string;
  meta?: React.ReactNode;
}) {
  return (
    <header className="relative flex items-center gap-4 mb-6 pr-12">
      {icon && (
        <div className={theme.headerIcon}>
          <Icon name={icon} className="text-[28px]" />
        </div>
      )}
      <div>
        <h2 id={id} className={theme.title}>
          {title}
        </h2>
        {subtitle && <p className={theme.subtitle}>{subtitle}</p>}
        {meta}
      </div>
    </header>
  );
}

export function DetailBody({ detail }: { detail: DetailContent }) {
  return (
    <div className="relative">
      <p className={theme.overview}>{detail.overview}</p>

      {detail.sections.map((section) => (
        <section key={section.heading} className="mb-8 last:mb-0">
          <h3 className={theme.sectionHeading}>{section.heading}</h3>
          {section.list && (
            <ul className="space-y-2">
              {section.list.map((line) => (
                <li key={line} className={theme.listItem}>
                  <Icon name="check_circle" className={theme.listIcon} />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          )}
          {section.chips && (
            <ul className="flex flex-wrap gap-2">
              {section.chips.map((chip) => (
                <li key={chip} className={theme.chipNeutral}>
                  {chip}
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}

      {detail.technologies.length > 0 && (
        <section className="mt-8">
          <h3 className={theme.sectionHeading}>Technologies</h3>
          <ul className="flex flex-wrap gap-2">
            {detail.technologies.map((tech) => (
              <li key={tech} className={theme.chipAccent}>
                {tech}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
