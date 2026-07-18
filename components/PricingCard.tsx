"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import TiltCard from "./TiltCard";

type PricingCardProps = {
  title: string;
  price: string;
  image: string;
  href?: string;
  onClick?: () => void;
};

export default function PricingCard({
  title,
  price,
  image,
  href,
  onClick,
}: PricingCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ type: "spring", damping: 18, stiffness: 160 }}
      viewport={{ once: true, amount: 0.3 }}
    >
      <TiltCard max={9} className="w-[300px]">
        <div
          className="
            group
            bg-[#1a1a1a]/60
            backdrop-blur-xl
            rounded-3xl
            p-6
            w-full
            flex flex-col
            shadow-xl shadow-black/40
            border border-white/10
            hover:border-purple-400/40
            transition-colors
          "
        >
          <div className="rounded-2xl overflow-hidden mb-5">
            <Image
              src={image}
              alt={title}
              width={400}
              height={400}
              className="rounded-2xl transition-transform duration-500 group-hover:scale-105"
            />
          </div>

          <h2 className="text-xl font-semibold text-white mb-1">{title}</h2>
          <p className="text-sm text-white/60 mb-6">Цена: {price}</p>

          {href ? (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="
                block w-full py-3 rounded-xl bg-purple-600 text-white font-medium
                hover:bg-purple-500 transition-colors text-center
              "
            >
              Купить
            </a>
          ) : (
            <motion.button
              onClick={onClick}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", damping: 15, stiffness: 350 }}
              className="
                w-full
                py-3
                rounded-xl
                bg-purple-600
                text-white
                font-medium
                hover:bg-purple-500
                transition-colors
              "
            >
              Купить
            </motion.button>
          )}
        </div>
      </TiltCard>
    </motion.div>
  );
}
