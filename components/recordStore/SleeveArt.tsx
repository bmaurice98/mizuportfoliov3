import type { RecordDef } from "@/util/records";

/**
 * Procedural album covers (SVG, 100×100 user units). Each record gets a
 * distinct identity without shipping any image assets; text scales with the
 * sleeve because it lives in the same viewBox.
 */
export function SleeveArt({ record }: { record: RecordDef }) {
  const { paper, ink, accent, accent2 } = record.palette;
  return (
    <svg
      viewBox="0 0 100 100"
      className="rs-art"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid slice"
    >
      <rect width="100" height="100" fill={paper} />
      <Motif record={record} />
      <Credits record={record} ink={ink} accent={accent} accent2={accent2} />
    </svg>
  );
}

function Credits({
  record,
  ink,
  accent,
}: {
  record: RecordDef;
  ink: string;
  accent: string;
  accent2: string;
}) {
  const kind = record.art.kind;
  if (kind === "type") return null; // the motif *is* the typography
  const font =
    kind === "sunrise" || kind === "rings" || kind === "notebook" || kind === "contact-sheet"
      ? "var(--font-rs-serif), Georgia, serif"
      : kind === "schematic"
        ? "var(--font-rs-mono), monospace"
        : kind === "riso"
          ? "var(--font-rs-syne), sans-serif"
          : "var(--font-rs-grotesk), sans-serif";
  const italic = kind === "rings" || kind === "notebook";
  const upper = kind === "grid" || kind === "schematic" || kind === "bars";
  return (
    <g fill={ink}>
      <text
        x="7"
        y="14"
        style={{ fontFamily: font }}
        fontSize={kind === "riso" ? 13 : 10.5}
        fontWeight={kind === "riso" ? 800 : 600}
        fontStyle={italic ? "italic" : "normal"}
        letterSpacing={upper ? 0.6 : -0.2}
      >
        {upper ? record.title.toUpperCase() : record.title}
      </text>
      <text
        x="7"
        y="21"
        style={{ fontFamily: "var(--font-rs-mono), monospace" }}
        fontSize="3.4"
        letterSpacing="0.8"
        opacity="0.8"
      >
        {record.artist.toUpperCase()} · {record.format}
      </text>
      <text
        x="93"
        y="94"
        textAnchor="end"
        style={{ fontFamily: "var(--font-rs-mono), monospace" }}
        fontSize="3"
        letterSpacing="0.6"
        fill={accent}
      >
        {record.catalog}
      </text>
    </g>
  );
}

