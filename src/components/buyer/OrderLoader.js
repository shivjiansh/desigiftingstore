// SmartOrderLoader.jsx
import React, { useEffect, useMemo, useState } from "react";
import { CheckCircleIcon, XMarkIcon } from "@heroicons/react/24/solid";

export default function SmartOrderLoader({
  orderId = "DG-XXXX",
  etaSeconds = 40,
  queuePosition = 1,
  onCancel = null,
  compact = false, // if true, render a smaller footprint
}) {
  // Respect reduced-motion user preference
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Smart ETA: small penalty per queue position + tiny jitter to avoid feeling robotic
  const adjustedEta = useMemo(() => {
    const queueFactor = Math.min(queuePosition, 10) * 0.12; // 12% per position up to 10
    const jitter = Math.round((Math.random() - 0.5) * 6); // ±3s
    return Math.max(6, Math.round(etaSeconds * (1 + queueFactor) + jitter));
  }, [etaSeconds, queuePosition]);

  // Seconds left state (for display)
  const [secondsLeft, setSecondsLeft] = useState(adjustedEta);
  // progress 0..100
  const [progress, setProgress] = useState(prefersReducedMotion ? 60 : 0);

  // Drive progress / countdown
  useEffect(() => {
    if (prefersReducedMotion) {
      setProgress(60);
      setSecondsLeft(adjustedEta);
      return;
    }

    setProgress(0);
    setSecondsLeft(adjustedEta);
    const start = Date.now();
    const durationMs = Math.max(6000, adjustedEta * 1000); // at least 6s animation

    const tick = () => {
      const elapsed = Date.now() - start;
      const pct = Math.min(100, (elapsed / durationMs) * 100);
      // slight ease-out
      setProgress(Math.round(100 * (1 - Math.pow(1 - pct / 100, 0.9))));
      requestAnimationFrame(() => {
        if (pct < 100) tick();
      });
    };
    const raf = requestAnimationFrame(tick);

    const interval = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(interval);
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => {
      cancelAnimationFrame(raf);
      clearInterval(interval);
    };
  }, [adjustedEta, prefersReducedMotion]);

  // Derive step from progress
  const step = progress < 35 ? 0 : progress < 75 ? 1 : 2;
  const stepLabels = ["Processing", "Packing", "Dispatch"];

  return (
    <section
      role="status"
      aria-live="polite"
      className={`w-full ${
        compact ? "max-w-sm p-4" : "max-w-md p-8"
      } bg-white rounded-xl shadow-lg text-center`}
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div
            className={`w-16 h-16 rounded-xl flex items-center justify-center ${
              step === 2 ? "bg-emerald-50" : "bg-gray-50"
            }`}
            aria-hidden
          >
            {step === 2 ? (
              <CheckCircleIcon className="w-9 h-9 text-emerald-600" />
            ) : (
              <svg
                className="w-9 h-9 animate-spin-slow"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-emerald-300"
                />
                <path
                  d="M22 12a10 10 0 00-10-10"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-emerald-600"
                />
              </svg>
            )}
          </div>
        </div>

        <div className="flex-1 text-left min-w-0">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                Placing order{" "}
                <span className="font-mono text-sm ml-1">{orderId}</span>
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                We’re preparing your items — this usually completes quickly.
              </p>
            </div>

            <div className="text-right">
              <div className="text-xs text-gray-600">ETA</div>
              <div className="text-sm text-gray-800 mt-1" aria-live="polite">
                {prefersReducedMotion
                  ? `${Math.ceil(adjustedEta / 60)} min`
                  : `${secondsLeft}s`}
              </div>
              <div className="mt-1 text-[11px] text-gray-500">
                <span className="px-2 py-0.5 rounded bg-gray-50 border border-gray-100">
                  Queue #{queuePosition}
                </span>
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="mt-4">
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all"
                style={{ width: `${progress}%` }}
                aria-hidden
              />
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <strong className="text-sm text-gray-800">
                  {Math.min(100, progress)}%
                </strong>
                <span className="hidden sm:inline"> — {stepLabels[step]}</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => onCancel && onCancel()}
                  className="text-xs text-red-600 hover:underline"
                  aria-label="Cancel order placement"
                >
                  Cancel
                </button>
              </div>
            </div>

            {/* Stepper */}
            <div className="mt-3 grid grid-cols-3 gap-2 text-[12px]">
              {stepLabels.map((lbl, i) => (
                <div key={lbl} className="flex items-center gap-2">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] border ${
                      i < step
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : i === step
                        ? "border-indigo-300 text-indigo-600"
                        : "border-gray-100 text-gray-400"
                    }`}
                    aria-hidden
                  >
                    {i < step ? "✓" : lbl[0]}
                  </div>
                  <div className="truncate">{lbl}</div>
                </div>
              ))}
            </div>

            <div className="mt-4 text-xs text-gray-500 bg-gray-50 p-3 rounded">
              Tip: You can view order details or change delivery preferences
              from the Orders page.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
