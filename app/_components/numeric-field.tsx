"use client";

import { useCallback, useEffect, useId, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp } from "lucide-react";

/**
 * Interpreta texto con formato es-MX (miles con coma, decimales con punto).
 * En % el separador decimal puede ser coma (ej. 2,3).
 */
function parseLooseNumber(
  raw: string,
  variant: "decimal" | "integer" | "currency" | "percent"
): number {
  const s = raw.trim().replace(/\s/g, "");
  if (s === "" || s === "-" || s === ".") return NaN;

  if (variant === "percent") {
    const oneComma = s.replace(",", ".");
    const cleaned = oneComma.replace(/[^\d.-]/g, "");
    const n = parseFloat(cleaned);
    return Number.isFinite(n) ? n : NaN;
  }

  // Miles con coma (150,000), decimales con punto (150000.5)
  const normalized = s.replace(/,/g, "");
  const n = parseFloat(normalized);
  return Number.isFinite(n) ? n : NaN;
}

function formatDecimal(n: number, maxFrac: number): string {
  if (!Number.isFinite(n)) return "";
  return new Intl.NumberFormat("es-MX", {
    maximumFractionDigits: maxFrac,
    minimumFractionDigits: 0,
    useGrouping: true,
  }).format(n);
}

function blurFormat(
  value: number,
  variant: "decimal" | "integer" | "currency" | "percent",
  maxFractionDigits: number
): string {
  if (!Number.isFinite(value)) return "";
  if (variant === "percent") {
    return formatDecimal(value * 100, Math.min(6, maxFractionDigits + 2));
  }
  if (variant === "integer") {
    return new Intl.NumberFormat("es-MX", {
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
      useGrouping: true,
    }).format(Math.round(value));
  }
  return formatDecimal(value, maxFractionDigits);
}

function focusEditString(
  value: number,
  variant: "decimal" | "integer" | "currency" | "percent",
  maxFractionDigits: number
): string {
  if (!Number.isFinite(value)) return "";
  if (variant === "percent") {
    return String(value * 100).replace(".", ",");
  }
  if (variant === "integer") {
    return String(Math.round(value));
  }
  // Sin miles al editar; punto decimal (coherente con parseLooseNumber)
  return String(parseFloat(value.toFixed(maxFractionDigits)));
}

type Variant = "decimal" | "integer" | "currency" | "percent";

