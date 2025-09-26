"use client";

import { signIn } from "next-auth/react";
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
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm'>
      <div className='w-full max-w-md rounded-lg bg-white shadow-lg'>
        <div className='flex items-center justify-between px-4 py-3 border-b'>
          <div className='flex gap-2 text-sm'>
            <button
              className={`px-3 py-1 rounded ${
                tab === "signin" ? "bg-gray-900 text-white" : "bg-gray-100"
              }`}
              onClick={() => setTab("signin")}
            >
              Sign in
            </button>
            <button
              className={`px-3 py-1 rounded ${
                tab === "signup" ? "bg-gray-900 text-white" : "bg-gray-100"
              }`}
              onClick={() => setTab("signup")}
            >
              Sign up
            </button>
          </div>
          <button
            className='text-sm text-gray-500 hover:text-gray-900'
            onClick={close}
          >
            Close
          </button>
        </div>
        <form onSubmit={onSubmit} className='p-4 space-y-3'>
          {tab === "signup" && (
            <>
              <input
                className='w-full border rounded px-3 py-2'
                placeholder='Username'
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </>
          )}
          <input
            className='w-full border rounded px-3 py-2'
            placeholder='Email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type='email'
            required
          />
          <input
            className='w-full border rounded px-3 py-2'
            placeholder='Password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type='password'
            required
            autoComplete="on"
          />
          {error && <p className='text-red-600 text-sm'>{error}</p>}
          <button
            type='submit'
            className='w-full bg-gray-900 text-white rounded px-3 py-2 disabled:opacity-50'
            disabled={loading}
          >
            {loading
              ? tab === "signin"
                ? "Signing in..."
                : "Creating..."
              : tab === "signin"
              ? "Sign in"
              : "Sign up"}
          </button>
        </form>
      </div>
    </div>
  );
}
