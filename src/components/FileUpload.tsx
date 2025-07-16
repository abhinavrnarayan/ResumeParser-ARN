import React, { useCallback, useState } from 'react';
import { Upload, FileText, CheckCircle, Loader } from 'lucide-react';

interface FileUploadProps {
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  onFileUpload: (file: File) => void;
  isProcessing: boolean;
  uploadedFile: any;
  disabled?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({
  title,
  subtitle,
  icon: Icon,
  onFileUpload,
  isProcessing,
  uploadedFile,
  disabled = false
}) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (disabled) return;
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.includes('pdf') || file.type.includes('document') || file.type.includes('docx')) {
        onFileUpload(file);
      }
    }
  }, [onFileUpload, disabled]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    if (e.target.files && e.target.files[0]) {
      onFileUpload(e.target.files[0]);
    }
  }, [onFileUpload, disabled]);

  return (
    <div
      className={`relative bg-white rounded-2xl shadow-lg p-8 border-2 border-dashed transition-all duration-300 ${
        disabled
          ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
          :
        dragActive
          ? 'border-blue-400 bg-blue-50'
          : uploadedFile
          ? 'border-green-400 bg-green-50'
          : 'border-gray-300 hover:border-blue-300'
      }`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          {isProcessing ? (
            <Loader className="h-12 w-12 text-blue-600 animate-spin" />
          ) : uploadedFile ? (
            <CheckCircle className="h-12 w-12 text-green-600" />
          ) : (
            <Icon className="h-12 w-12 text-gray-400" />
          )}
        </div>
        
        <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{subtitle}</p>
        
        {uploadedFile ? (
          <div className="bg-green-100 border border-green-200 rounded-lg p-4 mb-4">
            <p className="text-green-800 font-medium">✓ {uploadedFile.fileName}</p>
            <p className="text-green-600 text-sm">Successfully processed</p>
          </div>
        ) : (
          <div className="mb-6">
            <div className="flex items-center justify-center mb-4">
              <Upload className="h-8 w-8 text-blue-600 mr-2" />
              <span className="text-gray-600">Drag & drop or click to upload</span>
            </div>
            <p className="text-sm text-gray-500">Supports PDF, DOCX files up to 10MB</p>
          </div>
        )}
        
        <input
          type="file"
          accept=".pdf,.docx"
          onChange={handleFileInput}
          disabled={disabled}
          className="hidden"
          id={`file-${title}`}
        />
        
        <label
          htmlFor={`file-${title}`}
          className={`inline-flex items-center px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
            disabled
              ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
              :
            uploadedFile
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
          }`}
        >
          {uploadedFile ? (
            <>
              <CheckCircle className="h-5 w-5 mr-2" />
              {disabled ? 'File Uploaded' : 'Replace File'}
            </>
          ) : (
            <>
              <Upload className="h-5 w-5 mr-2" />
              {disabled ? 'Backend Offline' : 'Choose File'}
            </>
          )}
        </label>
      </div>
    </div>
  );
};

export default FileUpload;