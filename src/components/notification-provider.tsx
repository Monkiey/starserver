'use client';

import { useNotificationChecker } from '@/hooks/use-notification-checker';

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useNotificationChecker();
  return <>{children}</>;
}