export function NumericField({
  id: idProp,
  label,
  value,
  onChange,
  hint,
  variant = "decimal",
  maxFractionDigits = 4,
  className,
  /** Etiqueta corta junto al campo (ej. sem, años). */
  unit,
  /** Botones +/− (usar con enteros o decimales discretos). */
  stepUpDown,
  compact = false,
}: {
  id?: string;
  label: string;
  value: number;
  onChange: (v: number) => void;
  hint?: string;
  variant?: Variant;
  maxFractionDigits?: number;
  className?: string;
  unit?: string;
  stepUpDown?: { step?: number; min?: number; max?: number };
  compact?: boolean;
}) {
  const uid = useId();
  const id = idProp ?? uid;
  const hintId = `${id}-hint`;
  const [text, setText] = useState(() => blurFormat(value, variant, maxFractionDigits));
  const [focused, setFocused] = useState(false);
  const step = stepUpDown?.step ?? (variant === "integer" ? 1 : 0.01);
  const min = stepUpDown?.min;
  const max = stepUpDown?.max;

  useEffect(() => {
    if (focused) return;
    setText(blurFormat(value, variant, maxFractionDigits));
  }, [value, focused, variant, maxFractionDigits]);

  const commit = useCallback(() => {
    const raw = text.trim();
    if (raw === "") {
      onChange(0);
      return;
    }
    let n = parseLooseNumber(raw, variant);
    if (variant === "percent") {
      n = (Number.isFinite(n) ? n : 0) / 100;
    }
    if (!Number.isFinite(n)) {
      n = 0;
    }
    if (variant === "integer") {
      n = Math.round(n);
    }
    if (min !== undefined) n = Math.max(min, n);
    if (max !== undefined) n = Math.min(max, n);
    onChange(n);
  }, [text, variant, onChange, min, max]);

  const bump = useCallback(
    (dir: 1 | -1) => {
      let n = Number.isFinite(value) ? value : 0;
      let delta = step;
      if (variant === "percent") {
        /* `step` en puntos porcentuales (ej. 0,1 → suma 0,001 al tipo) */
        delta = step / 100;
      } else if (variant === "integer") {
        delta = Math.max(1, Math.round(step));
      }
      n = n + dir * delta;
      if (variant === "integer") {
        n = Math.round(n);
      } else if (variant !== "percent") {
        const decimals = String(step).split(".")[1]?.length ?? 2;
        const f = Math.max(2, decimals);
        n = Math.round(n * 10 ** f) / 10 ** f;
      } else {
        n = Math.round(n * 10000) / 10000;
      }
      if (min !== undefined) {
        const bound = variant === "percent" ? min / 100 : min;
        n = Math.max(bound, n);
      }
      if (max !== undefined) {
        const bound = variant === "percent" ? max / 100 : max;
        n = Math.min(bound, n);
      }
      onChange(n);
      setText(blurFormat(n, variant, maxFractionDigits));
    },
    [value, step, variant, onChange, min, max, maxFractionDigits]
  );

  const borderRow = compact ? "min-h-9" : "min-h-10";

  const prefix =
    variant === "currency" ? (
      <span className={cn(
        "text-muted-foreground border-input flex shrink-0 items-center justify-center border-r bg-muted/30 font-medium select-none",
        compact ? "w-7 text-xs" : "w-8 text-sm",
      )}
      >
        $
      </span>
    ) : null;

  const percentSuffix =
    variant === "percent" ? (
      <span className={cn(
        "text-muted-foreground border-input flex shrink-0 items-center justify-center border-l bg-muted/30 font-medium select-none",
        compact ? "w-7 text-xs" : "w-8 text-sm",
      )}
      >
        %
      </span>
    ) : unit ? (
      <span className={cn(
        "text-muted-foreground border-input flex shrink-0 items-center border-l bg-muted/30 font-medium select-none",
        compact ? "px-2 text-[11px]" : "px-2.5 text-xs",
      )}
      >
        {unit}
      </span>
    ) : null;

  const showStepper = Boolean(stepUpDown);

  return (
    <div className={cn("group", compact ? "space-y-1" : "space-y-2", className)}>
      <Label
        htmlFor={id}
        className={cn(
          "text-muted-foreground block w-full font-medium leading-snug break-words",
          compact ? "text-xs leading-tight" : "text-sm",
        )}
      >
        {label}
      </Label>
      <div
        className={cn(
          "flex items-stretch overflow-hidden rounded-md border border-input bg-background transition-[box-shadow,border-color]",
          borderRow,
          "focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50",
        )}
      >
        {prefix}
        <Input
          id={id}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          aria-describedby={hint ? hintId : undefined}
          value={text}
          onFocus={() => {
            setFocused(true);
            setText(focusEditString(value, variant, maxFractionDigits));
          }}
          onChange={(e) => setText(e.target.value)}
          onBlur={() => {
            setFocused(false);
            commit();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              (e.target as HTMLInputElement).blur();
            }
          }}
          className={cn(
            "flex-1 min-w-0 rounded-none border-0 bg-transparent py-0 tabular-nums shadow-none focus-visible:ring-0",
            compact ? "h-9 text-sm md:h-9" : "h-10 text-sm md:h-10",
            prefix ? "pl-2" : "pl-3",
            showStepper || percentSuffix ? "pr-2" : "pr-3"
          )}
        />
        {percentSuffix}
        {showStepper ? (
          <div className="border-input flex shrink-0 flex-col border-l bg-muted/25">
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className="h-1/2 min-h-0 rounded-none border-b border-border px-0 hover:bg-muted/80"
              aria-label={`Aumentar ${label}`}
              onClick={() => bump(1)}
            >
              <ChevronUp className="size-3.5 opacity-70" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className="h-1/2 min-h-0 rounded-none px-0 hover:bg-muted/80"
              aria-label={`Disminuir ${label}`}
              onClick={() => bump(-1)}
            >
              <ChevronDown className="size-3.5 opacity-70" />
            </Button>
          </div>
        ) : null}
      </div>
      {hint ? (
        <p
          id={hintId}
          className={cn(
            "text-muted-foreground leading-snug",
            compact ? "text-[10px]" : "text-[11px] leading-relaxed",
          )}
        >
          {hint}
        </p>
      ) : null}
    </div>
  );
}
