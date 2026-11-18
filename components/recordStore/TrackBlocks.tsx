"use client";

import Image from "next/image";
import { Icon } from "@/components/ui/icon";
import { ThemeEditor } from "@/components/ui/themeEditor";
import ContactForm from "@/components/contactPage/contactForm";
import type { Block, WidgetId } from "@/util/records";

/** Renders one track's content blocks. Pure presentation, data-driven. */
export function TrackBlocks({ blocks }: { blocks: Block[] }) {
  return (
    <div className="rs-blocks">
      {blocks.map((b, i) => (
        <BlockView key={i} block={b} />
      ))}
    </div>
  );
}

function BlockView({ block: b }: { block: Block }) {
  switch (b.type) {
    case "lede":
      return <p className="rs-lede">{b.text}</p>;
    case "text":
      return <p className="rs-text">{b.text}</p>;
    case "heading":
      return <h4 className="rs-subhead">{b.text}</h4>;
    case "list":
      return (
        <ul className="rs-list">
          {b.items.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      );
    case "chips":
      return (
        <div className="rs-chips-wrap">
          {b.label && <span className="rs-kicker">{b.label}</span>}
          <ul className="rs-chips">
            {b.items.map((t) => (
              <li key={t} className="rs-chip">
                {t}
              </li>
            ))}
          </ul>
        </div>
      );
    case "pillars":
      return (
        <ul className="rs-pillars">
          {b.items.map((p) => (
            <li key={p.title} className="rs-pillar">
              <Icon name={p.icon} className="rs-pillar-icon" />
              <h4 className="rs-pillar-title">{p.title}</h4>
              <p className="rs-text">{p.text}</p>
            </li>
          ))}
        </ul>
      );
    case "stat":
      return (
        <div className="rs-stat">
          <span className="rs-stat-value">{b.value}</span>
          <span className="rs-kicker">{b.label}</span>
        </div>
      );
    case "project": {
      const p = b.project;
      return (
        <article className="rs-project">
          {p.image && (
            <div className="rs-project-media">
              <Image
                src={p.image}
                alt={`Screenshot of ${p.title}`}
                width={800}
                height={450}
                sizes="(min-width: 1024px) 50vw, 100vw"
                loading="lazy"
              />
            </div>
          )}
          <ul className="rs-chips">
            {p.tags.map((t) => (
              <li key={t} className="rs-chip">
                {t}
              </li>
            ))}
          </ul>
          <p className="rs-text">{p.description}</p>
          <div className="rs-actions">
            {p.link && (
              <a className="rs-action" href={p.link} target="_blank" rel="noreferrer">
                View project <Icon name="arrow_outward" />
              </a>
            )}
            {p.github && (
              <a className="rs-action rs-action--ghost" href={p.github} target="_blank" rel="noreferrer">
                Source <Icon name="code" />
              </a>
            )}
          </div>
        </article>
      );
    }
    case "credit": {
      const e = b.entry;
      return (
        <article className="rs-credit">
          <p className="rs-credit-meta">
            <span>{e.role}</span>
            <span aria-hidden="true">·</span>
            <span>
              <time dateTime={e.period.start.iso}>{e.period.start.label}</time>
              {" – "}
              {e.period.end ? (
                <time dateTime={e.period.end.iso}>{e.period.end.label}</time>
              ) : (
                "Present"
              )}
            </span>
          </p>
          <p className="rs-lede rs-lede--sm">{e.detail.overview}</p>
          <p className="rs-text">{e.summary}</p>
          {e.detail.sections.map((s) =>
            s.list ? (
              <div key={s.heading}>
                <h4 className="rs-subhead">{s.heading}</h4>
                <ul className="rs-list">
                  {s.list.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
            ) : null,
          )}
          <ul className="rs-chips">
            {e.detail.technologies.map((t) => (
              <li key={t} className="rs-chip">
                {t}
              </li>
            ))}
          </ul>
        </article>
      );
    }
    case "links":
      return (
        <ul className="rs-links">
          {b.items.map((l) => (
            <li key={l.href}>
              <a
                className="rs-link"
                href={l.href}
                target={l.href.startsWith("mailto:") ? undefined : "_blank"}
                rel="noreferrer"
              >
                <Icon name={l.icon} className="rs-link-icon" />
                <span className="rs-link-label">{l.label}</span>
                <span className="rs-link-value">{l.value}</span>
              </a>
            </li>
          ))}
        </ul>
      );
    case "widget":
      return <Widget id={b.widget} />;
  }
}

function Widget({ id }: { id: WidgetId }) {
  switch (id) {
    case "theme-console":
      // Reused as-is: writes to the shared SpacetimeDB theme tokens.
      return (
        <div className="rs-widget rs-widget--console">
          <ThemeEditor />
        </div>
      );
    case "contact-form":
      return (
        <div className="rs-widget rs-widget--form">
          <ContactForm />
        </div>
      );
    case "games":
      return (
        <p className="rs-note">
          <Icon name="sports_esports" /> Needs at least two visitors. Rounds are
          opt-in: only players who ready up can hold the bomb.
        </p>
      );
  }
}
