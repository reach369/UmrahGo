import { useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Trash2, Eye, Download, Clock } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Document } from '../redux/api/documentsApiSlice';

interface DocumentCardProps {
  document: Document;
  onDelete: (id: number) => void;
}

const documentTypeColors = {
  license: 'bg-blue-500',
  certificate: 'bg-green-500',
  identification: 'bg-yellow-500',
  other: 'bg-gray-500',
};

const documentStatusColors = {
  pending: 'bg-yellow-500',
  approved: 'bg-green-500',
  rejected: 'bg-red-500',
};

export function DocumentCard({ document, onDelete }: DocumentCardProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const getDocumentUrl = (path: string) => {
    return `${process.env.NEXT_PUBLIC_API_URL}/api/v1/${path}`;
  };

  const handleDelete = () => {
    onDelete(document.id);
    setShowDeleteConfirm(false);
  };

  const handleDownload = () => {
    const link = window.document.createElement('a');
    link.href = getDocumentUrl(document.file_path);
    link.download = document.name;
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
  };

  const isExpiringSoon = () => {
    const expiryDate = new Date(document.expiry_date);
    const today = new Date();
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays > 0;
  };

  const isExpired = () => {
    const expiryDate = new Date(document.expiry_date);
    const today = new Date();
    return expiryDate < today;
  };

  return (
    <>
      <Card className="group relative">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-gray-100 rounded-lg">
                <FileText className="h-8 w-8 text-gray-600" />
              </div>
              <div>
                <h3 className="font-medium">{document.name}</h3>
                <p className="text-sm text-gray-500">{document.description}</p>
              </div>
            </div>
            <div className="flex flex-col items-end space-y-2">
              <Badge className={documentTypeColors[document.type]}>
                {document.type}
              </Badge>
              <Badge className={documentStatusColors[document.status]}>
                {document.status}
              </Badge>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              <span>
                تاريخ الانتهاء: {format(new Date(document.expiry_date), 'yyyy/MM/dd')}
              </span>
            </div>
            {isExpiringSoon() && (
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 animate-pulse">
                ينتهي قريباً
              </Badge>
            )}
            {isExpired() && (
              <Badge variant="destructive">
                منتهي الصلاحية
              </Badge>
            )}
          </div>
        </CardContent>
        <CardFooter className="bg-gray-50 p-4 flex justify-end space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPreview(true)}
          >
            <Eye className="h-4 w-4 mr-2" />
            عرض
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
          >
            <Download className="h-4 w-4 mr-2" />
            تحميل
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            حذف
          </Button>
        </CardFooter>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{document.name}</DialogTitle>
          </DialogHeader>
          <div className="relative w-full aspect-[4/3]">
            {document.mime_type.startsWith('image/') ? (
              // For images
              <img
                src={getDocumentUrl(document.file_path)}
                alt={document.name}
                className="w-full h-full object-contain"
              />
            ) : (
              // For PDFs and other documents
              <iframe
                src={getDocumentUrl(document.file_path)}
                className="w-full h-full"
                title={document.name}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد حذف المستند</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذا المستند؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 