"use client";

import React from "react";
import { Icon } from "@/components/ui/icon";
import {
  DetailBody,
  ExpandableModal,
  ModalHeader,
  useExpandable,
} from "@/components/ui/expandableModal";
import {
  PRACTICES,
  TECH_STACK,
  type ExpandableItem,
} from "@/util/experienceData";

export default function ExperienceTechStackSection() {
  const { active, openFrom, close } = useExpandable<ExpandableItem>();

  return (
    <div className="lg:col-span-5 flex flex-col gap-8">
      <section
        aria-labelledby="core-stack-heading"
        className="bg-white/3 backdrop-blur-[32px] border border-white/10 rounded-xl p-8 relative overflow-hidden"
      >
        <div
          aria-hidden="true"
          className="absolute bottom-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-[60px] -mr-20 -mb-20 pointer-events-none"
        />
        <h2
          id="core-stack-heading"
          className="font-headline-md text-headline-md text-primary mb-6 flex items-center gap-3"
        >
          <Icon name="terminal" className="text-secondary" />
          Core Stack
        </h2>
        <ul className="grid grid-cols-2 gap-4">
          {TECH_STACK.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                aria-haspopup="dialog"
                onClick={(e) => openFrom(item, e.currentTarget)}
                className="group w-full text-left cursor-pointer bg-surface-container-high border border-white/5 rounded-lg p-4 flex items-center gap-4 hover:border-secondary/30 hover:bg-surface-bright transition-colors focus-visible:outline-2 focus-visible:outline-secondary"
              >
                <span className="w-10 h-10 shrink-0 rounded-DEFAULT bg-white/5 flex items-center justify-center text-secondary">
                  <Icon name={item.icon} />
                </span>
                <span className="grow block">
                  <span className="block font-label-caps text-label-caps text-primary">
                    {item.title}
                  </span>
                  <span className="block font-code text-[10px] text-on-surface-variant mt-1">
                    {item.subtitle}
                  </span>
                </span>
                <Icon
                  name="open_in_full"
                  className="text-[16px] text-on-surface-variant opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity"
                />
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section
        aria-labelledby="practices-heading"
        className="bg-white/3 backdrop-blur-[32px] border border-white/10 rounded-xl p-8"
      >
        <h2
          id="practices-heading"
          className="font-headline-md text-headline-md text-primary mb-6 flex items-center gap-3"
        >
          <Icon name="architecture" className="text-secondary" />
          Tools &amp; Practices
        </h2>
        <ul className="font-body-md text-body-md text-on-surface-variant space-y-2">
          {PRACTICES.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                aria-haspopup="dialog"
                onClick={(e) => openFrom(item, e.currentTarget)}
                className="group w-full text-left cursor-pointer flex items-start gap-3 rounded-lg p-3 -mx-3 hover:bg-white/5 transition-colors focus-visible:outline-2 focus-visible:outline-secondary"
              >
                <Icon
                  name={item.icon}
                  className="text-secondary text-[20px] mt-1"
                />
                <span className="grow block">
                  <strong className="text-primary block font-medium">
                    {item.title}
                  </strong>
                  <span className="block text-sm">{item.summary}</span>
                </span>
                <Icon
                  name="open_in_full"
                  className="text-[16px] mt-1 text-on-surface-variant opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity"
                />
              </button>
            </li>
          ))}
        </ul>
      </section>

      {active && (
        <ExpandableModal
          titleId={`stack-${active.item.id}-title`}
          originRect={active.rect}
          onClose={close}
        >
          <ModalHeader
            id={`stack-${active.item.id}-title`}
            icon={active.item.icon}
            title={active.item.title}
            subtitle={active.item.subtitle}
          />
          <DetailBody detail={active.item.detail} />
        </ExpandableModal>
      )}
    </div>
  );
}
