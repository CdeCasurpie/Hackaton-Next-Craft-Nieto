import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function AnimatedBackground() {
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <>
      <div className="fixed inset-0 z-[-1] bg-grid" />
      
      {/* Custom Cursor Ring */}
      <motion.div
        className="fixed top-0 left-0 z-[100] pointer-events-none h-8 w-8 rounded-full border-2 border-brand-2 mix-blend-screen hidden md:block"
        animate={{ x: mousePos.x - 16, y: mousePos.y - 16 }}
        transition={{ type: "spring", stiffness: 400, damping: 28, mass: 0.5 }}
      />
      {/* Custom Cursor Dot */}
      <motion.div
        className="fixed top-0 left-0 z-[100] pointer-events-none h-2 w-2 rounded-full bg-brand-2 hidden md:block"
        animate={{ x: mousePos.x - 4, y: mousePos.y - 4 }}
        transition={{ type: "spring", stiffness: 1000, damping: 40, mass: 0.1 }}
      />
    </>
  );
}
