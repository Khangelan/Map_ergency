import React, { useMemo, useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import FilterBar from './FilterBar';
import { expandedEmergencyData } from '../assets/data/emergencyData';
import { db } from '../assets/data/firebase';
import { collection, onSnapshot } from 'firebase/firestore';

const TYPE_META = {
  hospital: { color: '#12A594', glyph: '🏥' },
  police: { color: '#2F6FED', glyph: '👮' },
  fire: { color: '#F2994A', glyph: '🚒' },
};

function getMeta(type) {
  return TYPE_META[type] || { color: '#5B6472', glyph: '📍' };
}

function buildIcon(type) {
  const meta = getMeta(type);
  return L.divIcon({
    className: 'custom-marker',
    html: `<span class="marker-pin" style="background:${meta.color}"><span class="marker-glyph">${meta.glyph}</span></span>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -28],
  });
}

// Flies the map to a service when it's selected from the list or a marker
function FlyTo({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.flyTo(position, 15, { duration: 1 });
  }, [position, map]);
  return null;
}

// Fit map bounds to include all provided services
function FitBounds({ services }) {
  const map = useMap();

  useEffect(() => {
    if (!services || services.length === 0) return;
    const latlngs = services.map((s) => [s.lat, s.lng]);
    try {
      map.fitBounds(latlngs, { padding: [60, 60] });
    } catch (e) {
      // ignore if invalid bounds
    }
  }, [services, map]);

  return null;
}

function MapView() {
  const [selectedType, setSelectedType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeService, setActiveService] = useState(null);
  const [services, setServices] = useState(expandedEmergencyData);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isLive, setIsLive] = useState(false);

  // Default center (rough Western Cape centre) — fitBounds will override on load
  const centerPosition = [-33.8, 19.0];

  // Subscribe to Firestore 'services' collection for realtime updates, fallback to local data
  useEffect(() => {
    let unsub;
    try {
      const col = collection(db, 'services');
      unsub = onSnapshot(
        col,
        (snapshot) => {
          if (!snapshot.empty) {
            const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
            setServices(docs);
            setLastUpdated(new Date());
            setIsLive(true);
          } else {
            setServices(expandedEmergencyData);
            setIsLive(false);
          }
        },
        (err) => {
          console.error('Firestore listen error', err);
          setServices(expandedEmergencyData);
          setIsLive(false);
        }
      );
    } catch (e) {
      console.error('Firestore subscribe failed', e);
      setServices(expandedEmergencyData);
      setIsLive(false);
    }

    return () => unsub && unsub();
  }, []);

  const filteredServices = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return services.filter((service) => {
      const matchesType = selectedType === 'all' || service.type === selectedType;
      const matchesSearch =
        !query ||
        service.name?.toLowerCase().includes(query) ||
        service.address?.toLowerCase().includes(query) ||
        (service.suburb && service.suburb.toLowerCase().includes(query));
      return matchesType && matchesSearch;
    });
  }, [services, selectedType, searchQuery]);

  return (
    <div className="map-view">
      <div className="toolbar">
        <div className="search-box">
          <span className="search-icon" aria-hidden="true">⌕</span>
          <input
            type="text"
            placeholder="Search by name or address…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search emergency services"
          />
          {searchQuery && (
            <button
              className="clear-btn"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        <FilterBar selectedType={selectedType} setSelectedType={setSelectedType} />
      </div>

      <div className="workspace">
        <aside className="results-panel">
          <div style={{ padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 10, height: 10, borderRadius: 10, background: isLive ? '#16a34a' : '#9ca3af', display: 'inline-block' }} aria-hidden="true" />
              <small style={{ color: '#6b7280' }}>{isLive ? 'Live' : 'Offline (local data)'}</small>
            </div>
            <div style={{ color: '#6b7280', fontSize: '12px' }}>{lastUpdated ? `Updated ${new Date(lastUpdated).toLocaleString()}` : ''}</div>
          </div>
          <div className="results-count">
            {filteredServices.length} result{filteredServices.length !== 1 ? 's' : ''}
          </div>

          {filteredServices.length === 0 ? (
            <div className="empty-state">
              <p>No services match your search.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedType('all');
                }}
              >
                Clear filters
              </button>
            </div>
          ) : (
            <ul className="results-list">
              {filteredServices.map((service, index) => {
                const meta = getMeta(service.type);
                const isActive = activeService?.name === service.name;
                return (
                  <li
                    key={index}
                    className={`result-item ${isActive ? 'is-active' : ''}`}
                    onClick={() => setActiveService(service)}
                  >
                    <span className="result-badge" style={{ background: meta.color }}>
                      {meta.glyph}
                    </span>
                    <div className="result-body">
                      <p className="result-name">{service.name}</p>
                      <p className="result-address">{service.address}</p>
                      <p className={`result-status ${service.open247 ? 'is-open' : ''}`}>
                        {service.open247 ? 'Open 24/7' : 'Check hours'}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </aside>

        <div className="map-frame">
          <MapContainer center={centerPosition} zoom={10} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Fit the map to show all current filtered services */}
            <FitBounds services={filteredServices} />

            {activeService && <FlyTo position={[activeService.lat, activeService.lng]} />}

            {filteredServices.map((service, index) => (
              <Marker
                key={index}
                position={[service.lat, service.lng]}
                icon={buildIcon(service.type)}
                eventHandlers={{ click: () => setActiveService(service) }}
              >
                <Popup>
                  <div className="popup-card">
                    <h3 style={{ color: getMeta(service.type).color }}>
                      {getMeta(service.type).glyph} {service.name}
                    </h3>
                    <p>
                      <strong>Address:</strong> {service.address}
                    </p>
                    <p>
                      <strong>Phone:</strong> <a href={`tel:${service.phone}`}>{service.phone}</a>
                    </p>
                    <p className={service.open247 ? 'popup-open' : 'popup-hours'}>
                      {service.open247 ? '● Open 24/7' : '● Check hours'}
                    </p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}

export default MapView;