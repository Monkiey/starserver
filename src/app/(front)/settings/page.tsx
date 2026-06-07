import PageHeader from '@/components/page-header';
import OmssServerSettings from '@/components/settings/omss-server-settings';

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        title="Settings"
        description="Customize your viewing experience."
      />
      <div className="px-4 py-6 sm:px-6">
        <div className="mx-auto max-w-2xl space-y-4">
          <OmssServerSettings />

          {/* About card */}
          <div className="rounded-lg border border-border bg-card">
            <div className="border-b border-border px-5 py-4">
              <h2 className="text-sm font-semibold">About</h2>
            </div>
            <div className="divide-y divide-border">
              <div className="flex items-center justify-between px-5 py-3">
                <span className="text-sm text-muted-foreground">Version</span>
                <span className="text-sm font-medium">4.0</span>
              </div>
              <div className="flex items-center justify-between px-5 py-3">
                <span className="text-sm text-muted-foreground">
                  Data source
                </span>
                <span className="text-sm font-medium">TMDB + OMSS</span>
              </div>
              <div className="flex items-center justify-between px-5 py-3">
                <span className="text-sm text-muted-foreground">
                  Streaming source
                </span>
                <span className="text-sm font-medium">CinePro/Core OMSS</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
