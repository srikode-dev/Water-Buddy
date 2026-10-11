"use client";

import React, { useState } from 'react';
import { WebUser } from '@/types';
import { PortalLayout } from './PortalLayout';
import { AdminConsole } from './AdminConsole';
import { UserConsole } from './UserConsole';
import { WaterDropletLoader } from '@/components/ui/WaterDropletLoader';

interface PortalViewProps {
  user: WebUser;
  initialMode?: 'owner' | 'user';
  onLogout: () => void;
  onNavigateTab: (tab: any) => void;
  onToast: (msg: string) => void;
}

export function PortalView({
  user,
  initialMode,
  onLogout,
  onNavigateTab,
  onToast
}: PortalViewProps) {
  const isOwner = user.role === 'admin';

  // Default active section
  const [activeSection, setActiveSection] = useState<string>(
    isOwner ? 'overview' : 'today'
  );
  const [isSectionLoading, setIsSectionLoading] = useState(false);
  const [isSectionExiting, setIsSectionExiting] = useState(false);
  const [sectionTitle, setSectionTitle] = useState('');

  const sectionMessages: Record<string, string> = {
    overview: 'Platform Performance & Analytics',
    users: 'Registered Hydrators Directory',
    inquiries: 'Customer Support Messages',
    pricing: 'Pricing & License Configuration',
    'personal-hydration': 'My Personal Water Intake',
    today: "Today's Water Intake Tracker",
    schedule: 'Hydration Activity & Drink Log',
    biometrics: 'Biometrics & Daily Water Target',
    'desktop-app': 'Windows 11 Companion App'
  };

  const handleSelectSection = (section: string) => {
    if (section === activeSection) return;
    setSectionTitle(sectionMessages[section] || 'Synchronizing workspace...');
    setIsSectionLoading(true);
    setIsSectionExiting(false);

    // Switch section at 150ms while loader masks view
    setTimeout(() => {
      setActiveSection(section);
    }, 150);

    // Fade out at 380ms
    setTimeout(() => {
      setIsSectionExiting(true);
    }, 380);

    // Unmount at 580ms
    setTimeout(() => {
      setIsSectionLoading(false);
      setIsSectionExiting(false);
    }, 580);
  };

  return (
    <div className="relative w-full">
      {isSectionLoading && (
        <WaterDropletLoader
          message={sectionTitle}
          subMessage="Loading module telemetry"
          isTransition={true}
          isExiting={isSectionExiting}
        />
      )}
      <PortalLayout
        user={user}
        activeSection={activeSection}
        onSelectSection={handleSelectSection}
        onLogout={onLogout}
        onNavigateTab={onNavigateTab}
      >
        {isOwner && activeSection !== 'personal-hydration' ? (
          <AdminConsole
            user={user}
            activeSection={activeSection}
            onToast={onToast}
            onNavigateTab={onNavigateTab}
          />
        ) : (
          <UserConsole
            user={user}
            activeSection={activeSection === 'personal-hydration' ? 'today' : activeSection}
            onToast={onToast}
            onNavigateTab={onNavigateTab}
          />
        )}
      </PortalLayout>
    </div>
  );
}

export default PortalView;
