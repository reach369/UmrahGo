'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { toast } from 'react-hot-toast';
import { useGetOfficeProfileQuery } from '../../redux/api/officesApiSlice';

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

export default function TestEndpointsPage() {
  const params = useParams();
  const locale = params?.locale || 'ar';
  
  // Get user from Redux store
  const { user, token } = useSelector((state: RootState) => state.auth);
  
  // Test API queries
  const {
    data: profileData,
    isLoading: isProfileLoading,
    error: profileError,
    refetch: refetchProfile
  } = useGetOfficeProfileQuery();
  
  // Loading state
  if (isProfileLoading) {
    return (
      <div className="container mx-auto py-8">
        <Skeleton className="h-[400px] w-full rounded-lg" />
      </div>
    );
  }
  
  // Error state
  if (profileError) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>
            Error loading profile data. Please try again later.
          </AlertDescription>
        </Alert>
        <Button onClick={() => refetchProfile()}>Retry</Button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Test Endpoints Page</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Redux Auth State</CardTitle>
          <CardDescription>Current authentication state from Redux</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-60">
            {JSON.stringify({ user, token }, null, 2)}
          </pre>
        </CardContent>
      </Card>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Office Profile</CardTitle>
          <CardDescription>Data from office profile API endpoint</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-60">
            {JSON.stringify(profileData, null, 2)}
          </pre>
        </CardContent>
      </Card>
      
      <Button onClick={() => refetchProfile()} className="mb-4">
        Refresh Profile Data
      </Button>
      
      <Button variant="outline" onClick={() => toast.success('Toast working!')}>
        Test Toast
      </Button>
    </div>
  );
} 