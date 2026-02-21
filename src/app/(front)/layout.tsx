import VerticalSidebar from '@/components/navigation/vertical-sidebar';

const FrontLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen">
      <VerticalSidebar />
      {/* pt-14 on mobile to clear the fixed top bar; none on desktop (sidebar has its own header row) */}
      <main className="relative min-w-0 flex-1 pt-14 lg:pt-0">{children}</main>
    </div>
  );
};

export default FrontLayout;
