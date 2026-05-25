import { Fragment, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Settings2, Clock, CloudRain, CalendarDays } from 'lucide-react';

const toDateKey = (date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const addDays = (date, days) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const formatDateLabel = (dateKey) => {
  const [year, month, day] = dateKey.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

const calendarDates = Array.from({ length: 15 }, (_, index) => {
  const date = addDays(new Date(), index);
  return {
    key: toDateKey(date),
    day: date.getDate(),
    weekday: date.toLocaleDateString(undefined, { weekday: 'short' }),
    month: date.toLocaleDateString(undefined, { month: 'short' }),
  };
});

const arrondissementColors = [
  '#007aff', '#34c759', '#ff9500', '#ff3b30', '#af52de', '#32ade6',
  '#ffcc00', '#ff2d55', '#64d2ff', '#30d158', '#bf5af2', '#ffd60a',
  '#5e5ce6', '#ff9f0a', '#00c7be', '#ff453a', '#0a84ff', '#a2845e',
];

const colorForArrondissement = (arrondissement) => {
  if (!arrondissement) return 'var(--accent-color)';

  let hash = 0;
  for (let i = 0; i < arrondissement.length; i++) {
    hash = (hash * 31 + arrondissement.charCodeAt(i)) % arrondissementColors.length;
  }
  return arrondissementColors[hash];
};

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

const lightDashboardTheme = {
  '--text-primary': '#172033',
  '--text-secondary': '#5f6f89',
  '--accent-color': '#0b7a75',
  '--glass-bg': 'rgba(255, 255, 255, 0.82)',
  '--glass-border': 'rgba(34, 84, 90, 0.16)',
  '--border-radius': '12px',
  background: 'linear-gradient(135deg, #f7fbf8 0%, #edf7f6 42%, #f7f4ec 100%)',
  color: '#172033',
};

const BikePredictionDashboard = () => {
  const [counters, setCounters] = useState(mockCounters);
  const [selectedCounter, setSelectedCounter] = useState(mockCounters[0]);
  const [hoveredCounter, setHoveredCounter] = useState(null);
  const [selectedDate, setSelectedDate] = useState(calendarDates[0].key);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [hour, setHour] = useState(8);
  const [prediction, setPrediction] = useState(null);
  const [weatherSummary, setWeatherSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchSites = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/sites');
        if (!response.ok) throw new Error('Network error');

        const data = await response.json();
        const sites = data.data?.map(site => ({
          id: site.id.toString(),
          externalCounterId: site.external_counter_id,
          name: site.name,
          municipality: site.municipality,
          arrondissement: site.arrondissement,
          lat: site.lat,
          lng: site.lng,
          infrastructureDeficit: site.infrastructure_deficit,
          population: site.population,
        })) || [];

        if (isMounted && sites.length > 0) {
          setCounters(sites);
          setSelectedCounter(sites[0]);
        }
      } catch (err) {
        console.error("Failed to fetch site metadata from Python backend", err);
      }
    };

    fetchSites();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchPrediction = async () => {
      setLoading(true);
      try {
        const payload = {
          counter_id: parseInt(selectedCounter.id, 10),
          prediction_date: selectedDate,
          hour,
          lat: selectedCounter.lat,
          lng: selectedCounter.lng,
        };

        const response = await fetch('http://localhost:8000/api/predict/bike', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error('Network error');
        
        const data = await response.json();
        if (isMounted) {
          if (data.error) {
            setPrediction("N/A");
            setWeatherSummary(null);
          } else {
            setPrediction(data.prediction);
            setWeatherSummary(data.weather || null);
          }
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to fetch from Python backend", err);
        if (isMounted) {
          setPrediction("N/A"); // Fallback on error
          setWeatherSummary(null);
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
  }, [selectedCounter, selectedDate, hour]);

  return (
    <div className="slide-container" style={{ padding: '2rem', ...lightDashboardTheme }}>
      <div style={{ width: '100%', maxWidth: '1400px', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 className="title" style={{ fontSize: '2.5rem', marginBottom: '0.2rem' }}>Bike Traffic Forecast</h2>
          <p className="subtitle" style={{ fontSize: '1.1rem' }}>LightGBM Predictive Model (Live Simulation)</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem', flex: 1, minHeight: 0 }}>
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel" style={{ padding: '1rem', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ marginBottom: '1rem', fontWeight: 500, display: 'flex', justifyContent: 'space-between' }}>
              <span>Select EcoCounter ({counters.length} locations)</span>
            </h3>
            <div style={{ flex: 1, borderRadius: '12px', overflow: 'hidden', zIndex: 1 }}>
              <MapContainer center={[51.02, 4.3]} zoom={8} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                  attribution='&copy; OpenStreetMap & CARTO'
                />

                {counters.map(counter => {
                  const isSelected = selectedCounter.id === counter.id;
                  const isHovered = hoveredCounter?.id === counter.id;
                  const markerColor = colorForArrondissement(counter.arrondissement);
                  
                  const popup = (
                    <Popup>
                      <strong style={{ color: '#000' }}>{counter.name}</strong><br/>
                      <span style={{ color: '#555' }}>ID: {counter.id}</span>
                      {counter.arrondissement && (
                        <>
                          <br/>
                          <span style={{ color: '#555' }}>{counter.arrondissement}</span>
                        </>
                      )}
                      {counter.externalCounterId && (
                        <>
                          <br/>
                          <span style={{ color: '#555' }}>Counter: {counter.externalCounterId}</span>
                        </>
                      )}
                    </Popup>
                  );

                  return (
                    <Fragment key={counter.id}>
                      <CircleMarker
                        center={[counter.lat, counter.lng]}
                        radius={15}
                        pathOptions={{
                          color: '#ffffff',
                          opacity: 0,
                          fillColor: '#ffffff',
                          fillOpacity: 0.01,
                          weight: 1,
                        }}
                        eventHandlers={{
                          click: () => setSelectedCounter(counter),
                          mouseover: () => setHoveredCounter(counter),
                          mouseout: () => setHoveredCounter(null)
                        }}
                      >
                        {popup}
                      </CircleMarker>
                      <CircleMarker
                        center={[counter.lat, counter.lng]}
                        radius={isSelected ? 10 : isHovered ? 8 : 5}
                        interactive={false}
                        pathOptions={{
                          color: isHovered ? '#172033' : isSelected ? '#172033' : markerColor,
                          fillColor: markerColor,
                          fillOpacity: isHovered ? 0.92 : 0.78,
                          weight: isSelected ? 3 : 1,
                          className: isHovered ? 'eco-shadow' : ''
                        }}
                      />
                    </Fragment>
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
              <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '1.05rem' }}>
                  <CalendarDays size={18} /> Date
                </label>
                <button
                  type="button"
                  onClick={() => setCalendarOpen(open => !open)}
                  style={{
                    width: '100%',
                    padding: '0.8rem',
                    borderRadius: '8px',
                    border: '1px solid var(--glass-border)',
                    background: 'rgba(255,255,255,0.72)',
                    color: 'var(--text-primary)',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                    fontSize: '1.08rem',
                  }}
                >
                  <span>{formatDateLabel(selectedDate)}</span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{selectedDate}</span>
                </button>
                {calendarOpen && (
                  <div
                    className="glass-panel"
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 0.5rem)',
                      left: 0,
                      right: 0,
                      zIndex: 20,
                      padding: '0.85rem',
                      borderRadius: '8px',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
                      gap: '0.5rem',
                    }}
                  >
                    {calendarDates.map(date => {
                      const isSelected = selectedDate === date.key;

                      return (
                        <button
                          key={date.key}
                          type="button"
                          onClick={() => {
                            setSelectedDate(date.key);
                            setCalendarOpen(false);
                          }}
                          style={{
                            border: `1px solid ${isSelected ? 'var(--accent-color)' : 'var(--glass-border)'}`,
                            borderRadius: '8px',
                            background: isSelected ? 'rgba(11, 122, 117, 0.18)' : 'rgba(255,255,255,0.76)',
                            color: 'var(--text-primary)',
                            cursor: 'pointer',
                            minHeight: '68px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.05rem',
                          }}
                        >
                          <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{date.weekday}</span>
                          <span style={{ fontSize: '1.2rem', fontWeight: 700, lineHeight: 1 }}>{date.day}</span>
                          <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{date.month}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '1.05rem' }}>
                  <Clock size={18} /> Time of Day
                </label>
                <select
                  value={hour}
                  onChange={(e) => setHour(parseInt(e.target.value, 10))}
                  style={{
                    width: '100%',
                    padding: '0.8rem',
                    borderRadius: '8px',
                    border: '1px solid var(--glass-border)',
                    background: 'rgba(255,255,255,0.72)',
                    color: 'var(--text-primary)',
                    fontSize: '1.08rem',
                  }}
                >
                  {Array.from({ length: 24 }, (_, value) => (
                    <option key={value} value={value}>
                      {`${value}`.padStart(2, '0')}:00
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                  <CloudRain size={16} /> Forecast Weather
                </label>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.5rem',
                  fontSize: '0.82rem',
                  color: 'var(--text-secondary)',
                }}>
                  <div>Temp: {weatherSummary ? `${weatherSummary.temperature_2m.toFixed(1)} deg C` : '...'}</div>
                  <div>Feels: {weatherSummary ? `${weatherSummary.apparent_temperature.toFixed(1)} deg C` : '...'}</div>
                  <div>Rain: {weatherSummary ? `${weatherSummary.precipitation.toFixed(1)} mm` : '...'}</div>
                  <div>Snow: {weatherSummary ? `${weatherSummary.snowfall.toFixed(1)} cm` : '...'}</div>
                  <div style={{ gridColumn: '1 / -1' }}>Wind: {weatherSummary ? `${weatherSummary.wind_speed_10m.toFixed(1)} km/h` : '...'}</div>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: 'rgba(11, 122, 117, 0.1)' }}>
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
          filter: drop-shadow(0px 0px 8px rgba(11, 122, 117, 0.35));
          transition: filter 0.2s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default BikePredictionDashboard;
