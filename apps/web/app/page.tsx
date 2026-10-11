"use client";

import React, { useState, useEffect } from "react";
import { ActiveTab, ProformaData, WebUser } from "@/types";
import { Navigation, Footer } from "@/components/layout";
import {
  LandingView,
  ArchitectureView,
  PricingView,
  ContactView,
  DesignSystemView,
  AuthView,
  WebOnboardingView,
  PortalView,
  AccountView,
  AdminView,
} from "@/components/views";
import {
  ProformaModal,
  CheckoutModal,
  DownloadModal,
} from "@/components/features/modals";
import { Toast, WaterDropletLoader } from "@/components/ui";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import gsap from "gsap";

export default function Home() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("landing");
  const [currentIntake, setCurrentIntake] = useState<number>(1850);
  const [dailyGoal, setDailyGoal] = useState<number>(2800);
  const [mounted, setMounted] = useState(false);
  const [currentUser, setCurrentUser] = useState<WebUser | null>(null);
  const [authChecking, setAuthChecking] = useState(true);

  // Modal states
  const [proformaData, setProformaData] = useState<ProformaData | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);

  // Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Hydrate from localStorage and verify auth token with /api/auth/me
  useEffect(() => {
    setMounted(true);
    const savedIntake = localStorage.getItem("wb_intake");
    if (savedIntake) setCurrentIntake(parseInt(savedIntake, 10));

    const savedGoal = localStorage.getItem("wb_goal");
    if (savedGoal) setDailyGoal(parseInt(savedGoal, 10));

    const token = localStorage.getItem("wb_auth_token");
    const savedUserStr = localStorage.getItem("wb_user");

    if (!token) {
      setAuthChecking(false);
      return;
    }

    const verifyAuth = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setCurrentUser(data.user);
            localStorage.setItem("wb_user", JSON.stringify(data.user));
            setActiveTab("portal"); // DIRECTLY SHOW PORTAL CONSOLE ON REFRESH!
            if (data.user.onboarding?.dailyGoal) {
              setDailyGoal(data.user.onboarding.dailyGoal);
            }
          }
        } else {
          // Token expired or invalid
          localStorage.removeItem("wb_auth_token");
          localStorage.removeItem("wb_user");
          setCurrentUser(null);
          setActiveTab("landing");
        }
      } catch (err) {
        // Offline fallback
        if (savedUserStr) {
          try {
            const user = JSON.parse(savedUserStr);
            setCurrentUser(user);
            setActiveTab("portal");
          } catch (e) {
            // ignore
          }
        }
      } finally {
        setAuthChecking(false);
      }
    };

    verifyAuth();
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

  // GSAP smooth cinematic transition whenever tab switches
  useEffect(() => {
    if (typeof window !== "undefined") {
      gsap.fromTo(
        "#main-content",
        { opacity: 0, y: 16, filter: "blur(6px)" },
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.5, ease: "power2.out" }
      );
    }
  }, [activeTab]);

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
    if (typeof window !== "undefined") {
      if (window.__lenis) {
        window.__lenis.scrollTo(0, { immediate: false, duration: 0.6 });
        setTimeout(() => window.__lenis?.resize(), 50);
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
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

  const handleLoginSuccess = (user: WebUser, token: string) => {
    setCurrentUser(user);
    if (user.onboarding?.dailyGoal) {
      setDailyGoal(user.onboarding.dailyGoal);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("wb_auth_token");
    localStorage.removeItem("wb_user");
    setCurrentUser(null);
    setActiveTab("landing");
    showToast("Signed out successfully.");
  };

  // Global Water Droplet Filling Loader while checking auth
  if (authChecking) {
    return (
      <WaterDropletLoader
        message="Restoring Hydration Session..."
        subMessage="Validating credentials with secure vault"
      />
    );
  }

  // Standalone Full-Screen Portal Mode (Zero traces of landing page)
  const isPortalMode = (activeTab === "portal" || activeTab === "account" || activeTab === "admin") && !!currentUser;

  if (isPortalMode && currentUser) {
    return (
      <div className="w-full min-h-screen bg-[#070f19] text-[#e2e8f0] selection:bg-[#38bdf8]/30 selection:text-[#38bdf8]">
        <PortalView
          user={currentUser}
          initialMode={activeTab === "admin" && currentUser.role === "admin" ? "owner" : undefined}
          onLogout={handleLogout}
          onNavigateTab={handleTabChange}
          onToast={showToast}
        />

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

  // Standalone Full-Screen Onboarding Mode
  if (activeTab === "onboarding" && currentUser) {
    return (
      <div className="w-full min-h-screen bg-[#070f19] text-[#e2e8f0] selection:bg-[#38bdf8]/30 selection:text-[#38bdf8] flex flex-col justify-center items-center p-4 sm:p-8">
        <div className="max-w-4xl w-full">
          <WebOnboardingView
            user={currentUser}
            onFinish={(updated) => {
              setCurrentUser(updated);
              setActiveTab("portal");
            }}
            onToast={showToast}
          />
        </div>
        <Toast message={toastMessage} />
      </div>
    );
  }

  // Public Landing Page Shell
  return (
    <SmoothScroll>
      <div className="min-h-screen bg-[#070f19] text-[#e2e8f0] flex flex-col justify-between selection:bg-[#38bdf8]/30 selection:text-[#38bdf8] film-grain relative">
        {/* Top Floating Glassmorphism Navigation with Location Clock */}
        <Navigation
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onDownloadClick={() => setDownloadOpen(true)}
          currentUser={currentUser}
        />

        {/* Main Content Router with GSAP Container */}
        <main
          id="main-content"
          className="grow pt-20 sm:pt-24 px-4 sm:px-6 md:px-8 max-w-6xl mx-auto w-full"
        >
          {activeTab === "landing" && (
            <LandingView
              currentIntake={currentIntake}
              dailyGoal={dailyGoal}
              onLogWater={handleLogWater}
              onResetIntake={handleResetIntake}
              onUpdateGoal={handleUpdateGoal}
              onNavigateTab={handleTabChange}
              onTriggerDownload={() => setDownloadOpen(true)}
              onTriggerCheckout={() => setCheckoutOpen(true)}
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

          {(activeTab === "auth" || ((activeTab === "portal" || activeTab === "account" || activeTab === "admin") && !currentUser)) && (
            <AuthView
              onLoginSuccess={handleLoginSuccess}
              onNavigateTab={handleTabChange}
              onToast={showToast}
              onStartOnboarding={(u) => {
                setCurrentUser(u);
                setActiveTab("onboarding");
              }}
            />
          )}
        </main>

        {/* Global Footer */}
        <Footer onNavigateTab={handleTabChange} />

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
    </SmoothScroll>
  );
}
