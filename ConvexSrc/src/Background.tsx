import { motion } from "framer-motion";

export function AnimatedBackground() {
  return (
    <div className="animated-gradient fixed inset-0 -z-10 overflow-hidden">
      <motion.div
        className="blob"
        style={{ background: "#6d5efc", width: 480, height: 480, top: -120, left: -80 }}
        animate={{ x: [0, 60, 0], y: [0, 40, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="blob"
        style={{ background: "#22d3ee", width: 420, height: 420, top: 120, right: -100 }}
        animate={{ x: [0, -50, 0], y: [0, 60, 0] }}
        transition={{ duration: 19, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="blob"
        style={{ background: "#f472b6", width: 360, height: 360, bottom: -120, left: "35%" }}
        animate={{ x: [0, 40, 0], y: [0, -40, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
