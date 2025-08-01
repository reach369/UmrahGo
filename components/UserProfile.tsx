"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from '@/types/auth.types';
import { authService } from '@/lib/auth.service';
import { useAuth } from '@/contexts/AuthContext';

interface UserProfileProps {
  user: User;
  onUpdate?: (updatedUser: User) => void;
}

export default function UserProfile({ user, onUpdate }: UserProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    phone: user.phone || '',
    address: user.address || ''
  });
  const [loading, setLoading] = useState(false);
  const { state, dispatch } = useAuth();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authService.updateProfile({
        name: formData.name,
        phone: formData.phone,
        address: formData.address
      });

      if (response && onUpdate) {
        onUpdate(response.data);
      }

      setIsEditing(false);
    } catch (error) {
      console.error('Profile update error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      address: user.address || ''
    });
    setIsEditing(false);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          <Avatar className="w-16 h-16">
            <AvatarImage src={user.avatar || user.profile_photo || ''} alt={user.name} />
            <AvatarFallback className="text-lg">
              {user.name?.charAt(0)?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-xl">{user.name}</CardTitle>
            <CardDescription>{user.email}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">الاسم</label>
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">البريد الإلكتروني</label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                disabled
                className="bg-gray-100"
              />
            </div>
            <div>
              <label className="text-sm font-medium">رقم الهاتف</label>
              <Input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="text-sm font-medium">العنوان</label>
              <Input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
              />
            </div>
            <div className="flex space-x-2 rtl:space-x-reverse">
              <Button type="submit" disabled={loading}>
                {loading ? 'جاري الحفظ...' : 'حفظ'}
              </Button>
              <Button type="button" variant="outline" onClick={handleCancel}>
                إلغاء
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div>
              <p><strong>الاسم:</strong> {user.name}</p>
            </div>
            <div>
              <p><strong>البريد الإلكتروني:</strong> {user.email}</p>
            </div>
            <div>
              <p><strong>رقم الهاتف:</strong> {user.phone || 'غير محدد'}</p>
            </div>
            <div>
              <p><strong>العنوان:</strong> {user.address || 'غير محدد'}</p>
            </div>
            <Button onClick={() => setIsEditing(true)}>
              تحرير الملف الشخصي
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 