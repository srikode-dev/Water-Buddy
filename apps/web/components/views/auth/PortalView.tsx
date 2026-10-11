"use client";

import React, { useState } from 'react';
import { WebUser } from '@/types';
import { PortalLayout } from './PortalLayout';
import { AdminConsole } from './AdminConsole';
import { UserConsole } from './UserConsole';

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

  return (
    <PortalLayout
      user={user}
      activeSection={activeSection}
      onSelectSection={setActiveSection}
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
  );
}
