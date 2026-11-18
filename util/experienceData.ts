export type DetailSection = {
  heading: string;
  list?: string[];
  chips?: string[];
};

export type DetailContent = {
  overview: string;
  sections: DetailSection[];
  technologies: string[];
};

// ✏️ The `detail` blocks are placeholder copy built from what's already on your
// site. Edit them so they only claim what's true.

export type ExpandableItem = {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  detail: DetailContent;
};

export type PracticeItem = ExpandableItem & { summary: string };

export type TimelineEntry = {
  id: string;
  role: string;
  company: string;
  period: {
    start: { iso: string; label: string };
    end?: { iso: string; label: string };
  };
  summary: string;
  tags: string[];
  featured?: boolean;
  detail: DetailContent;
};

export const TIMELINE: TimelineEntry[] = [
  {
    id: "maison-matho",
    role: "Full-Stack Engineer",
    company: "Maison Matho",
    period: {
      start: { iso: "2026-04", label: "April 2026" },
      end: { iso: "2027-06", label: "June 2027" },
    },
    featured: true,
    summary:
      "Developed an online portal for the Restaurant Maison Matho allowing patrons to view a pictured menu, access online ordering on preferred platforms, leave personalized reviews, and receive reward opportunities using NextJS, MongoDB through Supabase hosted on a Vercel Domain",
    tags: ["React", "MongoDb", "TypeScript", "Supabase"],
    detail: {
      overview:
        "An end-to-end web presence for a restaurant, covering discovery, ordering, and customer loyalty in a single portal.",
      sections: [
        {
          heading: "Responsibilities",
          list: [
            "Built a pictured menu patrons can browse",
            "Linked online ordering to each patron's preferred platform",
            "Implemented personalized reviews and reward opportunities",
            "Deployed the site on a Vercel domain",
          ],
        },
      ],
      technologies: [
        "Next.js",
        "React",
        "TypeScript",
        "MongoDB",
        "Supabase",
        "Vercel",
      ],
    },
  },
  {
    id: "benduka-arts",
    role: "Full-Stack Engineer",
    company: "Benduka Arts",
    period: {
      start: { iso: "2022", label: "2022" },
      end: { iso: "2024", label: "2024" },
    },
    summary:
      "Using NextJS and Tailwind, overhauled the front-end of the entire online art portfolio and storefront with custom-built components based on the clients design preferences, improving performance and modernizing the interface. Resulting in an overall improved user experience leading to increased site traffic and sales.",
    tags: ["React", "Node.js", "TypeScript", "MongoDB"],
    detail: {
      overview:
        "A front-end overhaul of an online art portfolio and storefront, driven by the client's design preferences.",
      sections: [
        {
          heading: "Responsibilities",
          list: [
            "Rebuilt the front-end with custom components in NextJS and Tailwind",
            "Translated client design preferences into a modern interface",
            "Improved performance across the portfolio and storefront",
          ],
        },
        {
          heading: "Outcomes",
          list: [
            "Improved user experience",
            "Increased site traffic and sales",
          ],
        },
      ],
      technologies: [
        "Next.js",
        "React",
        "Tailwind CSS",
        "Node.js",
        "TypeScript",
        "MongoDB",
      ],
    },
  },
  {
    id: "hotline-media",
    role: "Web Developer",
    company: "Hotline Media",
    period: {
      start: { iso: "2023", label: "2023" },
      end: { iso: "2024", label: "2024" },
    },
    summary:
      "Leveraging Webflow CMS, Javascript, and CSS. Developed a design plan to build an efficient and effective full-stack web application for Hotline Media, a startup content management media service.",
    tags: ["WebflowCMS", "JS", "Google Workspace"],
    detail: {
      overview:
        "Planned and built a web application for a startup content management media service.",
      sections: [
        {
          heading: "Responsibilities",
          list: [
            "Developed a design plan for the application",
            "Built the site on Webflow CMS with custom JavaScript and CSS",
          ],
        },
      ],
      technologies: ["Webflow CMS", "JavaScript", "CSS", "Google Workspace"],
    },
  },
];

