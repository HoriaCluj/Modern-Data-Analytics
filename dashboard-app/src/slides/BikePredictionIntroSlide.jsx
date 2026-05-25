import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Cpu, Network, Zap } from 'lucide-react';

const BikePredictionIntroSlide = () => {
  return (
    <div className="slide-container" style={{ padding: '4rem' }}>
      <div style={{ width: '100%', maxWidth: '1200px', height: '100%', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="title" style={{ fontSize: '3.5rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Activity size={48} color="var(--accent-color)" /> Bike Traffic Prediction Model
          </h2>
          <p className="subtitle" style={{ fontSize: '1.5rem', color: 'var(--text-secondary)' }}>
            Forecasting hourly cycling traffic across Flanders
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', flex: 1 }}>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Cpu size={28} /> Model Architecture
            </h3>
            <p style={{ fontSize: '1.1rem', lineHeight: 1.6 }}>
              Our goal was to accurately forecast hourly bike traffic per sensor to guide short-to-medium-term decisions, such as maintenance scheduling and event congestion management.
            </p>
            <ul style={{ fontSize: '1.1rem', lineHeight: 1.8, paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li><strong>Data Split:</strong> Training set used data from 2020-2025; testing set used 2026 data.</li>
              <li><strong>Initial Attempt:</strong> XGBoost with Poisson distribution. R² was relatively poor initially (0.67), improving slightly with fine-tuning.</li>
              <li><strong>Final Model:</strong> LightGBM. Increased trees to 1000 and max leaves to 127, while implementing L1 & L2 regularization.</li>
            </ul>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Zap size={28} /> Performance & Application
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '0.5rem', marginBottom: '1rem' }}>
              <div style={{ background: 'var(--bg-color)', padding: '1.5rem', borderRadius: '12px', textAlign: 'center', border: '1px solid var(--glass-border)' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--accent-color)' }}>0.75</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>R² Score</div>
              </div>
              <div style={{ background: 'var(--bg-color)', padding: '1.5rem', borderRadius: '12px', textAlign: 'center', border: '1px solid var(--glass-border)' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--accent-color)' }}>13.17</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>RMSE</div>
              </div>
              <div style={{ background: 'var(--bg-color)', padding: '1.5rem', borderRadius: '12px', textAlign: 'center', border: '1px solid var(--glass-border)' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--accent-color)' }}>5.28</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>MAE</div>
              </div>
            </div>
            <p style={{ fontSize: '1.1rem', lineHeight: 1.6 }}>
              The interactive dashboard pulls live weather prediction variables (like temperature, wind, and precipitation) from the Open-Meteo API to generate on-the-fly traffic forecasts for any selected EcoCounter.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default BikePredictionIntroSlide;
