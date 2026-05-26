import React from 'react'

export default function MobileNavbar() {
  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 bg-white/3 dark:bg-white/3 backdrop-blur-[50px] shadow-[0_0_20px_rgba(224,247,250,0.05)] md:hidden">
      <ul className="flex justify-around items-center h-20 px-margin-mobile">
        <li>
          <a
            className="flex flex-col items-center gap-1 text-on-surface-variant"
            href="#"
          >
            <span className="material-symbols-outlined">home</span>
            <span className="font-label-caps text-[10px]">Home</span>
          </a>
        </li>
        <li>
          <a
            className="flex flex-col items-center gap-1 text-on-surface-variant"
            href="#"
          >
            <span className="material-symbols-outlined">folder</span>
            <span className="font-label-caps text-[10px]">Projects</span>
          </a>
        </li>
        <li>
          <a className="flex flex-col items-center gap-1 text-primary" href="#">
            <span className="material-symbols-outlined">work</span>
            <span className="font-label-caps text-[10px]">Experience</span>
          </a>
        </li>
        <li>
          <a
            className="flex flex-col items-center gap-1 text-on-surface-variant"
            href="#"
          >
            <span className="material-symbols-outlined">mail</span>
            <span className="font-label-caps text-[10px]">Contact</span>
          </a>
        </li>
      </ul>
    </nav>
  );
}
