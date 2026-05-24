import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Map, Navigation } from 'lucide-react';

const DataIntroSlide = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="slide-container">
      <div style={{ maxWidth: '1000px', width: '100%' }}>
        <h2 className="title" style={{ marginBottom: '0.5rem' }}>EcoSensor Data Overview</h2>
        <p className="subtitle" style={{ marginBottom: '3rem' }}>Automatic bicycle count data provided by the Agentschap Wegen & Verkeer (AWV)</p>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}
        >
          <motion.div variants={itemVariants} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '1rem' }}>
            <div style={{ padding: '1rem', background: 'rgba(0, 122, 255, 0.1)', borderRadius: '12px', color: 'var(--accent-color)' }}>
              <Activity size={32} />
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 500 }}>Counts</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              Bicycle traffic counts provided for each EcoSensor from late 2019 to 2026. Aggregated from 15-minute intervals to hourly formats.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '1rem' }}>
            <div style={{ padding: '1rem', background: 'rgba(52, 199, 89, 0.1)', borderRadius: '12px', color: '#34c759' }}>
              <Navigation size={32} />
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 500 }}>Direction</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              Directional data for traffic flow recorded at the sensors, categorized as <strong>in</strong>, <strong>out</strong>, or <strong>both</strong> directions.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '1rem' }}>
            <div style={{ padding: '1rem', background: 'rgba(255, 149, 0, 0.1)', borderRadius: '12px', color: '#ff9500' }}>
              <Map size={32} />
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 500 }}>Sites</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              Geographical coordinates and municipality mappings for all installed EcoCounters across the Flanders primary road network.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default DataIntroSlide;
