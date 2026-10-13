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
import { API_BASE_URL } from "@/utils/api";
import gsap from "gsap";

export default function Home() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("landing");
  const [currentIntake, setCurrentIntake] = useState<number>(1850);
  const [dailyGoal, setDailyGoal] = useState<number>(2800);
  const [mounted, setMounted] = useState(false);
  const [currentUser, setCurrentUser] = useState<WebUser | null>(null);
  const [authChecking, setAuthChecking] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isLoaderExiting, setIsLoaderExiting] = useState(false);
  const [loaderMessage, setLoaderMessage] = useState("Synchronizing Hydration Core...");
  const [loaderSubMessage, setLoaderSubMessage] = useState("Authenticating atmospheric telemetry");

  // Modal states
  const [proformaData, setProformaData] = useState<ProformaData | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);

  // Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Tab transition metadata
  const tabMeta: Record<ActiveTab, { title: string; sub: string }> = {
    landing: { title: "Atmospheric Hydration System", sub: "Navigating to companion cockpit" },
    architecture: { title: "Silent Electron Architecture", sub: "Loading multi-process technical blueprints" },
    pricing: { title: "Lifetime License & Perks", sub: "Retrieving perpetual license tiers" },
    contact: { title: "Engineering Support Desk", sub: "Connecting direct communication channel" },
    "design-system": { title: "Oceanic Abyssal Kit", sub: "Loading design tokens & components" },
    auth: { title: "Secure Vault Access", sub: "Preparing cryptographic session" },
    onboarding: { title: "Biometric Calibration", sub: "Calibrating personalized hydration target" },
    portal: { title: "Hydration Control Center", sub: "Retrieving synchronized telemetry" },
    account: { title: "Profile & Preferences", sub: "Loading subscriber credentials" },
    admin: { title: "Owner Control Center", sub: "Loading analytics & enterprise metrics" },
  };

  // Initial load smooth transition
  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setIsLoaderExiting(true);
    }, 600);
    const endTimer = setTimeout(() => {
      setIsInitialLoading(false);
      setIsLoaderExiting(false);
    }, 900);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(endTimer);
    };
  }, []);

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

    // Token exists; validate credentials with backend
    setAuthChecking(true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const verifyAuth = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
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
        clearTimeout(timeoutId);
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

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
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

  // GSAP smooth cinematic transition whenever tab switches and main content is present
  useEffect(() => {
    if (typeof window === "undefined" || !mounted || authChecking || isInitialLoading || isTransitioning) return;

    const mainEl = document.getElementById("main-content");
    if (!mainEl) return;

    gsap.fromTo(
      mainEl,
      { opacity: 0, y: 16, filter: "blur(6px)" },
      { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.45, ease: "power2.out" }
    );
  }, [activeTab, mounted, authChecking, isInitialLoading, isTransitioning]);

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

  const handleTabChange = (newTab: ActiveTab) => {
    if (newTab === activeTab) return;

    const meta = tabMeta[newTab] || { title: "Water Buddy", sub: "Loading view..." };
    setLoaderMessage(meta.title);
    setLoaderSubMessage(meta.sub);
    setIsTransitioning(true);
    setIsLoaderExiting(false);

    if (typeof window !== "undefined") {
      if (window.__lenis) {
        window.__lenis.scrollTo(0, { immediate: true });
      } else {
        window.scrollTo({ top: 0, behavior: "instant" });
      }
    }

    // Switch view underneath fluid overlay at 180ms
    setTimeout(() => {
      setActiveTab(newTab);
    }, 180);

    // Fade out loader smoothly at 420ms
    setTimeout(() => {
      setIsLoaderExiting(true);
    }, 420);

    // Unmount transition overlay at 640ms
    setTimeout(() => {
      setIsTransitioning(false);
      setIsLoaderExiting(false);
    }, 640);
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

  // Reusable Water Droplet Loader Overlay
  const isLoaderVisible = mounted && (isInitialLoading || authChecking || isTransitioning);
  const loaderOverlay = isLoaderVisible ? (
    <WaterDropletLoader
      message={loaderMessage}
      subMessage={loaderSubMessage}
      isTransition={isTransitioning}
      isExiting={isLoaderExiting}
    />
  ) : null;

  // Standalone Full-Screen Portal Mode (Zero traces of landing page)
  const isPortalMode = (activeTab === "portal" || activeTab === "account" || activeTab === "admin") && !!currentUser;

  if (isPortalMode && currentUser) {
    return (
      <div className="w-full min-h-screen bg-[#070f19] text-[#e2e8f0] selection:bg-[#38bdf8]/30 selection:text-[#38bdf8] relative">
        {loaderOverlay}
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
      <div className="w-full min-h-screen bg-[#070f19] text-[#e2e8f0] selection:bg-[#38bdf8]/30 selection:text-[#38bdf8] flex flex-col justify-center items-center p-4 sm:p-8 relative">
        {loaderOverlay}
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
        {loaderOverlay}
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
