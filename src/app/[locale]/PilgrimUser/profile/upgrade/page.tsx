'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { 
  Upload,
  Building,
  Truck,
  FileText,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Loader2,
  X
} from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';

// Services
import { requestServiceUpgrade } from '../../services/userService';

const ServiceUpgradePage = () => {
  // Hooks
  const t = useTranslations('profile.serviceUpgrade');
  const commonT = useTranslations('Common');
  const profileT = useTranslations('profile');
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const locale = String(params?.locale || 'ar');

  // Form state
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    business_type: 'umrah_office',
    business_name: '',
    business_license_number: '',
    business_address: '',
    business_city: '',
    business_country: 'SA',
    contact_person_name: '',
    contact_person_email: '',
    contact_person_phone: '',
    notes: ''
  });

  // File states
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [additionalFiles, setAdditionalFiles] = useState<File[]>([]);

  // Handle form changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle radio button changes
  const handleBusinessTypeChange = (value: string) => {
    setFormData(prev => ({ ...prev, business_type: value }));
  };

  // Handle license file selection
  const handleLicenseFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLicenseFile(e.target.files[0]);
    }
  };

  // Handle additional files selection
  const handleAdditionalFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setAdditionalFiles(prev => [...prev, ...filesArray]);
    }
  };

  // Remove additional file
  const removeAdditionalFile = (index: number) => {
    setAdditionalFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!licenseFile) {
      toast({
        title: profileT('errors.error'),
        description: t('errors.licenseFileRequired'),
        variant: 'destructive'
      });
      return;
    }

    if (!formData.business_name || !formData.business_license_number) {
      toast({
        title: profileT('errors.error'),
        description: t('errors.requiredFields'),
        variant: 'destructive'
      });
      return;
    }

    // Create form data for upload
    const uploadFormData = new FormData();
    
    // Add text fields
    Object.entries(formData).forEach(([key, value]) => {
      uploadFormData.append(key, value);
    });
    
    // Add license file
    uploadFormData.append('business_license_file', licenseFile);
    
    // Add additional files
    additionalFiles.forEach((file, index) => {
      uploadFormData.append(`additional_documents[${index}]`, file);
    });

    setIsLoading(true);
    try {
      const response = await requestServiceUpgrade(uploadFormData);
      
      if (response.status && response.data) {
        toast({
          title: profileT('success'),
          description: t('requestSuccess'),
        });
        
        // Redirect back to profile after successful submission
        setTimeout(() => {
          router.push(`/${locale}/PilgrimUser/profile`);
        }, 2000);
      }
    } catch (error) {
      console.error("Error submitting upgrade request:", error);
      toast({
        title: profileT('errors.error'),
        description: t('errors.submitError'),
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => router.push(`/${locale}/PilgrimUser/profile`)}
          className="gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('backToProfile')}
        </Button>
      </div>
      
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground">
          {t('description')}
        </p>
      </div>

      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertTitle>
          {t('importantInfo')}
        </AlertTitle>
        <AlertDescription>
          {t('reviewProcess')}
        </AlertDescription>
      </Alert>

      {/* Main Form */}
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
          <CardDescription>
            {t('formDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Business Type Selection */}
            <div className="space-y-2">
              <Label>{t('businessType')}</Label>
              <RadioGroup 
                value={formData.business_type} 
                onValueChange={handleBusinessTypeChange}
                className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="umrah_office" id="umrah_office" />
                  <Label htmlFor="umrah_office" className="flex items-center gap-2 cursor-pointer">
                    <Building className="h-4 w-4" />
                    {t('umrahOffice')}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="transportation_operator" id="transportation_operator" />
                  <Label htmlFor="transportation_operator" className="flex items-center gap-2 cursor-pointer">
                    <Truck className="h-4 w-4" />
                    {t('transportationOperator')}
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Business Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="business_name">{t('businessName')}</Label>
                <Input
                  id="business_name"
                  name="business_name"
                  value={formData.business_name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="business_license_number">{t('businessLicenseNumber')}</Label>
                <Input
                  id="business_license_number"
                  name="business_license_number"
                  value={formData.business_license_number}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="business_license_file">{t('businessLicenseFile')}</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="business_license_file"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleLicenseFileChange}
                    required
                    className="max-w-sm"
                  />
                  {licenseFile && (
                    <span className="text-sm text-muted-foreground">
                      {licenseFile.name}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="business_address">{t('businessAddress')}</Label>
                <Input
                  id="business_address"
                  name="business_address"
                  value={formData.business_address}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="business_city">{t('businessCity')}</Label>
                <Input
                  id="business_city"
                  name="business_city"
                  value={formData.business_city}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="business_country">{t('businessCountry')}</Label>
                <Input
                  id="business_country"
                  name="business_country"
                  value={formData.business_country}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Contact Person Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact_person_name">{t('contactPersonName')}</Label>
                <Input
                  id="contact_person_name"
                  name="contact_person_name"
                  value={formData.contact_person_name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_person_email">{t('contactPersonEmail')}</Label>
                <Input
                  id="contact_person_email"
                  name="contact_person_email"
                  type="email"
                  value={formData.contact_person_email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_person_phone">{t('contactPersonPhone')}</Label>
                <Input
                  id="contact_person_phone"
                  name="contact_person_phone"
                  value={formData.contact_person_phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Additional Documents */}
            <div className="space-y-2">
              <Label htmlFor="additional_documents">{t('additionalDocuments')}</Label>
              <Input
                id="additional_documents"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                multiple
                onChange={handleAdditionalFilesChange}
              />
              
              {/* Display selected additional files */}
              {additionalFiles.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium mb-1">
                    {t('selectedFiles')}
                  </p>
                  <ul className="space-y-1">
                    {additionalFiles.map((file, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <FileText className="h-3 w-3 text-muted-foreground" />
                        <span>{file.name}</span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-5 w-5 p-0" 
                          onClick={() => removeAdditionalFile(index)}
                        >
                          <X className="h-3 w-3" />
                          <span className="sr-only">
                            {t('removeFile')}
                          </span>
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">{t('notes')}</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder={t('notesPlaceholder')}
              />
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => router.push(`/${locale}/PilgrimUser/profile`)}
          >
            {profileT('cancel')}
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            {t('submit')}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ServiceUpgradePage; 