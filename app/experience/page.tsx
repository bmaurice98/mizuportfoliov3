import ExperienceHeader from "@/components/experiencePage/experienceHeader";
import ExperienceTechStackSection from "@/components/experiencePage/experienceTechStackSection";
import ExperienceTimelineSection from "@/components/experiencePage/experienceTimelineSection";
import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import React from "react";

function page() {
  return (
    <>
      <Navbar />
      <div className="grow pt-28 pb-section-gap px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto w-full">
        <ExperienceHeader />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">

        <ExperienceTimelineSection />
        <ExperienceTechStackSection />
        </div>
      </div>
      <Footer />
    </>
  );
}

export default page;
