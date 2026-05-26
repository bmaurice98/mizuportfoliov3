import Image from 'next/image';
import Link from 'next/link'
import React from 'react'

export default function Hero() {
  return (
    <section className="min-h-217.5 flex items-center pt-20 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto relative z-10">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter w-full">
        {/* <!-- Hero Typography --> */}
        <div className="col-span-1 md:col-span-8 flex flex-col justify-center space-y-8 z-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary-container/20 rounded-full border border-secondary/20 w-fit">
            <span className="w-2 h-2 rounded-full bg-secondary"></span>
            <span className="font-label-caps text-label-caps text-secondary tracking-widest">
              FULL STACK ENGINEER
            </span>
          </div>
          <h1 className="font-display-lg text-display-lg text-primary text-balance">
            BUILDING WITH PRECISION. DESIGNED WITH CLARITY.
          </h1>
          <p className="font-body-lg text-body-lg text-body-tracking-lg) text-on-surface-variant max-w-2xl text-balance">
            Engineering scalable, high-performance systems applications.
            Bridging the gap between a powerful backend and elegant front-end
            design.
          </p>
          <div className="flex flex-wrap items-center gap-6 pt-4">
            <Link href="/projects">
              <button className="px-8 py-4 bg-primary text-surface font-label-caps text-label-caps rounded-DEFAULT hover:bg-primary-fixed transition-colors cursor-pointer">
                Explore Projects
              </button>
            </Link>
            <Link href={"/contact"}>
              <button className="px-8 py-4 bg-transparent text-primary font-label-caps text-label-caps border border-white/20 rounded-DEFAULT backdrop-blur-md hover:bg-white/10 transition-all flex items-center gap-2 cursor-pointer">
                <span>Contact Me</span>
                <span
                  className="material-symbols-outlined text-[16px]"
                  data-icon="arrow_forward"
                >
                  arrow_forward
                </span>
              </button>
            </Link>
          </div>
        </div>
        {/* <!-- Hero Visual (Glass Card overlaying abstract bg) --> */}
        <div className="hidden md:flex col-span-1 md:col-span-4 relative justify-center items-center">
          <div className="w-full aspect-3/4 bg-white/3 backdrop-blur-[32px] border border-white/10 rounded-xl flex flex-col p-6 shadow-[0_8px_32px_rgba(0,0,0,0.4)] relative overflow-hidden group">
            {/* <!-- Inner Refraction Glow --> */}
            <div className="absolute inset-0 bg-linear-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
            <div className="flex-1 w-full bg-surface-container-high border border-white/5 rounded-lg mb-6 flex items-center justify-center overflow-hidden relative">
              <div className="absolute inset-0 bg-[radial-linear(ellipse_at_center,var(--tw-linear-stops))] from-secondary/20 via-surface-container-high to-surface-container-high"></div>
              {/* <span
                className="material-symbols-outlined text-[64px] text-primary/80 z-10 font-light"
                data-icon="code_blocks"
                data-weight="fill"
              >
                code_blocks
              </span> */}
              <Image
                src={"/MizuDev.png"}
                alt="Hero Dev Logo"
                style={{
                  width: "100%",
                  height: "auto",
                }}
                width={500}
                height={300}
              />
            </div>
            <div className="space-y-4 w-full">
              <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-secondary w-2/3 rounded-full"></div>
              </div>
              <div className="flex justify-between items-center font-code text-code text-on-surface-variant">
                <span>System Status</span>
                <span className="text-secondary">Optimal</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
