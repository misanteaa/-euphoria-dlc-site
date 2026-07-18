"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import TiltCard from "./TiltCard";

export default function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ type: "spring", damping: 18, stiffness: 160 }}
      viewport={{ once: true, amount: 0.4 }}
      className="w-full max-w-md"
    >
      <TiltCard max={6}>
        <div
          className="
            group
            relative
            border border-white/10
            bg-white/[0.03]
            hover:bg-white/[0.06]
            rounded-2xl
            p-6
            overflow-hidden
            transition-colors
          "
        >
          <div className="flex items-center gap-3 mb-3 text-white">
            <span className="grid place-items-center w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-white/80 group-hover:text-purple-300 group-hover:scale-110 transition-transform">
              {icon}
            </span>
            <h3 className="text-xl font-semibold">{title}</h3>
          </div>

          <p className="text-white/70 leading-relaxed text-sm">{description}</p>
        </div>
      </TiltCard>
    </motion.div>
  );
}
