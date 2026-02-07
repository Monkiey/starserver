import SiteHeader from '@/components/main/site-header';

const FrontLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <SiteHeader />
      <main className="relative z-10 pb-16">{children}</main>
    </div>
  );
};

export default FrontLayout;
