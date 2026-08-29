import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function AnimatedBackground() {
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const [windowCenter, setWindowCenter] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setWindowCenter({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <>
      <div className="fixed inset-0 z-[-10] overflow-hidden pointer-events-none bg-ink">
        
        {/* Cuadrícula interactiva siempre visible */}
        <motion.div 
          className="absolute inset-[-10%] bg-grid opacity-70"
          animate={{
            x: (mousePos.x - windowCenter.x) * -0.02,
            y: (mousePos.y - windowCenter.y) * -0.02,
            rotateX: (mousePos.y - windowCenter.y) * 0.015,
            rotateY: (mousePos.x - windowCenter.x) * -0.015,
          }}
          transition={{ type: "spring", stiffness: 100, damping: 30 }}
          style={{ transformPerspective: 1000 }}
        />
      </div>

      {/* Custom Cursor Ring */}
      <motion.div
        className="fixed top-0 left-0 z-[9999] pointer-events-none h-8 w-8 rounded-full border-2 border-brand-2 mix-blend-screen hidden md:block"
        animate={{ x: mousePos.x - 16, y: mousePos.y - 16 }}
        transition={{ type: "spring", stiffness: 400, damping: 28, mass: 0.5 }}
      />
      {/* Custom Cursor Dot */}
      <motion.div
        className="fixed top-0 left-0 z-[10000] pointer-events-none h-2 w-2 rounded-full bg-brand-2 hidden md:block"
        animate={{ x: mousePos.x - 4, y: mousePos.y - 4 }}
        transition={{ type: "spring", stiffness: 1000, damping: 40, mass: 0.1 }}
      />
    </>
  );
}
