'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface Breadcrumb {
  label: string;
  href: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: Breadcrumb[];
}

const PageHeader = ({ title, description, breadcrumbs }: PageHeaderProps) => {
  return (
    <div className="mb-6">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex mb-2 text-sm text-gray-500 dark:text-gray-400">
          <ol className="flex items-center space-x-1">
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={index}>
                {index > 0 && (
                  <li className="flex items-center">
                    <ChevronRight className="h-4 w-4 mx-1" />
                  </li>
                )}
                <li>
                  {index === breadcrumbs.length - 1 ? (
                    <span className="text-gray-900 dark:text-gray-100">{crumb.label}</span>
                  ) : (
                    <Link href={crumb.href} className="hover:text-primary">
                      {crumb.label}
                    </Link>
                  )}
                </li>
              </React.Fragment>
            ))}
          </ol>
        </nav>
      )}
      
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1">{title}</h1>
      
      {description && (
        <p className="text-gray-500 dark:text-gray-400">{description}</p>
      )}
    </div>
  );
};

export { PageHeader };
export default PageHeader; 