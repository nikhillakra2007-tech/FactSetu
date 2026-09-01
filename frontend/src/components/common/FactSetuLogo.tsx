import React from 'react';

interface FactSetuLogoProps {
  size?: number;
  className?: string;
}

/**
 * Modern FACTSETU Logo:
 * Precision Fact Inspection Lens + Bold Verification Checkmark.
 * Sleek, professional, modern intelligence and verification emblem.
 */
export const FactSetuLogo: React.FC<FactSetuLogoProps> = ({ size = 32, className = '' }) => {
  return (
    <div
      className={`relative flex items-center justify-center shrink-0 transition-transform duration-200 hover:scale-105 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Sleek rounded dark blue base with subtle border */}
        <rect
          width="40"
          height="40"
          rx="12"
          className="fill-primary"
        />

        {/* Precision Inspection Lens Outer Ring */}
        <circle
          cx="19"
          cy="19"
          r="10"
          stroke="white"
          strokeWidth="2.5"
          strokeOpacity="0.3"
        />

        {/* Lens Handle (Inspection pointer) */}
        <path
          d="M26.5 26.5L32 32"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Bold Verified Checkmark inside the Lens */}
        <path
          d="M14 19L17.5 22.5L24.5 15"
          stroke="#34D399"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Top-Right Evidence Sparkle Node */}
        <circle
          cx="30"
          cy="10"
          r="2.5"
          className="fill-emerald-400"
        />
      </svg>
    </div>
  );
};
