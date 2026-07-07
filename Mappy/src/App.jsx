import React from 'react';
import MapView from './components/MapView';
import { expandedEmergencyData } from './assets/data/emergencyData';
import './App.css';

function App() {
  const total = expandedEmergencyData.length;
  const open247 = expandedEmergencyData.filter((s) => s.open247).length;

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-inner">
          <div className="brand">
            <span className="brand-mark" aria-hidden="true">✚</span>
            <div>
              <h1>Cape Town Emergency Locator</h1>
              <p>Find the nearest hospital, police station or fire response unit — fast.</p>
            </div>
          </div>

          <div className="status-strip">
            <span className="live-dot" aria-hidden="true"></span>
            <span className="status-item"><strong>{total}</strong> services tracked</span>
            <span className="status-divider">/</span>
            <span className="status-item"><strong>{open247}</strong> open 24/7</span>
          </div>
        </div>
      </header>

      <main>
        <MapView />
      </main>

      <footer className="app-footer">
        Demo data. In a real emergency, always dial your local emergency number first.
      </footer>
    </div>
  );
}

export default App;