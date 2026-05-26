"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import MobileNavbar from "./mobileNavbar";


const navLinks = {
  Home: "/",
  Projects: "/projects",
  Experience: "/experience",
  Contact: "/contact",
};

const activeLinkStyle = "text-primary border-b-2 border-primary pb-1 block";
const inactiveLinkStyle =
  "text-on-surface-variant hover:text-primary hover:bg-white/10 transition-all duration-300 px-3 py-2 rounded-DEFAULT block scale-95 active:scale-90";

export default function Navbar() {
  const pathname = usePathname();
  // console.log(pathname);

  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const handleMenuOpen = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleMenuClose = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white/3 dark:bg-white/3 backdrop-blur-[50px] border-b border-white/10 shadow-[0_0_20px_rgba(224,247,250,0.05)]">
      <div className="flex justify-between items-center h-20 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
        {/* <!-- Brand --> */}
        <Link
          className="font-display-lg-mobile text-display-lg-mobile font-bold tracking-tighter text-primary"
          href="/"
        >
          DevMizu
        </Link>
        {/* <!-- Navigation Links (Desktop) --> */}
        <ul className="hidden md:flex items-center gap-gutter font-label-caps text-label-caps">
          {Object.entries(navLinks).map(([name, path]) => (
            <Link
              className={
                pathname === path ? activeLinkStyle : inactiveLinkStyle
              }
              href={path}
              key={name}
            >
              <li>{name}</li>
            </Link>
          ))}
          {/* <li>
                  <Link
                    className="text-primary border-b-2 border-primary pb-1 block"
                    href="/"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    className="text-on-surface-variant hover:text-primary hover:bg-white/10 transition-all duration-300 px-3 py-2 rounded-DEFAULT block scale-95 active:scale-90"
                    href="/projects"
                  >
                    Projects
                  </Link>
                </li>
                <li>
                  <Link
                    className="text-on-surface-variant hover:text-primary hover:bg-white/10 transition-all duration-300 px-3 py-2 rounded-DEFAULT block scale-95 active:scale-90"
                    href="/experience"
                  >
                    Experience
                  </Link>
                </li>
                <li>
                  <Link
                    className="text-on-surface-variant hover:text-primary hover:bg-white/10 transition-all duration-300 px-3 py-2 rounded-DEFAULT block scale-95 active:scale-90"
                    href="/contact"
                  >
                    Contact
                  </Link>
                </li> */}
        </ul>
        {/* <!-- Trailing Action --> */}
        <Link href="/Resume/BMResumeDev2026_Portfolio.pdf" download="Brandon_Maurice_Developer_Resume.pdf" prefetch={false}>
          <button
            type="button"
            className="hidden md:flex items-center justify-center px-6 py-3 bg-primary text-surface font-label-caps text-label-caps rounded-DEFAULT hover:opacity-90 transition-opacity"
          >
            Resume
          </button>
        </Link>
        {/* <!-- Mobile Menu Icon (Visual only) --> */}
        <button className="md:hidden text-primary p-2" onClick={handleMenuOpen}>
          <span className="material-symbols-outlined" data-icon="menu">
            menu
          </span>
        </button>
      </div>
      {/* <!-- Mobile Menu (Hidden by default) --> */}
      {/* <!-- When the menu is open, the mobile nav will display over the full screen --> */}
      {isMenuOpen && <MobileNavbar handleMenuClose={handleMenuClose} />}
    </nav>
  );
}
