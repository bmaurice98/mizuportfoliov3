import Image from "next/image";
import Link from "next/link";
import React from "react";

type Props = {
  projectTitle?: string;
  projectTags?: string[];
  projectDescription?: string;
  projectLink?: string;
  projectImageUrl?: string;
  githubLink?: string;
};

export const ProjectCard = ({
  projectTitle,
  projectTags,
  projectDescription,
  projectLink,
  projectImageUrl,
  githubLink,
}: Props) => {
  return (
    <article className="group relative overflow-hidden rounded-xl bg-white/3 backdrop-blur-[32px] border border-white/10 hover:bg-white/8 hover:backdrop-blur-3xl hover:border-white/40 transition-all duration-500 flex flex-col min-h-120">
      <div className="absolute inset-0 bg-linear-to-br from-white/5 to-transparent pointer-events-none rounded-xl"></div>
      <div className="h-64 overflow-hidden relative">
        <Image
          alt="Cybernetic core"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100 mix-blend-luminosity group-hover:mix-blend-normal"
          data-alt="A highly detailed close-up of a futuristic quantum computer core glowing with icy blue and pristine white lights. The complex metallic structures are encased in frosted glass panels that refract the light, creating a serene, high-tech atmosphere. Deep slate and navy shadows provide stark contrast against the brilliant cyan accents, emphasizing precision engineering."
          src={
            projectImageUrl ||
            "https://lh3.googleusercontent.com/aida-public/AB6AXuCdnhCrKgFMCuX0Miy641ut4Zp2m4uvzasTH9RamJam_zCcD08wBomZQex_DZGw45bubne5uHm2pX1Jc6luMHaBAbGQqr5cBxSV2a_FMqy0zEZOIxQLJpFVKTtwdHUXGYLrz5O6nNAPIjct0xQEwux2Mt0uxtEKISpePHwbadpHzCnW_HP0lFUyE9s_QkdyBT16zUURF5qdlSoYQ-RHt4rOFsTFOIY15PaYEqNngehAbYnNvcBpGyYN0zceZM27lg0Bth2NOHRi_A"
          }
          style={{
            width: "100%",
            height: "auto",
          }}
          width={500}
          height={300}
          loading="eager"
        />
        <div className="absolute inset-0 bg-linear-to-t from-surface-dim to-transparent"></div>
      </div>
      <div className="p-6 flex flex-col grow z-10">
        <div className="flex gap-2 flex-wrap mb-4">
          {projectTags?.map((tag, id) => (
            <span
              className="rounded-full bg-secondary-container/20 px-3 py-1 font-label-caps text-label-caps text-secondary border border-secondary/10"
              key={tag}
            >
              {tag}
            </span>
          ))}
        </div>
        <h3 className="font-headline-sm text-headline-sm text-primary mb-2">
          {projectTitle}
        </h3>
        <p className="font-body-md text-body-md text-on-surface-variant mb-6 grow">
          {projectDescription}
        </p>
        <div className="grid grid-cols-2 w-full">
          <Link
            className="font-label-caps text-label-caps text-secondary flex items-center gap-2 group-hover:text-primary hover:text-secondary transition-colors"
            href={projectLink || "#"}
          >
            View Project{" "}
            <span className="material-symbols-outlined text-[16px] transition-transform group-hover:translate-x-1">
              arrow_forward
            </span>
          </Link>

          {githubLink && (
            <Link
              className="font-label-caps text-label-caps text-secondary flex items-center justify-end gap-2 group-hover:text-primary hover:text-secondary transition-colors"
              href={githubLink}
            >
              <span className="material-symbols-outlined text-[16px] transition-transform ">
                hub
              </span>
            </Link>
          )}
        </div>
      </div>
    </article>
  );
};
