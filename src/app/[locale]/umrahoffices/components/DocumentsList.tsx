import { useGetDocumentsQuery, useDeleteDocumentMutation } from '../redux/api/documentsApiSlice';
import { DocumentCard } from './DocumentCard';
import { useToast } from '@/components/ui/use-toast';
import { Document } from '../redux/api/documentsApiSlice';
import { Loader2 } from 'lucide-react';

interface DocumentsListProps {
  onEditDocument: (document: Document) => void;
}

export function DocumentsList({ onEditDocument }: DocumentsListProps) {
  const { data: documentsData, isLoading, error } = useGetDocumentsQuery();
  const [deleteDocument] = useDeleteDocumentMutation();
  const { toast } = useToast();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="mr-2">جاري تحميل المستندات...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        حدث خطأ أثناء تحميل المستندات. الرجاء المحاولة مرة أخرى.
      </div>
    );
  }

  if (!documentsData?.data || documentsData.data.length === 0) {
    return (
      <div className="text-center text-gray-500 p-4">
        لا توجد مستندات متاحة حالياً
      </div>
    );
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteDocument(id).unwrap();
      toast({
        title: 'تم حذف المستند بنجاح',
        variant: 'default',
      });
    } catch (error) {
      toast({
        title: 'حدث خطأ أثناء حذف المستند',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {documentsData.data.map((document) => (
        <DocumentCard
          key={document.id}
          document={document}
        //  onEdit={onEditDocument}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
} 