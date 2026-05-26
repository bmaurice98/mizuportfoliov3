import React from "react";

export default function ProfessionalSummary() {
  return (
    <>
      <section className="py-section-gap px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto relative z-10">
        <div className="w-full bg-white/3 backdrop-blur-[32px] border border-white/10 rounded-xl p-8 md:p-16 shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="col-span-1 flex flex-col space-y-4 border-l-2 border-secondary/30 pl-6">
              <span
                className="material-symbols-outlined text-secondary text-[32px]"
                data-icon="memory"
              >
                memory
              </span>
              <h3 className="font-headline-sm text-headline-sm text-primary">
                Core Engineering
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Building resilient microservices and distributed systems
                capable of handling sizeable data throughput with sub-millisecond
                latency.
              </p>
            </div>
            <div className="col-span-1 flex flex-col space-y-4 border-l-2 border-secondary/30 pl-6">
              <span
                className="material-symbols-outlined text-secondary text-[32px]"
                data-icon="visibility"
              >
                visibility
              </span>
              <h3 className="font-headline-sm text-headline-sm text-primary">
                UI/UX Precision
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Translating complex data streams into intuitive, 
                interfaces that provide clarity without sacrificing technical
                depth.
              </p>
            </div>
            <div className="col-span-1 flex flex-col space-y-4 border-l-2 border-secondary/30 pl-6">
              <span
                className="material-symbols-outlined text-secondary text-[32px]"
                data-icon="security"
              >
                security
              </span>
              <h3 className="font-headline-sm text-headline-sm text-primary">
                Zero-Trust Security
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Implementing robust encryption, secure authentication pipelines,
                and proactive threat modeling from the foundational layer up.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
