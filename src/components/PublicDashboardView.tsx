import React from 'react';
import { useParams } from 'react-router-dom';
import Dashboard from './Dashboard';
import { useAppStore } from '../store';

export default function PublicDashboardView() {
  const { groupSlug } = useParams();
  const isRealtimeConnected = useAppStore((s) => s.isRealtimeConnected);

  return (
    <Dashboard
      user={null}
      onUpdateGroupConfig={async () => false}
      isRealtimeConnected={isRealtimeConnected}
      publicGroupSlug={groupSlug}
    />
  );
}
