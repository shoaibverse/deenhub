import type { ReactNode } from "react";
import type { Bilingual } from "@/lib/i18n";
import { cn } from "@/lib/utils/cn";

/**
 * Renders a bilingual value with the English part LTR and the Arabic/Urdu
 * part in its own RTL span. The whole component is inline, so it can be
 * dropped inside a heading or a button without breaking the surrounding flow.
 */
export function Bilingual({
  value,
  className,
  separator = " · ",
}: {
  value: Bilingual | string;
  className?: string;
  separator?: string;
}) {
  if (typeof value === "string") return <>{value}</>;
  return (
    <span className={cn("inline-flex items-baseline gap-1", className)}>
      <span>{value.en}</span>
      {value.ar ? (
        <>
          <span aria-hidden="true" className="text-mute">
            {separator.trim() ? separator : ""}
          </span>
          <span lang="ur" dir="rtl" className="font-urdu">
            {value.ar}
          </span>
        </>
      ) : null}
    </span>
  );
}

/** Render a bilingual value to a plain string. */
export function bilingualString(value: Bilingual | string): string {
  if (typeof value === "string") return value;
  return value.ar ? `${value.en} · ${value.ar}` : value.en;
}

export function BilingualText({
  value,
  className,
}: {
  value: Bilingual | string;
  className?: string;
}) {
  if (typeof value === "string")
    return <p className={className}>{value}</p>;
  return (
    <p className={cn("leading-loose", className)}>
      <span>{value.en}</span>
      {value.ar ? (
        <>
          <span aria-hidden="true" className="mx-2 text-mute">
            ·
          </span>
          <span lang="ar" dir="rtl" className="font-arabic">
            {value.ar}
          </span>
        </>
      ) : null}
    </p>
  );
}

export function BilingualList({ items }: { items: Array<Bilingual | string> }): ReactNode {
  return (
    <>
      {items.map((item, index) => (
        <span key={index}>
          <Bilingual value={item} />
          {index < items.length - 1 ? <span aria-hidden="true">, </span> : null}
        </span>
      ))}
    </>
  );
}
