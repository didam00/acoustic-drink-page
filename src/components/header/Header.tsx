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
      z-50
      ${isScrolled ? 'bg-[var(--bg-0)]/80 backdrop-blur-sm' : ''}
    `}>
      <Logo size={32} className="ml-6" />
      <Nav />
    </header>
  )
}

export default Header