function Motif({ record }: { record: RecordDef }) {
  const { ink, accent, accent2, paper } = record.palette;
  switch (record.art.kind) {
    case "sunrise":
      return (
        <g>
          {[46, 40, 34, 28, 22, 16, 10].map((r, i) => (
            <circle
              key={r}
              cx="50"
              cy="100"
              r={r}
              fill={i % 2 ? accent2 : accent}
              opacity={1 - i * 0.04}
            />
          ))}
          <rect x="0" y="99" width="100" height="1" fill={ink} />
          {Array.from({ length: 6 }, (_, i) => (
            <rect
              key={i}
              x="0"
              y={58 + i * 6.2}
              width="100"
              height={1.4 + i * 0.35}
              fill={paper}
            />
          ))}
        </g>
      );
    case "grid": {
      const lines = [];
      for (let i = 0; i <= 12; i++) {
        const x = -60 + i * 18.3;
        lines.push(
          <line
            key={`v${i}`}
            x1="50"
            y1="52"
            x2={x}
            y2="100"
            stroke={accent2}
            strokeWidth="0.35"
            opacity="0.7"
          />,
        );
      }
      for (let i = 0; i < 8; i++) {
        const y = Math.round((52 + Math.pow(i / 7, 1.8) * 48) * 100) / 100;
        lines.push(
          <line
            key={`h${i}`}
            x1="0"
            y1={y}
            x2="100"
            y2={y}
            stroke={accent2}
            strokeWidth="0.35"
            opacity="0.7"
          />,
        );
      }
      return (
        <g>
          <rect x="0" y="0" width="100" height="52" fill={paper} />
          <circle cx="68" cy="40" r="17" fill={accent} />
          {[0, 1, 2, 3, 4].map((i) => (
            <rect
              key={i}
              x="48"
              y={38 + i * 3.4}
              width="40"
              height={1.2 + i * 0.25}
              fill={paper}
            />
          ))}
          {lines}
        </g>
      );
    }
    case "rings":
      return (
        <g fill="none">
          {Array.from({ length: 9 }, (_, i) => (
            <circle
              key={i}
              cx="64"
              cy="62"
              r={6 + i * 5}
              stroke={i % 3 === 0 ? accent : accent2}
              strokeWidth={i % 3 === 0 ? 1.6 : 0.8}
              opacity={1 - i * 0.07}
            />
          ))}
          <circle cx="64" cy="62" r="4" fill={accent} />
        </g>
      );
    case "schematic":
      return (
        <g stroke={accent2} strokeWidth="0.7" fill="none">
          <path d="M8 34 H40 V58 H70 V82 H92" />
          <path d="M8 46 H28 V70 H52 V92" />
          <path d="M60 30 V48 H88" />
          <path d="M18 88 H34" strokeDasharray="1.5 1.5" />
          <rect x="40" y="52" width="18" height="12" />
          <rect x="70" y="44" width="10" height="8" />
          {[
            [40, 34],
            [70, 58],
            [28, 46],
            [52, 70],
            [60, 30],
            [88, 48],
            [92, 82],
          ].map(([x, y]) => (
            <circle
              key={`${x}-${y}`}
              cx={x}
              cy={y}
              r="1.6"
              fill={accent}
              stroke="none"
            />
          ))}
          <text
            x="7"
            y="28"
            fill={ink}
            stroke="none"
            style={{ fontFamily: "var(--font-rs-mono), monospace" }}
            fontSize="2.6"
            opacity="0.7"
          >
            fig. 04 — signal path
          </text>
        </g>
      );
    case "riso":
      return (
        <g style={{ mixBlendMode: "multiply" }}>
          <path
            d="M22 40 C10 58 20 92 50 90 C80 88 94 66 84 48 C74 30 34 22 22 40 Z"
            fill={accent}
          />
          <path
            d="M40 30 C20 34 24 70 46 76 C70 82 92 60 80 40 C70 24 56 27 40 30 Z"
            fill={accent2}
            opacity="0.85"
          />
          <text
            x="50"
            y="72"
            textAnchor="middle"
            style={{ fontFamily: "var(--font-rs-syne), sans-serif" }}
            fontWeight="800"
            fontSize="30"
            fill={ink}
            opacity="0.9"
          >
            B
          </text>
        </g>
      );
    case "contact-sheet": {
      // A strip of film frames with sprocket holes.
      const frames = [0, 1, 2, 3];
      return (
        <g>
          <rect x="0" y="30" width="100" height="58" fill="#050404" />
          {Array.from({ length: 14 }, (_, i) => (
            <g key={i} fill={paper}>
              <rect x={2 + i * 7.2} y="32.5" width="3.4" height="2.6" rx="0.6" />
              <rect x={2 + i * 7.2} y="83" width="3.4" height="2.6" rx="0.6" />
            </g>
          ))}
          {frames.map((i) => (
            <g key={i}>
              <rect x={4 + i * 24} y="38" width="21" height="42" fill={i === 1 ? accent : "#2b2321"} />
              <circle cx={14.5 + i * 24} cy={52 + (i % 2) * 8} r={4 + i} fill={accent2} opacity={i === 1 ? 0.9 : 0.25} />
              <text
                x={5 + i * 24}
                y="78"
                fontSize="2.6"
                fill={accent2}
                opacity="0.7"
                style={{ fontFamily: "var(--font-rs-mono), monospace" }}
              >
                {`${12 + i}A`}
              </text>
            </g>
          ))}
          <rect x="27" y="36" width="25" height="46" fill="none" stroke={accent} strokeWidth="1" />
        </g>
      );
    }
    case "notebook":
      return (
        <g>
          {Array.from({ length: 13 }, (_, i) => (
            <line key={i} x1="0" x2="100" y1={28 + i * 5.6} y2={28 + i * 5.6} stroke={accent2} strokeWidth="0.35" />
          ))}
          <line x1="14" x2="14" y1="0" y2="100" stroke={accent} strokeWidth="0.5" />
          <g fill="none" stroke={ink} strokeWidth="0.9" strokeLinecap="round">
            <path d="M20 44 q6 -4 12 0 t12 0 t12 0" />
            <path d="M20 55.6 q5 -3 10 0 t10 0" />
            <path d="M20 67 l8 0 M32 67 l18 0" />
          </g>
          <g fill={accent}>
            <circle cx="7" cy="40" r="1.6" />
            <circle cx="7" cy="60" r="1.6" />
            <circle cx="7" cy="80" r="1.6" />
          </g>
          <text
            x="62"
            y="88"
            fill={ink}
            fontSize="5"
            transform="rotate(-6 62 88)"
            style={{ fontFamily: "var(--font-rs-serif), Georgia, serif", fontStyle: "italic" }}
          >
            v3 notes
          </text>
        </g>
      );
    case "bars": {
      const heights = [18, 30, 44, 26, 52, 38, 60, 34, 22, 46, 30, 16];
      return (
        <g>
          {heights.map((h, i) => (
            <rect
              key={i}
              x={6 + i * 7.6}
              y={92 - h}
              width="5"
              height={h}
              rx="1"
              fill={i % 3 === 1 ? accent : accent2}
              opacity={0.55 + (h / 60) * 0.45}
            />
          ))}
          <circle cx="78" cy="34" r="8" fill="none" stroke={accent} strokeWidth="1.2" />
          <circle cx="78" cy="34" r="2" fill={accent} />
        </g>
      );
    }
    case "type":
      return (
        <g
          fill={ink}
          style={{ fontFamily: "Inter, var(--font-geist-sans), sans-serif" }}
          fontWeight="800"
        >
          <text x="6" y="38" fontSize="29" letterSpacing="-1.6">
            CON
          </text>
          <text x="6" y="66" fontSize="29" letterSpacing="-1.6">
            TACT
          </text>
          <circle cx="88" cy="60" r="4.2" fill={accent} />
          <text
            x="7"
            y="90"
            fontSize="3.4"
            fontWeight="500"
            letterSpacing="0.8"
            style={{ fontFamily: "var(--font-rs-mono), monospace" }}
          >
            {record.artist.toUpperCase()} · {record.catalog}
          </text>
        </g>
      );
  }
}
