/**
 * @fileoverview Inline SVG category icons and illustrations for lab equipment.
 * Designed with precision instrument aesthetics, geometric line art, and calibrated scales.
 *
 * @param {{ category: string, className?: string }} props
 */
export default function CategoryIcon({ category, className = 'equip-icon' }) {
  const c = (category || '').toLowerCase()

  if (c.includes('oscilloscope')) {
    return (
      <svg
        className={className}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        focusable="false"
      >
        <rect x="4" y="8" width="40" height="32" rx="4" stroke="currentColor" strokeWidth="2.5" />
        <rect x="8" y="12" width="22" height="24" rx="2" fill="var(--c-sage-soft)" stroke="currentColor" strokeWidth="1.5" />
        {/* Calibrated Screen Grid */}
        <line x1="19" y1="12" x2="19" y2="36" stroke="var(--c-sage)" strokeWidth="0.8" strokeDasharray="2 2" />
        <line x1="8" y1="24" x2="30" y2="24" stroke="var(--c-sage)" strokeWidth="0.8" strokeDasharray="2 2" />
        {/* Sine waveform */}
        <path
          d="M9 24c3-10 6-10 9 0s6 10 9 0"
          stroke="var(--c-primary)"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        {/* Controls & Dials */}
        <circle cx="36" cy="16" r="3.5" stroke="currentColor" strokeWidth="2" />
        <line x1="36" y1="16" x2="38" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="36" cy="26" r="3.5" stroke="currentColor" strokeWidth="2" />
        <line x1="36" y1="26" x2="34" y2="28" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="34" cy="34" r="1.5" fill="currentColor" />
        <circle cx="39" cy="34" r="1.5" fill="currentColor" />
      </svg>
    )
  }

  if (c.includes('logic')) {
    return (
      <svg
        className={className}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        focusable="false"
      >
        <rect x="4" y="8" width="40" height="32" rx="4" stroke="currentColor" strokeWidth="2.5" />
        {/* Multi-channel digital logic waveforms */}
        <path d="M8 16h8v8h8V16h8v8h8" stroke="var(--c-primary)" strokeWidth="2" strokeLinejoin="round" />
        <path d="M8 28h12v-8h10v8h10" stroke="var(--c-amber)" strokeWidth="2" strokeLinejoin="round" />
        <line x1="8" y1="36" x2="40" y2="36" stroke="var(--c-sage)" strokeWidth="1.5" strokeDasharray="3 2" />
        <circle cx="16" cy="24" r="2" fill="var(--c-primary)" />
        <circle cx="28" cy="20" r="2" fill="var(--c-amber)" />
      </svg>
    )
  }

  if (c.includes('microcontroller') || c.includes('esp32')) {
    return (
      <svg
        className={className}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        focusable="false"
      >
        <rect x="10" y="10" width="28" height="28" rx="4" fill="var(--c-sage-soft)" stroke="currentColor" strokeWidth="2.5" />
        <rect x="16" y="16" width="16" height="16" rx="2" stroke="var(--c-primary)" strokeWidth="2" />
        <circle cx="20" cy="20" r="1.5" fill="var(--c-primary)" />
        {/* Chip Pins */}
        <path
          d="M16 6v4M24 6v4M32 6v4M16 38v4M24 38v4M32 38v4M6 16h4M6 24h4M6 32h4M38 16h4M38 24h4M38 32h4"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    )
  }

  if (c.includes('single-board') || c.includes('raspberry') || c.includes('computer')) {
    return (
      <svg
        className={className}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        focusable="false"
      >
        <rect x="6" y="8" width="36" height="32" rx="4" fill="var(--c-sage-soft)" stroke="currentColor" strokeWidth="2.5" />
        {/* SoC processor */}
        <rect x="18" y="18" width="12" height="12" rx="1.5" stroke="var(--c-primary)" strokeWidth="2" />
        {/* GPIO Pin Header */}
        <line x1="10" y1="12" x2="38" y2="12" stroke="currentColor" strokeWidth="2.5" strokeDasharray="2 3" strokeLinecap="round" />
        {/* Ports (USB & Ethernet) */}
        <rect x="34" y="24" width="8" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" fill="var(--bg-surface)" />
        <rect x="34" y="32" width="8" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" fill="var(--bg-surface)" />
        <circle cx="12" cy="24" r="2.5" stroke="var(--c-amber)" strokeWidth="1.5" />
      </svg>
    )
  }

  if (c.includes('printer') || c.includes('3d')) {
    return (
      <svg
        className={className}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        focusable="false"
      >
        {/* Gantry & Frame */}
        <rect x="8" y="6" width="32" height="36" rx="3" stroke="currentColor" strokeWidth="2.5" />
        <line x1="8" y1="18" x2="40" y2="18" stroke="currentColor" strokeWidth="2" />
        {/* Extruder & Hotend */}
        <rect x="20" y="14" width="8" height="8" rx="1" fill="var(--c-sage-pale)" stroke="var(--c-primary)" strokeWidth="2" />
        <path d="M24 22v4l-2 2h4l-2-2" stroke="var(--c-primary)" strokeWidth="2" strokeLinejoin="round" />
        {/* Print Bed & 3D Object */}
        <line x1="12" y1="36" x2="36" y2="36" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M20 36l4-6 4 6z" fill="var(--c-amber)" opacity="0.8" stroke="var(--c-amber)" strokeWidth="1.5" />
      </svg>
    )
  }

  if (c.includes('soldering')) {
    return (
      <svg
        className={className}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        focusable="false"
      >
        {/* Station Base */}
        <rect x="6" y="20" width="22" height="22" rx="3" fill="var(--c-sage-soft)" stroke="currentColor" strokeWidth="2.5" />
        <circle cx="17" cy="29" r="4" stroke="currentColor" strokeWidth="2" />
        <line x1="17" y1="29" x2="19" y2="27" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        {/* Soldering Iron Stylus */}
        <path
          d="M26 36l12-18 4 4-18 12-3 4z"
          fill="var(--c-sage-pale)"
          stroke="var(--c-primary)"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        {/* Fine Tip */}
        <path d="M40 18l3-5-5 3z" fill="var(--c-amber)" stroke="var(--c-amber)" strokeWidth="1.5" />
      </svg>
    )
  }

  if (c.includes('fpga')) {
    return (
      <svg
        className={className}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        focusable="false"
      >
        <rect x="8" y="8" width="32" height="32" rx="3" fill="var(--c-sage-soft)" stroke="currentColor" strokeWidth="2.5" />
        <rect x="14" y="14" width="20" height="20" rx="1.5" stroke="var(--c-primary)" strokeWidth="2" />
        {/* Logic matrix grid */}
        <circle cx="19" cy="19" r="1.5" fill="var(--c-primary)" />
        <circle cx="29" cy="19" r="1.5" fill="var(--c-primary)" />
        <circle cx="19" cy="29" r="1.5" fill="var(--c-primary)" />
        <circle cx="29" cy="29" r="1.5" fill="var(--c-primary)" />
        <path d="M19 19h10v10H19z" stroke="var(--c-sage)" strokeWidth="1" strokeDasharray="2 2" />
        {/* Bus trace lines */}
        <line x1="4" y1="24" x2="8" y2="24" stroke="currentColor" strokeWidth="2" />
        <line x1="40" y1="24" x2="44" y2="24" stroke="currentColor" strokeWidth="2" />
        <line x1="24" y1="4" x2="24" y2="8" stroke="currentColor" strokeWidth="2" />
        <line x1="24" y1="40" x2="24" y2="44" stroke="currentColor" strokeWidth="2" />
      </svg>
    )
  }

  if (c.includes('multimeter')) {
    return (
      <svg
        className={className}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        focusable="false"
      >
        <rect x="10" y="6" width="28" height="36" rx="4" fill="var(--c-sage-soft)" stroke="currentColor" strokeWidth="2.5" />
        {/* Digital LCD readout */}
        <rect x="15" y="11" width="18" height="9" rx="1.5" fill="var(--bg-surface)" stroke="currentColor" strokeWidth="1.5" />
        <path d="M18 16h3M24 14v4M27 15l2 2" stroke="var(--c-primary)" strokeWidth="1.5" strokeLinecap="round" />
        {/* Rotary selector dial */}
        <circle cx="24" cy="29" r="6" stroke="currentColor" strokeWidth="2" />
        <line x1="24" y1="29" x2="27" y2="26" stroke="var(--c-amber)" strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="17" cy="38" r="1.5" fill="currentColor" />
        <circle cx="31" cy="38" r="1.5" fill="currentColor" />
      </svg>
    )
  }

  // Fallback: precision instrument dial / compass
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="24" cy="24" r="3" fill="var(--c-primary)" />
      <path d="M24 24l8-8M24 10v4M24 34v4M10 24h4M34 24h4" stroke="var(--c-primary)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
