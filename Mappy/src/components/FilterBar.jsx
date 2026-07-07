import React from 'react';

const categories = [
  { id: 'all', label: 'All services', color: '#1B2333' },
  { id: 'hospital', label: 'Hospitals', color: '#12A594' },
  { id: 'police', label: 'Police', color: '#2F6FED' },
  { id: 'fire', label: 'Fire response', color: '#F2994A' },
];

function FilterBar({ selectedType, setSelectedType }) {
  return (
    <div className="filter-bar" role="tablist" aria-label="Filter by service type">
      {categories.map((cat) => (
        <button
          key={cat.id}
          role="tab"
          aria-selected={selectedType === cat.id}
          className={`filter-pill ${selectedType === cat.id ? 'is-active' : ''}`}
          style={{ '--pill-color': cat.color }}
          onClick={() => setSelectedType(cat.id)}
        >
          <span className="pill-dot" aria-hidden="true" />
          {cat.label}
        </button>
      ))}
    </div>
  );
}

export default FilterBar;