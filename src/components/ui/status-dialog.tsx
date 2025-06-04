import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle } from 'lucide-react';

interface StatusDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  status: 'success' | 'error';
}

export function StatusDialog({
  isOpen,
  onClose,
  title,
  message,
  status,
}: StatusDialogProps) {
  const Icon = status === 'success' ? CheckCircle2 : XCircle;
  const iconColor = status === 'success' ? 'text-green-500' : 'text-red-500';
  const buttonColor = status === 'success' 
    ? 'bg-green-600 hover:bg-green-700 text-white' 
    : 'bg-red-600 hover:bg-red-700 text-white';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[400px]">
        <DialogHeader className="flex flex-col items-center justify-center text-center">
          <Icon className={`w-16 h-16 ${iconColor} mb-4`} />
          <DialogTitle className={status === 'success' ? 'text-green-700' : 'text-red-700'}>
            {title}
          </DialogTitle>
          <DialogDescription className="mt-2">
            {message}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex justify-center sm:justify-center">
          <Button
            onClick={onClose}
            className={buttonColor}
          >
            {status === 'success' ? 'حسناً' : 'حاول مرة أخرى'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 