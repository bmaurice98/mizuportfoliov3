import { JsonLd } from "@/components/ui/jsonLd";
import { siteConfig } from "@/util/siteConfig";
import { PRACTICES, TECH_STACK } from "@/util/experienceData";

/** Structured data for the home page (moved here from the old /experience page). */
export function StoreJsonLd() {
  const personId = `${siteConfig.url}/#person`;
  const knowsAbout = [
    ...new Set([...TECH_STACK, ...PRACTICES].flatMap((i) => i.detail.technologies)),
  ];

  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "WebSite",
            "@id": `${siteConfig.url}/#website`,
            url: siteConfig.url,
            name: siteConfig.name,
            author: { "@id": personId },
          },
          {
            "@type": "ProfilePage",
            "@id": `${siteConfig.url}/#webpage`,
            url: siteConfig.url,
            name: `${siteConfig.name} — Portfolio`,
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
        ],
      }}
    />
  );
}
