import React from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LabelList, Cell
} from 'recharts';

const TechStackSlide = () => {
  const modelPerformance = [
    { name: 'XGBoost (Basic)', r2: 0.67, rmse: 14.93 },
    { name: 'XGBoost (Tuned)', r2: 0.71, rmse: 14.07 },
    { name: 'LightGBM (Basic)', r2: 0.72, rmse: 13.88 },
    { name: 'LightGBM (Tuned)', r2: 0.75, rmse: 13.17 },
  ];

  const packages = [
    { name: 'Pandas', role: 'Data Manipulation', color: '#150458' },
    { name: 'NumPy', role: 'Numerical Computing', color: '#013243' },
    { name: 'Scikit-Learn', role: 'Data Preprocessing', color: '#F7931E' },
    { name: 'LightGBM', role: 'Gradient Boosting', color: '#FF3B30' },
    { name: 'XGBoost', role: 'Gradient Boosting', color: '#32ADE6' },
  ];

  return (
    <div className="slide-container">
      <div style={{ maxWidth: '1200px', width: '100%' }}>
        <h2 className="title" style={{ marginBottom: '0.5rem' }}>Methodology & Tech Stack</h2>
        <p className="subtitle" style={{ marginBottom: '3rem' }}>Python packages utilized and model performance evaluation</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="glass-panel"
          >
            <h3 style={{ fontSize: '1.4rem', fontWeight: 500, marginBottom: '1.5rem', textAlign: 'center' }}>Model Performance (R²)</h3>
            <div style={{ height: '300px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={modelPerformance} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} angle={-15} textAnchor="end" height={60} />
                  <YAxis domain={[0.6, 0.8]} stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)' }} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#111', border: '1px solid var(--glass-border)', borderRadius: '8px', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="r2" fill="var(--accent-color)" radius={[4, 4, 0, 0]}>
                    {modelPerformance.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 3 ? '#34c759' : 'var(--accent-color)'} />
                    ))}
                    <LabelList dataKey="r2" position="top" fill="var(--text-primary)" style={{ fontSize: '12px' }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              The tuned LightGBM model was selected for the final predictions.
            </p>
          </motion.div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 500, marginBottom: '0.5rem', paddingLeft: '0.5rem' }}>Core Python Stack</h3>
            {packages.map((pkg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                className="glass-panel"
                style={{ padding: '1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: pkg.color }} />
                  <span style={{ fontSize: '1.2rem', fontWeight: 600 }}>{pkg.name}</span>
                </div>
                <span style={{ color: 'var(--text-secondary)' }}>{pkg.role}</span>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};

export default TechStackSlide;
