"use client";

import React from "react";
import { Icon } from "@/components/ui/icon";
import {
  DetailBody,
  ExpandableModal,
  ModalHeader,
  useExpandable,
} from "@/components/ui/expandableModal";
import { TIMELINE, type TimelineEntry } from "@/util/experienceData";

function Period({ period }: { period: TimelineEntry["period"] }) {
  return (
    <span>
      <time dateTime={period.start.iso}>{period.start.label}</time>
      {" – "}
      {period.end ? (
        <time dateTime={period.end.iso}>{period.end.label}</time>
      ) : (
        "Present"
      )}
    </span>
  );
}

function ExperienceTimelineSection() {
  const { active, openFrom, close } = useExpandable<TimelineEntry>();

  return (
    <section
      aria-labelledby="work-history-heading"
      className="lg:col-span-7 relative"
    >
      <h2 id="work-history-heading" className="sr-only">
        Work history
      </h2>
      <div
        aria-hidden="true"
        className="absolute left-4 top-0 bottom-0 w-px bg-linear-to-b from-white/20 via-white/10 to-transparent"
      />
      <ol className="flex flex-col gap-12 pl-12 relative">
        {TIMELINE.map((entry) => (
          <li key={entry.id} className="relative group">
            <div
              aria-hidden="true"
              className={
                entry.featured
                  ? "absolute -left-9.5 top-6 w-3 h-3 rounded-full bg-secondary shadow-[0_0_10px_rgba(152,208,215,0.5)] border border-primary/50"
                  : "absolute -left-9.5 top-6 w-3 h-3 rounded-full bg-surface-variant border border-white/20"
              }
            />
            <article className="relative overflow-hidden bg-white/3 backdrop-blur-[32px] border border-white/10 rounded-xl p-8 hover:bg-white/8 transition-all duration-300">
              {entry.featured && (
                <div
                  aria-hidden="true"
                  className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"
                />
              )}
              <div className="flex justify-between items-start gap-4 mb-4">
                <header>
                  <h3 className="font-headline-md text-headline-md text-primary">
                    {entry.role}
                  </h3>
                  <p className="font-headline-sm text-headline-sm text-secondary mt-1">
                    {entry.company}
                  </p>
                </header>
                <span className="shrink-0 font-label-caps text-label-caps text-on-surface-variant bg-white/5 px-3 py-1 rounded-full border border-white/5">
                  <Period period={entry.period} />
                </span>
              </div>

              <p className="font-body-md text-body-md text-on-surface-variant mb-6 leading-relaxed">
                {entry.summary}
              </p>

              <ul className="flex flex-wrap gap-2">
                {entry.tags.map((tag) => (
                  <li
                    key={tag}
                    className="font-label-caps text-label-caps text-secondary bg-secondary/10 px-3 py-1 rounded-full border border-secondary/20"
                  >
                    {tag}
                  </li>
                ))}
              </ul>

              {/* Stretched button: the whole card is clickable, but the card
                  keeps clean article/heading semantics. */}
              <button
                type="button"
                aria-haspopup="dialog"
                onClick={(e) =>
                  openFrom(entry, e.currentTarget.closest("article")!)
                }
                className="mt-6 inline-flex items-center gap-2 font-label-caps text-label-caps text-secondary cursor-pointer after:absolute after:inset-0 after:rounded-xl focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-secondary"
              >
                View details
                <span className="sr-only">
                  {" "}
                  about {entry.role} at {entry.company}
                </span>
                <Icon
                  name="open_in_full"
                  className="text-[16px] transition-transform group-hover:translate-x-1"
                />
              </button>
            </article>
          </li>
        ))}
      </ol>

      {active && (
        <ExpandableModal
          titleId={`timeline-${active.item.id}-title`}
          originRect={active.rect}
          onClose={close}
        >
          <ModalHeader
            id={`timeline-${active.item.id}-title`}
            icon="work"
            title={active.item.role}
            subtitle={active.item.company}
            meta={
              <p className="font-label-caps text-label-caps text-on-surface-variant mt-1">
                <Period period={active.item.period} />
              </p>
            }
          />
          <DetailBody detail={active.item.detail} />
        </ExpandableModal>
      )}
    </section>
  );
}

export default ExperienceTimelineSection;
