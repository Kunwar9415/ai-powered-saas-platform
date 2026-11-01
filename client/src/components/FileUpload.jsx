import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, AlertCircle, X } from 'lucide-react';

export const FileUpload = ({
  onFileSelect,
  acceptedFormats = ['.pdf', '.docx', '.txt'],
  maxSizeMB = 10,
  title = 'Upload Document',
  description = 'Drag and drop your PDF, DOCX, or TXT file here, or click to browse',
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const validateAndProcessFile = (file) => {
    setError('');
    if (!file) return;

    const sizeInMB = file.size / (1024 * 1024);
    if (sizeInMB > maxSizeMB) {
      setError(`File size (${sizeInMB.toFixed(1)}MB) exceeds max limit of ${maxSizeMB}MB.`);
      return;
    }

    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!acceptedFormats.includes(ext)) {
      setError(`Unsupported file type. Accepted: ${acceptedFormats.join(', ')}`);
      return;
    }

    setSelectedFile(file);
    if (onFileSelect) {
      onFileSelect(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  const clearFile = (e) => {
    e.stopPropagation();
    setSelectedFile(null);
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (onFileSelect) onFileSelect(null);
  };

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 ${
          dragOver
            ? 'border-purple-600 bg-purple-50'
            : selectedFile
            ? 'border-emerald-500 bg-emerald-50/50'
            : 'border-slate-300 bg-slate-50/60 hover:border-purple-400 hover:bg-purple-50/30'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleChange}
          accept={acceptedFormats.join(',')}
          className="hidden"
        />

        {selectedFile ? (
          <div className="flex items-center justify-between p-3.5 bg-white border border-slate-200 rounded-xl max-w-md mx-auto shadow-sm">
            <div className="flex items-center gap-3 text-left">
              <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                <FileText className="w-5 h-5" />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-slate-900 truncate max-w-[220px]">{selectedFile.name}</p>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                  {(selectedFile.size / 1024).toFixed(1)} KB • Ready for AI processing
                </p>
              </div>
            </div>
            <button
              onClick={clearFile}
              className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              title="Remove file"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2.5">
            <div className="p-3 rounded-2xl bg-purple-50 border border-purple-200 text-purple-700">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">{title}</h4>
              <p className="text-xs text-slate-500 mt-0.5 max-w-sm mx-auto">{description}</p>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-mono font-semibold text-slate-600 bg-white px-2 py-0.5 rounded-full border border-slate-200 shadow-2xs">
                {acceptedFormats.join(', ')}
              </span>
              <span className="text-[10px] font-mono font-semibold text-slate-600 bg-white px-2 py-0.5 rounded-full border border-slate-200 shadow-2xs">
                Max {maxSizeMB}MB
              </span>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-2 flex items-center gap-2 text-xs text-red-600">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
