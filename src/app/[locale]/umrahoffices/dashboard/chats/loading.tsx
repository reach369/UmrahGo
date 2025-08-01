import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function ChatLoading() {
  return (
    <div className="h-screen bg-background flex">
      {/* Sidebar Loading */}
      <div className="w-80 border-r bg-card flex flex-col">
        {/* Header Loading */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-6 w-32" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-8 rounded" />
              <Skeleton className="h-8 w-8 rounded" />
            </div>
          </div>
          <Skeleton className="h-10 w-full" />
        </div>

        {/* Chat List Loading */}
        <div className="flex-1 p-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 mb-2">
              <Skeleton className="w-12 h-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-4 w-8" />
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area Loading */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header Loading */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-8 w-8 rounded" />
              <Skeleton className="h-8 w-8 rounded" />
              <Skeleton className="h-8 w-8 rounded" />
            </div>
          </div>
        </div>

        {/* Messages Loading */}
        <div className="flex-1 p-4">
          <div className="space-y-4">
            {[...Array(8)].map((_, i) => (
              <div 
                key={i} 
                className={`flex gap-2 max-w-[70%] ${i % 3 === 0 ? 'ml-auto flex-row-reverse' : ''}`}
              >
                {i % 3 !== 0 && <Skeleton className="h-8 w-8 rounded-full" />}
                <div className="space-y-2">
                  <Skeleton className={`h-16 ${i % 2 === 0 ? 'w-48' : 'w-32'} rounded-lg`} />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Message Input Loading */}
        <div className="p-4 border-t">
          <div className="flex items-end gap-2">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="flex-1 h-10" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
      </div>
    </div>
  );
} 