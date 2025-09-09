"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

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
      setUploadProgress(prev => ({ ...prev, [fieldName]: 'Upload successful!' }));
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

    // Save to both localStorage and sessionStorage
    localStorage.setItem('sellerRegistration_step1', JSON.stringify(dataToStore));
    sessionStorage.setItem('sellerRegistration_step1', JSON.stringify(dataToStore));
    
    console.log('Data saved:', dataToStore);
    router.push('/seller/auth/register/step2');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Progress Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Step 1 of 4</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">25%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-orange-500 h-2 rounded-full" style={{ width: '25%' }}></div>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
            Shop Owner Details
          </h2>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Shop Owner Name */}
            <div>
              <label htmlFor="shopOwnerName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Shop Owner Name
              </label>
              <input
                type="text"
                id="shopOwnerName"
                name="shopOwnerName"
                value={formData.shopOwnerName}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="Enter shop owner name"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                E-Mail
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="Enter your email"
              />
            </div>

            {/* Contact */}
            <div>
              <label htmlFor="contact" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Contact
              </label>
              <input
                type="tel"
                id="contact"
                name="contact"
                value={formData.contact}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="Enter contact number"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Gender
              </label>
              <div className="space-y-2">
                {['Male', 'Female', 'Not Preferred to say'].map((gender) => (
                  <label key={gender} className="flex items-center">
                    <input
                      type="radio"
                      name="gender"
                      value={gender}
                      checked={formData.gender === gender}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{gender}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Permanent Address */}
            <div>
              <label htmlFor="permanentAddress" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Permanent Address
              </label>
              <textarea
                id="permanentAddress"
                name="permanentAddress"
                value={formData.permanentAddress}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="Enter your permanent address"
              />
            </div>

            {/* Permanent Address Document */}
            <div>
              <label htmlFor="permanentAddressFile" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Address Proof Document
              </label>
              <input
                type="file"
                id="permanentAddressFile"
                name="permanentAddressFile"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                disabled={uploading.permanentAddress}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-orange-50 file:text-orange-700 dark:file:bg-orange-900/20 dark:file:text-orange-400 hover:file:bg-orange-100 dark:hover:file:bg-orange-900/30"
              />
              {uploadProgress.permanentAddress && (
                <p className={`text-xs mt-1 ${uploadProgress.permanentAddress.includes('successful') ? 'text-green-600' : uploadProgress.permanentAddress.includes('failed') ? 'text-red-600' : 'text-blue-600'}`}>
                  {uploadProgress.permanentAddress}
                </p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Upload address proof (PDF, DOC, or image)</p>
            </div>

            {/* ID Proof */}
            <div>
              <label htmlFor="idProof" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                ID Proof
              </label>
              <input
                type="file"
                id="idProof"
                name="idProof"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                disabled={uploading.idProof}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-orange-50 file:text-orange-700 dark:file:bg-orange-900/20 dark:file:text-orange-400 hover:file:bg-orange-100 dark:hover:file:bg-orange-900/30"
              />
              {uploadProgress.idProof && (
                <p className={`text-xs mt-1 ${uploadProgress.idProof.includes('successful') ? 'text-green-600' : uploadProgress.idProof.includes('failed') ? 'text-red-600' : 'text-blue-600'}`}>
                  {uploadProgress.idProof}
                </p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Upload government ID (PDF, DOC, or image)</p>
            </div>

            {/* Next Button */}
            <Button
              type="submit"
              disabled={uploading.permanentAddress || uploading.idProof}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              {uploading.permanentAddress || uploading.idProof ? 'Uploading...' : 'Next'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
