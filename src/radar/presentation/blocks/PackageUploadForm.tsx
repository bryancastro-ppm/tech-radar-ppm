'use client';

import { useState, useCallback, type DragEvent, type ChangeEvent } from 'react';
import { Button } from '@heroui/react';
import { Input } from '@heroui/react';
import { Card, CardBody, CardHeader } from '@heroui/react';

export interface UploadResult {
  success: boolean;
  product?: string;
  dependenciesDetected?: number;
  newDependencies?: number;
  filePath?: string;
  error?: string;
  details?: string;
}

interface PackageUploadFormProps {
  onSuccess?: (result: UploadResult) => void;
  onError?: (error: string) => void;
}

export function PackageUploadForm({ onSuccess, onError }: PackageUploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [productName, setProductName] = useState('');
  const [repository, setRepository] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const validateFile = useCallback((file: File): string | null => {
    if (!file.name.endsWith('.json')) {
      return 'El archivo debe ser un JSON válido';
    }

    if (file.size > 1024 * 1024) {
      return 'El archivo no debe superar 1MB';
    }

    return null;
  }, []);

  const handleFileSelect = useCallback(
    async (selectedFile: File) => {
      const error = validateFile(selectedFile);
      if (error) {
        setValidationError(error);
        return;
      }

      setFile(selectedFile);
      setValidationError(null);

      // Generate preview
      try {
        const content = await selectedFile.text();
        const parsed = JSON.parse(content);
        const preview = JSON.stringify(parsed, null, 2);
        setFilePreview(preview.length > 500 ? preview.slice(0, 500) + '\n...' : preview);
      } catch {
        setValidationError('El archivo no contiene JSON válido');
        setFile(null);
        setFilePreview(null);
      }
    },
    [validateFile],
  );

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) {
        handleFileSelect(droppedFile);
      }
    },
    [handleFileSelect],
  );

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) {
        handleFileSelect(selectedFile);
      }
    },
    [handleFileSelect],
  );

  const handleProductNameChange = useCallback((value: string) => {
    // Auto-format: lowercase and replace spaces with hyphens
    const formatted = value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    setProductName(formatted);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!file || !productName) {
      setValidationError('Por favor completa todos los campos requeridos');
      return;
    }

    setIsUploading(true);
    setValidationError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('productName', productName);
      if (repository) {
        formData.append('repository', repository);
      }

      const response = await fetch('/api/upload-package', {
        method: 'POST',
        body: formData,
      });

      const result: UploadResult = await response.json();

      if (result.success) {
        onSuccess?.(result);
      } else {
        const errorMessage = result.details
          ? `${result.error}: ${result.details}`
          : result.error || 'Error desconocido';
        setValidationError(errorMessage);
        onError?.(errorMessage);
      }
    } catch {
      const errorMessage = 'Error al procesar el archivo. Por favor intenta nuevamente.';
      setValidationError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsUploading(false);
    }
  }, [file, productName, repository, onSuccess, onError]);

  const handleReset = useCallback(() => {
    setFile(null);
    setProductName('');
    setRepository('');
    setFilePreview(null);
    setValidationError(null);
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Subir package.json</h2>
        </CardHeader>
        <CardBody className="space-y-4">
          {/* File Drop Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
              ${isDragging ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}
              ${file ? 'bg-success/10 border-success' : ''}
            `}
          >
            <input
              type="file"
              accept=".json"
              onChange={handleFileInputChange}
              className="hidden"
              id="file-input"
            />
            <label htmlFor="file-input" className="cursor-pointer">
              <div className="space-y-2">
                <div className="text-4xl">📦</div>
                {file ? (
                  <>
                    <p className="text-lg font-medium text-success">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-lg font-medium">
                      Arrastra tu package.json aquí
                    </p>
                    <p className="text-sm text-muted-foreground">
                      o haz click para seleccionar
                    </p>
                  </>
                )}
              </div>
            </label>
          </div>

          {/* File Preview */}
          {filePreview && (
            <Card className="bg-muted">
              <CardBody>
                <p className="text-xs font-mono whitespace-pre-wrap overflow-auto max-h-40">
                  {filePreview}
                </p>
              </CardBody>
            </Card>
          )}

          {/* Product Name Input */}
          <Input
            label="Nombre del Producto"
            placeholder="mi-aplicacion"
            value={productName}
            onValueChange={handleProductNameChange}
            isRequired
            description="Solo letras minúsculas, números y guiones"
            variant="bordered"
          />

          {/* Repository Input */}
          <Input
            label="Repositorio"
            placeholder="org/mi-aplicacion (opcional)"
            value={repository}
            onValueChange={setRepository}
            description="Nombre del repositorio en GitHub (opcional)"
            variant="bordered"
          />

          {/* Validation Error */}
          {validationError && (
            <div className="p-3 rounded-lg bg-danger/10 border border-danger text-danger text-sm">
              {validationError}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Button
              variant="flat"
              onPress={handleReset}
              isDisabled={isUploading || (!file && !productName)}
            >
              Limpiar
            </Button>
            <Button
              color="primary"
              onPress={handleSubmit}
              isLoading={isUploading}
              isDisabled={!file || !productName}
            >
              {isUploading ? 'Procesando...' : 'Analizar Dependencias'}
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
