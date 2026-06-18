import React from 'react';
import { format } from 'date-fns';
import { CheckCircle2, Circle, Clock } from 'lucide-react';

interface TimelineEvent {
  id: string;
  action: string;
  createdAt: string;
}

interface BookingTimelineProps {
  timeline: TimelineEvent[];
}

export function BookingTimeline({ timeline }: BookingTimelineProps) {
  // Ordered lifecycle steps
  const steps = [
    { key: 'BOOKING_REQUESTED', label: 'Requested' },
    { key: 'BOOKING_APPROVED', label: 'Approved' },
    { key: 'BOOKING_ACTIVE', label: 'Rental Started' },
    { key: 'BOOKING_RETURNED', label: 'Returned' },
    { key: 'BOOKING_COMPLETED', label: 'Completed' },
  ];

  // Helper to find if a step occurred
  const getEvent = (key: string) => timeline.find((e) => e.action === key);

  // Check if rejected or cancelled
  const isRejected = !!getEvent('BOOKING_REJECTED');
  const isCancelled = !!getEvent('BOOKING_CANCELLED');

  if (isRejected) {
    return (
      <div className="flex items-center gap-4 text-red-500 bg-red-500/10 p-4 rounded-xl border border-red-500/20">
        <CheckCircle2 className="w-6 h-6" />
        <div>
          <p className="font-semibold">Booking Rejected</p>
          <p className="text-sm opacity-80">The owner has declined this request.</p>
        </div>
      </div>
    );
  }

  if (isCancelled) {
    return (
      <div className="flex items-center gap-4 text-gray-400 bg-gray-500/10 p-4 rounded-xl border border-gray-500/20">
        <CheckCircle2 className="w-6 h-6" />
        <div>
          <p className="font-semibold">Booking Cancelled</p>
          <p className="text-sm opacity-80">This booking request was cancelled.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative space-y-6 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
      {steps.map((step, index) => {
        const event = getEvent(step.key);
        const isPast = !!event;
        const isCurrent = !isPast && (index === 0 || !!getEvent(steps[index - 1].key));

        return (
          <div key={step.key} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            {/* Icon */}
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-background shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow transition-colors duration-300 ${
              isPast ? 'text-primary border-primary/20' : isCurrent ? 'text-blue-400 border-blue-400/20' : 'text-muted-foreground border-white/5'
            }`}>
              {isPast ? <CheckCircle2 className="w-5 h-5" /> : isCurrent ? <Clock className="w-5 h-5 animate-pulse" /> : <Circle className="w-5 h-5" />}
            </div>
            
            {/* Card */}
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-white/5 bg-white/5 backdrop-blur-md shadow">
              <div className="flex items-center justify-between mb-1">
                <div className={`font-bold ${isPast ? 'text-foreground' : 'text-muted-foreground'}`}>{step.label}</div>
                {event && (
                  <time className="text-xs font-medium text-blue-400">
                    {format(new Date(event.createdAt), 'MMM d, h:mm a')}
                  </time>
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                {isPast ? 'Completed' : isCurrent ? 'Pending...' : 'Waiting'}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
