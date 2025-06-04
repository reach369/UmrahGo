'use client';

import { useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileIcon, Upload, PlusCircle, RefreshCw, Pencil, Trash2, Download, Calendar, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { useGetDocumentsQuery, useUploadDocumentMutation, useUpdateDocumentMutation, useDeleteDocumentMutation } from '../../redux/api/documentsApiSlice';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

const DOCUMENT_TYPES = [
  { value: 'license', label: 'رخصة' },
  { value: 'certificate', label: 'شهادة' },
  { value: 'identification', label: 'هوية' },
  { value: 'other', label: 'أخرى' }
];

export default function DocumentsPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale || 'ar';
  const { toast } = useToast();

  // Upload states
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentName, setDocumentName] = useState('');
  const [documentType, setDocumentType] = useState<'license' | 'certificate' | 'identification' | 'other'>('license');
  const [documentDescription, setDocumentDescription] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit states
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<any>(null);
  const [editName, setEditName] = useState('');
  const [editType, setEditType] = useState<'license' | 'certificate' | 'identification' | 'other'>('license');
  const [editDescription, setEditDescription] = useState('');
  const [editExpiryDate, setEditExpiryDate] = useState('');

  // API hooks with polling disabled
  const { data: documentsData, isLoading, error } = useGetDocumentsQuery(undefined, {
    pollingInterval: 0
  });
  const [uploadDocument, { isLoading: isUploading }] = useUploadDocumentMutation();
  const [updateDocument, { isLoading: isUpdating }] = useUpdateDocumentMutation();
  const [deleteDocument, { isLoading: isDeleting }] = useDeleteDocumentMutation();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !documentName || !documentType || !expiryDate) {
      toast({
        title: 'خطأ',
        description: 'يرجى ملء جميع الحقول المطلوبة',
        variant: 'destructive',
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('name', documentName);
      formData.append('type', documentType);
      formData.append('expiry_date', expiryDate);
      if (documentDescription) {
        formData.append('description', documentDescription);
      }

      await uploadDocument(formData).unwrap();
      
      toast({
        title: 'تم بنجاح',
        description: 'تم رفع المستند بنجاح',
      });
      
      setIsUploadDialogOpen(false);
      resetUploadForm();
    } catch (err) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء رفع المستند',
        variant: 'destructive',
      });
    }
  };

  const handleUpdate = async () => {
    if (!editingDocument || !editName || !editType || !editExpiryDate) {
      toast({
        title: 'خطأ',
        description: 'يرجى ملء جميع الحقول المطلوبة',
        variant: 'destructive',
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', editName);
      formData.append('type', editType);
      formData.append('expiry_date', editExpiryDate);
      if (editDescription) {
        formData.append('description', editDescription);
      }

      await updateDocument({ id: editingDocument.id, formData }).unwrap();
      
      toast({
        title: 'تم بنجاح',
        description: 'تم تحديث المستند بنجاح',
      });
      
      setIsEditDialogOpen(false);
    } catch (err) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء تحديث المستند',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا المستند؟')) return;

    try {
      await deleteDocument(id).unwrap();
      
      toast({
        title: 'تم بنجاح',
        description: 'تم حذف المستند بنجاح',
      });
    } catch (err) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء حذف المستند',
        variant: 'destructive',
      });
    }
  };

  const resetUploadForm = () => {
    setSelectedFile(null);
    setDocumentName('');
    setDocumentType('license');
    setDocumentDescription('');
    setExpiryDate('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openEditDialog = (doc: any) => {
    setEditingDocument(doc);
    setEditName(doc.name || '');
    setEditType(doc.type || 'license');
    setEditDescription(doc.description || '');
    setEditExpiryDate(doc.expiry_date?.split('T')[0] || '');
    setIsEditDialogOpen(true);
  };

  const handleDownload = (doc: any) => {
    const link = window.document.createElement('a');
    link.href = doc.file_path.startsWith('http') ? doc.file_path : `/${doc.file_path}`;
    link.download = doc.name;
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500';
      case 'rejected':
        return 'bg-red-500';
      default:
        return 'bg-yellow-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return format(new Date(dateString), 'dd MMMM yyyy', { locale: ar });
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold text-primary">إدارة المستندات</CardTitle>
            <CardDescription>
              عرض وإدارة المستندات الخاصة بالمكتب
            </CardDescription>
          </div>
          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <PlusCircle className="h-4 w-4" />
                إضافة مستند جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] text-right">
              <DialogHeader>
                <DialogTitle className="text-right">إضافة مستند جديد</DialogTitle>
                <DialogDescription className="text-right">
                  قم برفع مستند جديد إلى المكتب
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">اسم المستند</Label>
                  <Input
                    id="name"
                    value={documentName}
                    onChange={(e) => setDocumentName(e.target.value)}
                    placeholder="أدخل اسم المستند"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">نوع المستند</Label>
                  <Select value={documentType} onValueChange={(value: any) => setDocumentType(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر نوع المستند" />
                    </SelectTrigger>
                    <SelectContent>
                      {DOCUMENT_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">وصف المستند</Label>
                  <Input
                    id="description"
                    value={documentDescription}
                    onChange={(e) => setDocumentDescription(e.target.value)}
                    placeholder="أدخل وصفاً للمستند"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expiry_date">تاريخ انتهاء الصلاحية</Label>
                  <div className="relative">
                    <Input
                      id="expiry_date"
                      type="date"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                    <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="file">اختر الملف</Label>
                  <Input
                    id="file"
                    type="file"
                    onChange={handleFileSelect}
                    ref={fileInputRef}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button 
                  type="submit" 
                  onClick={handleUpload}
                  disabled={!selectedFile || !documentName || !documentType || !expiryDate || isUploading}
                >
                  {isUploading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      جاري الرفع...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      رفع المستند
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <RefreshCw className="h-8 w-8 mx-auto animate-spin text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">جاري تحميل المستندات...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-lg text-red-500">حدث خطأ أثناء تحميل المستندات</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => window.location.reload()}
              >
                إعادة المحاولة
              </Button>
            </div>
          ) : documentsData?.data.length === 0 ? (
            <div className="text-center py-12">
              <FileIcon className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-lg text-muted-foreground mb-2">لا توجد مستندات</p>
              <p className="text-sm text-muted-foreground/70 mb-6">يمكنك البدء بإضافة مستندات جديدة</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {documentsData?.data.map((doc: any) => (
                <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <FileIcon className="h-8 w-8 text-primary" />
                    <div className="space-y-2">
                      <div>
                        <h3 className="font-medium">{doc.name}</h3>
                        {doc.description && (
                          <p className="text-sm text-muted-foreground">{doc.description}</p>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">
                          {DOCUMENT_TYPES.find(t => t.value === doc.type)?.label || doc.type}
                        </Badge>
                        <Badge 
                          className={`flex items-center gap-1 ${getStatusBadgeColor(doc.status)}`}
                        >
                          {getStatusIcon(doc.status)}
                          <span>{doc.status === 'pending' ? 'قيد المراجعة' : doc.status === 'approved' ? 'معتمد' : 'مرفوض'}</span>
                        </Badge>
                        {doc.is_archived && (
                          <Badge variant="outline" className="bg-gray-100">
                            مؤرشف
                          </Badge>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span>تاريخ الانتهاء: {formatDate(doc.expiry_date)}</span>
                        <span>تاريخ الرفع: {formatDate(doc.uploaded_at)}</span>
                        {doc.approved_at && (
                          <span>تاريخ الاعتماد: {formatDate(doc.approved_at)}</span>
                        )}
                      </div>

                      {doc.rejection_reason && (
                        <p className="text-sm text-red-500">
                          سبب الرفض: {doc.rejection_reason}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDownload(doc)}
                      title="تحميل المستند"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    {doc.status === 'pending' && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(doc)}
                          title="تعديل المستند"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(doc.id)}
                          title="حذف المستند"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px] text-right">
          <DialogHeader>
            <DialogTitle className="text-right">تعديل المستند</DialogTitle>
            <DialogDescription className="text-right">
              قم بتعديل تفاصيل المستند
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">اسم المستند</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="أدخل اسم المستند"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-type">نوع المستند</Label>
              <Select value={editType} onValueChange={(value: any) => setEditType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر نوع المستند" />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-description">وصف المستند</Label>
              <Input
                id="edit-description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="أدخل وصفاً للمستند"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-expiry-date">تاريخ انتهاء الصلاحية</Label>
              <div className="relative">
                <Input
                  id="edit-expiry-date"
                  type="date"
                  value={editExpiryDate}
                  onChange={(e) => setEditExpiryDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
                <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="submit" 
              onClick={handleUpdate}
              disabled={!editName || !editType || !editExpiryDate || isUpdating}
            >
              {isUpdating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  جاري التحديث...
                </>
              ) : (
                <>
                  <Pencil className="h-4 w-4 mr-2" />
                  حفظ التعديلات
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 