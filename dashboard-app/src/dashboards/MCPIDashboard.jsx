import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { SlidersHorizontal, Calendar, Activity, GitMerge, TrendingUp, ListOrdered, Info, X } from 'lucide-react';
import * as topojson from 'topojson-client';

const normalizeName = (value) => (
  value
    ?.normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/['’`.-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim() || ''
);

const calculateMcpi = (row, alpha, beta, gamma) => {
  if (!row) return null;
  const totalWeight = alpha + beta + gamma;
  if (totalWeight === 0) return 0;
  return (
    alpha * row.norm_accident_rate +
    beta * row.norm_infrastructure_deficit +
    gamma * row.norm_cycling_adoption_rate
  ) / totalWeight;
};

const getMcpiColor = (mcpi, maxMcpi) => {
  if (mcpi === null || mcpi === undefined) return '#8e8e93';
  const scale = maxMcpi > 0 ? Math.min(1, Math.max(0, mcpi / maxMcpi)) : 0;
  const hue = 128 - (128 * scale);
  const lightness = 45 + (8 * (1 - Math.abs(scale - 0.5) * 2));
  return `hsl(${hue}, 82%, ${lightness}%)`;
};

const MCPIDashboard = () => {
  const [geoData, setGeoData] = useState(null);
  const [mcpiData, setMcpiData] = useState({});
  const [selectedMunicipality, setSelectedMunicipality] = useState(null);
  const [year, setYear] = useState(2026);
  const [alpha, setAlpha] = useState(0.4);
  const [beta, setBeta] = useState(0.3);
  const [gamma, setGamma] = useState(0.3);
  const [trendMunicipality, setTrendMunicipality] = useState(null);

  const mcpiLookup = useMemo(() => {
    const lookup = {};
    Object.entries(mcpiData).forEach(([municipality, yearlyRows]) => {
      lookup[normalizeName(municipality)] = yearlyRows;
    });
    return lookup;
  }, [mcpiData]);

  const maxMcpiForSelection = useMemo(() => {
    return Object.values(mcpiData).reduce((maxValue, yearlyRows) => {
      const row = yearlyRows?.[year];
      const mcpi = calculateMcpi(row, alpha, beta, gamma);
      return mcpi !== null && mcpi > maxValue ? mcpi : maxValue;
    }, 0);
  }, [mcpiData, year, alpha, beta, gamma]);

  const rankedMunicipalities = useMemo(() => {
    return Object.entries(mcpiData)
      .map(([municipality, yearlyRows]) => {
        const row = yearlyRows?.[year];
        const mcpi = calculateMcpi(row, alpha, beta, gamma);
        return row ? { municipality, row, mcpi } : null;
      })
      .filter(Boolean)
      .sort((a, b) => b.mcpi - a.mcpi);
  }, [mcpiData, year, alpha, beta, gamma]);

  const selectedDetail = useMemo(() => {
    if (!selectedMunicipality) return rankedMunicipalities[0] || null;
    return rankedMunicipalities.find(item => normalizeName(item.municipality) === normalizeName(selectedMunicipality)) || null;
  }, [rankedMunicipalities, selectedMunicipality]);

  const trendDetail = useMemo(() => {
    if (!trendMunicipality) return null;
    const match = Object.entries(mcpiData).find(([municipality]) => (
      normalizeName(municipality) === normalizeName(trendMunicipality)
    ));

    if (!match) return null;

    const [municipality, yearlyRows] = match;
    const data = Array.from({ length: 7 }, (_, index) => {
      const trendYear = 2020 + index;
      const row = yearlyRows?.[trendYear];
      const mcpi = calculateMcpi(row, alpha, beta, gamma);
      return {
        year: trendYear,
        mcpi: mcpi === null ? null : Number(mcpi.toFixed(4)),
      };
    });

    const validValues = data.filter(item => item.mcpi !== null);
    const first = validValues[0]?.mcpi ?? null;
    const last = validValues[validValues.length - 1]?.mcpi ?? null;
    const delta = first !== null && last !== null ? last - first : null;

    return { municipality, data, delta };
  }, [trendMunicipality, mcpiData, alpha, beta, gamma]);

  useEffect(() => {
    Promise.all([
      fetch('/belgium.json').then(res => res.json()),
      fetch('http://localhost:8000/api/mcpi').then(res => res.json())
    ])
      .then(([topo, mcpiResponse]) => {
        const geojson = topojson.feature(topo, topo.objects.municipalities);
        geojson.features = geojson.features.filter(feature => feature.properties.reg_nis === '02000');
        setGeoData(geojson);
        setMcpiData(mcpiResponse?.data || {});
      })
      .catch(err => console.error("Error loading MCPI map data", err));
  }, []);

  const getFeatureRow = (feature) => {
    const name = feature.properties.name_nl || feature.properties.name_fr;
    return mcpiLookup[normalizeName(name)]?.[year] || null;
  };

  const getStyle = (feature) => {
    const row = getFeatureRow(feature);
    const mcpi = calculateMcpi(row, alpha, beta, gamma);
    const hasData = row !== null;
    const name = feature.properties.name_nl || feature.properties.name_fr;
    const isSelected = normalizeName(name) === normalizeName(selectedDetail?.municipality);

    return {
      fillColor: getMcpiColor(mcpi, maxMcpiForSelection),
      fillOpacity: hasData ? 0.78 : 0.42,
      color: isSelected ? '#111' : '#222',
      weight: isSelected ? 3 : hasData ? 1 : 0.7,
    };
  };

  const onEachFeature = (feature, layer) => {
    const name = feature.properties.name_nl || feature.properties.name_fr;
    const row = getFeatureRow(feature);
    const mcpi = calculateMcpi(row, alpha, beta, gamma);

    if (!row) {
      layer.bindPopup(`<strong>${name}</strong><br/>No MCPI data`);
      return;
    }

    layer.on({
      click: () => setSelectedMunicipality(name),
      popupopen: (event) => {
        const button = event.popup.getElement()?.querySelector('.mcpi-trend-button');
        if (!button) return;
        button.addEventListener('click', () => {
          const matchedMunicipality = rankedMunicipalities.find(item => (
            normalizeName(item.municipality) === normalizeName(name)
          ))?.municipality || name;
          setSelectedMunicipality(matchedMunicipality);
          setTrendMunicipality(matchedMunicipality);
        });
      },
    });

    layer.bindPopup(
      `<strong>${name}</strong><br/>` +
      `MCPI: ${mcpi.toFixed(3)}<br/>` +
      `Accident score: ${row.accident_score.toFixed(1)}<br/>` +
      `Traffic: ${Math.round(row.yearly_bike_count).toLocaleString()}<br/>` +
      `Population: ${row.population.toLocaleString()}<br/>` +
      `Infrastructure deficit: ${row.infrastructure_deficit.toFixed(3)}<br/>` +
      `<button class="mcpi-trend-button" type="button">See MCPI over time</button>`
    );
  };

  return (
    <div className="slide-container" style={{ padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: '1500px', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 className="title" style={{ fontSize: '2.5rem', marginBottom: '0.2rem' }}>Priority Index (MCPI)</h2>
          <p className="subtitle" style={{ fontSize: '1.1rem' }}>Municipality Cycling Priority Index Configuration</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '250px minmax(0, 1fr) 360px', gap: '1rem', flex: 1, minHeight: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto', paddingRight: '0.5rem' }}>
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass-panel">
              <h3 style={{ marginBottom: '1.5rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={20} /> Timeline Selection
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input type="range" min="2020" max="2026" step="1" value={year} onChange={(e) => setYear(parseInt(e.target.value, 10))} style={{ width: '100%' }} />
                <div style={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: 600, color: 'var(--accent-color)' }}>{year}</div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="glass-panel">
              <h3 style={{ marginBottom: '1.5rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <SlidersHorizontal size={20} /> Parameter Tuning
              </h3>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#2563eb' }}><Activity size={16} /> Accident Rate (alpha)</span>
                  <span>{alpha.toFixed(2)}</span>
                </label>
                <input type="range" min="0" max="1" step="0.05" value={alpha} onChange={(e) => setAlpha(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#2563eb' }} />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#8b5cf6' }}><GitMerge size={16} /> Infra Gap (beta)</span>
                  <span>{beta.toFixed(2)}</span>
                </label>
                <input type="range" min="0" max="1" step="0.05" value={beta} onChange={(e) => setBeta(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#8b5cf6' }} />
              </div>

              <div style={{ marginBottom: '0.5rem' }}>
                <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#ec4899' }}><TrendingUp size={16} /> Adoption (gamma)</span>
                  <span>{gamma.toFixed(2)}</span>
                </label>
                <input type="range" min="0" max="1" step="0.05" value={gamma} onChange={(e) => setGamma(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#ec4899' }} />
              </div>

              <div style={{ marginTop: '1.5rem', height: '4px', display: 'flex', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ width: `${(alpha / (alpha + beta + gamma || 1)) * 100}%`, background: '#2563eb' }} />
                <div style={{ width: `${(beta / (alpha + beta + gamma || 1)) * 100}%`, background: '#8b5cf6' }} />
                <div style={{ width: `${(gamma / (alpha + beta + gamma || 1)) * 100}%`, background: '#ec4899' }} />
              </div>
            </motion.div>

          </div>

          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="glass-panel" style={{ padding: '1rem', display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1, borderRadius: '12px', overflow: 'hidden', zIndex: 1 }}>
              <MapContainer center={[51.0, 4.4]} zoom={8} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                  attribution='&copy; OpenStreetMap & CARTO'
                />
                {geoData && (
                  <GeoJSON
                    key={`${year}-${alpha}-${beta}-${gamma}-${Object.keys(mcpiLookup).length}-${selectedDetail?.municipality || ''}`}
                    data={geoData}
                    style={getStyle}
                    onEachFeature={onEachFeature}
                  />
                )}
              </MapContainer>
            </div>
          </motion.div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', paddingRight: '0.5rem' }}>
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }} className="glass-panel">
              <h3 style={{ marginBottom: '1rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Info size={20} /> Map Scale
              </h3>
              <div style={{
                height: '10px',
                borderRadius: '999px',
                background: 'linear-gradient(90deg, hsl(128, 82%, 45%), hsl(64, 82%, 53%), hsl(0, 82%, 45%))',
                border: '1px solid var(--glass-border)',
                marginBottom: '0.6rem',
              }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                <span>0.000</span>
                <span>{maxMcpiForSelection.toFixed(3)}</span>
              </div>
              <div style={{ marginTop: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                <span style={{ width: '14px', height: '14px', borderRadius: '3px', background: '#8e8e93', display: 'inline-block' }} />
                <span>No MCPI data</span>
              </div>
            </motion.div>

            {selectedDetail && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="glass-panel">
                <h3 style={{ marginBottom: '1rem', fontWeight: 500 }}>{selectedDetail.municipality}</h3>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '2.2rem', fontWeight: 700, color: 'var(--accent-color)', lineHeight: 1 }}>{selectedDetail.mcpi.toFixed(3)}</span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>MCPI</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.7rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  <div>Accident score<br/><strong style={{ color: 'var(--text-primary)' }}>{selectedDetail.row.accident_score.toFixed(1)}</strong></div>
                  <div>Traffic<br/><strong style={{ color: 'var(--text-primary)' }}>{Math.round(selectedDetail.row.yearly_bike_count).toLocaleString()}</strong></div>
                  <div>Population<br/><strong style={{ color: 'var(--text-primary)' }}>{selectedDetail.row.population.toLocaleString()}</strong></div>
                  <div>Infra deficit<br/><strong style={{ color: 'var(--text-primary)' }}>{selectedDetail.row.infrastructure_deficit.toFixed(3)}</strong></div>
                </div>
              </motion.div>
            )}

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }} className="glass-panel">
              <h3 style={{ marginBottom: '1rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ListOrdered size={20} /> Top Priorities
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {rankedMunicipalities.slice(0, 10).map((item, index) => {
                  const isSelected = normalizeName(item.municipality) === normalizeName(selectedDetail?.municipality);
                  return (
                    <button
                      key={item.municipality}
                      type="button"
                      onClick={() => setSelectedMunicipality(item.municipality)}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '28px minmax(0, 1fr) auto',
                        alignItems: 'center',
                        gap: '0.55rem',
                        width: '100%',
                        padding: '0.55rem 0.65rem',
                        borderRadius: '8px',
                        border: `1px solid ${isSelected ? 'var(--accent-color)' : 'var(--glass-border)'}`,
                        background: isSelected ? 'rgba(0, 122, 255, 0.12)' : 'rgba(255,255,255,0.04)',
                        color: 'var(--text-primary)',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{index + 1}</span>
                      <span style={{ fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.municipality}</span>
                      <span style={{ fontSize: '0.82rem', color: 'var(--accent-color)', fontWeight: 600 }}>{item.mcpi.toFixed(3)}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      {trendDetail && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setTrendMunicipality(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            background: 'rgba(10, 15, 25, 0.58)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            onClick={(event) => event.stopPropagation()}
            className="glass-panel"
            style={{
              width: 'min(900px, 92vw)',
              height: 'min(620px, 82vh)',
              background: 'rgba(255, 255, 255, 0.96)',
              color: '#172033',
              border: '1px solid rgba(31, 41, 55, 0.14)',
              boxShadow: '0 24px 80px rgba(0, 0, 0, 0.28)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontSize: '1.8rem', fontWeight: 650, marginBottom: '0.35rem' }}>{trendDetail.municipality}</h3>
                <p style={{ color: '#5f6f89', fontSize: '1rem' }}>MCPI change over time using the current alpha, beta, and gamma weights</p>
              </div>
              <button
                type="button"
                onClick={() => setTrendMunicipality(null)}
                aria-label="Close trend popup"
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '8px',
                  border: '1px solid rgba(31, 41, 55, 0.16)',
                  background: '#ffffff',
                  color: '#172033',
                  display: 'grid',
                  placeItems: 'center',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                <X size={22} />
              </button>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ padding: '0.8rem 1rem', borderRadius: '8px', background: 'rgba(37, 99, 235, 0.09)', border: '1px solid rgba(37, 99, 235, 0.18)' }}>
                <div style={{ color: '#5f6f89', fontSize: '0.9rem' }}>2020 to 2026 change</div>
                <div style={{ color: trendDetail.delta >= 0 ? '#b91c1c' : '#047857', fontSize: '1.55rem', fontWeight: 700 }}>
                  {trendDetail.delta === null ? 'N/A' : `${trendDetail.delta >= 0 ? '+' : ''}${trendDetail.delta.toFixed(3)}`}
                </div>
              </div>
              <div style={{ color: '#5f6f89', fontSize: '0.95rem' }}>
                Higher MCPI means the municipality is more urgent under the selected weighting.
              </div>
            </div>

            <div style={{ flex: 1, minHeight: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendDetail.data} margin={{ top: 12, right: 30, left: 12, bottom: 12 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(95, 111, 137, 0.24)" />
                  <XAxis dataKey="year" stroke="#5f6f89" tick={{ fill: '#5f6f89', fontSize: 14 }} />
                  <YAxis
                    stroke="#5f6f89"
                    tick={{ fill: '#5f6f89', fontSize: 14 }}
                    domain={['auto', 'auto']}
                    tickFormatter={(value) => Number(value).toFixed(2)}
                  />
                  <Tooltip
                    formatter={(value) => [Number(value).toFixed(3), 'MCPI']}
                    labelFormatter={(label) => `Year ${label}`}
                    contentStyle={{
                      background: '#ffffff',
                      border: '1px solid rgba(31, 41, 55, 0.16)',
                      borderRadius: '8px',
                      color: '#172033',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="mcpi"
                    stroke="#8b5cf6"
                    strokeWidth={4}
                    dot={{ r: 5, fill: '#ec4899', stroke: '#ffffff', strokeWidth: 2 }}
                    activeDot={{ r: 7, fill: '#2563eb', stroke: '#ffffff', strokeWidth: 2 }}
                    connectNulls={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </motion.div>
      )}
      <style>{`
        .mcpi-trend-button {
          margin-top: 0.5rem;
          border: 1px solid rgba(31, 41, 55, 0.22);
          background: #ffffff;
          color: #172033;
          border-radius: 6px;
          padding: 0.28rem 0.5rem;
          font-size: 0.78rem;
          font-weight: 500;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default MCPIDashboard;
