import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Settings2, Clock, CloudRain, Wind } from 'lucide-react';

const generate100Counters = () => {
  const cities = [
    { name: 'Antwerpen', lat: 51.2194, lng: 4.4025 },
    { name: 'Gent', lat: 51.0543, lng: 3.7174 },
    { name: 'Brugge', lat: 51.2093, lng: 3.2247 },
    { name: 'Leuven', lat: 50.8798, lng: 4.7005 },
    { name: 'Hasselt', lat: 50.9307, lng: 5.3325 },
    { name: 'Kortrijk', lat: 50.8280, lng: 3.2649 },
    { name: 'Mechelen', lat: 51.0259, lng: 4.4776 },
    { name: 'Oostende', lat: 51.2154, lng: 2.9287 },
    { name: 'Aalst', lat: 50.9360, lng: 4.0355 },
    { name: 'Sint-Niklaas', lat: 51.1646, lng: 4.1395 },
  ];

  const counters = [];
  let idCounter = 100;
  
  // Seeded random for stable locations
  let seed = 42;
  const random = () => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };

  cities.forEach(city => {
    // Generate exactly 10 counters clustered around each major city
    for (let i = 0; i < 10; i++) {
      idCounter++;
      // Gaussian-ish distribution for realistic clustering
      const latOffset = (random() + random() - 1) * 0.08;
      const lngOffset = (random() + random() - 1) * 0.12;
      
      counters.push({
        id: idCounter.toString(),
        name: `${city.name} - Sensor ${i + 1}`,
        lat: city.lat + latOffset,
        lng: city.lng + lngOffset,
      });
    }
  });

  return counters;
};

const mockCounters = generate100Counters();

const BikePredictionDashboard = () => {
  const [selectedCounter, setSelectedCounter] = useState(mockCounters[0]);
  const [hoveredCounter, setHoveredCounter] = useState(null);
  const [time, setTime] = useState('08:00');
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [weather, setWeather] = useState({ temp: 14, rain: 0, wind: 12 });

  useEffect(() => {
    let isMounted = true;
    const fetchPrediction = async () => {
      setLoading(true);
      try {
        const hour = parseInt(time.split(':')[0]);
        const payload = {
          hour,
          lat: selectedCounter.lat,
          lng: selectedCounter.lng,
          temp: weather.temp,
          rain: weather.rain,
          wind: weather.wind
        };

        const response = await fetch('http://localhost:8000/api/predict/bike', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error('Network error');
        
        const data = await response.json();
        if (isMounted) {
          setPrediction(data.prediction);
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to fetch from Python backend", err);
        if (isMounted) {
          setPrediction("N/A"); // Fallback on error
          setLoading(false);
        }
      }
    };

    // Debounce the fetch calls to ensure smooth sliding
    const timeout = setTimeout(fetchPrediction, 300);
    return () => {
      isMounted = false;
      clearTimeout(timeout);
    };
  }, [selectedCounter, time, weather]);

  return (
    <div className="slide-container" style={{ padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: '1400px', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 className="title" style={{ fontSize: '2.5rem', marginBottom: '0.2rem' }}>Bike Traffic Forecast</h2>
          <p className="subtitle" style={{ fontSize: '1.1rem' }}>LightGBM Predictive Model (Live Simulation)</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem', flex: 1, minHeight: 0 }}>
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel" style={{ padding: '1rem', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ marginBottom: '1rem', fontWeight: 500, display: 'flex', justifyContent: 'space-between' }}>
              <span>Select EcoCounter ({mockCounters.length} locations)</span>
            </h3>
            <div style={{ flex: 1, borderRadius: '12px', overflow: 'hidden', zIndex: 1 }}>
              <MapContainer center={[51.02, 4.3]} zoom={8} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                  attribution='&copy; OpenStreetMap & CARTO'
                />

                {mockCounters.map(counter => {
                  const isSelected = selectedCounter.id === counter.id;
                  const isHovered = hoveredCounter?.id === counter.id;
                  
                  return (
                    <CircleMarker
                      key={counter.id}
                      center={[counter.lat, counter.lng]}
                      radius={isSelected ? 10 : isHovered ? 8 : 5}
                      pathOptions={{ 
                        color: isHovered ? '#39ff14' : isSelected ? '#ffffff' : 'var(--accent-color)', 
                        fillColor: isHovered ? '#39ff14' : 'var(--accent-color)', 
                        fillOpacity: isHovered ? 0.9 : 0.7,
                        weight: isSelected ? 3 : 1,
                        className: isHovered ? 'eco-shadow' : ''
                      }}
                      eventHandlers={{ 
                        click: () => setSelectedCounter(counter),
                        mouseover: () => setHoveredCounter(counter),
                        mouseout: () => setHoveredCounter(null)
                      }}
                    >
                      <Popup>
                        <strong style={{ color: '#000' }}>{counter.name}</strong><br/>
                        <span style={{ color: '#555' }}>ID: {counter.id}</span>
                      </Popup>
                    </CircleMarker>
                  );
                })}
              </MapContainer>
            </div>
          </motion.div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="glass-panel">
              <h3 style={{ marginBottom: '1.5rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Settings2 size={20} /> Parameters
              </h3>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                  <Clock size={16} /> Time of Day
                </label>
                <input type="time" value={time} onChange={(e) => setTime(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white' }} />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                  <CloudRain size={16} /> Precipitation (mm)
                </label>
                <input type="range" min="0" max="20" step="0.5" value={weather.rain} onChange={(e) => setWeather({...weather, rain: parseFloat(e.target.value)})} style={{ width: '100%' }} />
                <div style={{ textAlign: 'right', fontSize: '0.8rem', marginTop: '0.2rem' }}>{weather.rain} mm</div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: 'rgba(0, 122, 255, 0.1)' }}>
              <h3 style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>Predicted Traffic</h3>
              {loading ? (
                <div style={{ height: '80px', display: 'flex', alignItems: 'center' }}>
                  <div className="spinner" style={{ width: '30px', height: '30px', border: '3px solid var(--glass-border)', borderTopColor: 'var(--accent-color)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                  <span style={{ fontSize: '4rem', fontWeight: 700, color: 'var(--accent-color)', lineHeight: 1 }}>{prediction}</span>
                  <span style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>bikes/hr</span>
                </div>
              )}
              <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                at {selectedCounter.name}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
        
        /* Low opacity green shadow for eco counters */
        .eco-shadow {
          filter: drop-shadow(0px 0px 8px rgba(57, 255, 20, 0.8));
          transition: filter 0.2s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default BikePredictionDashboard;