/** Side B of Session Work: IT support and technician roles. */
export const SUPPORT_TIMELINE: TimelineEntry[] = [
  {
    id: "hotline-media-it",
    role: "IT Support Specialist",
    company: "Hotline Media",
    period: {
      start: { iso: "2023-11", label: "November 2023" },
      end: { iso: "2024-08", label: "August 2024" },
    },
    summary:
      "Implemented and ran Google Workspace for the company remotely: user provisioning, access control, security policy, and the training and documentation to go with it.",
    tags: ["Google Workspace", "IT Support"],
    detail: {
      overview: "Stood up and administered the company's Google Workspace.",
      sections: [
        {
          heading: "Responsibilities",
          list: [
            "Implemented and managed Google Workspace, streamlining user provisioning, access control and security policies",
            "Created and maintained user accounts, groups and permissions for role-based access",
            "Configured the Google Admin Console: 2FA enforcement, email security policies and Drive sharing restrictions",
            "Supported and trained employees on Gmail, Drive, Calendar and Meet",
            "Wrote IT documentation and best practices for Workspace usage and troubleshooting",
          ],
        },
      ],
      technologies: ["Google Workspace", "Google Admin Console", "2FA", "Gmail", "Google Drive"],
    },
  },
  {
    id: "hope-college",
    role: "IT Help Desk Technician",
    company: "Hope College",
    period: {
      start: { iso: "2017-05", label: "May 2017" },
      end: { iso: "2021-05", label: "May 2021" },
    },
    summary:
      "Level 1 & 2 support for macOS and iOS users across campus, device management with Jamf Pro, network troubleshooting, documentation and end-user training.",
    tags: ["macOS", "Jamf Pro", "Help Desk"],
    detail: {
      overview: "Campus help desk for macOS and iOS users, alongside a B.S. in Computer Science.",
      sections: [
        {
          heading: "Responsibilities",
          list: [
            "Provided Level 1 & 2 support for macOS and iOS users, resolving hardware and software issues",
            "Managed and deployed macOS devices with Jamf Pro, keeping them compliant with security policies",
            "Assisted with network troubleshooting: Wi-Fi, VPN, DNS and DHCP",
            "Created and maintained documentation for troubleshooting, onboarding and software installs",
            "Trained end users on best practices and efficient use of macOS",
          ],
        },
      ],
      technologies: ["macOS", "iOS", "Jamf Pro", "Wi-Fi", "VPN", "DNS", "DHCP"],
    },
  },
];

export const SUPPORT_SKILLS: { label: string; items: string[] }[] = [
  { label: "Operating systems", items: ["macOS", "iOS", "Windows", "Linux", "Ubuntu"] },
  {
    label: "Software & tools",
    items: ["Jamf Pro", "Apple Remote Desktop", "Microsoft 365", "Google Workspace", "Adobe Creative Suite"],
  },
  { label: "Networking", items: ["TCP/IP", "DNS", "DHCP", "VPN", "Wi-Fi troubleshooting"] },
  { label: "Hardware", items: ["MacBooks", "iMacs", "iPads", "Peripherals", "Printers"] },
  { label: "Scripting & automation", items: ["Bash", "Python", "AppleScript"] },
  { label: "IT support", items: ["Jira", "ServiceNow", "Zendesk", "User training", "Documentation"] },
];

