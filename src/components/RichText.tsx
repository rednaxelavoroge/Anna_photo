import type { ReactNode } from "react";

/**
 * Текст из панели с простым выделением: `**жирный**`. Ничего больше не
 * разбирается — заказчице нужно только выделить две фразы в биографии.
 */
export function RichText({ text }: { text: string }) {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  const nodes: ReactNode[] = parts.map((part, index) =>
    index % 2 === 1 ? (
      <strong key={index} className="font-semibold text-ink">
        {part}
      </strong>
    ) : (
      part
    ),
  );
  return <>{nodes}</>;
}
