"use client";

import { signIn } from "next-auth/react";
import Image from "next/image";
import { useState } from "react";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AuthModal({ open, onClose }: AuthModalProps) {
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const close = () => {
    setError(null);
    onClose();
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (tab === "signin") {
        const res = await signIn("credentials", {
          redirect: false,
          email,
          password,
        });
        window.location.reload();
        if (res?.error) throw new Error("Invalid email or password");
        close();
      } else {
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, username }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Signup failed");
        }
        signIn("credentials", {
          redirect: false,
          email,
          password,
        });
        close();
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm transition-opacity duration-300'>
      <div className='w-full max-w-md rounded-2xl bg-white shadow-2xl border border-gray-100 relative'>
        <div className='hidden flex-col items-center justify-center pt-6 pb-2 px-6 border-b'>
          {/* <div className='flex items-center gap-2 mb-2'>
            <Image
              src='/favicon.ico'
              alt='Logo'
              width={32}
              height={32}
              className='rounded'
            />
            <span className='font-semibold text-lg text-gray-900'>
              InvestorQuiz
            </span>
          </div> */}
          <div className='flex gap-2 text-sm w-full justify-center'>
            <button
              className={`px-4 py-1 rounded-full font-medium transition-colors duration-150 ${
                tab === "signin"
                  ? "bg-gray-900 text-white shadow"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              onClick={() => setTab("signin")}
            >
              Sign in
            </button>
            <button
              className={`px-4 py-1 rounded-full font-medium transition-colors duration-150 ${
                tab === "signup"
                  ? "bg-gray-900 text-white shadow"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              onClick={() => setTab("signup")}
            >
              Sign up
            </button>
          </div>
        </div>
        <div className='px-6 pt-6 text-center'>
          <h2 className='text-2xl font-bold text-gray-900 mb-2 mt-6'>
            Unlock Your Experience
          </h2>
          <p className='text-gray-600 text-sm'>
            Get full access to quizzes, track your progress over time, and
            compete against others on the leaderboard.
          </p>
        </div>
        <form onSubmit={onSubmit} className='px-6 py-4 space-y-4'>
          <button
            type='button'
            className='w-full flex items-center justify-center gap-2 border border-gray-300 rounded-lg px-3 py-2 bg-white hover:bg-gray-50 text-gray-700 font-semibold shadow-sm transition disabled:opacity-50'
            onClick={() => signIn("google")}
            disabled={loading}
          >
            <Image
              src='/google.png'
              alt="Google's logo"
              width={20}
              height={20}
            />
            Continue with Google
          </button>
          <div className='relative my-6 hidden'>
            <div className='absolute inset-0 flex items-center'>
              <div className='w-full border-b border-gray-200'></div>
            </div>
            <div className='relative flex justify-center text-sm'>
              <span className='bg-white px-3 text-gray-400 font-medium'>
                or
              </span>
            </div>
          </div>

          {tab === "signup" && (
            <input
              className='w-full hidden border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black transition'
              placeholder='Username'
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          )}
          <input
            className='w-full hidden border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black transition'
            placeholder='Email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type='email'
            required
          />
          <input
            className='w-full border hidden border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black transition'
            placeholder='Password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type='password'
            required
            autoComplete='on'
          />
          {error && <p className='text-red-600 text-sm text-center'>{error}</p>}
          <button
            type='submit'
            className='w-full bg-black hover:bg-black text-white rounded-lg px-3 py-2 font-semibold transition disabled:opacity-50 hidden items-center justify-center gap-2'
            disabled={loading}
          >
            {loading && (
              <svg
                className='animate-spin h-5 w-5 text-white'
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
              >
                <circle
                  className='opacity-25'
                  cx='12'
                  cy='12'
                  r='10'
                  stroke='currentColor'
                  strokeWidth='4'
                ></circle>
                <path
                  className='opacity-75'
                  fill='currentColor'
                  d='M4 12a8 8 0 018-8v8z'
                ></path>
              </svg>
            )}
            {loading
              ? tab === "signin"
                ? "Signing in..."
                : "Creating..."
              : tab === "signin"
              ? "Sign in"
              : "Sign up"}
          </button>
        </form>
        <button
          className='absolute top-3 right-3 text-gray-400 hover:text-gray-700 transition text-lg'
          onClick={close}
          aria-label='Close modal'
        >
          &times;
        </button>
      </div>
    </div>
  );
}
