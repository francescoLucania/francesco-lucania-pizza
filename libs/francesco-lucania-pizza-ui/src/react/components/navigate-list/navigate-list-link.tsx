'use client';

import * as React from 'react';

type NavigateListLinkProps = {
  href: string;
  className?: string;
  children: React.ReactNode;
  useNextLink?: boolean;
};

export function NavigateListLink({
  href,
  className,
  children,
  useNextLink = false,
}: NavigateListLinkProps) {
  const [LinkComponent, setLinkComponent] = React.useState<React.ComponentType<{
    href: string;
    className?: string;
    children: React.ReactNode;
  }> | null>(null);

  React.useEffect(() => {
    if (useNextLink) {
      // Dynamic import for Next.js Link
      import('next/link')
        .then((module) => {
          setLinkComponent(() => module.default);
        })
        .catch(() => {
          // Next.js not available
          setLinkComponent(null);
        });
    }
  }, [useNextLink]);

  if (LinkComponent) {
    return (
      <LinkComponent href={href} className={className}>
        {children}
      </LinkComponent>
    );
  }

  return (
    <a href={href} className={className}>
      {children}
    </a>
  );
}
