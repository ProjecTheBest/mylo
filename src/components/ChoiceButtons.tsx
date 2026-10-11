"use client";

import { useCallback, useRef } from "react";
import { fireConfetti } from "@/lib/confetti";
import { content } from "@/lib/content";
import { useDodge } from "@/lib/useDodge";

interface ChoiceButtonsProps {
  accepted: boolean;
  onAccept: () => void;
}

export function ChoiceButtons({ accepted, onAccept }: ChoiceButtonsProps) {
  const questionRef = useRef<HTMLHeadingElement | null>(null);
  const yesRef = useRef<HTMLButtonElement | null>(null);
  const getForbidden = useCallback(() => [questionRef.current, yesRef.current], []);
  const { slotRef, buttonRef, dodge } = useDodge(getForbidden);

  const handleAccept = (): void => {
    onAccept();
    void fireConfetti();
  };

  return (
    <div className="fade-up absolute inset-0 z-20 flex flex-col items-center gap-6 px-6 pt-[max(3rem,16dvh,calc(env(safe-area-inset-top)_+_1rem))] pb-[max(1.5rem,env(safe-area-inset-bottom))] text-center">
      <h1
        ref={questionRef}
        aria-live="polite"
        className="max-w-[20ch] font-serif text-[clamp(1.75rem,7vw,3.5rem)] leading-tight font-semibold text-white drop-shadow-[0_2px_14px_rgba(0,0,0,0.45)]"
      >
        <span key={accepted ? "result" : "question"} className="fade-up inline-block">
          {accepted ? content.result : content.question}
        </span>
      </h1>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <button
          ref={yesRef}
          type="button"
          onClick={handleAccept}
          className="min-h-11 min-w-11 touch-manipulation rounded-full bg-emerald-500 px-8 py-3 text-lg font-semibold text-white shadow-lg shadow-emerald-950/40 transition-colors hover:bg-emerald-400 active:scale-95"
        >
          {content.yesLabel}
        </button>
        {!accepted && (
          <span ref={slotRef} className="inline-block">
            <button
              ref={buttonRef}
              type="button"
              onPointerDown={(event) => {
                event.preventDefault();
                dodge({ x: event.clientX, y: event.clientY });
              }}
              onFocus={() => dodge()}
              className="min-h-11 min-w-11 touch-manipulation rounded-full bg-red-600 px-8 py-3 text-lg font-semibold text-white shadow-lg shadow-red-950/40 [translate:var(--dx,0px)_var(--dy,0px)] transition-[translate] duration-300 ease-out motion-reduce:transition-none"
            >
              {content.noLabel}
            </button>
          </span>
        )}
      </div>
    </div>
  );
}
