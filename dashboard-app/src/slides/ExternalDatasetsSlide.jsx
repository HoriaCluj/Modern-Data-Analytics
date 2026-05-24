import React from 'react';
import { motion } from 'framer-motion';
import { Cloud, AlertTriangle, Users, GitMerge } from 'lucide-react';

const ExternalDatasetsSlide = () => {
  const data = [
    {
      title: "Weather Dataset",
      source: "Open-Meteo API",
      icon: <Cloud size={24} />,
      color: "#32ADE6",
      desc: "Hourly historical weather data matching sensor coordinates. Includes temperature, apparent temperature, wind speed, precipitation, and snowfall."
    },
    {
      title: "Accident Dataset",
      source: "StatBel (Statistics Belgium)",
      icon: <AlertTriangle size={24} />,
      color: "#FF3B30",
      desc: "Comprehensive tabular description of road accidents involving bicycles (2017-2024). Details location, weather, and injury severity."
    },
    {
      title: "Demographics",
      source: "StatBel",
      icon: <Users size={24} />,
      color: "#FF9500",
      desc: "Population sizes across municipalities spanning the years 2020 to 2026."
    },
    {
      title: "Infrastructure",
      source: "European Cyclist Federation",
      icon: <GitMerge size={24} />,
      color: "#34C759",
      desc: "Quality metrics of cycling paths used to compute the Infrastructure Deficit Metric (IDM), capturing segregation, contraflow access, and surface quality."
    }
  ];

  return (
    <div className="slide-container">
      <div style={{ maxWidth: '1000px', width: '100%' }}>
        <h2 className="title" style={{ marginBottom: '0.5rem' }}>Supplementary Datasets</h2>
        <p className="subtitle" style={{ marginBottom: '3rem' }}>Integrating external factors to build a holistic predictive model</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
          {data.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.15, duration: 0.6 }}
              className="glass-panel"
              style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}
            >
              <div style={{ padding: '1rem', background: `${item.color}20`, borderRadius: '12px', color: item.color }}>
                {item.icon}
              </div>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 600, marginBottom: '0.25rem' }}>{item.title}</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--accent-color)', marginBottom: '0.75rem', fontWeight: 500 }}>{item.source}</p>
                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.5', fontSize: '0.95rem' }}>{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExternalDatasetsSlide;
