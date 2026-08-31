import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

interface AnimatedNavLinkProps {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
}

const AnimatedNavLink = ({ href, children, onClick }: AnimatedNavLinkProps) => {
  return (
    <a
      href={href}
      onClick={onClick}
      className="group relative inline-block h-6 overflow-hidden text-sm font-medium whitespace-nowrap"
    >
      <div className="flex flex-col transition-transform duration-300 ease-out transform group-hover:-translate-y-1/2">
        <span className="flex h-6 items-center text-gray-300 whitespace-nowrap">
          {children}
        </span>
        <span className="flex h-6 items-center text-[#baff3c] whitespace-nowrap font-semibold">
          {children}
        </span>
      </div>
    </a>
  );
};

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [headerShapeClass, setHeaderShapeClass] = useState('rounded-full');
  const shapeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toggleMenu = () => {
    setIsOpen((prev) => !prev);
  };

  useEffect(() => {
    if (shapeTimeoutRef.current) {
      clearTimeout(shapeTimeoutRef.current);
    }

    if (isOpen) {
      setHeaderShapeClass('rounded-2xl');
    } else {
      shapeTimeoutRef.current = setTimeout(() => {
        setHeaderShapeClass('rounded-full');
      }, 300);
    }

    return () => {
      if (shapeTimeoutRef.current) {
        clearTimeout(shapeTimeoutRef.current);
      }
    };
  }, [isOpen]);

  const navLinksData = [
    { label: 'Cómo funciona', href: '#como-funciona' },
    { label: 'Ranking', href: '#ranking' },
    { label: 'El proyecto', href: '#respaldo' },
  ];

  return (
    <header
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-40
                 flex flex-col items-center
                 px-6 py-2.5 sm:px-8 sm:py-3 backdrop-blur-xl
                 ${headerShapeClass}
                 border border-[rgba(174,255,197,0.18)] bg-[#07110f]/90
                 w-[calc(100%-2.5rem)] max-w-5xl sm:w-max
                 transition-[border-radius] duration-300 ease-in-out shadow-2xl`}
    >
      <div className="flex items-center justify-between w-full gap-x-6 sm:gap-x-10">
        {/* Official ECOToken Brand Logo */}
        <a href="#inicio" className="flex items-center shrink-0 pr-2">
          <img
            src="/logos/logo-ecotoken.png"
            alt="ECOToken"
            className="h-7 sm:h-8 w-auto object-contain transition-transform duration-200 hover:scale-105"
          />
        </a>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center space-x-8 shrink-0">
          {navLinksData.map((link) => (
            <AnimatedNavLink key={link.href} href={link.href}>
              {link.label}
            </AnimatedNavLink>
          ))}
        </nav>

        {/* Desktop Action Buttons (Amplio padding horizontal px-7.5 para cuerpo de botón espacioso) */}
        <div className="hidden sm:flex items-center gap-3.5 shrink-0 pl-2">
          <Link
            to="/login"
            className="px-7 py-2.5 text-xs font-semibold text-gray-300 hover:text-white border border-white/15 bg-white/5 rounded-full hover:border-[#baff3c]/50 hover:bg-[#baff3c]/10 transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <span>Iniciar sesión</span>
            <ArrowUpRight size={13} />
          </Link>

          {/* Botón Registrarme con amplio espacio interno y efecto glow */}
          <div className="relative group shrink-0">
            <div className="absolute inset-0 rounded-full bg-[#baff3c] opacity-35 filter blur-md pointer-events-none transition-all duration-300 group-hover:opacity-75 group-hover:blur-lg"></div>
            <Link
              to="/login"
              style={{ color: '#07110f' }}
              className="relative z-10 px-7 py-2.5 text-xs font-bold !text-[#07110f] bg-gradient-to-r from-[#baff3c] to-[#a6f427] rounded-full hover:from-[#c7ff57] hover:to-[#baff3c] transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap shadow-md"
            >
              <span>Registrarme</span>
              <ArrowUpRight size={14} className="stroke-[2.5]" />
            </Link>
          </div>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          className="md:hidden flex items-center justify-center w-8 h-8 text-gray-300 focus:outline-none"
          onClick={toggleMenu}
          aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
        >
          {isOpen ? (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      <div
        className={`md:hidden flex flex-col items-center w-full transition-all ease-in-out duration-300 overflow-hidden
                   ${isOpen ? 'max-h-[300px] opacity-100 pt-4 pb-2' : 'max-h-0 opacity-0 pt-0 pb-0 pointer-events-none'}`}
      >
        <nav className="flex flex-col items-center space-y-3 text-sm w-full">
          {navLinksData.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="text-gray-300 hover:text-[#baff3c] transition-colors w-full text-center py-1 font-medium"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className="flex flex-col items-center space-y-2 mt-4 w-full">
          <Link
            to="/login"
            onClick={() => setIsOpen(false)}
            className="w-full py-2.5 text-center text-xs font-semibold text-gray-300 border border-white/15 bg-white/5 rounded-full"
          >
            Iniciar sesión
          </Link>
          <Link
            to="/login"
            onClick={() => setIsOpen(false)}
            style={{ color: '#07110f' }}
            className="w-full py-2.5 text-center !text-[#07110f] font-bold bg-[#baff3c] rounded-full text-xs"
          >
            Registrarme
          </Link>
        </div>
      </div>
    </header>
  );
}
