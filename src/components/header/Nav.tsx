import React from 'react';
import NavItem from './NavItem';

const navItems = [
  {
    label: '칵테일 목록',
    href: '/drinks',
  },
  // {
  //   label: '재료 목록',
  //   href: '/ingredients',
  // },
]

const Nav = () => {
  return (
    <nav>
      <ul className="flex items-center ml-4 ">
        {navItems.map((item) => (
          <li key={item.label}>
            <NavItem item={item} />
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default Nav