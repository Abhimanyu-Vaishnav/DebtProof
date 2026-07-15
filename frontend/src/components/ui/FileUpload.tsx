/**
 * DebtProof — FileUpload Component
 */
"use client";

import React, { useRef, useState } from "react";
import { cn } from "@/utils/cn";

interface FileUploadProps {
  label?: string;
  accept?: string;
  error?: string;
  onFileSelect: (file: File) => void;
  existingFile?: { name: string; url?: string } | null;
  onRemove?: () => void;
  disabled?: boolean;
}

export function FileUpload({
  label,
  accept = ".pdf,.jpg,.jpeg,.png",
  error,
  onFileSelect,
  existingFile,
  onRemove,
  disabled,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFile = (file: File) => {
    setSelectedFile(file);
    onFileSelect(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const displayFile = selectedFile
    ? { name: selectedFile.name }
    : existingFile;

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}

      {displayFile ? (
        <div className="flex items-center gap-3 p-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-secondary)]">
          <div className="w-9 h-9 rounded-lg bg-[var(--color-primary)] bg-opacity-10 flex items-center justify-center text-[var(--color-primary)] shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">{displayFile.name}</p>
            {selectedFile && (
              <p className="text-xs text-[var(--color-text-tertiary)]">{formatSize(selectedFile.size)}</p>
            )}
          </div>
          {onRemove && (
            <button
              type="button"
              onClick={() => { setSelectedFile(null); onRemove(); }}
              className="w-7 h-7 rounded-md flex items-center justify-center text-[var(--color-text-tertiary)] hover:text-[var(--color-error)] hover:bg-[var(--color-surface-tertiary)] transition-colors"
              aria-label="Remove file"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
              </svg>
            </button>
          )}
        </div>
      ) : (
        <div
          className={cn(
            "border-2 border-dashed rounded-[var(--radius-md)] p-6 text-center cursor-pointer transition-colors",
            dragging
              ? "border-[var(--color-primary-light)] bg-blue-50"
              : "border-[var(--color-border)] hover:border-[var(--color-text-tertiary)]",
            disabled && "opacity-50 cursor-not-allowed",
            error && "border-[var(--color-error)]"
          )}
          onClick={() => !disabled && inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-[var(--color-surface-tertiary)] flex items-center justify-center text-[var(--color-text-tertiary)]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--color-text-primary)]">
                Drop file here or <span className="text-[var(--color-primary-light)]">browse</span>
              </p>
              <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">PDF, JPG, PNG · Max 5MB</p>
            </div>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={handleChange}
            className="hidden"
            disabled={disabled}
          />
        </div>
      )}
      {error && <p className="form-error">{error}</p>}
    </div>
  );
}
