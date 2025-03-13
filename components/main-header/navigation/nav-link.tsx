'use client';

import React, { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import classes from './nav-link.module.css';

interface NavLinkProps {
  href: string;
  children: ReactNode;
  exact?: boolean;
}

export default function NavLink({ href, children, exact = true }: NavLinkProps) {
  const pathname = usePathname();
  
  const isActive = () => {
    if (exact) {
      return pathname === href;
    }
    
    // Special case for /meals route
    if (href === '/meals') {
      return pathname === '/meals' || (pathname.startsWith('/meals/') && pathname !== '/meals/share');
    }
    
    return pathname.startsWith(href);
  };

  return (
    <Link 
      href={href} 
      className={`${classes.link} ${isActive() ? classes.active : ''}`}
    >
      {children}
    </Link>
  );
} 