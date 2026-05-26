import React from "react";

export default function SocialGraph() {
  return (
    <div className="lg:col-span-5 flex flex-col gap-6">
      <div className="bg-white/3 backdrop-blur-[32px] border border-white/10 border-t-white/20 border-l-white/20 rounded-xl p-8 relative overflow-hidden group">
        <div className="absolute inset-0 bg-linear-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <h2 className="font-headline-sm text-headline-sm text-primary mb-8 flex items-center gap-3">
          <span className="material-symbols-outlined text-secondary">
            share
          </span>
          Coordinates
        </h2>
        <ul className="flex flex-col gap-6 relative z-10">
          <li>
            <a
              className="flex items-center gap-4 group/link"
              href="mailto:brandon.maurice@devmizu.tech"
              target={"_blank"}
            >
              <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center bg-white/2 group-hover/link:bg-white/8 group-hover/link:border-secondary/50 transition-all">
                <span className="material-symbols-outlined text-on-surface-variant group-hover/link:text-primary transition-colors text-[20px]">
                  mail
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-label-caps text-label-caps text-on-surface-variant mb-1">
                  Email
                </span>
                <span className="font-code text-code text-primary group-hover/link:text-secondary transition-colors">
                  Bmaurice@devmizu.tech
                </span>
              </div>
            </a>
          </li>
          <li>
            <a
              className="flex items-center gap-4 group/link"
              href="github.com/bmaurice98"
            >
              <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center bg-white/2 group-hover/link:bg-white/8 group-hover/link:border-secondary/50 transition-all">
                <span className="material-symbols-outlined text-on-surface-variant group-hover/link:text-primary transition-colors text-[20px]">
                  code
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-label-caps text-label-caps text-on-surface-variant mb-1">
                  Repository
                </span>
                <span className="font-code text-code text-primary group-hover/link:text-secondary transition-colors">
                  github.com/bmaurice98
                </span>
              </div>
            </a>
          </li>
          <li>
            <a
              className="flex items-center gap-4 group/link"
              href="linkedin.com/in/bmaurice98"
            >
              <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center bg-white/2 group-hover/link:bg-white/8 group-hover/link:border-secondary/50 transition-all">
                <span className="material-symbols-outlined text-on-surface-variant group-hover/link:text-primary transition-colors text-[20px]">
                  hub
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-label-caps text-label-caps text-on-surface-variant mb-1">
                  Professional Network
                </span>
                <span className="font-code text-code text-primary group-hover/link:text-secondary transition-colors">
                  linkedin.com/in/bmaurice98
                </span>
              </div>
            </a>
          </li>
        </ul>
      </div>
      {/* <!-- Subtle Info Card --> */}
      <div className="bg-white/2 backdrop-blur-lg border border-white/5 rounded-xl p-6">
        <p className="font-body-md text-body-md text-on-surface-variant">
          Operating from PST-5. Response times typically within 24 standard
          hours.
        </p>
      </div>
    </div>
  );
}
