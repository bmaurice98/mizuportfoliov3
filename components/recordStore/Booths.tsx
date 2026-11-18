"use client";

import { RECORDS_BY_ID } from "@/util/records";
import type { Listener } from "@/components/realtime/listening";

/**
 * Social bits of the shop: who else is playing what, and opt-in follow mode
 * (your turntable follows another visitor's record and track).
 */

const MAX_BOOTHS = 3;

function Dot({ color }: { color: string }) {
  return <span className="rs-who-dot" style={{ background: color }} aria-hidden="true" />;
}

/** On the shop floor: "Sneaky Fox is playing Discography — Join · Follow". */
export function ListeningBooths({
  listeners,
  onFollow,
}: {
  listeners: Listener[];
  onFollow: (l: Listener) => void;
}) {
  if (!listeners.length) return null;
  const shown = listeners.slice(0, MAX_BOOTHS);
  return (
    <div className="rs-booths" aria-label="Other visitors' turntables">
      <p className="rs-kicker">Now spinning in the shop</p>
      <ul>
        {shown.map((l) => (
          <li key={l.id}>
            <Dot color={l.color} />
            <span className="rs-who-name">{l.name}</span>
            <span className="rs-who-what">
              is playing <em>{RECORDS_BY_ID[l.record]?.title ?? l.record}</em>
            </span>
            <button type="button" className="rs-who-btn" onClick={() => onFollow(l)}>
              Follow
            </button>
          </li>
        ))}
      </ul>
      {listeners.length > MAX_BOOTHS && (
        <p className="rs-booths-more">+{listeners.length - MAX_BOOTHS} more listening</p>
      )}
    </div>
  );
}

/** In the listening room: who's here, who's elsewhere, and follow status. */
export function FollowBar({
  following,
  leader,
  here,
  others,
  onFollow,
}: {
  following: { id: string; name: string } | null;
  leader: Listener | undefined;
  here: Listener[];
  others: Listener[];
  onFollow: (l: Listener | null) => void;
}) {
  if (!following && !here.length && !others.length) return null;
  return (
    <div className="rs-followbar">
      {following && (
        <p className="rs-follow-status" aria-live="polite">
          <span>
            {leader ? (
              <>
                <Dot color={leader.color} /> Following <strong>{following.name}</strong>
              </>
            ) : (
              <>
                <strong>{following.name}</strong> is back at the crates — you&apos;ll
                follow their next record
              </>
            )}
          </span>
          <button type="button" className="rs-who-btn" onClick={() => onFollow(null)}>
            Stop
          </button>
        </p>
      )}
      {here.length > 0 && (
        <div className="rs-who-row">
          <span className="rs-kicker">Also listening</span>
          <ul>
            {here.map((l) => (
              <li key={l.id}>
                <Dot color={l.color} />
                {l.name}
                {following?.id !== l.id && (
                  <button type="button" className="rs-who-btn" onClick={() => onFollow(l)}>
                    Follow
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
      {others.length > 0 && (
        <div className="rs-who-row">
          <span className="rs-kicker">Elsewhere</span>
          <ul>
            {others.slice(0, MAX_BOOTHS).map((l) => (
              <li key={l.id}>
                <Dot color={l.color} />
                {l.name} · {RECORDS_BY_ID[l.record]?.title ?? l.record}
                {following?.id !== l.id && (
                  <button type="button" className="rs-who-btn" onClick={() => onFollow(l)}>
                    Follow
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
