"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";

type ClassValue =
  | ClassArray
  | ClassDictionary
  | string
  | number
  | bigint
  | null
  | boolean
  | undefined;
type ClassDictionary = Record<string, any>;
type ClassArray = ClassValue[];
function clsx(...inputs: ClassValue[]): string {
  return inputs.filter(Boolean).join(" ");
}

type hsl = {
  h: number;
  s: number;
  l: number;
  a: number; // alpha (0-100)
};

type hex = {
  hex: string;
};
type Color = hsl & hex;

const HashtagIcon = (props: React.ComponentPropsWithoutRef<"svg">) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
      <path
        fillRule="evenodd"
        d="M11.097 1.515a.75.75 0 0 1 .589.882L10.666 7.5h4.47l1.079-5.397a.75.75 0 1 1 1.47.294L16.665 7.5h3.585a.75.75 0 0 1 0 1.5h-3.885l-1.2 6h3.585a.75.75 0 0 1 0 1.5h-3.885l-1.08 5.397a.75.75 0 1 1-1.47-.294l1.02-5.103h-4.47l-1.08 5.397a.75.75 0 1 1-1.47-.294l1.02-5.103H3.75a.75.75 0 0 1 0-1.5h3.885l1.2-6H5.25a.75.75 0 0 1 0-1.5h3.885l1.08-5.397a.75.75 0 0 1 .882-.588ZM10.365 9l-1.2 6h4.47l1.2-6h-4.47Z"
        clipRule="evenodd"
      />
    </svg>
  );
};

function hslToHex({ h, s, l, a }: hsl) {
  s /= 100;
  l /= 100;

  const k = (n: number) => (n + h / 30) % 12;
  const alpha = s * Math.min(l, 1 - l);
  const f = (n: number) =>
    l - alpha * Math.max(Math.min(k(n) - 3, 9 - k(n), 1), -1);
  let r = Math.round(255 * f(0));
  let g = Math.round(255 * f(8));
  let b = Math.round(255 * f(4));

  const toHex = (x: number) => {
    const hex = x.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };

  const alphaHex = Math.round((a / 100) * 255);
  return `${toHex(r)}${toHex(g)}${toHex(b)}${toHex(alphaHex)}`.toUpperCase();
}

function hslToRgba({ h, s, l, a }: hsl): string {
  return `hsla(${h}, ${s}%, ${l}%, ${a / 100})`;
}

function hexToHsl({ hex }: hex): hsl {
  // Ensure the hex string is formatted properly
  hex = hex.replace(/^#/, "");

  // Handle 3-digit hex
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((char) => char + char)
      .join("");
  }

  // Extract alpha if present (8-digit hex)
  let alpha = 100;
  if (hex.length === 8) {
    alpha = Math.round((parseInt(hex.slice(6, 8), 16) / 255) * 100);
    hex = hex.slice(0, 6);
  }

  // Pad with zeros if incomplete
  while (hex.length < 6) {
    hex += "0";
  }

  // Convert hex to RGB
  let r = parseInt(hex.slice(0, 2), 16) || 0;
  let g = parseInt(hex.slice(2, 4), 16) || 0;
  let b = parseInt(hex.slice(4, 6), 16) || 0;

  // Then convert RGB to HSL
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s: number;
  let l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
    h *= 360;
  }

  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100), a: alpha };
}

