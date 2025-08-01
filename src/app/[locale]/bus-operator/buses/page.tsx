'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { fetchBuses, createBus, updateBus, deleteBus } from '../redux/busOperatorSlice';
import { CreateBusForm } from '../types';

export default function BusOperatorBusesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedBus, setSelectedBus] = useState(null);
  const [formData, setFormData] = useState<CreateBusForm>({
    name: '',
    type: 'standard',
    capacity: 0,
    plate_number: '',
    description: '',
    price_per_km: 0,
    features: [],
    images: [],
    status: 'active'
  });

  const dispatch = useAppDispatch();
  const { buses, loading } = useAppSelector((state) => state.busOperator);
  const t = useTranslations('BusOperatorDashboard');

  useEffect(() => {
    dispatch(fetchBuses());
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedBus) {
        await dispatch(updateBus({ id: selectedBus.id, busData: formData })).unwrap();
        setIsEditDialogOpen(false);
      } else {
        await dispatch(createBus(formData)).unwrap();
        setIsAddDialogOpen(false);
      }
      resetForm();
    } catch (error) {
      console.error('Failed to save bus:', error);
    }
  };

  const handleDelete = async (busId: number) => {
    try {
      await dispatch(deleteBus(busId)).unwrap();
    } catch (error) {
      console.error('Failed to delete bus:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'standard',
      capacity: 0,
      plate_number: '',
      description: '',
      price_per_km: 0,
      features: [],
      images: [],
      status: 'active'
    });
    setSelectedBus(null);
  };

  const openEditDialog = (bus: any) => {
    setSelectedBus(bus);
    setFormData({
      name: bus.name,
      type: bus.type,
      capacity: bus.capacity,
      plate_number: bus.plate_number,
      description: bus.description || '',
      price_per_km: bus.price_per_km,
      features: bus.features || [],
      images: [],
      status: bus.status
    });
    setIsEditDialogOpen(true);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'inactive': return 'secondary';
      case 'maintenance': return 'destructive';
      default: return 'outline';
    }
  };

  const filteredBuses = buses.filter(bus => {
    if (!searchQuery) return true;
    
    const searchLower = searchQuery.toLowerCase();
    return (
      bus.name.toLowerCase().includes(searchLower) ||
      bus.plate_number.toLowerCase().includes(searchLower) ||
      bus.type.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('buses.title')}</h1>
          <p className="text-muted-foreground">
            {t('buses.list')}
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              {t('buses.add')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t('buses.add')}</DialogTitle>
              <DialogDescription>
                أضف باص جديد إلى أسطولك
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">{t('buses.form.name')}</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="type">{t('buses.form.type')}</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="luxury">{t('buses.types.luxury')}</SelectItem>
                      <SelectItem value="standard">{t('buses.types.standard')}</SelectItem>
                      <SelectItem value="economy">{t('buses.types.economy')}</SelectItem>
                      <SelectItem value="vip">{t('buses.types.vip')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="capacity">{t('buses.form.capacity')}</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData(prev => ({ ...prev, capacity: parseInt(e.target.value) }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="plate_number">{t('buses.form.plateNumber')}</Label>
                  <Input
                    id="plate_number"
                    value={formData.plate_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, plate_number: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price_per_km">{t('buses.form.pricePerKm')}</Label>
                  <Input
                    id="price_per_km"
                    type="number"
                    step="0.01"
                    value={formData.price_per_km}
                    onChange={(e) => setFormData(prev => ({ ...prev, price_per_km: parseFloat(e.target.value) }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="status">{t('buses.form.status')}</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">{t('buses.form.active')}</SelectItem>
                      <SelectItem value="inactive">{t('buses.form.inactive')}</SelectItem>
                      <SelectItem value="maintenance">{t('buses.form.maintenance')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">{t('buses.form.description')}</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  {t('common.cancel')}
                </Button>
                <Button type="submit">
                  {t('common.save')}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{t('buses.list')}</CardTitle>
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder={t('common.search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading.buses ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">{t('common.loading')}</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('buses.table.id')}</TableHead>
                    <TableHead>{t('buses.table.name')}</TableHead>
                    <TableHead>{t('buses.table.type')}</TableHead>
                    <TableHead>{t('buses.table.capacity')}</TableHead>
                    <TableHead>{t('buses.table.plateNumber')}</TableHead>
                    <TableHead>{t('buses.table.pricePerKm')}</TableHead>
                    <TableHead>{t('buses.table.status')}</TableHead>
                    <TableHead className="text-right">{t('buses.table.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBuses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        {t('common.noData')}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredBuses.map((bus) => (
                      <TableRow key={bus.id}>
                        <TableCell className="font-medium">#{bus.id}</TableCell>
                        <TableCell className="font-medium">{bus.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {t(`buses.types.${bus.type}`)}
                          </Badge>
                        </TableCell>
                        <TableCell>{bus.capacity} مقعد</TableCell>
                        <TableCell className="font-mono">{bus.plate_number}</TableCell>
                        <TableCell>{bus.price_per_km} ريال/كم</TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(bus.status)}>
                            {t(`buses.form.${bus.status}`)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-1">
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(bus)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    هل أنت متأكد من حذف الباص "{bus.name}"؟ هذا الإجراء لا يمكن التراجع عنه.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(bus.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    {t('common.delete')}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('buses.edit')}</DialogTitle>
            <DialogDescription>
              تعديل معلومات الباص
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">{t('buses.form.name')}</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-type">{t('buses.form.type')}</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="luxury">{t('buses.types.luxury')}</SelectItem>
                    <SelectItem value="standard">{t('buses.types.standard')}</SelectItem>
                    <SelectItem value="economy">{t('buses.types.economy')}</SelectItem>
                    <SelectItem value="vip">{t('buses.types.vip')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-capacity">{t('buses.form.capacity')}</Label>
                <Input
                  id="edit-capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData(prev => ({ ...prev, capacity: parseInt(e.target.value) }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-plate_number">{t('buses.form.plateNumber')}</Label>
                <Input
                  id="edit-plate_number"
                  value={formData.plate_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, plate_number: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-price_per_km">{t('buses.form.pricePerKm')}</Label>
                <Input
                  id="edit-price_per_km"
                  type="number"
                  step="0.01"
                  value={formData.price_per_km}
                  onChange={(e) => setFormData(prev => ({ ...prev, price_per_km: parseFloat(e.target.value) }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-status">{t('buses.form.status')}</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">{t('buses.form.active')}</SelectItem>
                    <SelectItem value="inactive">{t('buses.form.inactive')}</SelectItem>
                    <SelectItem value="maintenance">{t('buses.form.maintenance')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="edit-description">{t('buses.form.description')}</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button type="submit">
                {t('common.update')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 