'use client';

// Global easter egg: Pablo the parrot drifts around the site; clicking him opens
// the hidden "Pablo's Garden Run" mini-game. Mounted once in the locale layout.

import { useState } from 'react';
import FloatingParrot from './FloatingParrot';
import ParrotGame from './ParrotGame';

export default function ParrotEasterEgg() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {!open && <FloatingParrot onOpen={() => setOpen(true)} />}
      {open && <ParrotGame onClose={() => setOpen(false)} />}
    </>
  );
}
