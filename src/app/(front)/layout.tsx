import VerticalSidebar from '@/components/navigation/vertical-sidebar';

const FrontLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen">
      <VerticalSidebar />
      {/* pt-14 clears the fixed top bar on all screen sizes */}
      <main className="relative pt-14">{children}</main>
    </div>
  );
};

export default FrontLayout;
