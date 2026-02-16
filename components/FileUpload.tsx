
import React, { useState, useRef } from 'react';
import FileIcon from './icons/FileIcon';
import XCircleIcon from './icons/XCircleIcon';

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
  disabled: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, selectedFile, disabled }) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
  };

  const openFileDialog = () => {
    inputRef.current?.click();
  };

  const clearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFileSelect(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };
  
  const acceptedFileTypes = "image/jpeg,image/png,image/webp,application/pdf";

  if (selectedFile) {
    return (
      <div className="p-4 bg-gray-700 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-between">
        <div className="flex items-center space-x-3 truncate">
            <FileIcon className="h-6 w-6 text-cyan-400 flex-shrink-0" />
            <span className="text-gray-200 truncate">{selectedFile.name}</span>
        </div>
        <button onClick={clearFile} disabled={disabled} className="text-gray-400 hover:text-white disabled:opacity-50 flex-shrink-0 ml-2">
          <XCircleIcon className="h-6 w-6" />
        </button>
      </div>
    );
  }

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={openFileDialog}
      className={`
        p-6 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors duration-300 
        ${isDragging ? 'border-cyan-500 bg-gray-700' : 'border-gray-600 hover:border-cyan-500'}
        ${disabled ? 'cursor-not-allowed opacity-60' : ''}
      `}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={handleFileChange}
        disabled={disabled}
        accept={acceptedFileTypes}
      />
      <FileIcon className="h-10 w-10 mx-auto text-gray-500 mb-2" />
      <p className="text-gray-400">
        <span className="font-semibold text-cyan-400">Click to upload</span> or drag and drop
      </p>
      <p className="text-xs text-gray-500 mt-1">PDF, PNG, JPG, or WEBP</p>
    </div>
  );
};

export default FileUpload;
