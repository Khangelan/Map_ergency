import React from 'react';

function FilterBar({ selectedType, setSelectedType }) {
  const categories = [
    { id: 'all', label: 'All Services', icon: '🚨' },
    { id: 'hospital', label: 'Hospitals', icon: '🏥' },
    { id: 'police', label: 'Police', icon: '👮' },
    { id: 'fire', label: 'Fire Response', icon: '🚒' }
  ];

  return (
    <div style={{ 
      display: 'flex', 
      gap: '12px', 
      marginBottom: '20px', 
      justifyContent: 'center',
      flexWrap: 'wrap' 
    }}>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => setSelectedType(cat.id)}
          style={{
            padding: '10px 18px',
            borderRadius: '25px',
            border: 'none',
            backgroundColor: selectedType === cat.id ? '#d9534f' : '#f5f5f5',
            color: selectedType === cat.id ? '#fff' : '#333',
            cursor: 'pointer',
            fontWeight: 'bold',
            boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <span>{cat.icon}</span>
          <span>{cat.label}</span>
        </button>
      ))}
    </div>
  );
}

export default FilterBar;