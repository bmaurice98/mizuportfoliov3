import Link from "next/link";
import React from "react";

type MobileNavbarProps = {
  handleMenuClose: () => void;
};

export default function MobileNavbar({ handleMenuClose }: MobileNavbarProps) {
  return (
    <nav
      className="fixed inset-0 z-101 h-dvh w-dvw glass-base bg-on-primary-fixed flex flex-col justify-between overflow-hidden"
      id="full-nav"
    >
      {/* <!-- Header: Brand & Close --> */}
      <header className="flex justify-between items-center h-20 px-margin-mobile">
        <div className="font-display-lg-mobile text-display-lg-mobile font-bold tracking-tighter text-primary">
          DevMizu
        </div>
        <button
          className="w-12 h-12 flex items-center justify-center rounded-lg glass-stroke glass-card-hover transition-all active:scale-90"
          onClick={handleMenuClose}
        >
          <span className="material-symbols-outlined text-primary text-[32px]">
            close
          </span>
        </button>
      </header>
      {/* <!-- Main Links: Bento-ish Asymmetric Layout --> */}
      <main className="grow flex flex-col justify-center px-margin-mobile gap-8">
        <div className="space-y-4">
          <Link
            className="group block overflow-hidden"
            href="/"
            // onClick={handleMenuClose}
          >
            <span className="font-display-lg-mobile text-display-lg-mobile font-bold text-primary group-hover:translate-x-4 transition-transform duration-500 block">
              Home
            </span>
            <div className="h-px w-0 group-hover:w-full bg-linear-to-r from-secondary to-transparent transition-all duration-700 mt-1"></div>
          </Link>
          <Link
            className="group block overflow-hidden"
            href="/projects"
            // onClick={handleMenuClose}
          >
            <span className="font-display-lg-mobile text-display-lg-mobile font-bold text-primary group-hover:translate-x-4 transition-transform duration-500 block">
              Projects
            </span>
            <div className="h-px w-0 group-hover:w-full bg-linear-to-r from-secondary to-transparent transition-all duration-700 mt-1"></div>
          </Link>
          <Link
            className="group block overflow-hidden"
            href="/experience"
            // onClick={handleMenuClose}
          >
            <span className="font-display-lg-mobile text-display-lg-mobile font-bold text-primary group-hover:translate-x-4 transition-transform duration-500 block">
              Experience
            </span>
            <div className="h-px w-0 group-hover:w-full bg-linear-to-r from-secondary to-transparent transition-all duration-700 mt-1"></div>
          </Link>
          <Link
            className="group block overflow-hidden"
            href="/contact"
            // onClick={handleMenuClose}
          >
            <span className="font-display-lg-mobile text-display-lg-mobile font-bold text-primary group-hover:translate-x-4 transition-transform duration-500 block">
              Contact
            </span>
            <div className="h-px w-0 group-hover:w-full bg-linear-to-r from-secondary to-transparent transition-all duration-700 mt-1"></div>
          </Link>
        </div>
      </main>
      {/* <!-- Footer: Socials & Action --> */}
      <footer className="p-margin-mobile space-y-12">
        {/* <!-- Social Icons --> */}
        <div className="flex flex-col gap-4">
          <span className="font-label-caps text-label-caps text-outline uppercase tracking-[0.2em]">
            Connect
          </span>
          <div className="flex gap-4">
            <Link
              className="w-14 h-14 rounded-full flex items-center justify-center glass-stroke glass-card-hover transition-all duration-300"
              href="https://www.linkedin.com/in/bmaurice98/"
              target="_blank"
              onClick={handleMenuClose}
            >
              <img
                alt="GitHub"
                className="w-6 h-6 invert"
                src="https://cdn.jsdelivr.net/npm/simple-icons@v4/icons/github.svg"
              />
            </Link>
            <Link
              className="w-14 h-14 rounded-full flex items-center justify-center glass-stroke glass-card-hover transition-all duration-300"
              href="https://www.linkedin.com/in/bmaurice98/"
              target="_blank"
              onClick={handleMenuClose}
            >
              <img
                alt="LinkedIn"
                className="w-6 h-6 invert"
                src="https://cdn.jsdelivr.net/npm/simple-icons@v4/icons/linkedin.svg"
              />
            </Link>
            <Link
              className="w-14 h-14 rounded-full flex items-center justify-center glass-stroke glass-card-hover transition-all duration-300"
              href="https://leetcode.com/u/MizuPiku/"
              target="_blank"
              onClick={handleMenuClose}
            >
              <img
                alt="LeetCode"
                className="w-6 h-6 invert"
                src="https://cdn.jsdelivr.net/npm/simple-icons@v4/icons/leetcode.svg"
              />
            </Link>
            <Link
              className="w-14 h-14 rounded-full flex items-center justify-center glass-stroke glass-card-hover transition-all duration-300"
              href="https://open.spotify.com/user/bmaurice100"
              target="_blank"
              onClick={handleMenuClose}
            >
              <img
                alt="Spotify"
                className="w-6 h-6 invert"
                src="https://cdn.jsdelivr.net/npm/simple-icons@v4/icons/spotify.svg"
              />
            </Link>
          </div>
        </div>
        {/* <!-- Primary Action --> */}
        <div className="w-full">
          <Link
            href="/Resume/BMResumeDev2026_Portfolio.pdf"
            download="Brandon_Maurice_Developer_Resume.pdf"
            prefetch={false}
            target="_blank"
            onClick={handleMenuClose}
          >
            <button className="w-full h-16 bg-[#e0f7fa] text-[#09151a] font-headline-sm text-headline-sm font-bold rounded-lg flex items-center justify-center gap-2 hover:bg-white active:scale-[0.98] transition-all shadow-[0_0_30px_rgba(224,247,250,0.1)]">
              Resume
              <span className="material-symbols-outlined">download</span>
            </button>
          </Link>
          <div className="mt-8 text-center">
            <p className="font-label-caps text-label-caps text-outline">
              © 2026 DevMizu. BUILT WITH PRECISION.
            </p>
          </div>
        </div>
      </footer>
      {/* <!-- Atmospheric Glow Orbs --> */}
      <div className="absolute -top-20 -left-20 w-64 h-64 bg-secondary/10 blur-[100px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-40 -right-20 w-80 h-80 bg-on-tertiary-container/10 blur-[120px] rounded-full pointer-events-none"></div>
    </nav>
  );
}
