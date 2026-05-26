import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import { ProjectCard } from "@/components/projectsPage/projectCard";
import ProjectsHeader from "@/components/projectsPage/projectsHeader";
import React from "react";
import projects from '@/util/projects.json' with {type: 'json'}

type ProjectDetails = {
  projectName: string;
  projectTags: string[];
  projectDescriptions: string;
  projectLink: string;
};

// console.log(Object.entries(projects).map((value, key) => {
//   // console.log("key: " + keyof);
//   return key + " " + value;
  
// }));



function page() {
  return (
    <>
      <Navbar />
      <div className="grow pt-15 pb-section-gap px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto w-full">
        <ProjectsHeader />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
          {
            Object.entries(projects).map(([key, value]) => (
              <ProjectCard {...value} key={key} />
            ))
          }
          
        </div>
      </div>
      <Footer />
    </>
  );
}

export default page;
