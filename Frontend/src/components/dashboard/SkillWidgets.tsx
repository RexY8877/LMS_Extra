import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SkillScoreRingProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  color?: 'primary' | 'coding' | 'writing' | 'reading' | 'speaking' | 'behavior';
  showLabel?: boolean;
  className?: string;
}

const sizeConfig = {
  sm: { width: 80, stroke: 6, fontSize: 'text-lg' },
  md: { width: 120, stroke: 8, fontSize: 'text-2xl' },
  lg: { width: 160, stroke: 10, fontSize: 'text-4xl' },
};

const colorConfig = {
  primary: 'stroke-primary',
  coding: 'stroke-skill-coding',
  writing: 'stroke-skill-writing',
  reading: 'stroke-skill-reading',
  speaking: 'stroke-skill-speaking',
  behavior: 'stroke-skill-behavior',
};

export const SkillScoreRing = ({
  score,
  size = 'md',
  label,
  color = 'primary',
  showLabel = true,
  className,
}: SkillScoreRingProps) => {
  const { width, stroke, fontSize } = sizeConfig[size];
  const radius = (width - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <div className="relative" style={{ width, height: width }}>
        <svg className="transform -rotate-90" width={width} height={width}>
          {/* Background circle */}
          <circle
            cx={width / 2}
            cy={width / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={stroke}
            className="text-muted"
          />
          {/* Progress circle */}
          <circle
            cx={width / 2}
            cy={width / 2}
            r={radius}
            fill="none"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={cn(colorConfig[color], 'transition-all duration-1000 ease-out')}
          />
        </svg>
        {/* Score text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn('font-bold', fontSize)}>{score}</span>
          <span className="text-xs text-muted-foreground">/ 100</span>
        </div>
      </div>
      {showLabel && label && (
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
      )}
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  variant?: 'default' | 'coding' | 'writing' | 'reading' | 'speaking' | 'behavior';
  className?: string;
}

const variantConfig = {
  default: 'bg-card',
  coding: 'bg-skill-coding-muted border-skill-coding/20',
  writing: 'bg-skill-writing-muted border-skill-writing/20',
  reading: 'bg-skill-reading-muted border-skill-reading/20',
  speaking: 'bg-skill-speaking-muted border-skill-speaking/20',
  behavior: 'bg-skill-behavior-muted border-skill-behavior/20',
};

const iconVariantConfig = {
  default: 'bg-primary/10 text-primary',
  coding: 'bg-skill-coding/10 text-skill-coding',
  writing: 'bg-skill-writing/10 text-skill-writing',
  reading: 'bg-skill-reading/10 text-skill-reading',
  speaking: 'bg-skill-speaking/10 text-skill-speaking',
  behavior: 'bg-skill-behavior/10 text-skill-behavior',
};

export const StatCard = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
  variant = 'default',
  className,
}: StatCardProps) => {
  return (
    <div
      className={cn(
        'rounded-xl border p-5 transition-all card-hover',
        variantConfig[variant],
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
          {trend && trendValue && (
            <div className="flex items-center gap-1 pt-1">
              <span
                className={cn(
                  'text-xs font-medium',
                  trend === 'up' && 'text-success',
                  trend === 'down' && 'text-destructive',
                  trend === 'stable' && 'text-muted-foreground'
                )}
              >
                {trend === 'up' && '↑'}
                {trend === 'down' && '↓'}
                {trend === 'stable' && '→'}
                {trendValue}
              </span>
            </div>
          )}
        </div>
        {icon && (
          <div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-lg',
              iconVariantConfig[variant]
            )}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

interface SkillBadgeProps {
  skill: 'coding' | 'writing' | 'reading' | 'speaking' | 'behavior';
  children: ReactNode;
  className?: string;
}

export const SkillBadge = ({ skill, children, className }: SkillBadgeProps) => {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        `skill-badge-${skill}`,
        className
      )}
    >
      {children}
    </span>
  );
};

interface DifficultyBadgeProps {
  difficulty: 'Easy' | 'Medium' | 'Hard';
  className?: string;
}

export const DifficultyBadge = ({ difficulty, className }: DifficultyBadgeProps) => {
  const colors = {
    Easy: 'bg-success/10 text-success border-success/20',
    Medium: 'bg-warning/10 text-warning border-warning/20',
    Hard: 'bg-destructive/10 text-destructive border-destructive/20',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium',
        colors[difficulty],
        className
      )}
    >
      {difficulty}
    </span>
  );
};

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: 'primary' | 'coding' | 'writing' | 'reading' | 'speaking' | 'behavior' | 'success' | 'warning' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const progressColorConfig = {
  primary: 'bg-primary',
  coding: 'bg-skill-coding',
  writing: 'bg-skill-writing',
  reading: 'bg-skill-reading',
  speaking: 'bg-skill-speaking',
  behavior: 'bg-skill-behavior',
  success: 'bg-success',
  warning: 'bg-warning',
  destructive: 'bg-destructive',
};

const progressSizeConfig = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

export const ProgressBar = ({
  value,
  max = 100,
  color = 'primary',
  size = 'md',
  showLabel = false,
  className,
}: ProgressBarProps) => {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="mb-1 flex justify-between text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium">{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={cn('w-full overflow-hidden rounded-full bg-muted', progressSizeConfig[size])}>
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            progressColorConfig[color]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
