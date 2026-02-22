import VerticalSidebar from '@/components/navigation/vertical-sidebar';

const FrontLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen">
      <VerticalSidebar />
      {/* pt-16 clears the fixed top bar; lg:ml-[260px] offsets for the persistent desktop sidebar */}
      <main className="relative pt-16 lg:ml-[260px]">{children}</main>
    </div>
  );
};

export default FrontLayout;
