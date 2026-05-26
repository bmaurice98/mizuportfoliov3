import Link from 'next/link';
import React from 'react'

export default function Footer() {
  return (
    <footer className="w-full py-12 bg-surface-container-lowest dark:bg-surface-container-lowest border-t border-white/5">
      <div className="flex flex-col md:flex-row justify-between items-center gap-gutter px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
        <div className="font-label-caps text-label-caps text-primary">
          DevMizu
        </div>
        <div className="font-code text-code text-secondary dark:text-secondary opacity-60">
          © 2026 DevMizu. BUILT WITH PRECISION.
        </div>
        <ul className="flex items-center gap-6 font-code text-code">
          <li>
            <Link
              className="text-outline hover:text-primary transition-colors hover:opacity-80 hover:underline decoration-secondary"
              href="https://github.com/bmaurice98"
            >
              <img
                alt="GitHub"
                className="w-6 h-6 invert"
                src="https://cdn.jsdelivr.net/npm/simple-icons@v4/icons/github.svg"
              />
            </Link>
          </li>
          <li>
            <Link
              className="text-outline hover:text-primary transition-colors hover:opacity-80 hover:underline decoration-secondary"
              href="https://www.linkedin.com/in/bmaurice98/"
            >
              <img
                alt="LinkedIn"
                className="w-6 h-6 invert"
                src="https://cdn.jsdelivr.net/npm/simple-icons@v4/icons/linkedin.svg"
              />
            </Link>
          </li>
          <li>
            <Link
              className="text-outline hover:text-primary transition-colors hover:opacity-80 hover:underline decoration-secondary"
              href="https://leetcode.com/u/MizuPiku/"
            >
              <img
                alt="LeetCode"
                className="w-6 h-6 invert"
                src="https://cdn.jsdelivr.net/npm/simple-icons@v4/icons/leetcode.svg"
              />
            </Link>
          </li>
          <li>
            <Link
              className="text-outline hover:text-primary transition-colors hover:opacity-80 hover:underline decoration-secondary"
              href="https://open.spotify.com/user/bmaurice100"
            >
              <img
                alt="Spotify"
                className="w-6 h-6 invert"
                src="https://cdn.jsdelivr.net/npm/simple-icons@v4/icons/spotify.svg"
              />
            </Link>
          </li>
        </ul>
      </div>
    </footer>
  );
}
