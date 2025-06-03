'use client'

import React, { useEffect, useState } from 'react';
import Logo from '../Logo';
import Nav from './Nav';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`
      fixed top-0 left-0 right-0
      flex items-center p-4
      transition-colors duration-250
      z-50 justify-center md:justify-start
    `}>
      <Logo className="ml-0 h-8 w-8 md:ml-6" />
      <div className="hidden md:block">
        <Nav />
      </div>
    </header>
  )
}

export default Header