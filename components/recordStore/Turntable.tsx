"use client";

import type { ReactNode } from "react";

/**
 * Turntable deck: plinth, platter, tonearm and a start/stop key.
 * The platter's mat is the measurable slot (`data-slot="platter"`) the
 * transition stage flies the vinyl into. Geometry is in a 130×100 box.
 */
export function Turntable({
  playing,
  armDown,
  onToggle,
  children,
  label,
}: {
  playing: boolean;
  armDown: boolean;
  onToggle?: () => void;
  children?: ReactNode;
  label: string;
}) {
  return (
    <div className="rs-deck" data-playing={playing} data-arm={armDown}>
      <div className="rs-deck-plinth">
        <div className="rs-deck-grain" />
        <div className="rs-platter">
          <div className="rs-platter-mat" data-slot="platter">
            {children}
          </div>
          <span className="rs-spindle" />
        </div>

        <svg
          className="rs-tonearm"
          viewBox="0 0 130 100"
          aria-hidden="true"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* base */}
          <circle cx="106" cy="18" r="9" className="rs-arm-base" />
          <g className="rs-arm">
            {/* counterweight */}
            <rect x="102.5" y="3" width="7" height="8" rx="1.5" className="rs-arm-weight" />
            <path d="M106 11 L106 70 L101.5 79" className="rs-arm-tube" />
            <rect
              x="97.5"
              y="77"
              width="7"
              height="9"
              rx="1"
              transform="rotate(28 101 81.5)"
              className="rs-arm-head"
            />
            <circle cx="106" cy="18" r="3.4" className="rs-arm-pivot" />
          </g>
          {/* arm rest */}
          <rect x="111" y="70" width="5" height="9" rx="1.5" className="rs-arm-rest" />
        </svg>

        <div className="rs-deck-controls">
          <span className="rs-deck-led" aria-hidden="true" />
          <button
            type="button"
            className="rs-deck-key"
            onClick={onToggle}
            aria-pressed={playing}
            aria-label={playing ? `Pause ${label}` : `Play ${label}`}
            disabled={!onToggle}
          >
            {playing ? "Stop" : "Start"}
          </button>
          <span className="rs-deck-speed" aria-hidden="true">
            33 · 45
          </span>
        </div>
      </div>
    </div>
  );
}
