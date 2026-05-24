import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { SlidersHorizontal, Calendar, Activity, GitMerge, TrendingUp } from 'lucide-react';
import * as topojson from 'topojson-client';

const MCPIDashboard = () => {
  const [geoData, setGeoData] = useState(null);
  const [year, setYear] = useState(2026);
  const [alpha, setAlpha] = useState(0.4); 
  const [beta, setBeta] = useState(0.3);  
  const [gamma, setGamma] = useState(0.3);

  // Load and parse TopoJSON and fetch real Python data
  useEffect(() => {
    Promise.all([
      fetch('/belgium.json').then(res => res.json()),
      fetch('http://localhost:8000/api/mcpi').then(res => res.json().catch(() => null))
    ])
    .then(([topo, pyDataResponse]) => {
      const geojson = topojson.feature(topo, topo.objects.municipalities);
      
      const realAccidentData = pyDataResponse?.data || {};

      geojson.features = geojson.features.map(f => {
        const name = f.properties.name;
        // Seed for missing pop/traffic/infra (since we only pulled accidents from python for now)
        const seed = name ? name.length : Math.random() * 10;
        
        // Find real accidents for this municipality (fallback to some default if not found)
        const munAccidents = realAccidentData[name] || {};
        f.properties.historicalAccidents = munAccidents; // { 2020: 15, 2021: 18... }
        
        f.properties.basePop = 10000 + (seed * 8000);
        f.properties.baseTraffic = f.properties.basePop * (0.1 + (seed % 5) * 0.1);
        f.properties.baseInfra = 0.1 + ((seed % 10) * 0.05);
        return f;
      });
      setGeoData(geojson);
    })
    .catch(err => console.error("Error loading topojson/python data", err));
  }, []);

  // Compute color based on MCPI logic
  const getStyle = (feature) => {
    if (!feature.properties) return { fillColor: '#333', weight: 1 };
    
    // Pull the real accident count for the selected year from Python data (fallback to generic if missing)
    const yearAccidents = feature.properties.historicalAccidents?.[year] || (feature.properties.historicalAccidents?.[2020] || 5);

    // Recalculate MCPI dynamically using Real Accidents / Traffic
    const A = yearAccidents / (feature.properties.baseTraffic + 1);
    const B = feature.properties.baseInfra;
    const C = 1 - (feature.properties.baseTraffic / feature.properties.basePop);

    const normA = Math.min(1, A * 5000);
    const normB = B;
    const normC = Math.max(0, Math.min(1, C));

    const mcpiRaw = (alpha * normA) + (beta * normB) + (gamma * normC);
    const mcpi = Math.min(1, Math.max(0, mcpiRaw));

    // Color gradient from yellow to red based on MCPI
    // Low = #FFD60A (Yellow) -> Mid = #FF9500 (Orange) -> High = #FF3B30 (Red)
    let color = '#FFD60A';
    if (mcpi > 0.6) color = '#FF3B30';
    else if (mcpi > 0.3) color = '#FF9500';

    return {
      fillColor: color,
      fillOpacity: 0.7,
      color: '#111',
      weight: 1,
    };
  };

  const onEachFeature = (feature, layer) => {
    if (feature.properties && feature.properties.name) {
      layer.bindPopup(`<strong>${feature.properties.name}</strong><br/>Priority Region`);
    }
  };

  return (
    <div className="slide-container" style={{ padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: '1400px', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 className="title" style={{ fontSize: '2.5rem', marginBottom: '0.2rem' }}>Priority Index (MCPI)</h2>
          <p className="subtitle" style={{ fontSize: '1.1rem' }}>Municipality Cycling Priority Index Configuration</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '2rem', flex: 1, minHeight: 0 }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto', paddingRight: '0.5rem' }}>
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass-panel">
              <h3 style={{ marginBottom: '1.5rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={20} /> Timeline Selection
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input type="range" min="2020" max="2026" step="1" value={year} onChange={(e) => setYear(parseInt(e.target.value))} style={{ width: '100%' }} />
                <div style={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: 600, color: 'var(--accent-color)' }}>{year}</div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="glass-panel">
              <h3 style={{ marginBottom: '1.5rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <SlidersHorizontal size={20} /> Parameter Tuning
              </h3>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#FF3B30' }}><Activity size={16} /> Accident Rate (α)</span>
                  <span>{alpha.toFixed(2)}</span>
                </label>
                <input type="range" min="0" max="1" step="0.05" value={alpha} onChange={(e) => setAlpha(parseFloat(e.target.value))} style={{ width: '100%' }} />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#FF9500' }}><GitMerge size={16} /> Infra Gap (β)</span>
                  <span>{beta.toFixed(2)}</span>
                </label>
                <input type="range" min="0" max="1" step="0.05" value={beta} onChange={(e) => setBeta(parseFloat(e.target.value))} style={{ width: '100%' }} />
              </div>

              <div style={{ marginBottom: '0.5rem' }}>
                <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#FFD60A' }}><TrendingUp size={16} /> Adoption (γ)</span>
                  <span>{gamma.toFixed(2)}</span>
                </label>
                <input type="range" min="0" max="1" step="0.05" value={gamma} onChange={(e) => setGamma(parseFloat(e.target.value))} style={{ width: '100%' }} />
              </div>
              
              <div style={{ marginTop: '1.5rem', height: '4px', display: 'flex', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ width: `${(alpha / (alpha + beta + gamma)) * 100}%`, background: '#FF3B30' }} />
                <div style={{ width: `${(beta / (alpha + beta + gamma)) * 100}%`, background: '#FF9500' }} />
                <div style={{ width: `${(gamma / (alpha + beta + gamma)) * 100}%`, background: '#FFD60A' }} />
              </div>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="glass-panel" style={{ padding: '1rem', display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1, borderRadius: '12px', overflow: 'hidden', zIndex: 1 }}>
              <MapContainer center={[50.8, 4.4]} zoom={7.5} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                  attribution='&copy; OpenStreetMap & CARTO'
                />
                {geoData && (
                  <GeoJSON 
                    key={`${year}-${alpha}-${beta}-${gamma}`} // Force re-render of GeoJSON when parameters change
                    data={geoData} 
                    style={getStyle}
                    onEachFeature={onEachFeature}
                  />
                )}
              </MapContainer>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
};

export default MCPIDashboard;
