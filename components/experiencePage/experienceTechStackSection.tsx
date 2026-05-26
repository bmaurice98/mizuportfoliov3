import React from 'react'

export default function ExperienceTechStackSection() {
  return (
    <aside className="lg:col-span-5 flex flex-col gap-8">
      <div className="bg-white/3] backdrop-blur-[32px] border border-white/10 rounded-xl p-8 relative overflow-hidden">
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-[60px] -mr-20 -mb-20"></div>
        <h2 className="font-headline-md text-headline-md text-primary mb-6 flex items-center gap-3">
          <span className="material-symbols-outlined text-secondary">
            terminal
          </span>
          Core Stack
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-surface-container-high border border-white/5 rounded-lg p-4 flex items-center gap-4 hover:border-secondary/30 transition-colors">
            <div className="w-10 h-10 rounded-DEFAULT bg-white/5 flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined font-['fill'_1]">
                code
              </span>
            </div>
            <div>
              <p className="font-label-caps text-label-caps text-primary">
                React &amp; Next.js
              </p>
              <p className="font-code text-[10px] text-on-surface-variant mt-1">
                Frontend Engineering
              </p>
            </div>
          </div>
          <div className="bg-surface-container-high border border-white/5 rounded-lg p-4 flex items-center gap-4 hover:border-secondary/30 transition-colors">
            <div className="w-10 h-10 rounded-DEFAULT bg-white/5 flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined font-['fill'_1]">
                dns
              </span>
            </div>
            <div>
              <p className="font-label-caps text-label-caps text-primary">
                Node.js &amp; Express
              </p>
              <p className="font-code text-[10px] text-on-surface-variant mt-1">
                Backend Services
              </p>
            </div>
          </div>
          <div className="bg-surface-container-high border border-white/5 rounded-lg p-4 flex items-center gap-4 hover:border-secondary/30 transition-colors">
            <div className="w-10 h-10 rounded-DEFAULT bg-white/5 flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined font-['fill'_1]">
                database
              </span>
            </div>
            <div>
              <p className="font-label-caps text-label-caps text-primary">
                PostgreSQL &amp; MongoDB
              </p>
              <p className="font-code text-[10px] text-on-surface-variant mt-1">
                Relational Data
              </p>
            </div>
          </div>
          <div className="bg-surface-container-high border border-white/5 rounded-lg p-4 flex items-center gap-4 hover:border-secondary/30 transition-colors">
            <div className="w-10 h-10 rounded-DEFAULT bg-white/5 flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined font-['fill'_1]">
                cloud
              </span>
            </div>
            <div>
              <p className="font-label-caps text-label-caps text-primary">
                AWS &amp; K8s
              </p>
              <p className="font-code text-[10px] text-on-surface-variant mt-1">
                Cloud Infrastructure
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white/3] backdrop-blur-[32px] border border-white/10 rounded-xl p-8">
        <h2 className="font-headline-md text-headline-md text-primary mb-6 flex items-center gap-3">
          <span className="material-symbols-outlined text-secondary">
            architecture
          </span>
          Tools &amp; Practices
        </h2>
        <ul className="font-body-md text-body-md text-on-surface-variant space-y-4">
          <li className="flex items-start gap-3">
            <span className="material-symbols-outlined text-secondary text-[20px] mt-1">
              check_circle
            </span>
            <div>
              <strong className="text-primary block font-medium">
                CI/CD &amp; DevOps
              </strong>
              <span className="text-sm">
                GitHub Actions, Docker, Terraform, Prometheus monitoring.
              </span>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="material-symbols-outlined text-secondary text-[20px] mt-1">
              check_circle
            </span>
            <div>
              <strong className="text-primary block font-medium">
                Architecture
              </strong>
              <span className="text-sm">
                Microservices, Event-Driven Design, RESTful APIs, GraphQL.
              </span>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="material-symbols-outlined text-secondary text-[20px] mt-1">
              check_circle
            </span>
            <div>
              <strong className="text-primary block font-medium">
                Testing
              </strong>
              <span className="text-sm">
                Jest, Cypress, Go Testing, Integration &amp; E2E pipelines.
              </span>
            </div>
          </li>
        </ul>
      </div>
    </aside>
  );
}
