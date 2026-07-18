"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

type LoaderProps = {
  onFinished?: () => void;
  durationMs?: number;
};

export default function Loader({ onFinished, durationMs = 1000 }: LoaderProps) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setLoading(false);
      onFinished?.();
    }, durationMs);

    return () => clearTimeout(t);
  }, [durationMs, onFinished]);

  useEffect(() => {
    if (loading) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [loading]);

  if (!loading) return null;

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          suppressHydrationWarning
          className="fixed inset-0 bg-black/80 z-50 flex flex-col items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="mb-6"
          >
            <Image
              src="/icon.png"
              width={140}
              height={140}
              alt="Icon"
              priority
            />
          </motion.div>

          <motion.div
            className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1, rotate: 360 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{
              opacity: { duration: 0.5, ease: "easeOut" },
              scale: { duration: 0.5, ease: "easeOut" },
              rotate: { repeat: Infinity, duration: 1.2, ease: "linear" },
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
