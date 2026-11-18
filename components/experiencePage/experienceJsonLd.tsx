import { JsonLd } from "@/components/ui/jsonLd";
import { siteConfig } from "@/util/siteConfig";
import { PRACTICES, TECH_STACK } from "@/util/experienceData";

export default function ExperienceJsonLd() {
  const pageUrl = `${siteConfig.url}/experience`;
  const personId = `${siteConfig.url}/#person`;

  const knowsAbout = [
    ...new Set(
      [...TECH_STACK, ...PRACTICES].flatMap((i) => i.detail.technologies),
    ),
  ];

  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "ProfilePage",
            "@id": `${pageUrl}#webpage`,
            url: pageUrl,
            name: "Experience & Tech Stack",
            mainEntity: { "@id": personId },
          },
          {
            "@type": "Person",
            "@id": personId,
            name: siteConfig.author,
            url: siteConfig.url,
            jobTitle: "Full-Stack Engineer",
            sameAs: siteConfig.sameAs,
            knowsAbout,
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: siteConfig.url,
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Experience",
                item: pageUrl,
              },
            ],
          },
        ],
      }}
    />
  );
}
