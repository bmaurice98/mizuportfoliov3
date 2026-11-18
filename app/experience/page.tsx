import ExperienceHeader from "@/components/experiencePage/experienceHeader";
import ExperienceJsonLd from "@/components/experiencePage/experienceJsonLd";
import ExperienceTechStackSection from "@/components/experiencePage/experienceTechStackSection";
import ExperienceTimelineSection from "@/components/experiencePage/experienceTimelineSection";
import Navbar from "@/components/navbar";
import React from "react";

function page() {
  return (
    <>
      <Navbar />
      <main className="grow pt-28 pb-section-gap px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto w-full">
        <ExperienceHeader />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          <ExperienceTimelineSection />
          <ExperienceTechStackSection />
        </div>
      </main>
      <ExperienceJsonLd />
    </>
  );
}

export default page;
