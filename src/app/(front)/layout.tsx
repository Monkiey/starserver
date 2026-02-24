import VerticalSidebar from '@/components/navigation/vertical-sidebar';
import { NotificationProvider } from '@/components/notification-provider';

const FrontLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <NotificationProvider>
      <div className="min-h-screen">
        <VerticalSidebar />
        {/* pt-16 clears the fixed top bar; lg:ml-[260px] offsets for the persistent desktop sidebar */}
        <main className="relative pt-16 lg:ml-[260px]">{children}</main>
      </div>
    </NotificationProvider>
  );
};

export default FrontLayout;
