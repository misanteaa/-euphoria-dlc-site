"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function Cursor() {
  // Ядро следует почти мгновенно, кольцо — плавно догоняет (iOS-ощущение)
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);

  const dotX = useSpring(x, { damping: 30, stiffness: 800, mass: 0.2 });
  const dotY = useSpring(y, { damping: 30, stiffness: 800, mass: 0.2 });
  const ringX = useSpring(x, { damping: 22, stiffness: 180, mass: 0.6 });
  const ringY = useSpring(y, { damping: 22, stiffness: 180, mass: 0.6 });

  const [hovering, setHovering] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    setEnabled(true);
    document.body.classList.add("custom-cursor");

    const move = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const el = e.target as HTMLElement;
      setHovering(
        !!el.closest("a, button, input, [role='button'], .cursor-pointer")
      );
    };
    const down = () => setPressed(true);
    const up = () => setPressed(false);

    window.addEventListener("mousemove", move);
    window.addEventListener("mousedown", down);
    window.addEventListener("mouseup", up);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mousedown", down);
      window.removeEventListener("mouseup", up);
      document.body.classList.remove("custom-cursor");
    };
  }, [x, y]);

  if (!enabled) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999]">
      {/* Тонкое кольцо, мягко догоняющее курсор */}
      <motion.div style={{ x: ringX, y: ringY }} className="absolute top-0 left-0">
        <motion.div
          animate={{
            width: hovering ? 52 : 34,
            height: hovering ? 52 : 34,
            borderColor: hovering
              ? "rgba(196,160,255,0.9)"
              : "rgba(255,255,255,0.45)",
            scale: pressed ? 0.8 : 1,
          }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="rounded-full border"
          style={{ translateX: "-50%", translateY: "-50%" }}
        />
      </motion.div>

      {/* Маленькое ядро */}
      <motion.div style={{ x: dotX, y: dotY }} className="absolute top-0 left-0">
        <motion.div
          animate={{ scale: pressed ? 1.6 : hovering ? 0 : 1 }}
          transition={{ type: "spring", damping: 20, stiffness: 400 }}
          className="w-1.5 h-1.5 rounded-full bg-white"
          style={{ translateX: "-50%", translateY: "-50%" }}
        />
      </motion.div>
    </div>
  );
}
