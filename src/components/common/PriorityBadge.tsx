import React from 'react';
import { PriorityLevel } from '../../types';

export interface PriorityConfig {
  label: string;
  shortLabel: string;
  badgeClass: string;
  dotClass: string;
  borderClass: string;
  bgLightClass: string;
  textColorClass: string;
  level: 'high' | 'medium' | 'low';
}

export const getPriorityConfig = (priority: PriorityLevel): PriorityConfig => {
  switch (priority) {
    case 'urgent':
      return {
        label: 'ด่วนมาก (High)',
        shortLabel: 'ด่วนมาก',
        badgeClass: 'bg-red-50 text-red-700 border-red-200 font-bold',
        dotClass: 'bg-red-500',
        borderClass: 'border-red-300',
        bgLightClass: 'bg-red-50/70',
        textColorClass: 'text-red-700',
        level: 'high',
      };
    case 'high':
      return {
        label: 'สูง (High)',
        shortLabel: 'สูง',
        badgeClass: 'bg-red-50 text-red-700 border-red-200 font-semibold',
        dotClass: 'bg-red-500',
        borderClass: 'border-red-300',
        bgLightClass: 'bg-red-50/50',
        textColorClass: 'text-red-700',
        level: 'high',
      };
    case 'medium':
      return {
        label: 'ปานกลาง (Medium)',
        shortLabel: 'ปานกลาง',
        badgeClass: 'bg-amber-50 text-amber-800 border-amber-200 font-medium',
        dotClass: 'bg-amber-500',
        borderClass: 'border-amber-300',
        bgLightClass: 'bg-amber-50/50',
        textColorClass: 'text-amber-800',
        level: 'medium',
      };
    case 'low':
      return {
        label: 'ต่ำ (Low)',
        shortLabel: 'ต่ำ',
        badgeClass: 'bg-blue-50 text-blue-700 border-blue-200 font-medium',
        dotClass: 'bg-blue-500',
        borderClass: 'border-blue-300',
        bgLightClass: 'bg-blue-50/50',
        textColorClass: 'text-blue-700',
        level: 'low',
      };
    default:
      return {
        label: 'ปานกลาง (Medium)',
        shortLabel: 'ปานกลาง',
        badgeClass: 'bg-amber-50 text-amber-800 border-amber-200 font-medium',
        dotClass: 'bg-amber-500',
        borderClass: 'border-amber-300',
        bgLightClass: 'bg-amber-50/50',
        textColorClass: 'text-amber-800',
        level: 'medium',
      };
  }
};

interface PriorityBadgeProps {
  priority: PriorityLevel;
  size?: 'xs' | 'sm' | 'md';
  showDot?: boolean;
  useShortLabel?: boolean;
  className?: string;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({
  priority,
  size = 'xs',
  showDot = true,
  useShortLabel = false,
  className = '',
}) => {
  const config = getPriorityConfig(priority);

  const sizeClasses = {
    xs: 'text-[10px] px-1.5 py-0.5 gap-1',
    sm: 'text-xs px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-semibold',
  };

  const dotSizes = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-2 h-2',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border shadow-2xs transition-colors shrink-0 ${config.badgeClass} ${sizeClasses[size]} ${className}`}
    >
      {showDot && (
        <span
          className={`rounded-full shrink-0 ${config.dotClass} ${dotSizes[size]} ${
            config.level === 'high' ? 'animate-pulse' : ''
          }`}
        />
      )}
      <span>{useShortLabel ? config.shortLabel : config.label}</span>
    </span>
  );
};
