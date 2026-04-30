function cx(...c: (string | false | undefined)[]) {
    return c.filter(Boolean).join(" ");
}


export function Out({
    label,
    value,
    emphasis,
    hint,
  }: {
    label: string;
    value: string;
    emphasis?: boolean;
    /** Texto auxiliar debajo de la etiqueta (p. ej. fórmula en una línea). */
    hint?: string;
  }) {
    return (
      <div
        className={cx(
          "flex min-w-0 items-start justify-between gap-3 rounded-md border px-3 py-2.5 transition-colors sm:gap-4 sm:px-3.5",
          emphasis
            ? "border-primary/25 bg-muted/50"
            : "border-border bg-muted/30"
        )}
      >
        <div className="min-w-0 flex-1 sm:max-w-[75%]">
          <p
            className={cx(
              "text-xs leading-snug font-medium",
              emphasis ? "text-foreground" : "text-muted-foreground"
            )}
          >
            {label}
          </p>
          {hint ? (
            <p className="text-muted-foreground mt-0.5 text-[10px] leading-snug">{hint}</p>
          ) : null}
        </div>
        <p className="min-w-0 shrink text-right font-mono text-sm font-semibold tabular-nums tracking-tight break-words text-foreground">
          {value}
        </p>
      </div>
    );
  }