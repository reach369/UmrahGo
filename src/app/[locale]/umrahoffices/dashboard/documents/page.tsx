'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { FileText, Plus, Trash, Edit, Download, File, Loader2, Calendar, AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react';
import {
  useGetDocumentsQuery,
  useUploadDocumentMutation,
  useUpdateDocumentMutation,
  useDeleteDocumentMutation,
  useGetDocumentTypesQuery
} from '../../redux/api/documentsApiSlice';
import { API_BASE_CONFIG } from '@/config/api.config';
import { useLocale } from '@/hooks/useLocale';

// UI Components
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/[locale]/umrahoffices/redux/store';

export default function DocumentsPage() {
  const locale = useLocale();
  const { user } = useSelector((state: RootState) => state.auth);
  
  // State for dialogs
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  
  // Filter states
  const [filter, setFilter] = useState({
    status: 'all',
    type: 'all',
    search: ''
  });
  
  // Form states
  const [uploadForm, setUploadForm] = useState({
    name: '',
    type: '',
    description: '',
    expiry_date: '',
    file: null as File | null
  });
  
  const [editForm, setEditForm] = useState({
    id: 0,
    name: '',
    description: '',
    expiry_date: ''
  });
  
  // RTK Query hooks
  const {
    data: documentsData,
    isLoading: isLoadingDocuments,
    error: documentsError,
    refetch: refetchDocuments
  } = useGetDocumentsQuery(undefined, {
    skip: !user?.id
  });
  
  const {
    data: documentTypesData,
    isLoading: isLoadingTypes
  } = useGetDocumentTypesQuery();
  
  const [uploadDocument, { isLoading: isUploading }] = useUploadDocumentMutation();
  const [updateDocument, { isLoading: isUpdating }] = useUpdateDocumentMutation();
  const [deleteDocument, { isLoading: isDeleting }] = useDeleteDocumentMutation();
  
  // Filter documents
  const filteredDocuments = documentsData?.data
    ? documentsData.data.filter((doc) => {
        // Filter by status
        if (filter.status !== 'all' && doc.status !== filter.status) {
          return false;
        }
        
        // Filter by type
        if (filter.type !== 'all' && doc.type !== filter.type) {
          return false;
        }
        
        // Filter by search term
        if (filter.search && !doc.name.toLowerCase().includes(filter.search.toLowerCase())) {
          return false;
        }
        
        return true;
      })
    : [];
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadForm({
        ...uploadForm,
        file
      });
    }
  };
  
  // Handle document upload
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!uploadForm.file) {
      toast.error('يرجى اختيار ملف للتحميل');
      return;
    }
    
    if (!uploadForm.name || !uploadForm.type) {
      toast.error('يرجى إدخال جميع البيانات المطلوبة');
      return;
    }
    
    try {
      const formData = new FormData();
      formData.append('file', uploadForm.file);
      formData.append('name', uploadForm.name);
      formData.append('type', uploadForm.type);
      
      if (uploadForm.description) {
        formData.append('description', uploadForm.description);
      }
      
      if (uploadForm.expiry_date) {
        formData.append('expiry_date', uploadForm.expiry_date);
      }
      
      await uploadDocument(formData).unwrap();
      toast.success('تم تحميل المستند بنجاح');
      
      // Reset form and close dialog
      setUploadForm({
        name: '',
        type: '',
        description: '',
        expiry_date: '',
        file: null
      });
      setUploadDialogOpen(false);
      
      // Refresh documents
      refetchDocuments();
    } catch (err) {
      console.error('Error uploading document:', err);
      toast.error('حدث خطأ أثناء تحميل المستند');
    }
  };
  
  // Open edit dialog with document data
  const openEditDialog = (document: any) => {
    setSelectedDocument(document);
    setEditForm({
      id: document.id,
      name: document.name,
      description: document.description || '',
      expiry_date: document.expiry_date ? new Date(document.expiry_date).toISOString().split('T')[0] : ''
    });
    setEditDialogOpen(true);
  };
  
  // Handle document update
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const formData = new FormData();
      formData.append('name', editForm.name);
      
      if (editForm.description) {
        formData.append('description', editForm.description);
      }
      
      if (editForm.expiry_date) {
        formData.append('expiry_date', editForm.expiry_date);
      }
      
      formData.append('_method', 'PUT'); // Laravel method spoofing
      
      await updateDocument({ id: editForm.id, formData }).unwrap();
      toast.success('تم تحديث معلومات المستند بنجاح');
      
      // Close dialog
      setEditDialogOpen(false);
      
      // Refresh documents
      refetchDocuments();
    } catch (err) {
      console.error('Error updating document:', err);
      toast.error('حدث خطأ أثناء تحديث معلومات المستند');
    }
  };
  
  // Handle document delete
  const handleDeleteDocument = async (id: number) => {
    if (!confirm('هل أنت متأكد من رغبتك في حذف هذا المستند؟')) {
      return;
    }
    
    try {
      await deleteDocument(id).unwrap();
      toast.success('تم حذف المستند بنجاح');
      
      // Refresh documents
      refetchDocuments();
    } catch (err) {
      console.error('Error deleting document:', err);
      toast.error('حدث خطأ أثناء حذف المستند');
    }
  };
  
  // Download document
  const handleDownloadDocument = (document: any) => {
    const baseUrl = API_BASE_CONFIG.BASE_URL;
    const downloadUrl = `${baseUrl}/office/documents/${document.id}/download`;
    
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    if (token) {
      // Create a hidden form to post with token for file download
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = downloadUrl;
      form.target = '_blank';
      
      // Add token to form
      const tokenInput = document.createElement('input');
      tokenInput.type = 'hidden';
      tokenInput.name = 'token';
      tokenInput.value = token;
      form.appendChild(tokenInput);
      
      // Add CSRF token if available
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      if (csrfToken) {
        const csrfInput = document.createElement('input');
        csrfInput.type = 'hidden';
        csrfInput.name = '_token';
        csrfInput.value = csrfToken;
        form.appendChild(csrfInput);
      }
      
      document.body.appendChild(form);
      form.submit();
      document.body.removeChild(form);
    } else {
      toast.error('جلسة المستخدم غير صالحة. يرجى تسجيل الدخول مرة أخرى.');
    }
  };
  
  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500">معتمد</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500">مرفوض</Badge>;
      case 'pending':
      default:
        return <Badge className="bg-yellow-500">قيد المراجعة</Badge>;
    }
  };
  
  // Get document icon by file type
  const getDocumentIcon = (document: any) => {
    const fileType = document.file_path.split('.').pop()?.toLowerCase();
    
    switch (fileType) {
      case 'pdf':
        return <FileText className="w-8 h-8 text-red-500" />;
      case 'doc':
      case 'docx':
        return <FileText className="w-8 h-8 text-blue-500" />;
      case 'xls':
      case 'xlsx':
        return <FileText className="w-8 h-8 text-green-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
        return <File className="w-8 h-8 text-purple-500" />;
      default:
        return <File className="w-8 h-8 text-gray-500" />;
    }
  };
  
  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '—';
    
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Check if document is expired
  const isExpired = (expiryDate: string | null) => {
    if (!expiryDate) return false;
    
    const today = new Date();
    const expiry = new Date(expiryDate);
    
    return expiry < today;
  };
  
  // Loading state
  if (isLoadingDocuments || isLoadingTypes) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-10 w-[200px]" />
          <Skeleton className="h-10 w-[150px]" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/3" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Error state
  if (documentsError) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>
            حدث خطأ أثناء تحميل المستندات. يرجى المحاولة مرة أخرى لاحقا.
          </AlertDescription>
        </Alert>
        <Button onClick={() => refetchDocuments()}>إعادة المحاولة</Button>
      </div>
    );
  }
  
  // Get document types
  const documentTypes = documentTypesData?.data || [];
  
  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold">المستندات والوثائق</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            إدارة المستندات والوثائق الخاصة بمكتب العمرة
          </p>
        </div>
        
        <Button onClick={() => setUploadDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          تحميل مستند جديد
        </Button>
      </div>
      
      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>الفلترة والبحث</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="filter-status">حالة المستند</Label>
              <Select
                value={filter.status}
                onValueChange={(value) => setFilter({ ...filter, status: value })}
              >
                <SelectTrigger id="filter-status">
                  <SelectValue placeholder="جميع الحالات" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="pending">قيد المراجعة</SelectItem>
                  <SelectItem value="approved">معتمد</SelectItem>
                  <SelectItem value="rejected">مرفوض</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="filter-type">نوع المستند</Label>
              <Select
                value={filter.type}
                onValueChange={(value) => setFilter({ ...filter, type: value })}
              >
                <SelectTrigger id="filter-type">
                  <SelectValue placeholder="جميع الأنواع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأنواع</SelectItem>
                  {documentTypes.map((type: string) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="filter-search">بحث</Label>
              <Input
                id="filter-search"
                placeholder="ابحث باسم المستند..."
                value={filter.search}
                onChange={(e) => setFilter({ ...filter, search: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle>المستندات والوثائق</CardTitle>
          <CardDescription>
            {filteredDocuments.length === 0 ? 'لا توجد مستندات' : `عدد المستندات: ${filteredDocuments.length}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredDocuments.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">لا توجد مستندات</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                ابدأ بتحميل المستندات والوثائق الخاصة بمكتبك.
              </p>
              <div className="mt-6">
                <Button onClick={() => setUploadDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  تحميل مستند جديد
                </Button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10"></TableHead>
                    <TableHead>اسم المستند</TableHead>
                    <TableHead>نوع المستند</TableHead>
                    <TableHead>تاريخ التحميل</TableHead>
                    <TableHead>تاريخ الانتهاء</TableHead>
                    <TableHead>حالة المستند</TableHead>
                    <TableHead className="text-left">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocuments.map((document) => (
                    <TableRow key={document.id} className="group">
                      <TableCell className="p-2">
                        {getDocumentIcon(document)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {document.name}
                        {document.description && (
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {document.description}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>{document.type}</TableCell>
                      <TableCell>{formatDate(document.created_at)}</TableCell>
                      <TableCell>
                        {document.expiry_date ? (
                          <div className="flex items-center">
                            <span className={isExpired(document.expiry_date) ? 'text-red-500' : ''}>
                              {formatDate(document.expiry_date)}
                            </span>
                            {isExpired(document.expiry_date) && (
                              <AlertTriangle className="h-4 w-4 text-red-500 mr-1" />
                            )}
                          </div>
                        ) : (
                          '—'
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(document.status)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDownloadDocument(document)}
                            title="تنزيل المستند"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(document)}
                            title="تعديل المستند"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteDocument(document.id)}
                            title="حذف المستند"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Upload Document Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>تحميل مستند جديد</DialogTitle>
            <DialogDescription>
              قم بتحميل مستند أو وثيقة جديدة لمكتب العمرة.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleUploadSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">اسم المستند</Label>
                <Input
                  id="name"
                  value={uploadForm.name}
                  onChange={(e) => setUploadForm({ ...uploadForm, name: e.target.value })}
                  placeholder="أدخل اسمًا وصفيًا للمستند"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="type">نوع المستند</Label>
                <Select
                  value={uploadForm.type}
                  onValueChange={(value) => setUploadForm({ ...uploadForm, type: value })}
                  required
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="اختر نوع المستند" />
                  </SelectTrigger>
                  <SelectContent>
                    {documentTypes.map((type: string) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">وصف المستند (اختياري)</Label>
                <Textarea
                  id="description"
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                  placeholder="أدخل وصفًا للمستند"
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="expiry_date">تاريخ انتهاء الصلاحية (اختياري)</Label>
                <Input
                  id="expiry_date"
                  type="date"
                  value={uploadForm.expiry_date}
                  onChange={(e) => setUploadForm({ ...uploadForm, expiry_date: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="file">الملف</Label>
                <Input
                  id="file"
                  type="file"
                  onChange={handleFileChange}
                  required
                />
                {uploadForm.file && (
                  <p className="text-sm text-gray-500">
                    الملف المحدد: {uploadForm.file.name} ({Math.round(uploadForm.file.size / 1024)} كيلوبايت)
                  </p>
                )}
              </div>
            </div>
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setUploadDialogOpen(false)}
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                disabled={isUploading || !uploadForm.file || !uploadForm.name || !uploadForm.type}
              >
                {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                تحميل المستند
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Edit Document Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>تعديل معلومات المستند</DialogTitle>
            <DialogDescription>
              تعديل تفاصيل المستند المحدد.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleEditSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">اسم المستند</Label>
                <Input
                  id="edit-name"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder="أدخل اسمًا وصفيًا للمستند"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-description">وصف المستند (اختياري)</Label>
                <Textarea
                  id="edit-description"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  placeholder="أدخل وصفًا للمستند"
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-expiry_date">تاريخ انتهاء الصلاحية (اختياري)</Label>
                <Input
                  id="edit-expiry_date"
                  type="date"
                  value={editForm.expiry_date}
                  onChange={(e) => setEditForm({ ...editForm, expiry_date: e.target.value })}
                />
              </div>
              
              {selectedDocument && (
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
                  <div className="flex items-center">
                    {getDocumentIcon(selectedDocument)}
                    <div className="mr-3">
                      <p className="font-medium">{selectedDocument.name}</p>
                      <p className="text-sm text-gray-500">
                        تم التحميل: {formatDate(selectedDocument.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                disabled={isUpdating || !editForm.name}
              >
                {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                حفظ التغييرات
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 