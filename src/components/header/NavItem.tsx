'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NavItem = ({ item }: { item: { label: string; href: string } }) => {
  const pathname = usePathname()
  const isActive = pathname === item.href

  return (
    <Link
      href={item.href}
      className={`
        px-5
        py-2
        rounded-lg
        hover:bg-[var(--bg-1)]
        transition-colors
        duration-250
        ${isActive ? 'text-[var(--p)]' : 'text-[var(--fg-0)]'}
      `}
    >
      {item.label}
    </Link>
  )
}

export default NavItem