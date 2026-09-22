'use client';

import { useState } from 'react';
import { PackageUploadForm, type UploadResult } from '@/radar/presentation/blocks/PackageUploadForm';
import { UploadResultDisplay } from '@/radar/presentation/blocks/UploadResultDisplay';

export default function UploadPage() {
  const [result, setResult] = useState<UploadResult | null>(null);

  const handleSuccess = (uploadResult: UploadResult) => {
    setResult(uploadResult);
  };

  const handleError = (error: string) => {
    console.error('Upload error:', error);
  };

  const handleUploadAnother = () => {
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            Subir Dependencias al Tech Radar
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Sube tu archivo <code className="px-2 py-1 bg-muted rounded text-sm">package.json</code> 
            {' '}para detectar automáticamente las dependencias de tu proyecto y agregarlas al radar.
          </p>
        </div>

        {/* Content */}
        {result && result.success ? (
          <UploadResultDisplay
            result={{
              product: result.product!,
              dependenciesDetected: result.dependenciesDetected!,
              newDependencies: result.newDependencies!,
              filePath: result.filePath!,
            }}
            onUploadAnother={handleUploadAnother}
          />
        ) : (
          <PackageUploadForm onSuccess={handleSuccess} onError={handleError} />
        )}

        {/* Info Section */}
        {!result && (
          <div className="mt-12 max-w-2xl mx-auto space-y-6">
            <div className="p-6 rounded-lg bg-muted/50 border border-border">
              <h3 className="font-semibold mb-3">¿Cómo funciona?</h3>
              <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                <li>Sube tu archivo package.json</li>
                <li>Ingresa el nombre de tu producto</li>
                <li>El sistema detecta automáticamente todas las dependencias</li>
                <li>Las dependencias se categorizan en los cuadrantes del radar</li>
                <li>Se genera un archivo JSON en radar-data/</li>
                <li>Tu producto aparece inmediatamente en el radar</li>
              </ol>
            </div>

            <div className="p-6 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
              <h3 className="font-semibold mb-3 text-yellow-600 dark:text-yellow-400">
                ⚠️ Limitación conocida
              </h3>
              <p className="text-sm text-yellow-600 dark:text-yellow-400">
                Al subir solo el package.json (sin lockfile), las versiones mostradas serán los 
                rangos declarados (ej: ^19.0.0) en lugar de versiones exactas (ej: 19.0.2). 
                Para mayor precisión, considera usar el sistema de GitHub Actions que incluye 
                el lockfile.
              </p>
            </div>

            <div className="p-6 rounded-lg bg-blue-500/10 border border-blue-500/30">
              <h3 className="font-semibold mb-3 text-blue-600 dark:text-blue-400">
                💡 ¿Prefieres automatización?
              </h3>
              <p className="text-sm text-blue-600 dark:text-blue-400 mb-2">
                Si tu proyecto está en GitHub, puedes configurar un workflow que actualice 
                automáticamente el radar cada vez que cambien tus dependencias.
              </p>
              <a
                href="https://github.com/bryancastro-ppm/tech-radar-ppm#github-actions"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
              >
                Ver documentación de GitHub Actions →
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
