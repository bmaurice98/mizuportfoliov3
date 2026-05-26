import React from 'react'

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
        <div className="col-span-1 md:col-span-1 bg-[#05080a] border border-white/10 rounded-xl p-6 font-code text-code overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-8 bg-surface-container flex items-center px-4 gap-2 border-b border-white/5">
            <div className="w-2 h-2 rounded-full bg-error"></div>
            <div className="w-2 h-2 rounded-full bg-secondary"></div>
            <div className="w-2 h-2 rounded-full bg-primary-fixed"></div>
          </div>
          <div className="pt-8 text-on-surface-variant opacity-80">
            <span className="text-secondary">const</span> init ={" "}
            <span className="text-primary">async</span> () =&gt;{" "}
            {
              <>
                <br />
                  <span className="text-primary">await</span> connect();
                <br />
                  render(<span className="text-primary">'glass_ui'</span>);
                <br />
              </>
            }
            ;
          </div>
        </div>
      </div>
    </section>
  );
}
