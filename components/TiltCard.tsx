"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ReactNode } from "react";

// Переиспользуемая обёртка: 3D-наклон к курсору + блик (iOS-стиль)
export default function TiltCard({
  children,
  className = "",
  max = 8,
  glare = true,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
  glare?: boolean;
}) {
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(my, [0, 1], [max, -max]), {
    damping: 15,
    stiffness: 200,
  });
  const rotateY = useSpring(useTransform(mx, [0, 1], [-max, max]), {
    damping: 15,
    stiffness: 200,
  });
  const glareX = useTransform(mx, [0, 1], ["0%", "100%"]);
  const glareY = useTransform(my, [0, 1], ["0%", "100%"]);

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
  }
  function handleLeave() {
    mx.set(0.5);
    my.set(0.5);
  }

  return (
    <motion.div
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      whileHover={{ scale: 1.03, y: -6 }}
      whileTap={{ scale: 0.98 }}
      style={{ rotateX, rotateY, transformPerspective: 1000 }}
      transition={{ type: "spring", damping: 18, stiffness: 260 }}
      className={`relative ${className}`}
    >
      {children}
      {glare && (
        <motion.span
          className="pointer-events-none absolute inset-0 rounded-[inherit] overflow-hidden opacity-0 hover:opacity-100"
          style={{ opacity: 1 }}
        >
          <motion.span
            className="absolute w-48 h-48 rounded-full"
            style={{
              left: glareX,
              top: glareY,
              x: "-50%",
              y: "-50%",
              background:
                "radial-gradient(circle, rgba(196,160,255,0.18) 0%, rgba(196,160,255,0) 70%)",
            }}
          />
        </motion.span>
      )}
    </motion.div>
  );
}
