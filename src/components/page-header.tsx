import React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
}

const PageHeader = ({ title, description }: PageHeaderProps) => {
  return (
    <div className="border-b border-border bg-card px-4 py-4 sm:px-6 sm:py-5">
      <div>
        <h1 className="text-lg font-semibold sm:text-xl">{title}</h1>
        {description && (
          <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
