import React from 'react';
import { motion } from 'framer-motion';

const IntroSlide = () => {
  return (
    <div className="slide-container" style={{ textAlign: 'center' }}>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="glass-panel"
        style={{ maxWidth: '800px' }}
      >
        <motion.h1 
          className="title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          Modern Data Analytics
        </motion.h1>
        <motion.div 
          style={{ height: '4px', width: '60px', background: 'var(--accent-color)', margin: '0 auto 2rem auto', borderRadius: '2px' }}
          initial={{ width: 0 }}
          animate={{ width: 60 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        />
        <motion.h2 
          className="subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          Biking In Flanders
        </motion.h2>
        
        <motion.p
          style={{ marginTop: '2rem', fontSize: '1.2rem', color: 'var(--text-secondary)', lineHeight: '1.8' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
        >
          Developing a comprehensive two-tier decision-support tool for cycling infrastructure planning.
        </motion.p>
      </motion.div>
    </div>
  );
};

export default IntroSlide;
