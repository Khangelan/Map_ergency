import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../assets/data/firebase'; // Connects to your firebase.js config

// Fix for default Leaflet marker icons not showing up correctly in React/Vite build
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

function MapView() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Center map around your default Cape Town coordinates
  const centerPosition = [-33.9249, 18.4241]; 

  useEffect(() => {
    const fetchServicesFromFirebase = async () => {
      try {
        // Look into the "emergency_services" collection inside Firestore
        const querySnapshot = await getDocs(collection(db, "emergency_services"));
        const data = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setServices(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching Firestore data: ", error);
        setLoading(false);
      }
    };

    fetchServicesFromFirebase();
  }, []);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '20px' }}>Loading Emergency Map Data...</div>;
  }

  return (
    <div style={{ height: '70vh', width: '100%', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
      <MapContainer center={centerPosition} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {services.map((service) => (
          <Marker key={service.id} position={[service.lat, service.lng]}>
            <Popup>
              <div style={{ fontFamily: 'sans-serif' }}>
                <h3 style={{ margin: '0 0 5px 0', color: '#d9534f' }}>
                  {service.type === 'hospital' ? '🏥' : service.type === 'police' ? '👮' : '🚒'} {service.name}
                </h3>
                <p style={{ margin: '0 0 5px 0' }}><b>Address:</b> {service.address}</p>
                <p style={{ margin: '0 0 5px 0' }}><b>Emergency Phone:</b> <a href={`tel:${service.phone}`}>{service.phone}</a></p>
                <p style={{ margin: '0', color: service.open247 ? 'green' : 'red' }}>
                  • {service.open247 ? 'Open 24/7' : 'Check hours'}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default MapView;