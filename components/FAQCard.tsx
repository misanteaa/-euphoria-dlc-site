"use client";

import { motion } from "framer-motion";

interface FAQCardProps {
  question: string;
  answer: string;
}

export default function FAQCard({ question, answer }: FAQCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="
        w-full max-w-4xl
        p-8 rounded-3xl
        bg-white/10 backdrop-blur-xl
        border border-white/10
        text-white mb-10
      "
    >
      <h2 className="text-2xl font-bold mb-4">{question}</h2>
      <p className="text-white/80 leading-relaxed">{answer}</p>
    </motion.div>
  );
}
