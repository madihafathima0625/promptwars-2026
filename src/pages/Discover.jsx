/**
 * @fileoverview Equipment discovery grid ( /discover ).
 */
import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'

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

  return (
    <main id="main-content" className="app-main">
      <div className="page-header">
        <h1>Equipment Catalogue</h1>
        <p>Browse available lab equipment and submit booking requests.</p>
      </div>

      <div className="filter-bar" role="search" aria-label="Filter equipment">
        <div className="field search-field">
          <label htmlFor="eq-search">Search</label>
          <input
            id="eq-search"
            type="search"
            placeholder="Name, category, description…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            aria-label="Search equipment by name or description"
          />
        </div>

        <div className="field">
          <label htmlFor="eq-cat">Category</label>
          <select id="eq-cat" value={category} onChange={e => setCategory(e.target.value)}>
            <option value="">All categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="field">
          <label htmlFor="eq-dept">Department</label>
          <select id="eq-dept" value={dept} onChange={e => setDept(e.target.value)}>
            <option value="">All departments</option>
            {departments.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        <div className="field">
          <label htmlFor="eq-lab">Lab</label>
          <select id="eq-lab" value={lab} onChange={e => setLab(e.target.value)}>
            <option value="">All labs</option>
            {labs.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state" role="status" aria-live="polite">
          <span aria-hidden="true" style={{ fontSize: '2rem' }}>🔍</span>
          <p>No equipment matches your filters. Try broadening your search.</p>
        </div>
      ) : (
        <div className="card-grid" aria-label={`${filtered.length} equipment items`}>
          {filtered.map(e => (
            <Link
              key={e.id}
              to={`/equipment/${e.id}`}
              className="card equip-card"
              aria-label={`${e.name} – ${e.department}, ${e.lab}`}
            >
              <div className="equip-card-meta">
                <span className="equip-pill">{e.category}</span>
                <span className="equip-pill">{e.department}</span>
              </div>
              <div className="equip-card-title">{e.name}</div>
              <div className="equip-card-desc">{e.description}</div>
              <div className="equip-card-meta" style={{ marginTop: 'auto' }}>
                <span>Qty: <strong>{e.quantity}</strong></span>
                <span>Max session: <strong>{e.maxSessionHours} h</strong></span>
                <span>{e.lab}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}
