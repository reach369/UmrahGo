'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { apiTester } from '../../utils/api-tester';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';

// UI Components
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

interface TestResult {
  name: string;
  endpoint: string;
  method: string;
  status: number;
  success: boolean;
  responseTime: number;
  data?: any;
  error?: any;
}

export default function ApiTesterPage() {
  const params = useParams();
  const locale = params?.locale || 'ar';
  const { token, user } = useSelector((state: RootState) => state.auth);
  
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Set the API token when user is available
  useEffect(() => {
    if (token) {
      apiTester.setToken(token);
    }
  }, [token]);

  // Run tests on dashboard endpoints
  const runDashboardTests = async () => {
    setIsTestRunning(true);
    setError(null);
    setTestResults([]);

    try {
      // Test dashboard endpoints
      const dashboardStatsResult = await apiTester.testEndpoint(
        '/office/reports/dashboard'
      );
      const dailyBookingsResult = await apiTester.testEndpoint(
        '/office/reports/bookings-daily'
      );
      const financialTransactionsResult = await apiTester.testEndpoint(
        '/office/reports/financial-transactions'
      );
      const packagesPopularityResult = await apiTester.testEndpoint(
        '/office/reports/packages-popular'
      );

      setTestResults([
        {
          name: 'Dashboard Statistics',
          ...dashboardStatsResult
        },
        {
          name: 'Daily Bookings',
          ...dailyBookingsResult
        },
        {
          name: 'Financial Transactions',
          ...financialTransactionsResult
        },
        {
          name: 'Popular Packages',
          ...packagesPopularityResult
        }
      ]);

      toast.success('Dashboard API tests completed');
    } catch (err: any) {
      setError(err.message || 'Failed to run API tests');
      toast.error('Error running API tests');
    } finally {
      setIsTestRunning(false);
    }
  };

  // Run tests on booking endpoints
  const runBookingTests = async () => {
    setIsTestRunning(true);
    setError(null);
    setTestResults([]);

    try {
      // Test booking endpoints
      const bookingsResult = await apiTester.testEndpoint(
        '/office/bookings'
      );
      const packageBookingsResult = await apiTester.testEndpoint(
        '/office/package-bookings'
      );
      const bookingStatsResult = await apiTester.testEndpoint(
        '/office/package-bookings/statistics'
      );

      setTestResults([
        {
          name: 'All Bookings',
          ...bookingsResult
        },
        {
          name: 'Package Bookings',
          ...packageBookingsResult
        },
        {
          name: 'Booking Statistics',
          ...bookingStatsResult
        }
      ]);

      toast.success('Booking API tests completed');
    } catch (err: any) {
      setError(err.message || 'Failed to run API tests');
      toast.error('Error running API tests');
    } finally {
      setIsTestRunning(false);
    }
  };

  // Run tests on package endpoints
  const runPackageTests = async () => {
    setIsTestRunning(true);
    setError(null);
    setTestResults([]);

    try {
      // Test package endpoints
      const packagesResult = await apiTester.testEndpoint(
        '/office/packages'
      );

      setTestResults([
        {
          name: 'All Packages',
          ...packagesResult
        }
      ]);

      toast.success('Package API tests completed');
    } catch (err: any) {
      setError(err.message || 'Failed to run API tests');
      toast.error('Error running API tests');
    } finally {
      setIsTestRunning(false);
    }
  };

  // Run all tests
  const runAllTests = async () => {
    setIsTestRunning(true);
    setError(null);
    setTestResults([]);

    try {
      const results = await apiTester.testAllOfficeEndpoints();
      
      const formattedResults = Object.entries(results).map(([key, value]) => ({
        name: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        ...value
      }));

      setTestResults(formattedResults);
      toast.success('All API tests completed');
    } catch (err: any) {
      setError(err.message || 'Failed to run API tests');
      toast.error('Error running API tests');
    } finally {
      setIsTestRunning(false);
    }
  };

  // Get status badge
  const getStatusBadge = (status: number) => {
    if (status >= 200 && status < 300) {
      return <Badge className="bg-green-500">Success ({status})</Badge>;
    } else if (status >= 400 && status < 500) {
      return <Badge className="bg-yellow-500">Client Error ({status})</Badge>;
    } else if (status >= 500) {
      return <Badge className="bg-red-500">Server Error ({status})</Badge>;
    } else {
      return <Badge className="bg-gray-500">Unknown ({status})</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold">اختبار واجهة API</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            اختبار إندبوينت مكاتب العمرة والتحقق من صحتها
          </p>
        </div>
      </div>

      {/* Test Controls */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button onClick={runDashboardTests} disabled={isTestRunning}>
              اختبار إندبوينت لوحة التحكم
            </Button>
            <Button onClick={runBookingTests} disabled={isTestRunning}>
              اختبار إندبوينت الحجوزات
            </Button>
            <Button onClick={runPackageTests} disabled={isTestRunning}>
              اختبار إندبوينت الباقات
            </Button>
            <Button onClick={runAllTests} disabled={isTestRunning}>
              اختبار جميع الإندبوينت
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error display */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading state */}
      {isTestRunning && (
        <div className="mb-6">
          <Skeleton className="h-[400px] w-full rounded-lg" />
        </div>
      )}

      {/* Test Results */}
      {testResults.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">نتائج الاختبار</h2>
          
          {testResults.map((result, index) => (
            <Card key={index} className={`overflow-hidden ${result.success ? 'border-green-300' : 'border-red-300'}`}>
              <CardHeader className="pb-2 bg-gray-50 dark:bg-gray-800">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg font-bold">{result.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(result.status)}
                    <Badge className={result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {result.responseTime}ms
                    </Badge>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {result.method} {result.endpoint}
                </div>
              </CardHeader>
              
              <CardContent className="py-4">
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-auto max-h-96">
                  <pre className="text-sm">
                    {JSON.stringify(result.data || result.error, null, 2)}
                  </pre>
                </div>
              </CardContent>
              
              <CardFooter className="bg-gray-50 dark:bg-gray-800 py-2">
                <div className="text-sm text-gray-500">
                  Tested at: {new Date().toLocaleString()}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 