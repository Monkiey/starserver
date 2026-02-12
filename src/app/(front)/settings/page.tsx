'use client';

import React from 'react';

export default function SettingsPage() {
  return (
    <div className="min-h-screen px-4 py-8 md:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Customize your viewing experience.
          </p>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <p className="text-sm text-muted-foreground">
            There are currently no configurable settings.
          </p>
        </div>
      </div>
    </div>
  );
}
