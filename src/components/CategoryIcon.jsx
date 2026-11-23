/**
 * @fileoverview Inline SVG category icons for precision lab equipment.
 *
 * @param {{ category: string, className?: string }} props
 */
export default function CategoryIcon({ category, className = 'equip-icon' }) {
  const c = (category || '').toLowerCase()

  if (c.includes('oscilloscope')) {
    return (
      <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="M5 12h3l2-5 3 10 3-7 2 2h2" />
      </svg>
    )
  }

  if (c.includes('logic')) {
    return (
      <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M3 6h4v4h5V6h9" />
        <path d="M3 18h7v-4h4v4h7" />
        <circle cx="7" cy="10" r="1" fill="currentColor" />
        <circle cx="16" cy="14" r="1" fill="currentColor" />
      </svg>
    )
  }

  if (c.includes('microcontroller') || c.includes('esp32')) {
    return (
      <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <rect x="5" y="5" width="14" height="14" rx="2" />
        <path d="M9 9h6v6H9z" />
        <path d="M1 9h4M1 15h4M19 9h4M19 15h4M9 1v4M15 1v4M9 19v4M15 19v4" />
      </svg>
    )
  }

  if (c.includes('single-board') || c.includes('raspberry') || c.includes('computer')) {
    return (
      <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <circle cx="7" cy="8" r="1.5" />
        <path d="M13 7h5v4h-5zM13 13h5v4h-5zM7 13h3v4H7z" />
      </svg>
    )
  }

  if (c.includes('printer') || c.includes('3d')) {
    return (
      <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M6 9V3h12v6" />
        <rect x="3" y="9" width="18" height="9" rx="2" />
        <path d="M7 15h10v6H7zM17 12h.01" />
      </svg>
    )
  }

  if (c.includes('soldering')) {
    return (
      <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M14 4l6 6-9 9-4 1 1-4 6-6" />
        <path d="M17 7l-2 2M3 21l3-3" />
      </svg>
    )
  }

  if (c.includes('fpga')) {
    return (
      <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <rect x="4" y="4" width="16" height="16" rx="1" />
        <path d="M8 8h2v2H8zm6 0h2v2h-2zm-6 6h2v2H8zm6 0h2v2h-2z" />
        <path d="M12 4v16M4 12h16" />
      </svg>
    )
  }

  if (c.includes('multimeter')) {
    return (
      <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <rect x="5" y="3" width="14" height="18" rx="2" />
        <rect x="8" y="6" width="8" height="4" rx="1" />
        <circle cx="12" cy="15" r="3" />
        <path d="M12 15l2-2" />
      </svg>
    )
  }

  // Fallback: precision dial / instrument icon
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 12l4-3M12 6v2M18 12h-2M6 12h2" />
    </svg>
  )
}
