import React from 'react';
import { CheckCircle, Circle, Clock, XCircle, AlertCircle, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export interface StatusStep {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled' | 'failed';
  completedAt?: string;
  details?: string;
}

interface StatusTrackerProps {
  steps: StatusStep[];
  className?: string;
  currentStep?: string;
}

export const StatusTracker: React.FC<StatusTrackerProps> = ({ 
  steps, 
  className,
  currentStep 
}) => {
  const getStepIcon = (status: StatusStep['status'], isActive: boolean) => {
    const iconClass = cn(
      "h-6 w-6 transition-colors",
      isActive && "animate-pulse"
    );

    switch (status) {
      case 'completed':
        return <CheckCircle className={cn(iconClass, "text-green-600")} />;
      case 'in-progress':
        return <Clock className={cn(iconClass, "text-blue-600")} />;
      case 'cancelled':
      case 'failed':
        return <XCircle className={cn(iconClass, "text-red-600")} />;
      default:
        return <Circle className={cn(iconClass, "text-gray-400")} />;
    }
  };

  const getStepColor = (status: StatusStep['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'in-progress':
        return 'text-blue-600';
      case 'cancelled':
      case 'failed':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusBadge = (status: StatusStep['status']) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Completed</Badge>;
      case 'in-progress':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">In Progress</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Cancelled</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Failed</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-100 text-gray-600">Pending</Badge>;
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Transfer Progress</h3>
        <div className="text-sm text-muted-foreground">
          {steps.filter(s => s.status === 'completed').length} of {steps.length} steps completed
        </div>
      </div>
      
      {steps.map((step, index) => {
        const isActive = currentStep === step.id;
        const isLast = index === steps.length - 1;
        
        return (
          <div key={step.id} className="relative">
            {!isLast && (
              <div
                className={cn(
                  'absolute left-3 top-8 w-0.5 h-12',
                  step.status === 'completed' ? 'bg-green-600' : 'bg-gray-300'
                )}
              />
            )}
            
            <div className={cn(
              "flex items-start space-x-3 p-4 rounded-lg transition-all",
              isActive && "bg-blue-50 border border-blue-200",
              step.status === 'completed' && "bg-green-50 border border-green-200",
              step.status === 'failed' && "bg-red-50 border border-red-200"
            )}>
              <div className="flex-shrink-0 mt-1">
                {getStepIcon(step.status, isActive)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className={cn('text-sm font-medium', getStepColor(step.status))}>
                    {step.title}
                  </p>
                  {getStatusBadge(step.status)}
                </div>
                
                {step.description && (
                  <p className="text-sm text-gray-600 mb-2">{step.description}</p>
                )}
                
                {step.details && (
                  <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded">
                    {step.details}
                  </div>
                )}
                
                {step.completedAt && step.status === 'completed' && (
                  <p className="text-xs text-gray-400 mt-1">
                    Completed on {new Date(step.completedAt).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatusTracker;