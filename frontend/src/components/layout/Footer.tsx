import React from 'react';
import { Logo } from '../common/Logo';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-sand/60 border-t border-sand mt-20 py-12">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
          <Logo className="h-7 w-auto" />
          <span className="text-sm text-muted">
            Direct commerce, zero borders, real-time inventory.
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted">
          <a
            href="mailto:support@mwb.example"
            className="hover:text-ink transition-colors underline-offset-4 hover:underline"
          >
            support@mwb.example
          </a>
          <span className="text-sand-hover">•</span>
          <a
            href="#terms"
            className="hover:text-ink transition-colors underline-offset-4 hover:underline"
          >
            Terms of Service
          </a>
          <span className="text-sand-hover">•</span>
          <a
            href="#privacy"
            className="hover:text-ink transition-colors underline-offset-4 hover:underline"
          >
            Privacy Policy
          </a>
        </div>
      </div>
    </footer>
  );
};

