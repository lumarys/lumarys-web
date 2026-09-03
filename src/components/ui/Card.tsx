import type { ReactNode } from "react";
import { cx } from "@/lib/utils";

export function Card({
  children,
  className,
  destaque = false,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  destaque?: boolean;
  as?: "div" | "section" | "article" | "li";
}) {
  return (
    <Tag
      className={cx(
        "rounded-2xl border bg-[var(--surface)] p-4",
        destaque ? "border-[var(--accent)]/40" : "border-[var(--border)]",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

export function Rotulo({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cx("text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]", className)}>
      {children}
    </p>
  );
}

export function RotuloAcento({ children }: { children: ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--accent)]">
      {children}
    </p>
  );
}
