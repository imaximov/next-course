import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import logoImg from '@/assets/logo.png';
import classes from './main-header.module.css';
import MainHeaderBackground from './background/main-header-background';
import NavLink from './navigation/nav-link';

export default function MainHeader() {
  return (
    <>
      <MainHeaderBackground />
      <header className={classes.header}>
        <Link 
          href="/" 
          className={classes.logo}
        >
          <Image src={logoImg} alt="A plate with food on it" priority />
          NextLevel Food
        </Link>
        <nav className={classes.nav}>
          <ul>
            <li>
              <NavLink href="/meals" exact={false}>
                Browse Meals
              </NavLink>
            </li>
            <li>
              <NavLink href="/community">
                Foodies Community
              </NavLink>
            </li>
            <li>
              <NavLink href="/meals/share">
                Share a Meal
              </NavLink>
            </li>
          </ul>
        </nav>
      </header>
    </>
  );
} 