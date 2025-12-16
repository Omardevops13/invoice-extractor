'use client';

import { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import InvoiceUpload from '@/components/InvoiceUpload';
import ExtractedDataView from '@/components/ExtractedDataView';
import ProcessingStatus from '@/components/ProcessingStatus';

interface ExtractedData {
  orderDate: string;
  dueDate: string;
  invoiceNumber: string;
  customerInfo: {
    name: string;
    address: string;
    customerId: number;
  };
  lineItems: Array<{
    productId: number | string;
    description: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }>;
  totals: {
    subtotal: number;
    taxRate: number;
    taxAmount: number;
    freight: number;
    total: number;
  };
  confidence: number;
  processingTime: number;
}

interface ProcessingState {
  status: 'idle' | 'uploading' | 'processing' | 'completed' | 'error';
  message: string;
  progress: number;
}

export default function Home() {
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [processingState, setProcessingState] = useState<ProcessingState>({
    status: 'idle',
    message: '',
    progress: 0
  });
  const [savedOrderId, setSavedOrderId] = useState<number | null>(null);

  const handleFileUpload = async (file: File) => {
    setProcessingState({
      status: 'uploading',
      message: 'Uploading invoice...',
      progress: 25
    });

    try {
      const formData = new FormData();
      formData.append('invoice', file);

      setProcessingState({
        status: 'processing',
        message: 'Processing with AI...',
        progress: 50
      });

      const response = await fetch('http://localhost:5001/api/invoices/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      
      setProcessingState({
        status: 'completed',
        message: 'Invoice processed successfully!',
        progress: 100
      });

      setExtractedData(result.data.extractedData);
      setSavedOrderId(null); // Reset saved state

    } catch (error) {
      setProcessingState({
        status: 'error',
        message: 'Failed to process invoice. Please try again.',
        progress: 0
      });
      console.error('Upload error:', error);
    }
  };

  const handleSaveData = async (data: ExtractedData) => {
    try {
      const response = await fetch('http://localhost:5001/api/invoices/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Save failed');
      }

      const result = await response.json();
      setSavedOrderId(result.data.salesOrderId);
      
      // Show success message
      setProcessingState({
        status: 'completed',
        message: `Data saved successfully! Order ID: ${result.data.salesOrderId}`,
        progress: 100
      });

    } catch (error) {
      setProcessingState({
        status: 'error',
        message: 'Failed to save data. Please try again.',
        progress: 0
      });
      console.error('Save error:', error);
    }
  };

  const resetState = () => {
    setExtractedData(null);
    setSavedOrderId(null);
    setProcessingState({
      status: 'idle',
      message: '',
      progress: 0
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Invoice Data Extraction
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Upload your invoices and extract structured data automatically. 
          Perfect for automating your document processing workflow.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Supported Formats</p>
              <p className="text-2xl font-bold text-gray-900">PDF, JPG, PNG</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Accuracy Rate</p>
              <p className="text-2xl font-bold text-gray-900">95%+</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Loader2 className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Processing Time</p>
              <p className="text-2xl font-bold text-gray-900">~2 seconds</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Upload className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Max File Size</p>
              <p className="text-2xl font-bold text-gray-900">10 MB</p>
            </div>
          </div>
        </div>
      </div>

      {/* Processing Status */}
      {processingState.status !== 'idle' && (
        <div className="mb-8">
          <ProcessingStatus 
            status={processingState.status}
            message={processingState.message}
            progress={processingState.progress}
          />
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload Invoice</h2>
          <InvoiceUpload 
            onFileUpload={handleFileUpload}
            isProcessing={processingState.status === 'uploading' || processingState.status === 'processing'}
          />
          
          {extractedData && (
            <div className="mt-6 pt-6 border-t">
              <button
                onClick={resetState}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Process Another Invoice
              </button>
            </div>
          )}
        </div>

        {/* Results Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Extracted Data</h2>
          
          {!extractedData ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                Upload an invoice to see extracted data here
              </p>
            </div>
          ) : (
            <ExtractedDataView 
              data={extractedData}
              onSave={handleSaveData}
              isSaved={savedOrderId !== null}
              savedOrderId={savedOrderId}
            />
          )}
        </div>
      </div>

      {/* Demo Instructions */}
      <div className="mt-12 bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">
          🎯 Demo Instructions
        </h3>
        <div className="text-blue-800 space-y-2">
          <p>• Upload any invoice image or PDF to see data extraction in action</p>
          <p>• Review and edit the extracted data if needed</p>
          <p>• Save the data to see it added to the database</p>
          <p>• Visit the History page to see all processed invoices</p>
          <p>• Check the Database page to explore the underlying data structure</p>
        </div>
      </div>
    </div>
  );
}