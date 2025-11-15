export default function SwipeTutorialOverlaySingleSwap({
  onClose,
  brand = "emerald",
}) {
  const brandMap = {
    emerald: { bg: "bg-emerald-500", stroke: "#10B981" },
    indigo: { bg: "bg-indigo-500", stroke: "#6366F1" },
    rose: { bg: "bg-rose-500", stroke: "#F43F5E" },
    teal: { bg: "bg-teal-500", stroke: "#14B8A6" },
  };
  const theme = brandMap[brand] || brandMap.emerald;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-gray-950/70 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="swipe-tip-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-gray-950/10">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="inline-flex items-center gap-2 text-gray-700">
            <span
              className={`inline-block h-1.5 w-1.5 rounded-full ${theme.bg}`}
            />
            <h3
              id="swipe-tip-title"
              className="text-sm font-semibold tracking-tight"
            >
              Quick tip
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
            aria-label="Close"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              stroke="currentColor"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M6 6l12 12M6 18L18 6"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-4 py-5">
          {/* Single frame: two layers translate in opposite directions */}
          <div
            className="relative mx-auto h-28 w-64 overflow-hidden rounded-xl ring-1 ring-gray-200 bg-gray-50"
            style={{ "--dur": "1500ms" }}
          >
            {/* Layer A (current) */}
            <div className="absolute inset-0 z-10 slide-out">
              <svg viewBox="0 0 160 160" className="h-full w-full">
                <rect
                  x="8"
                  y="8"
                  width="144"
                  height="144"
                  rx="12"
                  fill={theme.stroke}
                  opacity="0.08"
                />
                <rect
                  x="24"
                  y="24"
                  width="112"
                  height="72"
                  rx="8"
                  fill={theme.stroke}
                  opacity="0.16"
                />
                <rect
                  x="24"
                  y="104"
                  width="72"
                  height="12"
                  rx="6"
                  fill={theme.stroke}
                  opacity="0.26"
                />
                <circle
                  cx="52"
                  cy="60"
                  r="16"
                  fill={theme.stroke}
                  opacity="0.95"
                />
              </svg>
            </div>

            {/* Layer B (next), starts just to the right and slides in */}
            <div className="absolute inset-0 z-0 slide-in">
              <svg viewBox="0 0 160 160" className="h-full w-full">
                <rect
                  x="8"
                  y="8"
                  width="144"
                  height="144"
                  rx="12"
                  fill="#111827"
                  opacity="0.06"
                />
                <rect
                  x="24"
                  y="24"
                  width="112"
                  height="72"
                  rx="8"
                  fill="#111827"
                  opacity="0.12"
                />
                <rect
                  x="64"
                  y="104"
                  width="72"
                  height="12"
                  rx="6"
                  fill="#111827"
                  opacity="0.22"
                />
                <circle cx="108" cy="56" r="14" fill="#111827" opacity="0.9" />
              </svg>
            </div>
          </div>

          {/* Copy */}
          <p className="mt-4 text-center text-sm text-gray-700">
            Swipe through product images to see all angles and variants.
          </p>
        </div>

        {/* Footer */}
        <div className="px-4 pb-4">
          <button
            type="button"
            onClick={onClose}
            className={`w-full inline-flex items-center justify-center rounded-lg ${theme.bg} text-white px-4 py-2 text-sm font-semibold hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 transition`}
          >
            Got it
          </button>
        </div>
      </div>

      {/* Animations */}
      <style jsx>{`
        @media (prefers-reduced-motion: no-preference) {
          /* Current layer slides left and fades out slightly */
          @keyframes slideOut {
            0% {
              transform: translateX(0);
              opacity: 1;
            }
            50% {
              transform: translateX(-100%);
              opacity: 0.9;
            }
            100% {
              transform: translateX(0);
              opacity: 1;
            }
          }
          /* Next layer slides in from the right, then resets */
          @keyframes slideIn {
            0% {
              transform: translateX(100%);
              opacity: 0.9;
            }
            50% {
              transform: translateX(0);
              opacity: 1;
            }
            100% {
              transform: translateX(100%);
              opacity: 0.9;
            }
          }
          /* Hand follows with shorter travel */
          @keyframes hand {
            0% {
              transform: translateX(-12%);
              opacity: 0.96;
            }
            50% {
              transform: translateX(10%);
              opacity: 1;
            }
            100% {
              transform: translateX(-12%);
              opacity: 0.96;
            }
          }
          .slide-out {
            animation: slideOut var(--dur) ease-in-out infinite;
          }
          .slide-in {
            animation: slideIn var(--dur) ease-in-out infinite;
          }
          .swipe-hand {
            animation: hand var(--dur) ease-in-out infinite;
          }
        }
      `}</style>
    </div>
  );
}
