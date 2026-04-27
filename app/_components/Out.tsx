function cx(...c: (string | false | undefined)[]) {
    return c.filter(Boolean).join(" ");
}


export function Out({
    label,
    value,
    emphasis,
  }: {
    label: string;
    value: string;
    emphasis?: boolean;
  }) {
    return (
      <div
        className={cx(
          "flex items-start justify-between gap-3 rounded-md border px-3 py-2.5 transition-colors sm:gap-4 sm:px-3.5",
          emphasis
            ? "border-primary/25 bg-muted/50"
            : "border-border bg-muted/30"
        )}
      >
        <p
          className={cx(
            "max-w-[75%] text-xs leading-snug font-medium",
            emphasis ? "text-foreground" : "text-muted-foreground"
          )}
        >
          {label}
        </p>
        <p className="shrink-0 text-right font-mono text-sm font-semibold tabular-nums tracking-tight text-foreground">
          {value}
        </p>
      </div>
    );
  }