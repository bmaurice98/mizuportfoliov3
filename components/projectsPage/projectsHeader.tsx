import React from 'react'

function ProjectsHeader() {
  return (
    <div className="mb-16 md:mb-24 flex flex-col gap-4 max-w-3xl">
      <h1 className="font-display-lg text-display-lg text-primary/50 bg-clip-text bg-linear-to-r from-primary to-secondary">
        Projects
      </h1>
      <p className="font-body-lg text-body-lg text-on-surface-variant">
        A curated exhibition of high-performance systems and sophisticated
        digital architecture, forged with precision and clarity.
      </p>
    </div>
  );
}

export default ProjectsHeader