import React from 'react';

interface HubIconProps {
  className?: string;
  size?: number;
}

export function HubIcon({ className = '', size = 24 }: HubIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer Circle - Hub Container */}
      <circle
        cx="12"
        cy="12"
        r="10"
        fill="url(#hubGradient)"
        opacity="0.2"
      />
      
      {/* Center Hub Core */}
      <circle
        cx="12"
        cy="12"
        r="3.5"
        fill="url(#hubGradient)"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      
      {/* Connection Lines - 6 spokes */}
      <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        {/* Top */}
        <line x1="12" y1="8.5" x2="12" y2="3" />
        {/* Top Right */}
        <line x1="14.5" y1="9.5" x2="18" y2="6" />
        {/* Bottom Right */}
        <line x1="14.5" y1="14.5" x2="18" y2="18" />
        {/* Bottom */}
        <line x1="12" y1="15.5" x2="12" y2="21" />
        {/* Bottom Left */}
        <line x1="9.5" y1="14.5" x2="6" y2="18" />
        {/* Top Left */}
        <line x1="9.5" y1="9.5" x2="6" y2="6" />
      </g>
      
      {/* Connection Nodes */}
      <g fill="currentColor">
        {/* Top */}
        <circle cx="12" cy="3" r="2" />
        {/* Top Right */}
        <circle cx="18" cy="6" r="2" />
        {/* Bottom Right */}
        <circle cx="18" cy="18" r="2" />
        {/* Bottom */}
        <circle cx="12" cy="21" r="2" />
        {/* Bottom Left */}
        <circle cx="6" cy="18" r="2" />
        {/* Top Left */}
        <circle cx="6" cy="6" r="2" />
      </g>
      
      {/* Inner Sparkle */}
      <g fill="white" opacity="0.8">
        <circle cx="11" cy="11" r="0.8" />
        <circle cx="13" cy="13" r="0.6" />
      </g>
      
      {/* Gradient Definition */}
      <defs>
        <linearGradient id="hubGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="50%" stopColor="#059669" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// Animated version with pulse effect
export function HubIconAnimated({ className = '', size = 24 }: HubIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Animated Outer Rings */}
      <circle
        cx="12"
        cy="12"
        r="10"
        fill="none"
        stroke="url(#hubGradient)"
        strokeWidth="0.5"
        opacity="0.3"
      >
        <animate
          attributeName="r"
          values="10;11;10"
          dur="2s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="0.3;0.1;0.3"
          dur="2s"
          repeatCount="indefinite"
        />
      </circle>
      
      {/* Center Hub Core with Pulse */}
      <circle
        cx="12"
        cy="12"
        r="3.5"
        fill="url(#hubGradient)"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <animate
          attributeName="r"
          values="3.5;4;3.5"
          dur="1.5s"
          repeatCount="indefinite"
        />
      </circle>
      
      {/* Connection Lines */}
      <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <line x1="12" y1="8.5" x2="12" y2="3" />
        <line x1="14.5" y1="9.5" x2="18" y2="6" />
        <line x1="14.5" y1="14.5" x2="18" y2="18" />
        <line x1="12" y1="15.5" x2="12" y2="21" />
        <line x1="9.5" y1="14.5" x2="6" y2="18" />
        <line x1="9.5" y1="9.5" x2="6" y2="6" />
      </g>
      
      {/* Connection Nodes with Subtle Animation */}
      <g fill="currentColor">
        <circle cx="12" cy="3" r="2">
          <animate attributeName="r" values="2;2.3;2" dur="2s" begin="0s" repeatCount="indefinite" />
        </circle>
        <circle cx="18" cy="6" r="2">
          <animate attributeName="r" values="2;2.3;2" dur="2s" begin="0.3s" repeatCount="indefinite" />
        </circle>
        <circle cx="18" cy="18" r="2">
          <animate attributeName="r" values="2;2.3;2" dur="2s" begin="0.6s" repeatCount="indefinite" />
        </circle>
        <circle cx="12" cy="21" r="2">
          <animate attributeName="r" values="2;2.3;2" dur="2s" begin="0.9s" repeatCount="indefinite" />
        </circle>
        <circle cx="6" cy="18" r="2">
          <animate attributeName="r" values="2;2.3;2" dur="2s" begin="1.2s" repeatCount="indefinite" />
        </circle>
        <circle cx="6" cy="6" r="2">
          <animate attributeName="r" values="2;2.3;2" dur="2s" begin="1.5s" repeatCount="indefinite" />
        </circle>
      </g>
      
      {/* Sparkles */}
      <g fill="white" opacity="0.9">
        <circle cx="11" cy="11" r="0.8">
          <animate attributeName="opacity" values="0.9;0.3;0.9" dur="1s" repeatCount="indefinite" />
        </circle>
        <circle cx="13" cy="13" r="0.6">
          <animate attributeName="opacity" values="0.3;0.9;0.3" dur="1s" repeatCount="indefinite" />
        </circle>
      </g>
      
      {/* Gradient Definition */}
      <defs>
        <linearGradient id="hubGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="50%" stopColor="#059669" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>
      </defs>
    </svg>
  );
}
