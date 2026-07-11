"use client";

import { useEffect, useId, useRef, useState } from "react";

export type SelectOption = {
  label: string;
  value: string;
};

type SelectFieldProps = {
  value: string;
  onChange: (value: string) => void;
  options: readonly SelectOption[];
  id?: string;
  "aria-label"?: string;
};

export function SelectField({
  value,
  onChange,
  options,
  id,
  "aria-label": ariaLabel,
}: SelectFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const listboxId = `${fieldId}-listbox`;
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const selected =
    options.find((option) => option.value === value) ?? options[0];

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function selectOption(nextValue: string) {
    onChange(nextValue);
    setOpen(false);
  }

  function handleTriggerKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setOpen(true);
    }
  }

  function handleOptionKeyDown(
    event: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      selectOption(options[index].value);
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      const next = options[index + 1];
      if (next) {
        document.getElementById(`${fieldId}-option-${next.value}`)?.focus();
      }
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      const prev = options[index - 1];
      if (prev) {
        document.getElementById(`${fieldId}-option-${prev.value}`)?.focus();
      }
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        id={fieldId}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={handleTriggerKeyDown}
        className={`monsoon-input flex w-full items-center justify-between gap-3 rounded-2xl text-left ${
          open ? "border-monsoon-secondary ring-2 ring-monsoon-secondary/20" : ""
        }`}
      >
        <span className="truncate">{selected?.label}</span>
        <svg
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
          className={`h-5 w-5 shrink-0 text-slate-400 transition-transform ${
            open ? "rotate-180 text-monsoon-secondary" : ""
          }`}
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.25a.75.75 0 0 1-1.06 0L5.21 8.29a.75.75 0 0 1 .02-1.08Z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open && (
        <ul
          id={listboxId}
          role="listbox"
          aria-labelledby={fieldId}
          className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white py-1.5 shadow-[0_8px_30px_rgba(15,23,42,0.12)]"
        >
          {options.map((option, index) => {
            const isSelected = option.value === value;

            return (
              <li key={option.value} role="presentation">
                <button
                  type="button"
                  id={`${fieldId}-option-${option.value}`}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => selectOption(option.value)}
                  onKeyDown={(event) => handleOptionKeyDown(event, index)}
                  className={`flex w-full items-center justify-between px-4 py-3 text-left text-base transition ${
                    isSelected
                      ? "bg-teal-50 font-medium text-monsoon-secondary"
                      : "text-monsoon-primary hover:bg-slate-50"
                  }`}
                >
                  <span>{option.label}</span>
                  {isSelected && (
                    <svg
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                      className="h-5 w-5 shrink-0"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.704 5.29a1 1 0 0 1 .006 1.414l-7.25 7.25a1 1 0 0 1-1.414 0l-3.25-3.25a1 1 0 1 1 1.414-1.414l2.543 2.543 6.543-6.543a1 1 0 0 1 1.408 0Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
