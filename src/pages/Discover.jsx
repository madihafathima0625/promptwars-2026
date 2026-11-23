/**
 * @fileoverview Equipment discovery grid with tidy filter toolbar and category icons.
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
      if (q && !`${e.name} ${e.description} ${e.category}`.toLowerCase().includes(q)) return false
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
      <div className="page-header">
        <h1 className="page-title">Equipment Catalogue</h1>
        <p className="page-subtitle">Browse lab instruments, view live availability, and request booking slots.</p>
      </div>

      <div className="filter-toolbar" role="search" aria-label="Filter equipment catalogue">
        <div className="filter-group filter-group-search">
          <label htmlFor="eq-search">Search Instrument</label>
          <input
            id="eq-search"
            type="search"
            placeholder="Search by name, model, or specs…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label htmlFor="eq-cat">Category</label>
          <select id="eq-cat" value={category} onChange={e => setCategory(e.target.value)}>
            <option value="">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="eq-dept">Department</label>
          <select id="eq-dept" value={dept} onChange={e => setDept(e.target.value)}>
            <option value="">All Departments</option>
            {departments.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="eq-lab">Lab Room</label>
          <select id="eq-lab" value={lab} onChange={e => setLab(e.target.value)}>
            <option value="">All Labs</option>
            {labs.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state" role="status" aria-live="polite">
          <svg className="empty-state-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <h2 className="empty-state-title">No matching instruments</h2>
          <p className="empty-state-text">
            No equipment matches your current search or filter combination.
          </p>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleResetFilters}
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="card-grid" aria-label={`${filtered.length} equipment items available`}>
          {filtered.map(e => (
            <Link
              key={e.id}
              to={`/equipment/${e.id}`}
              className="equip-card"
              aria-label={`${e.name} – ${e.department}, ${e.lab}`}
            >
              <div className="equip-card-top">
                <div className="equip-icon-wrap" aria-hidden="true">
                  <CategoryIcon category={e.category} />
                </div>
                <div>
                  <h2 className="equip-card-title">{e.name}</h2>
                  <div className="equip-card-dept">{e.department} · {e.lab}</div>
                </div>
              </div>

              <p className="equip-card-desc">{e.description}</p>

              <div className="stat-chips">
                <span className="stat-chip">
                  <span className="stat-chip-label">Qty:</span>
                  <strong>{e.quantity}</strong>
                </span>
                <span className="stat-chip">
                  <span className="stat-chip-label">Max Session:</span>
                  <strong>{e.maxSessionHours}h</strong>
                </span>
                <span className="stat-chip">
                  <span className="stat-chip-label">Type:</span>
                  <span>{e.category}</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}
