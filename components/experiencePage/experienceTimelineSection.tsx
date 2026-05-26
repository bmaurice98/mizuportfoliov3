import React from "react";

function ExperienceTimelineSection() {
  return (
    <section className="lg:col-span-7 relative">
      <div className="absolute left-4 top-0 bottom-0 w-px bg-linear-to-b from-white/20 via-white/10 to-transparent"></div>
      <div className="flex flex-col gap-12 pl-12 relative">
        {/* <!-- Node 1 --> */}
        <div className="relative group">
          <div className="absolute -left-9.5 top-6 w-3 h-3 rounded-full bg-secondary shadow-[0_0_10px_rgba(152,208,215,0.5)] border border-primary/50"></div>
          <div className="bg-white/3 backdrop-blur-[32px] border border-white/10 rounded-xl p-8 hover:bg-white/8 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-headline-md text-headline-md text-primary">
                  Full-Stack Engineer
                </h3>
                <p className="font-headline-sm text-headline-sm text-secondary mt-1">
                  Maison Matho
                </p>
              </div>
              <span className="font-label-caps text-label-caps text-on-surface-variant bg-white/5 px-3 py-1 rounded-full border border-white/5">
                April 2026 - June 2027
              </span>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant mb-6 leading-relaxed">
              Developed an online portal for the Restaurant Maison Matho
              allowing patrons to view a pictured menu, access online ordering
              on preferred platforms, leave personalized reviews, and receive
              reward opportunities using NextJS, MongoDB through Supabase hosted
              on a Vercel Domain
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="font-label-caps text-label-caps text-secondary bg-secondary/10 px-3 py-1 rounded-full border border-secondary/20">
                React
              </span>
              <span className="font-label-caps text-label-caps text-secondary bg-secondary/10 px-3 py-1 rounded-full border border-secondary/20">
                MongoDb
              </span>
              <span className="font-label-caps text-label-caps text-secondary bg-secondary/10 px-3 py-1 rounded-full border border-secondary/20">
                TypeScript
              </span>
              <span className="font-label-caps text-label-caps text-secondary bg-secondary/10 px-3 py-1 rounded-full border border-secondary/20">
                Supabase
              </span>
              {/* <span className="font-label-caps text-label-caps text-secondary bg-secondary/10 px-3 py-1 rounded-full border border-secondary/20">
                AWS
              </span> */}
            </div>
          </div>
        </div>
        {/* <!-- Node 2 --> */}
        <div className="relative group">
          <div className="absolute -left-9.5 top-6 w-3 h-3 rounded-full bg-surface-variant border border-white/20"></div>
          <div className="bg-white/3 backdrop-blur-[32px] border border-white/10 rounded-xl p-8 hover:bg-white/8 transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-headline-md text-headline-md text-primary">
                  Full-Stack Engineer
                </h3>
                <p className="font-headline-sm text-headline-sm text-secondary mt-1">
                  Benduka Arts
                </p>
              </div>
              <span className="font-label-caps text-label-caps text-on-surface-variant bg-white/5 px-3 py-1 rounded-full border border-white/5">
                2022 - 2024
              </span>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant mb-6 leading-relaxed">
              Using NextJS and Tailwind, overhauled the front-end of the entire
              online art portfolio and storefront with custom-built components
              based on the clients design preferences, improving performance and
              modernizing the interface. Resulting in an overall improved user
              experience leading to increased site traffic and sales.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="font-label-caps text-label-caps text-secondary bg-secondary/10 px-3 py-1 rounded-full border border-secondary/20">
                React
              </span>
              <span className="font-label-caps text-label-caps text-secondary bg-secondary/10 px-3 py-1 rounded-full border border-secondary/20">
                Node.js
              </span>
              <span className="font-label-caps text-label-caps text-secondary bg-secondary/10 px-3 py-1 rounded-full border border-secondary/20">
                TypeScript
              </span>
              <span className="font-label-caps text-label-caps text-secondary bg-secondary/10 px-3 py-1 rounded-full border border-secondary/20">
                MongoDB
              </span>
            </div>
          </div>
        </div>
        {/* <!-- Node 3 --> */}
        <div className="relative group">
          <div className="absolute -left-9.5 top-6 w-3 h-3 rounded-full bg-surface-variant border border-white/20"></div>
          <div className="bg-white/3 backdrop-blur-[32px] border border-white/10 rounded-xl p-8 hover:bg-white/8 transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-headline-md text-headline-md text-primary">
                  Web Developer
                </h3>
                <p className="font-headline-sm text-headline-sm text-secondary mt-1">
                  Hotline Media
                </p>
              </div>
              <span className="font-label-caps text-label-caps text-on-surface-variant bg-white/5 px-3 py-1 rounded-full border border-white/5">
                2023 - 2024
              </span>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant mb-6 leading-relaxed">
              Leveraging Webflow CMS, Javascript, and CSS. Developed a design
              plan to build an efficient and effective full-stack web
              application for Hotline Media, a startup content management media
              service.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="font-label-caps text-label-caps text-secondary bg-secondary/10 px-3 py-1 rounded-full border border-secondary/20">
                WebflowCMS
              </span>
              <span className="font-label-caps text-label-caps text-secondary bg-secondary/10 px-3 py-1 rounded-full border border-secondary/20">
                JS
              </span>
              <span className="font-label-caps text-label-caps text-secondary bg-secondary/10 px-3 py-1 rounded-full border border-secondary/20">
                Google Workspace
              </span>
              {/* <span className="font-label-caps text-label-caps text-secondary bg-secondary/10 px-3 py-1 rounded-full border border-secondary/20">
                JavaScript
              </span> */}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ExperienceTimelineSection;
