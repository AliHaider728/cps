import React from "react";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-md mx-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        <div className="flex mb-4 gap-3 items-center">
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" strokeLinecap="round" /><line x1="12" y1="16" x2="12.01" y2="16" strokeLinecap="round" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">404 — Page Not Found</h1>
        </div>
        <p className="mt-2 text-sm text-slate-600">The page you're looking for doesn't exist or was moved.</p>
        <div className="mt-6">
          <Link href="/">
            <button className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors">
              Go to Dashboard
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}