import React from 'react';
import MapView from './components/MapView';

function App() {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <header style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h1 style={{ color: '#d9534f', fontSize: '2.5rem', margin: '0 0 10px 0' }}>
          🚨 Emergency Services Map
        </h1>
        <p style={{ color: '#555', margin: '0' }}>
          Locate nearby medical, police, and fire response stations in real time.
        </p>
      </header>
      
      <main>
        <MapView />
      </main>
    </div>
  );
}

export default App;