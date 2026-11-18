export function Icon({
  name,
  className = "",
}: {
  name: string;
  className?: string;
}) {
  // Decorative: hidden from screen readers/translators so ligature text
  // like "open_in_full" is never read or indexed as page content.
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      aria-hidden="true"
      translate="no"
    >
      {name}
    </span>
  );
}
