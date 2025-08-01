'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

const DecorativeBlobs = () => {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Don't render anything until mounted to avoid hydration issues
  if (!mounted) {
    return <div className="absolute inset-0 -z-10 overflow-hidden" />;
  }
  
  // Use predefined positions to avoid hydration mismatch
  const blobs = [
    {
      id: 1,
      style: {
        width: '120px',
        height: '150px',
        top: '10%',
        left: '85%',
      },
      animate: {
        y: ['0%', '10%', '0%'],
        x: ['0%', '-5%', '0%'],
      },
      duration: 15
    },
    {
      id: 2,
      style: {
        width: '80px',
        height: '90px',
        top: '60%',
        left: '5%',
      },
      animate: {
        y: ['0%', '-15%', '0%'],
        x: ['0%', '10%', '0%'],
      },
      duration: 20
    },
    {
      id: 3,
      style: {
        width: '110px',
        height: '130px',
        top: '25%',
        left: '90%',
      },
      animate: {
        y: ['0%', '20%', '0%'],
        x: ['0%', '-10%', '0%'],
      },
      duration: 18
    },
    {
      id: 4,
      style: {
        width: '140px',
        height: '160px',
        top: '70%',
        left: '80%',
      },
      animate: {
        y: ['0%', '-10%', '0%'],
        x: ['0%', '5%', '0%'],
      },
      duration: 22
    },
    {
      id: 5,
      style: {
        width: '90px',
        height: '110px',
        top: '40%',
        left: '2%',
      },
      animate: {
        y: ['0%', '15%', '0%'],
        x: ['0%', '8%', '0%'],
      },
      duration: 17
    }
  ];
  
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      {blobs.map(blob => (
        <motion.div
          key={blob.id}
          className="absolute rounded-full bg-primary/10 backdrop-blur-sm"
          style={blob.style}
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: 1,
            ...blob.animate 
          }}
          transition={{
            opacity: { duration: 0.5 },
            y: {
              duration: blob.duration,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut',
            },
            x: {
              duration: blob.duration,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut',
            }
          }}
        />
      ))}
    </div>
  );
};

export default DecorativeBlobs; 