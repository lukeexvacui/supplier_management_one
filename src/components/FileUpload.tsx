import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X } from 'lucide-react';

interface FileUploadProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  maxFiles?: number;
  maxSize?: number;
  accept?: Record<string, string[]>;
}

export function FileUpload({
  files,
  onFilesChange,
  maxFiles = 5,
  maxSize = 5242880, // 5MB
  accept = {
    'image/*': ['.png', '.jpg', '.jpeg'],
    'application/pdf': ['.pdf']
  }
}: FileUploadProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onFilesChange([...files, ...acceptedFiles].slice(0, maxFiles));
  }, [files, maxFiles, onFilesChange]);

  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    onFilesChange(newFiles);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: maxFiles - files.length,
    maxSize,
    accept
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-500'}`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">
          {isDragActive
            ? 'Solte os arquivos aqui...'
            : 'Arraste e solte arquivos aqui, ou clique para selecionar'}
        </p>
        <p className="mt-1 text-xs text-gray-500">
          Máximo {maxFiles} arquivos, até {(maxSize / 1024 / 1024).toFixed(0)}MB cada
        </p>
      </div>

      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((file, index) => (
            <li
              key={index}
              className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">{file.name}</span>
                <span className="text-xs text-gray-500">
                  ({(file.size / 1024).toFixed(0)}KB)
                </span>
              </div>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="text-gray-400 hover:text-red-500"
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}