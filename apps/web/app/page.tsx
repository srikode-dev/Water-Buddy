"use client";

import React, { useState, useEffect } from "react";
import { ActiveTab, ProformaData } from "@/types";
import { Navigation, Footer } from "@/components/layout";
import {
  LandingView,
  ArchitectureView,
  PricingView,
  ContactView,
  DesignSystemView,
} from "@/components/views";
import {
  ProformaModal,
  CheckoutModal,
  DownloadModal,
} from "@/components/features/modals";
import { Toast } from "@/components/ui/Toast";

export default function Home() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("landing");
  const [currentIntake, setCurrentIntake] = useState<number>(1850);
  const [dailyGoal, setDailyGoal] = useState<number>(2800);
  const [mounted, setMounted] = useState(false);

  // Modal states
  const [proformaData, setProformaData] = useState<ProformaData | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);

  // Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Hydrate from localStorage once mounted
  useEffect(() => {
    setMounted(true);
    const savedIntake = localStorage.getItem("wb_intake");
    if (savedIntake) setCurrentIntake(parseInt(savedIntake, 10));

    const savedGoal = localStorage.getItem("wb_goal");
    if (savedGoal) setDailyGoal(parseInt(savedGoal, 10));
  }, []);

  // Sync state to localStorage
  useEffect(() => {
    if (mounted) {
      localStorage.setItem("wb_intake", currentIntake.toString());
    }
  }, [currentIntake, mounted]);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("wb_goal", dailyGoal.toString());
    }
  }, [dailyGoal, mounted]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLogWater = (amount: number, label: string) => {
    setCurrentIntake((prev) => prev + amount);
    showToast(`+${amount}ml ${label} recorded. Total is now ${(currentIntake + amount).toLocaleString()} ml.`);
  };

  const handleResetIntake = () => {
    setCurrentIntake(0);
    showToast("Daily intake counter reset to 0 ml.");
  };

  const handleUpdateGoal = (newGoal: number) => {
    setDailyGoal(newGoal);
    showToast(`Daily target calibrated to ${newGoal.toLocaleString()} ml.`);
  };

  return (
    <div className="min-h-screen bg-[#070f19] text-[#dbe3f3] flex flex-col justify-between selection:bg-[#38bdf8]/20 selection:text-[#38bdf8] film-grain relative">
      {/* Top Floating Header Capsule */}
      <Navigation
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onDownloadClick={() => setDownloadOpen(true)}
      />

      {/* Main Content View Router */}
      <main className="grow pt-24 sm:pt-28 px-4 sm:px-6 md:px-8 max-w-6xl mx-auto w-full transition-opacity duration-300">
        {activeTab === "landing" && (
          <LandingView
            currentIntake={currentIntake}
            dailyGoal={dailyGoal}
            onLogWater={handleLogWater}
            onResetIntake={handleResetIntake}
            onUpdateGoal={handleUpdateGoal}
            onNavigateTab={handleTabChange}
            onTriggerDownload={() => setDownloadOpen(true)}
            onTriggerCheckout={() => setCheckoutOpen(false) /* or true */}
            onToast={showToast}
          />
        )}

        {activeTab === "architecture" && (
          <ArchitectureView
            onTriggerDownload={() => setDownloadOpen(true)}
            onTriggerCheckout={() => setCheckoutOpen(true)}
            onToast={showToast}
          />
        )}

        {activeTab === "pricing" && (
          <PricingView
            onTriggerDownload={() => setDownloadOpen(true)}
            onTriggerCheckout={() => setCheckoutOpen(true)}
            onOpenProformaModal={(data) => setProformaData(data)}
            onToast={showToast}
          />
        )}

        {activeTab === "contact" && <ContactView onToast={showToast} />}

        {activeTab === "design-system" && <DesignSystemView onToast={showToast} />}
      </main>

      {/* Global Footer */}
      <Footer />

      {/* Global Modals */}
      <ProformaModal
        data={proformaData}
        onClose={() => setProformaData(null)}
        onToast={showToast}
      />

      <CheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        onToast={showToast}
      />

      <DownloadModal
        isOpen={downloadOpen}
        onClose={() => setDownloadOpen(false)}
        onToast={showToast}
      />

      {/* Toast Notification HUD */}
      <Toast message={toastMessage} />
    </div>
  );
}
