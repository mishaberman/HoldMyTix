
import React from 'react';
import { CheckCircle, Circle, XCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ProgressStep {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  completedAt?: string;
}

interface ProgressTrackerProps {
  steps: ProgressStep[];
  className?: string;
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({ steps, className }) => {
  const getStepIcon = (status: ProgressStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-6 w-6 text-green-600" />;
      case 'in-progress':
        return <Clock className="h-6 w-6 text-blue-600" />;
      case 'cancelled':
        return <XCircle className="h-6 w-6 text-red-600" />;
      default:
        return <Circle className="h-6 w-6 text-gray-400" />;
    }
  };

  const getStepColor = (status: ProgressStep['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'in-progress':
        return 'text-blue-600';
      case 'cancelled':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {steps.map((step, index) => (
        <div key={step.id} className="relative">
          {index < steps.length - 1 && (
            <div
              className={cn(
                'absolute left-3 top-8 w-0.5 h-8',
                step.status === 'completed' ? 'bg-green-600' : 'bg-gray-300'
              )}
            />
          )}
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">{getStepIcon(step.status)}</div>
            <div className="flex-1 min-w-0">
              <p className={cn('text-sm font-medium', getStepColor(step.status))}>
                {step.title}
              </p>
              {step.description && (
                <p className="text-sm text-gray-500">{step.description}</p>
              )}
              {step.completedAt && step.status === 'completed' && (
                <p className="text-xs text-gray-400">
                  Completed on {new Date(step.completedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
