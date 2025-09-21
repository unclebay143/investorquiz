"use client";

import { MOCK_CURRENT_USER } from "@/data/leaderboardData";
import { CurrentUser } from "@/types";
import { Menu, X } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import AuthModal from "./AuthModal";

interface HeaderProps {
  isOpen: boolean;
  onToggleMenu: () => void;
  currentUser?: CurrentUser;
}

export default function Header({
  isOpen,
  onToggleMenu,
  currentUser = MOCK_CURRENT_USER,
}: HeaderProps) {
  const router = useRouter();
  const { status } = useSession();
  const [authOpen, setAuthOpen] = useState(false);

  const handleLeaderboardClick = () => {
    router.push("/leaderboard");
  };

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
        <Link href='/' className='font-bold text-xl text-gray-900'>
          Investment Questions
        </Link>

        {/* User Score Section */}
        <div className='ml-auto flex items-center space-x-2 sm:space-x-4'>
          {/* {status === "authenticated" ? (
            <div className='hidden sm:flex items-center space-x-3 text-sm text-gray-600'>
              <span>{currentUser.examsCompleted} exams</span>
              <span className='text-gray-300'>•</span>
              <span>Rank #{currentUser.rank}</span>
            </div>
          ) : null} */}

          {/* <button
            onClick={handleLeaderboardClick}
            className='flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 hover:from-yellow-100 hover:to-orange-100 transition-all duration-200 group'
            title='View Leaderboard'
          >
            <Trophy className='h-4 w-4 sm:h-5 sm:w-5 text-yellow-600 group-hover:text-yellow-700' />
            <span className='font-semibold text-gray-900 text-xs sm:text-sm hidden sm:inline'>
              Leaderboard
            </span>
          </button> */}

          {status === "authenticated" ? (
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className='px-2 sm:px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 text-xs sm:text-sm'
            >
              Sign out
            </button>
          ) : (
            <div className='flex items-center gap-1 sm:gap-2'>
              <button
                onClick={() => setAuthOpen(true)}
                className='px-2 sm:px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 text-xs sm:text-sm'
              >
                Sign in
              </button>
              <button
                onClick={() => setAuthOpen(true)}
                className='hidden sm:inline-flex px-2 sm:px-3 py-2 rounded-lg bg-gray-900 text-white hover:bg-black text-xs sm:text-sm'
              >
                Sign up
              </button>
            </div>
          )}
        </div>
        <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
      </div>
    </header>
  );
}
