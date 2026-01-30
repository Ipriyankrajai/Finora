"use client";

import * as React from "react";
import { HexColorInput, HexColorPicker } from "react-colorful";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const PRESET_COLORS = [
  "#ef4444", // red
  "#f97316", // orange
  "#eab308", // yellow
  "#22c55e", // green
  "#14b8a6", // teal
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#6b7280", // gray
  "#78716c", // stone
  "#0ea5e9", // sky
  "#a855f7", // purple
] as const;

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  className?: string;
}

function ColorPicker({ value, onChange, className }: ColorPickerProps) {
  const [showCustom, setShowCustom] = React.useState(false);

  return (
    <div className={cn("space-y-3", className)}>
      {/* Preset colors grid (6x2) */}
      <div className="grid grid-cols-6 gap-2">
        {PRESET_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            className={cn(
              "size-8 rounded-md transition-all",
              "ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
              value.toLowerCase() === color.toLowerCase() &&
                "ring-2 ring-ring ring-offset-2",
            )}
            style={{ backgroundColor: color }}
            onClick={() => onChange(color)}
            aria-label={`Select color ${color}`}
          />
        ))}
      </div>

      {/* Custom color toggle */}
      {!showCustom ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => setShowCustom(true)}
        >
          Custom color...
        </Button>
      ) : (
        <div className="space-y-3">
          <HexColorPicker
            color={value}
            onChange={onChange}
            className="!w-full"
          />
          <div className="flex items-center gap-2">
            <div
              className="size-8 shrink-0 rounded-md ring-1 ring-border"
              style={{ backgroundColor: value }}
            />
            <div className="relative flex-1">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                #
              </span>
              <HexColorInput
                color={value}
                onChange={onChange}
                prefixed={false}
                className={cn(
                  "h-8 w-full rounded-none border border-border bg-background pl-5 pr-2 text-xs",
                  "focus:outline-none focus:ring-1 focus:ring-ring",
                )}
              />
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-full"
            onClick={() => setShowCustom(false)}
          >
            Show presets
          </Button>
        </div>
      )}
    </div>
  );
}

export { ColorPicker, PRESET_COLORS };
export type { ColorPickerProps };