const DraggableColorCanvas = ({
  h,
  s,
  l,
  a,
  handleChange,
}: hsl & {
  handleChange: (e: Partial<Color>) => void;
}) => {
  const [dragging, setDragging] = useState(false);
  const colorAreaRef = useRef<HTMLDivElement>(null);

  const calculateSaturationAndLightness = useCallback(
    (clientX: number, clientY: number) => {
      if (!colorAreaRef.current) return;
      const rect = colorAreaRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      const xClamped = Math.max(0, Math.min(x, rect.width));
      const yClamped = Math.max(0, Math.min(y, rect.height));
      const newSaturation = Math.round((xClamped / rect.width) * 100);
      const newLightness = 100 - Math.round((yClamped / rect.height) * 100);
      handleChange({ s: newSaturation, l: newLightness });
    },
    [handleChange],
  );

  // Mouse event handlers
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      e.preventDefault();
      calculateSaturationAndLightness(e.clientX, e.clientY);
    },
    [calculateSaturationAndLightness],
  );

  const handleMouseUp = useCallback(() => {
    setDragging(false);
  }, []);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(true);
    calculateSaturationAndLightness(e.clientX, e.clientY);
  };

  // Touch event handlers
  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      if (touch) {
        calculateSaturationAndLightness(touch.clientX, touch.clientY);
      }
    },
    [calculateSaturationAndLightness],
  );

  const handleTouchEnd = useCallback(() => {
    setDragging(false);
  }, []);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    const touch = e.touches[0];
    if (touch) {
      setDragging(true);
      calculateSaturationAndLightness(touch.clientX, touch.clientY);
    }
  };

  useEffect(() => {
    if (dragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", handleTouchMove, { passive: false });
      window.addEventListener("touchend", handleTouchEnd);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [
    dragging,
    handleMouseMove,
    handleMouseUp,
    handleTouchMove,
    handleTouchEnd,
  ]);

  return (
    <div
      ref={colorAreaRef}
      className="h-48 w-full touch-auto overscroll-none rounded-xl border border-zinc-200 dark:touch-auto dark:border-zinc-700"
      style={{
        background: `linear-gradient(to top, #000, transparent, #fff), linear-gradient(to left, hsl(${h}, 100%, 50%), #bbb)`,
        position: "relative",
        cursor: "crosshair",
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      <div
        className="color-selector border-4 border-white ring-1 ring-zinc-200 dark:border-zinc-900 dark:ring-zinc-700"
        style={{
          position: "absolute",
          width: "20px",
          height: "20px",
          borderRadius: "50%",
          background: `hsl(${h}, ${s}%, ${l}%)`,
          transform: "translate(-50%, -50%)",
          left: `${s}%`,
          top: `${100 - l}%`,
          cursor: dragging ? "grabbing" : "grab",
        }}
      ></div>
    </div>
  );
};

function sanitizeHex(val: string) {
  const sanitized = val.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  return sanitized;
}

interface ColorPickerProps {
  default_value?: string;
  onChange?: (color: string) => void;
  label?: string;
}

const ColorPicker = ({ default_value = "#1C9488FF", onChange, label }: ColorPickerProps) => {
  // Initialize from controlled prop or a default
  const [color, setColor] = useState<Color>(() => {
    // 如果是 HSLA 格式，先转换为 hex
    let hexValue = default_value;
    if (default_value.startsWith('hsla(') || default_value.startsWith('hsl(')) {
      // 解析 HSLA 格式: hsla(h, s%, l%, a)
      const match = default_value.match(/hsla?\((\d+),\s*(\d+)%,\s*(\d+)%(?:,\s*([\d.]+))?\)/);
      if (match) {
        const h = parseInt(match[1]);
        const s = parseInt(match[2]);
        const l = parseInt(match[3]);
        const a = match[4] ? Math.round(parseFloat(match[4]) * 100) : 100;
        hexValue = hslToHex({ h, s, l, a });
      }
    }
    const hex = sanitizeHex(hexValue);
    const hsl = hexToHsl({ hex: hex });
    return { ...hsl, hex: sanitizeHex(hex) };
  });
  
  // Notify parent of color changes
  useEffect(() => {
    if (onChange) {
      onChange(hslToRgba(color));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [color.h, color.s, color.l, color.a]);
  
  // Update from hex input
  const handleHexInputChange = (newVal: string) => {
    const hex = sanitizeHex(newVal);
    if (hex.length === 6 || hex.length === 8) {
      const hsl = hexToHsl({ hex });
      setColor({ ...hsl, hex: hex });
    } else if (hex.length < 8) {
      setColor((prev) => ({ ...prev, hex: hex }));
    }
  };
  
  return (
    <>
      <style
        id="slider-thumb-style"
        dangerouslySetInnerHTML={{
          __html: `
              input[type='range']::-webkit-slider-thumb {
                -webkit-appearance: none;
                appearance: none;
                width: 18px; 
                height: 18px;
                background: transparent;
                border: 4px solid #FFFFFF;
                box-shadow: 0 0 0 1px #e4e4e7; 
                cursor: pointer;
                border-radius: 50%;
              }
              input[type='range']::-moz-range-thumb {
                width: 18px;
                height: 18px;
                cursor: pointer;
                border-radius: 50%;
                background: transparent;
                border: 4px solid #FFFFFF;
                box-shadow: 0 0 0 1px #e4e4e7;
              }
              input[type='range']::-ms-thumb {
                width: 18px;
                height: 18px;
                background: transparent;
                cursor: pointer;
                border-radius: 50%;
                border: 4px solid #FFFFFF;
                box-shadow: 0 0 0 1px #e4e4e7;
              }
    
              .dark input[type='range']::-webkit-slider-thumb {
                border: 4px solid rgb(24 24 27);
                box-shadow: 0 0 0 1px #3f3f46; 
              }
              .dark input[type='range']::-moz-range-thumb {
                border: 4px solid rgb(24 24 27);
                box-shadow: 0 0 0 1px #3f3f46; 
              }
              .dark input[type='range']::-ms-thumb {
                border: 4px solid rgb(24 24 27);
                box-shadow: 0 0 0 1px #3f3f46; 
              }
              `,
        }}
      />
      <div
        style={
          {
            "--thumb-border-color": "#000000",
            "--thumb-ring-color": "#666666",
          } as React.CSSProperties
        }
        className="z-30 flex w-full max-w-[300px] select-none flex-col items-center gap-3 overscroll-none rounded-2xl border border-zinc-200 bg-white p-4 shadow-md dark:border-zinc-700 dark:bg-zinc-900"
      >
        {label && <div className="text-sm font-medium text-zinc-700 dark:text-zinc-300 w-full">{label}</div>}
        <DraggableColorCanvas
          {...color}
          handleChange={(parital) => {
            setColor((prev) => {
              const value = { ...prev, ...parital };
              const hex_formatted = hslToHex({
                h: value.h,
                s: value.s,
                l: value.l,
                a: value.a,
              });
              return { ...value, hex: hex_formatted };
            });
          }}
        />
        <input
          type="range"
          min="0"
          max="360"
          value={color.h}
          className="dark:border-zinc-7000 h-3 w-full cursor-pointer appearance-none rounded-full border border-zinc-200 bg-white text-white placeholder:text-white dark:border-zinc-700"
          style={{
            background: `linear-gradient(to right, 
                    hsl(0, 100%, 50%), 
                    hsl(60, 100%, 50%), 
                    hsl(120, 100%, 50%), 
                    hsl(180, 100%, 50%), 
                    hsl(240, 100%, 50%), 
                    hsl(300, 100%, 50%), 
                    hsl(360, 100%, 50%))`,
          }}
          onChange={(e) => {
            const hue = e.target.valueAsNumber;
            setColor((prev) => {
              const { hex, ...rest } = { ...prev, h: hue };
              const hex_formatted = hslToHex({ ...rest });
              return { ...rest, hex: hex_formatted };
            });
          }}
        />
        <div className="w-full">
          <div className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">Opacity: {color.a}%</div>
          <input
            type="range"
            min="0"
            max="100"
            value={color.a}
            className="h-3 w-full cursor-pointer appearance-none rounded-full border border-zinc-200 dark:border-zinc-700"
            style={{
              background: `linear-gradient(to right, 
                      hsla(${color.h}, ${color.s}%, ${color.l}%, 0), 
                      hsla(${color.h}, ${color.s}%, ${color.l}%, 1))`,
            }}
            onChange={(e) => {
              const alpha = e.target.valueAsNumber;
              setColor((prev) => {
                const value = { ...prev, a: alpha };
                const hex_formatted = hslToHex(value);
                return { ...value, hex: hex_formatted };
              });
            }}
          />
        </div>
        <div className="relative h-fit w-full">
          <div className="absolute inset-y-0 flex items-center px-[5px]">
            <HashtagIcon className="size-4 text-zinc-600" />
          </div>
          <input
            id="color-value"
            className={clsx(
              "flex w-full items-center justify-between rounded-lg border p-2 text-sm focus:ring-1",
              "pl-[26px]",
              "pr-[38px]",
              "bg-black/[2.5%] text-zinc-700 dark:bg-white/[2.5%]  dark:text-zinc-200",
              "border-zinc-200 dark:border-zinc-700",
              "hover:border-zinc-300",
              "dark:hover:border-zinc-600",
              "focus:border-zinc-300 focus:ring-zinc-300",
              "dark:focus:border-zinc-600 dark:focus:ring-zinc-600",
              "selection:bg-black/20  selection:text-black",
              "dark:selection:bg-white/30 dark:selection:text-white",
            )}
            value={color.hex}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              handleHexInputChange(e.target.value);
            }}
          />
          <div className="absolute inset-y-0 right-0 flex h-full items-center px-[5px]">
            <div
              className="size-7 rounded-md border border-zinc-200 dark:border-zinc-800"
              style={{
                backgroundColor: `hsla(${color.h}, ${color.s}%, ${color.l}%, ${color.a / 100})`,
                backgroundImage: `linear-gradient(45deg, #ccc 25%, transparent 25%), 
                                  linear-gradient(-45deg, #ccc 25%, transparent 25%), 
                                  linear-gradient(45deg, transparent 75%, #ccc 75%), 
                                  linear-gradient(-45deg, transparent 75%, #ccc 75%)`,
                backgroundSize: '8px 8px',
                backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default ColorPicker;
