"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { useRegistrationProtection } from '@/lib/hooks/useRegistrationProtection';
import { Sun, Moon, Upload, CheckCircle, XCircle, User, Mail, Phone, MapPin, FileText, Shield } from 'lucide-react';

interface FormData {
  shopOwnerName: string;
  email: string;
  contact: string;
  gender: string;
  permanentAddress: string;
  permanentAddressFile: File | null;
  idProof: File | null;
  permanentAddressUrl: string;
  idProofUrl: string;
}

export default function Step1() {
  const router = useRouter();
  const { isLoading, canAccess } = useRegistrationProtection(1);
  const [darkMode, setDarkMode] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    shopOwnerName: '',
    email: '',
    contact: '',
    gender: '',
    permanentAddress: '',
    permanentAddressFile: null,
    idProof: null,
    permanentAddressUrl: '',
    idProofUrl: '',
  });

  const [uploading, setUploading] = useState<{
    permanentAddress: boolean;
    idProof: boolean;
  }>({
    permanentAddress: false,
    idProof: false,
  });

  const [uploadProgress, setUploadProgress] = useState<{
    permanentAddress: string;
    idProof: string;
  }>({
    permanentAddress: '',
    idProof: '',
  });
  // At the top of your Step1 component
useEffect(() => {
  const token = localStorage.getItem('authToken');
  if (token) {
    toast.warning('You are already logged in. Are you sure you want to create another account?', {
      position: "top-center",
      autoClose: 5000,
    });
  }
}, []);

  // Theme management
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    if (darkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setDarkMode(true);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const uploadToCloudinary = async (file: File, fieldName: 'permanentAddress' | 'idProof'): Promise<string> => {
    setUploading(prev => ({ ...prev, [fieldName]: true }));
    setUploadProgress(prev => ({ ...prev, [fieldName]: 'Uploading...' }));

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      setUploadProgress(prev => ({ ...prev, [fieldName]: 'Upload Approvedful!' }));
      return result.secure_url;
    } catch (error) {
      console.error('Upload error:', error);
      setUploadProgress(prev => ({ ...prev, [fieldName]: 'Upload failed!' }));
      throw error;
    } finally {
      setUploading(prev => ({ ...prev, [fieldName]: false }));
      setTimeout(() => {
        setUploadProgress(prev => ({ ...prev, [fieldName]: '' }));
      }, 3000);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      const file = files[0];
      
      // Update the file in state
      setFormData(prev => ({
        ...prev,
        [name]: file
      }));

      try {
        // Upload to Cloudinary immediately
        const fieldName = name as 'permanentAddressFile' | 'idProof';
        const uploadFieldName = fieldName === 'permanentAddressFile' ? 'permanentAddress' : 'idProof';
        const url = await uploadToCloudinary(file, uploadFieldName);
        
        // Update the URL in state
        const urlFieldName = fieldName === 'permanentAddressFile' ? 'permanentAddressUrl' : 'idProofUrl';
        setFormData(prev => ({
          ...prev,
          [urlFieldName]: url
        }));

        // Store in session storage immediately
        const currentSessionData = JSON.parse(sessionStorage.getItem('sellerRegistration_step1') || '{}');
        const updatedSessionData = {
          ...currentSessionData,
          [urlFieldName]: url
        };
        sessionStorage.setItem('sellerRegistration_step1', JSON.stringify(updatedSessionData));

      } catch (error) {
        console.error('File upload failed:', error);
        alert('File upload failed. Please try again.');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate that required files are uploaded
    if (!formData.permanentAddressUrl && formData.permanentAddressFile) {
      alert('Please wait for permanent address file to upload');
      return;
    }
    
    if (!formData.idProofUrl && formData.idProof) {
      alert('Please wait for ID proof file to upload');
      return;
    }

    // Prepare data for storage
    const dataToStore = {
      shopOwnerName: formData.shopOwnerName,
      email: formData.email,
      contact: formData.contact,
      gender: formData.gender,
      permanentAddress: formData.permanentAddress,
      permanentAddressUrl: formData.permanentAddressUrl,
      idProofUrl: formData.idProofUrl,
      timestamp: new Date().toISOString()
    };

    // Save to both sessionStorage (primary) and localStorage (backup)
    sessionStorage.setItem('sellerRegistration_step1', JSON.stringify(dataToStore));
    localStorage.setItem('sellerRegistration_step1', JSON.stringify(dataToStore));
    
    router.push('/seller/auth/register/step2');
  };

  // Show loading while checking access
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Checking access...</p>
        </div>
      </div>
    );
  }

  // Don't render if user doesn't have access (will be redirected)
  if (!canAccess) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/10 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-lg w-full space-y-8">
        
        {/* Theme Toggle */}
        <div className="flex justify-end mb-4">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg bg-card border border-border hover:bg-accent hover:text-accent-foreground transition-colors duration-200"
            aria-label="Toggle dark mode"
          >
            {darkMode ? (
              <Sun className="w-5 h-5 text-foreground" />
            ) : (
              <Moon className="w-5 h-5 text-foreground" />
            )}
          </button>
        </div>

        {/* Main Card */}
        <div className="bg-card rounded-3xl p-8 shadow-xl border border-border backdrop-blur-sm">
          
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-card-foreground">Step 1 of 4</span>
              <span className="text-sm text-muted-foreground">25%</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2.5">
              <div className="bg-primary h-2.5 rounded-full transition-all duration-300" style={{ width: '25%' }}></div>
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-primary/20 to-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-3xl font-bold text-card-foreground mb-2">
              Shop Owner Details
            </h2>
            <p className="text-muted-foreground">
              Let&apos;s start with your personal information
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Shop Owner Name */}
            <div className="space-y-2">
              <label htmlFor="shopOwnerName" className="flex items-center text-sm font-medium text-card-foreground">
                <User className="w-4 h-4 mr-2 text-primary" />
                Shop Owner Name
              </label>
              <input
                type="text"
                id="shopOwnerName"
                name="shopOwnerName"
                value={formData.shopOwnerName}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                placeholder="Enter shop owner name"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="flex items-center text-sm font-medium text-card-foreground">
                <Mail className="w-4 h-4 mr-2 text-primary" />
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                placeholder="Enter your email"
              />
            </div>

            {/* Contact */}
            <div className="space-y-2">
              <label htmlFor="contact" className="flex items-center text-sm font-medium text-card-foreground">
                <Phone className="w-4 h-4 mr-2 text-primary" />
                Contact Number
              </label>
              <input
                type="tel"
                id="contact"
                name="contact"
                value={formData.contact}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                placeholder="Enter contact number"
              />
            </div>

            {/* Gender */}
            <div className="space-y-3">
              <label className="flex items-center text-sm font-medium text-card-foreground">
                <User className="w-4 h-4 mr-2 text-primary" />
                Gender
              </label>
              <div className="space-y-2">
                {['Male', 'Female', 'Not Preferred to say'].map((gender) => (
                  <label key={gender} className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      value={gender}
                      checked={formData.gender === gender}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-primary focus:ring-primary border-border bg-background rounded"
                    />
                    <span className="ml-3 text-sm text-card-foreground">{gender}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Permanent Address */}
            <div className="space-y-2">
              <label htmlFor="permanentAddress" className="flex items-center text-sm font-medium text-card-foreground">
                <MapPin className="w-4 h-4 mr-2 text-primary" />
                Permanent Address
              </label>
              <textarea
                id="permanentAddress"
                name="permanentAddress"
                value={formData.permanentAddress}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                placeholder="Enter your permanent address"
              />
            </div>

            {/* Permanent Address Document */}
            <div className="space-y-3">
              <label htmlFor="permanentAddressFile" className="flex items-center text-sm font-medium text-card-foreground">
                <FileText className="w-4 h-4 mr-2 text-primary" />
                Address Proof Document
              </label>
              <div className="relative">
                <input
                  type="file"
                  id="permanentAddressFile"
                  name="permanentAddressFile"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  disabled={uploading.permanentAddress}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 file:cursor-pointer disabled:opacity-50 transition-all duration-200"
                />
                {uploading.permanentAddress && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Upload className="w-5 h-5 text-primary animate-pulse" />
                  </div>
                )}
              </div>
              {uploadProgress.permanentAddress && (
                <div className={`flex items-center text-xs mt-2 ${
                  uploadProgress.permanentAddress.includes('Approvedful') 
                    ? 'text-green-600' 
                    : uploadProgress.permanentAddress.includes('failed') 
                    ? 'text-destructive' 
                    : 'text-primary'
                }`}>
                  {uploadProgress.permanentAddress.includes('Approvedful') ? (
                    <CheckCircle className="w-4 h-4 mr-1" />
                  ) : uploadProgress.permanentAddress.includes('failed') ? (
                    <XCircle className="w-4 h-4 mr-1" />
                  ) : (
                    <Upload className="w-4 h-4 mr-1 animate-pulse" />
                  )}
                  {uploadProgress.permanentAddress}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Upload address proof (PDF, DOC, or image formats)
              </p>
            </div>

            {/* ID Proof */}
            <div className="space-y-3">
              <label htmlFor="idProof" className="flex items-center text-sm font-medium text-card-foreground">
                <Shield className="w-4 h-4 mr-2 text-primary" />
                Government ID Proof
              </label>
              <div className="relative">
                <input
                  type="file"
                  id="idProof"
                  name="idProof"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  disabled={uploading.idProof}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 file:cursor-pointer disabled:opacity-50 transition-all duration-200"
                />
                {uploading.idProof && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Upload className="w-5 h-5 text-primary animate-pulse" />
                  </div>
                )}
              </div>
              {uploadProgress.idProof && (
                <div className={`flex items-center text-xs mt-2 ${
                  uploadProgress.idProof.includes('Approvedful') 
                    ? 'text-green-600' 
                    : uploadProgress.idProof.includes('failed') 
                    ? 'text-destructive' 
                    : 'text-primary'
                }`}>
                  {uploadProgress.idProof.includes('Approvedful') ? (
                    <CheckCircle className="w-4 h-4 mr-1" />
                  ) : uploadProgress.idProof.includes('failed') ? (
                    <XCircle className="w-4 h-4 mr-1" />
                  ) : (
                    <Upload className="w-4 h-4 mr-1 animate-pulse" />
                  )}
                  {uploadProgress.idProof}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Upload government ID (PDF, DOC, or image formats)
              </p>
            </div>

            {/* Next Button */}
            <Button
              type="submit"
              disabled={uploading.permanentAddress || uploading.idProof}
              className="w-full bg-primary text-primary-foreground py-3 px-6 rounded-xl font-semibold text-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-card transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {uploading.permanentAddress || uploading.idProof ? (
                <>
                  <Upload className="w-5 h-5 mr-2 animate-pulse" />
                  Uploading...
                </>
              ) : (
                'Continue to Step 2'
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
