import React from 'react';
import { motion } from 'framer-motion';
import { Map, Calculator, Target } from 'lucide-react';
import 'katex/dist/katex.min.css';
import { BlockMath } from 'react-katex';

// Using a constant outside the component to completely avoid JSX parsing artifacts
const LATEX_FORMULA = String.raw`\text{MCPI}_m = \alpha \underbrace{\left( \frac{\text{Weighted Accidents}_m}{\text{Predicted Traffic}_m} \right)}_{\text{accident rate per cyclist}} + \beta \underbrace{(\text{Infrastructure Deficit}_m)}_{\text{infra gap}} + \gamma \underbrace{\left( \frac{\text{Predicted Traffic}_m}{\text{Population}_m} \right)}_{\text{cycling adoption rate}}`;

const MCPIIntroSlide = () => {
  return (
    <div className="slide-container" style={{ padding: '4rem' }}>
      <div style={{ width: '100%', maxWidth: '1200px', height: '100%', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="title" style={{ fontSize: '3.5rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Map size={48} color="var(--accent-color)" /> Priority Index (MCPI)
          </h2>
          <p className="subtitle" style={{ fontSize: '1.5rem', color: 'var(--text-secondary)' }}>
            Municipality Cycling Priority Index for Long-Term Planning
          </p>
        </motion.div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', flex: 1 }}>
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="glass-panel" style={{ padding: '2.5rem' }}>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <Calculator size={24} /> The MCPI Formula
            </h3>
            
            <div style={{ 
              background: '#ffffff', 
              padding: '2rem', 
              borderRadius: '12px', 
              border: '1px solid var(--glass-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
              overflowX: 'auto',
              minHeight: '200px',
              fontSize: '1.2rem'
            }}>
              <BlockMath math={LATEX_FORMULA} />
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <h3 style={{ fontSize: '1.6rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Target size={24} /> Model Context
            </h3>
            <p style={{ fontSize: '1.1rem', lineHeight: 1.6 }}>
              The MCPI outputs a transparent composite priority score per municipality, assisting policymakers in allocating investments where they yield the greatest safety and mobility impact.
            </p>
            <ul style={{ fontSize: '1.1rem', lineHeight: 1.8, paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li><strong>Accident Severity:</strong> Calculated by assigning weights from 1 to 4 to past accidents based on severity, scaled to extrapolate through 2026.</li>
              <li><strong>Infrastructure Deficit Metric (IDM):</strong> Uses segregation, contraflow access, surface quality, and path conditions to represent infrastructure quality.</li>
              <li><strong>Normalization:</strong> All three primary terms are min-max normalized (rescaled between 0 and 1) to prevent any term from disproportionately skewing the score.</li>
            </ul>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default MCPIIntroSlide;
