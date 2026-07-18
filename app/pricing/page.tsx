"use client";

import { motion } from "framer-motion";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import PricingCard from "@/components/PricingCard";

export default function PricingPage() {
  return (
    <>
      <Header />

      <main className="text-white min-h-screen relative overflow-hidden">
        <section className="relative z-10 pt-48 pb-40 flex flex-col items-center px-6">
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-6xl font-extrabold mb-20 text-center"
          >
            Купить
          </motion.h1>

          <div className="flex flex-wrap gap-14 justify-center">
            <PricingCard
              title="1 день"
              price="10 rubles"
              image="/pricing.jpg"
              href="https://funpay.com/lots/offer?id=73168336"
            />

            <PricingCard
              title="3 дня"
              price="20 rubles"
              image="/pricing.jpg"
              href="https://funpay.com/lots/offer?id=73168722"
            />

            <PricingCard
              title="7 дней"
              price="55 rubles"
              image="/pricing.jpg"
              href="https://funpay.com/lots/offer?id=73168775"
            />

            <PricingCard
              title="30 дней"
              price="130 rubles"
              image="/pricing.jpg"
              href="https://funpay.com/lots/offer?id=73168850"
            />

            <PricingCard
              title="90 дней"
              price="250 rubles"
              image="/pricing.jpg"
              href="https://funpay.com/lots/offer?id=73168970"
            />

            <PricingCard
              title="180 дней"
              price="400 rubles"
              image="/pricing.jpg"
              href="https://funpay.com/lots/offer?id=73169053"
            />

            <PricingCard
              title="Навсегда"
              price="300 rubles"
              image="/pricing.jpg"
              href="https://funpay.com/lots/offer?id=73169094"
            />

            <PricingCard
              title="Сброс HWID"
              price="150 rubles"
              image="/pricing.jpg"
              href="https://funpay.com/lots/offer?id=73169217"
            />
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
