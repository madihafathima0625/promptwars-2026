/**
 * @fileoverview Equipment discovery catalogue screen.
 * Features an editorial search header, category pill chips, secondary department/lab filters,
 * and equipment cards with rich inline SVG illustrations, availability dots, and direct request actions.
 */
import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import CategoryIcon from '../components/CategoryIcon.jsx'

/**
 * @param {{ equipment: import('../data/seed.js').Equipment[] }} props
 */
export default function Discover({ equipment }) {
  const [search, setSearch]     = useState('')
  const [category, setCategory] = useState('')
  const [dept, setDept]         = useState('')
  const [lab, setLab]           = useState('')

  const categories  = useMemo(() => [...new Set(equipment.map(e => e.category))].sort(), [equipment])
  const departments = useMemo(() => [...new Set(equipment.map(e => e.department))].sort(), [equipment])
  const labs        = useMemo(() => [...new Set(equipment.map(e => e.lab))].sort(), [equipment])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return equipment.filter(e => {
      if (category && e.category !== category)     return false
      if (dept     && e.department !== dept)        return false
      if (lab      && e.lab !== lab)                return false
      if (q && !`${e.name} ${e.description} ${e.category} ${e.department} ${e.lab}`.toLowerCase().includes(q)) return false
      return true
    })
  }, [equipment, search, category, dept, lab])

  function handleResetFilters() {
    setSearch('')
    setCategory('')
    setDept('')
    setLab('')
  }

  return (
    <main id="main-content" className="app-main">
      <header className="discover-hero-header">
        <h1 className="page-title">Laboratory Equipment Catalogue</h1>
        <p className="page-subtitle">
          Browse precision engineering apparatus, review instrument specifications, and request booking slots for your academic projects.
        </p>

        {/* Large Prominent Search Field */}
        <div className="search-field-large" role="search">
          <svg className="search-icon-inside" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
            <path d="M16 16l4.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            id="equipment-catalogue-search"
            type="search"
            placeholder="Search instruments by name, specs, or laboratory..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            aria-label="Search laboratory equipment by name, category, or specs"
          />
        </div>

        {/* Category Pill Chips */}
        <div className="category-pill-group" role="group" aria-label="Filter by instrument category">
          <button
            type="button"
            className={`category-chip ${category === '' ? 'active' : ''}`}
            onClick={() => setCategory('')}
            aria-pressed={category === ''}
          >
            All Instruments ({equipment.length})
          </button>
          {categories.map(c => {
            const count = equipment.filter(e => e.category === c).length
            const isActive = category === c
            return (
              <button
                key={c}
                type="button"
                className={`category-chip ${isActive ? 'active' : ''}`}
                onClick={() => setCategory(isActive ? '' : c)}
                aria-pressed={isActive}
              >
                {c} ({count})
              </button>
            )
          })}
        </div>

        {/* Secondary Filters Row */}
        <div className="secondary-filters-row">
          <div className="secondary-filter-select">
            <label htmlFor="dept-filter-select">Department:</label>
            <select
              id="dept-filter-select"
              value={dept}
              onChange={e => setDept(e.target.value)}
            >
              <option value="">All Departments ({departments.length})</option>
              {departments.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="secondary-filter-select">
            <label htmlFor="lab-filter-select">Laboratory:</label>
            <select
              id="lab-filter-select"
              value={lab}
              onChange={e => setLab(e.target.value)}
            >
              <option value="">All Labs ({labs.length})</option>
              {labs.map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>

          <span
            aria-live="polite"
            className="meta-subtext"
            style={{ marginLeft: 'auto', alignSelf: 'center' }}
          >
            Showing <strong>{filtered.length}</strong> of {equipment.length} instruments
          </span>
        </div>
      </header>

      {/* ── Results Grid or Empty State ───────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="empty-state" role="status" aria-live="polite">
          <svg className="empty-state-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
            <path d="M16 16l4.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <h2 className="empty-state-title">No matching instruments found</h2>
          <p className="empty-state-text">
            No equipment matches your current search criteria or filter selections. Try broadening your terms or reset the filters.
          </p>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleResetFilters}
          >
            Reset all filters
          </button>
        </div>
      ) : (
        <div className="equip-cards-grid" role="list" aria-label="Equipment catalogue items">
          {filtered.map(e => (
            <article
              key={e.id}
              className="equip-product-card"
              role="listitem"
              aria-labelledby={`equip-title-${e.id}`}
            >
              <div className="equip-illustration-box" aria-hidden="true">
                <CategoryIcon category={e.category} className="equip-icon" />
              </div>

              <div>
                <h2 id={`equip-title-${e.id}`} className="equip-card-h2">
                  {e.name}
                </h2>
                <div className="equip-card-location">
                  {e.department} · {e.lab}
                </div>
              </div>

              <p className="equip-card-desc-text">
                {e.description}
              </p>

              <div className="equip-card-meta-bar">
                <span className="availability-dot-indicator">
                  <span className="availability-dot" aria-hidden="true" />
                  {e.quantity} unit{e.quantity > 1 ? 's' : ''} in lab
                </span>
                <span className="session-hours-chip">
                  Max session: <strong>{e.maxSessionHours}h</strong>
                </span>
              </div>

              <Link
                to={`/equipment/${e.id}`}
                className="btn btn-primary btn-full"
                aria-label={`Request ${e.name} in ${e.lab}`}
              >
                Request this equipment
              </Link>
            </article>
          ))}
        </div>
      )}
    </main>
  )
}
