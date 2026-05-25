import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, CheckCircle, Navigation, ShieldCheck } from 'lucide-react';

const ConclusionSlide = () => {
  return (
    <div className="slide-container" style={{ padding: '4rem' }}>
      <div style={{ width: '100%', maxWidth: '1200px', height: '100%', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="title" style={{ fontSize: '3.5rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Lightbulb size={48} color="var(--accent-color)" /> Project Utility & Impact
          </h2>
          <p className="subtitle" style={{ fontSize: '1.5rem', color: 'var(--text-secondary)' }}>
            Empowering data-driven cycling infrastructure planning
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', flex: 1 }}>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Navigation size={28} /> Operational Level: Forecasts
            </h3>
            <p style={{ fontSize: '1.1rem', lineHeight: 1.6 }}>
              The Bike Prediction dashboard enables immediate, short-to-medium-term interventions for traffic and maintenance control.
            </p>
            <ul style={{ fontSize: '1.1rem', lineHeight: 1.8, paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li><strong>Maintenance Scheduling:</strong> Identifying low-traffic periods to perform critical path repairs with minimal disruption.</li>
              <li><strong>Congestion Management:</strong> Anticipating high-traffic surges during peak hours or specific weather conditions.</li>
              <li><strong>Accessibility:</strong> Provides an intuitive interface that doesn't require specialized data science knowledge to operate.</li>
            </ul>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h3 style={{ fontSize: '1.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <ShieldCheck size={28} /> Strategic Level: MCPI
            </h3>
            <p style={{ fontSize: '1.1rem', lineHeight: 1.6 }}>
              The Priority Index dashboard offers long-term macro-level insights to guide overarching policy and budget allocations.
            </p>
            <ul style={{ fontSize: '1.1rem', lineHeight: 1.8, paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li><strong>Hotspot Identification:</strong> Pinpoints municipalities with the highest accident risks and infrastructure deficits.</li>
              <li><strong>Progress Tracking:</strong> Allows policymakers to track changes across years to assess if previous interventions were successful.</li>
              <li><strong>Vision Zero:</strong> Directly supports the Flemish agency's goal of reducing fatal cyclist and pedestrian accidents to absolute zero.</li>
            </ul>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="glass-panel" style={{ textAlign: 'center', padding: '2rem' }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', color: 'var(--accent-color)' }}>
            <CheckCircle size={24} /> Conclusion
          </h3>
          <p style={{ fontSize: '1.1rem', lineHeight: 1.6, marginTop: '1rem', maxWidth: '900px', margin: '1rem auto 0 auto' }}>
            By employing this two-tier decision-support tool, the concerned authorities can optimally devote limited financial resources to areas presenting the highest level of lane degradation and accident risk, significantly improving the safety and mobility of the Flemish cycling network.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default ConclusionSlide;
