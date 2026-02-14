'use client';

import { motion, useReducedMotion } from 'framer-motion';

const CANDY_SHAPES = ['🍬', '🍭', '🍫', '⭐', '🎉', '🍩', '🧁', '🍪', '🎀', '✨', '🍰', '💫'];

interface ParticleProps {
  emoji: string;
  index: number;
}

function Particle({ emoji, index }: ParticleProps) {
  const shouldReduceMotion = useReducedMotion();

  // Random positioning
  const leftPosition = 5 + (index * 90) / 12;
  const size = 16 + (index % 4) * 6;

  // Stagger animation timing
  const duration = 15 + (index % 4) * 3;
  const delay = index * 0.8;

  if (shouldReduceMotion) {
    return (
      <span
        className="pointer-events-none absolute select-none opacity-30"
        style={{
          left: `${leftPosition}%`,
          top: `${20 + (index % 3) * 20}%`,
          fontSize: `${size}px`,
        }}
        aria-hidden="true"
      >
        {emoji}
      </span>
    );
  }

  return (
    <motion.span
      className="pointer-events-none absolute select-none"
      style={{
        left: `${leftPosition}%`,
        fontSize: `${size}px`,
      }}
      initial={{ y: '110vh', opacity: 0, rotate: 0 }}
      animate={{
        y: ['-10vh'],
        opacity: [0, 0.4, 0.6, 0.4, 0],
        rotate: [0, 180, 360],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'linear',
      }}
      aria-hidden="true"
    >
      {emoji}
    </motion.span>
  );
}

export default function CandyParticles() {
  // Use only 10 particles for performance
  const particles = CANDY_SHAPES.slice(0, 10);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {particles.map((emoji, i) => (
        <Particle key={`${emoji}-${i}`} emoji={emoji} index={i} />
      ))}
    </div>
  );
}
