import React from "react";
import { ThemeEditor } from "./ui/themeEditor";

export default function TechDisplay() {
  return (
    <section className="pb-section-gap px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto relative z-10">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter auto-rows-[240px]">
        {/* <!-- Bento Item 1 --> */}
        <div className="col-span-1 md:col-span-2 bg-white/3 backdrop-blur-[32px] border border-white/10 rounded-xl p-8 flex flex-col justify-end relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-100 transition-opacity">
            <span
              className="material-symbols-outlined text-[48px] text-primary"
              data-icon="deployed_code"
            >
              deployed_code
            </span>
          </div>
          <h4 className="font-headline-sm text-headline-md text-primary mb-2">
            Cloud Native
          </h4>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Deployment across GCP, and Azure using Kubernetes.
          </p>
        </div>
        {/* <!-- Bento Item 2 --> */}
        <div className="col-span-1 md:col-span-1 bg-white/3 backdrop-blur-[32px] border border-white/10 rounded-xl p-8 flex items-center justify-center text-center">
          <div className="space-y-2">
            <span className="font-display-lg text-display-lg text-secondary block">
              99.9%
            </span>
            <span className="font-label-caps text-label-caps text-on-surface-variant block">
              UPTIME
            </span>
          </div>
        </div>
        {/* <!-- Bento Item 3 (Code Snippet) --> */}
        <ThemeEditor />
      </div>
    </section>
  );
}
