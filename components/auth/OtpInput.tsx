"use client";

import { useRef, type KeyboardEvent } from "react";

type OtpInputProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

export function OtpInput({ value, onChange, disabled = false }: OtpInputProps) {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const digits = value.padEnd(6, " ").split("").slice(0, 6);

  function updateDigit(index: number, digit: string) {
    const sanitized = digit.replace(/\D/g, "").slice(-1);
    const next = value.split("");
    next[index] = sanitized;
    const joined = next.join("").replace(/\s/g, "");
    onChange(joined.slice(0, 6));

    if (sanitized && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && !digits[index]?.trim() && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  }

  function handlePaste(pasteValue: string) {
    const sanitized = pasteValue.replace(/\D/g, "").slice(0, 6);
    onChange(sanitized);
    const focusIndex = Math.min(sanitized.length, 5);
    inputsRef.current[focusIndex]?.focus();
  }

  return (
    <div className="flex justify-center gap-2 sm:gap-3">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(element) => {
            inputsRef.current[index] = element;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit.trim()}
          disabled={disabled}
          aria-label={`Digit ${index + 1}`}
          className="monsoon-touch-target h-14 w-11 rounded-2xl border border-slate-200 bg-white text-center text-xl font-bold text-monsoon-primary shadow-sm outline-none ring-monsoon-secondary transition focus:border-monsoon-secondary focus:ring-2 sm:h-16 sm:w-14"
          onChange={(event) => updateDigit(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={(event) => {
            event.preventDefault();
            handlePaste(event.clipboardData.getData("text"));
          }}
        />
      ))}
    </div>
  );
}