export const TECH_STACK: ExpandableItem[] = [
  {
    id: "frontend",
    icon: "code",
    title: "React & Next.js",
    subtitle: "Frontend Engineering",
    detail: {
      overview:
        "My primary toolkit for fast, accessible, component-driven interfaces. I lean on the App Router, server components, and server actions where they simplify data flow.",
      sections: [
        {
          heading: "What I use it for",
          list: [
            "Custom component libraries built from client design specs",
            "Online ordering, reviews, and rewards flows",
            "Portfolio and storefront performance overhauls",
          ],
        },
        {
          heading: "Where I've used it",
          chips: ["Maison Matho", "Benduka Arts", "Hotline Media"],
        },
      ],
      technologies: [
        "React",
        "Next.js",
        "TypeScript",
        "Tailwind CSS",
        "Webflow",
      ],
    },
  },
  {
    id: "backend",
    icon: "dns",
    title: "Node.js & Express",
    subtitle: "Backend Services",
    detail: {
      overview:
        "Server-side services and APIs that stay simple to reason about: clear boundaries, validated input, and predictable error handling.",
      sections: [
        {
          heading: "What I use it for",
          list: [
            "REST API design and third-party integrations",
            "Realtime features, including this site's live cursors and Hot Potato game",
            "Server-side validation and moderation",
          ],
        },
        {
          heading: "Where I've used it",
          chips: ["DJ Together", "MizuMaiNichi", "This portfolio"],
        },
      ],
      technologies: ["Node.js", "Express", "TypeScript", "SpacetimeDB", "REST"],
    },
  },
  {
    id: "data",
    icon: "database",
    title: "PostgreSQL & MongoDB",
    subtitle: "Relational Data",
    detail: {
      overview:
        "I pick the store based on the shape of the data: relational when integrity and joins matter, documents when the schema is flexible and read-heavy.",
      sections: [
        {
          heading: "What I use it for",
          list: [
            "Schema design and migrations",
            "Hosted databases through Supabase",
            "Storing listening history and user preferences",
          ],
        },
        {
          heading: "Where I've used it",
          chips: ["Maison Matho", "DJ Together", "MizuMaiNichi"],
        },
      ],
      technologies: ["PostgreSQL", "MongoDB", "Supabase"],
    },
  },
  {
    id: "cloud",
    icon: "cloud",
    title: "AWS & K8s",
    subtitle: "Cloud Infrastructure",
    detail: {
      overview:
        "Deploying and operating services with containers and repeatable infrastructure, plus lightweight Vercel hosting for front-end projects.",
      sections: [
        {
          heading: "What I use it for",
          list: [
            "Containerized deployments on Kubernetes",
            "CI/CD pipelines and monitoring",
            "Vercel-hosted production sites",
          ],
        },
      ],
      technologies: [
        "AWS",
        "GCP",
        "Azure",
        "Kubernetes",
        "Docker",
        "Terraform",
      ],
    },
  },
];

export const PRACTICES: PracticeItem[] = [
  {
    id: "cicd",
    icon: "check_circle",
    title: "CI/CD & DevOps",
    subtitle: "Tools & Practices",
    summary: "GitHub Actions, Docker, Terraform, Prometheus monitoring.",
    detail: {
      overview:
        "Automating build, test, and deploy so shipping is routine, and watching production so problems surface before users report them.",
      sections: [
        {
          heading: "What I use it for",
          list: [
            "Automated build and test pipelines",
            "Containerized, reproducible deployments",
            "Infrastructure defined as code",
            "Metrics and monitoring",
          ],
        },
      ],
      technologies: ["GitHub Actions", "Docker", "Terraform", "Prometheus"],
    },
  },
  {
    id: "architecture",
    icon: "check_circle",
    title: "Architecture",
    subtitle: "Tools & Practices",
    summary: "Microservices, Event-Driven Design, RESTful APIs, GraphQL.",
    detail: {
      overview:
        "Choosing service boundaries and communication patterns that fit the problem rather than the trend.",
      sections: [
        {
          heading: "What I use it for",
          list: [
            "Decomposing systems into focused services",
            "Event-driven workflows",
            "Designing consistent, well-documented APIs",
          ],
        },
      ],
      technologies: ["Microservices", "Event-Driven Design", "REST", "GraphQL"],
    },
  },
  {
    id: "testing",
    icon: "check_circle",
    title: "Testing",
    subtitle: "Tools & Practices",
    summary: "Jest, Cypress, Go Testing, Integration & E2E pipelines.",
    detail: {
      overview:
        "Layered tests: fast unit checks for logic, integration tests for boundaries, and end-to-end runs for critical user flows.",
      sections: [
        {
          heading: "What I use it for",
          list: [
            "Unit tests for core logic",
            "Integration and end-to-end tests in CI",
          ],
        },
      ],
      technologies: ["Jest", "Cypress", "Go Testing"],
    },
  },
];
