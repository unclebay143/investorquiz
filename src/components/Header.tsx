"use client";

import { Menu, X } from "lucide-react";

interface HeaderProps {
  isOpen: boolean;
  onToggleMenu: () => void;
}

export default function Header({ isOpen, onToggleMenu }: HeaderProps) {
  return (
    <header className='sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm'>
      <div className='px-4 sm:px-4 py-4 flex items-center gap-4'>
        <button
          className='lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors'
          aria-label='Toggle menu'
          onClick={onToggleMenu}
        >
          {isOpen ? <X className='h-5 w-5' /> : <Menu className='h-5 w-5' />}
        </button>
        <div className='font-bold text-xl text-gray-900'>Investment Exams</div>
        <div className='ml-auto' />
      </div>
    </header>
  );
}
