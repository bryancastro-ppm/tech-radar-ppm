'use client';

import { Button } from '@heroui/react';
import { Card, CardBody, CardHeader } from '@heroui/react';
import { useRouter } from 'next/navigation';

interface UploadResultDisplayProps {
  result: {
    product: string;
    dependenciesDetected: number;
    newDependencies: number;
    uncategorizedCount: number;
    filePath: string;
  };
  onUploadAnother?: () => void;
}

export function UploadResultDisplay({ result, onUploadAnother }: UploadResultDisplayProps) {
  const router = useRouter();

  const handleViewRadar = () => {
    router.push(`/?product=${result.product}`);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card className="border-success">
        <CardHeader className="flex-col items-start gap-2 bg-success/10">
          <div className="flex items-center gap-2">
            <span className="text-3xl">✅</span>
            <h2 className="text-xl font-semibold text-success">
              Dependencias Analizadas Exitosamente
            </h2>
          </div>
        </CardHeader>
        <CardBody className="space-y-6">
          {/* Summary Stats */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
              <span className="text-sm font-medium text-muted-foreground">Producto:</span>
              <span className="font-semibold">{result.product}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
              <span className="text-sm font-medium text-muted-foreground">
                📊 Dependencias detectadas:
              </span>
              <span className="font-semibold text-lg">{result.dependenciesDetected}</span>
            </div>

            {result.newDependencies > 0 && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10 border border-primary">
                <span className="text-sm font-medium text-primary">
                  🆕 Nuevas dependencias:
                </span>
                <span className="font-semibold text-lg text-primary">
                  {result.newDependencies}
                </span>
              </div>
            )}

            {result.uncategorizedCount > 0 && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-warning/10 border border-warning">
                <span className="text-sm font-medium text-warning">🏷️ Sin categorizar:</span>
                <span className="font-semibold text-lg text-warning">
                  {result.uncategorizedCount}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
              <span className="text-sm font-medium text-muted-foreground">
                Archivo generado:
              </span>
              <code className="text-xs font-mono bg-background px-2 py-1 rounded">
                {result.filePath}
              </code>
            </div>
          </div>

          {/* Info Message */}
          <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30 text-sm">
            <p className="text-blue-600 dark:text-blue-400">
              <strong>Nota:</strong> Las versiones mostradas corresponden a los rangos declarados
              en package.json (ej: ^19.0.0). Para obtener versiones exactas, considera usar el
              sistema de GitHub Actions con lockfile.
            </p>
          </div>

          {result.uncategorizedCount > 0 && (
            <div className="p-4 rounded-lg bg-warning/10 border border-warning/30 text-sm">
              <p className="text-warning">
                <strong>Nota:</strong> {result.uncategorizedCount}{' '}
                {result.uncategorizedCount === 1 ? 'dependencia cayó' : 'dependencias cayeron'} en
                &quot;Sin Categorizar&quot;. Para clasificarlas, agrégalas a{' '}
                <code className="text-xs">src/core/config/categorization-map.ts</code>.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t border-border">
            <Button variant="flat" onPress={onUploadAnother}>
              Subir Otro
            </Button>
            <Button color="primary" onPress={handleViewRadar}>
              Ver en el Radar
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
