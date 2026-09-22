import { describe, it, expect } from 'vitest';
import { detectDependenciesFromContent } from '@/ingest/application/use-cases/detectDependenciesFromContent';

describe('detectDependenciesFromContent', () => {
  it('should detect dependencies from valid package.json with dependencies', async () => {
    const content = JSON.stringify({
      name: 'test-app',
      dependencies: {
        react: '^19.0.0',
        next: '^15.0.0',
      },
    });

    const result = await detectDependenciesFromContent(content);

    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      name: 'react',
      declaredRange: '^19.0.0',
      resolvedVersion: '^19.0.0',
      isDev: false,
      source: 'dependencies',
    });
    expect(result[1]).toMatchObject({
      name: 'next',
      declaredRange: '^15.0.0',
      resolvedVersion: '^15.0.0',
      isDev: false,
      source: 'dependencies',
    });
  });

  it('should detect devDependencies from valid package.json', async () => {
    const content = JSON.stringify({
      name: 'test-app',
      devDependencies: {
        vitest: '^2.0.0',
        typescript: '^5.0.0',
      },
    });

    const result = await detectDependenciesFromContent(content);

    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      name: 'vitest',
      declaredRange: '^2.0.0',
      resolvedVersion: '^2.0.0',
      isDev: true,
      source: 'devDependencies',
    });
    expect(result[1]).toMatchObject({
      name: 'typescript',
      declaredRange: '^5.0.0',
      resolvedVersion: '^5.0.0',
      isDev: true,
      source: 'devDependencies',
    });
  });

  it('should detect both dependencies and devDependencies', async () => {
    const content = JSON.stringify({
      name: 'test-app',
      dependencies: {
        react: '^19.0.0',
      },
      devDependencies: {
        vitest: '^2.0.0',
      },
    });

    const result = await detectDependenciesFromContent(content);

    expect(result).toHaveLength(2);
    expect(result.filter((d) => !d.isDev)).toHaveLength(1);
    expect(result.filter((d) => d.isDev)).toHaveLength(1);
  });

  it('should throw error on invalid JSON', async () => {
    const content = 'invalid json {{{';

    await expect(detectDependenciesFromContent(content)).rejects.toThrow(
      /Invalid JSON content/,
    );
  });

  it('should throw error when no dependencies are found', async () => {
    const content = JSON.stringify({
      name: 'test-app',
      version: '1.0.0',
    });

    await expect(detectDependenciesFromContent(content)).rejects.toThrow(
      /No dependencies or devDependencies found/,
    );
  });

  it('should throw error when dependencies object is empty', async () => {
    const content = JSON.stringify({
      name: 'test-app',
      dependencies: {},
      devDependencies: {},
    });

    await expect(detectDependenciesFromContent(content)).rejects.toThrow(
      /No dependencies or devDependencies found/,
    );
  });

  it('should handle package.json with only dependencies', async () => {
    const content = JSON.stringify({
      dependencies: {
        lodash: '^4.17.21',
      },
    });

    const result = await detectDependenciesFromContent(content);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      name: 'lodash',
      declaredRange: '^4.17.21',
      resolvedVersion: '^4.17.21',
      isDev: false,
      source: 'dependencies',
    });
  });

  it('should handle package.json with only devDependencies', async () => {
    const content = JSON.stringify({
      devDependencies: {
        eslint: '^8.0.0',
      },
    });

    const result = await detectDependenciesFromContent(content);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      name: 'eslint',
      declaredRange: '^8.0.0',
      resolvedVersion: '^8.0.0',
      isDev: true,
      source: 'devDependencies',
    });
  });

  it('should preserve version ranges as resolved versions', async () => {
    const content = JSON.stringify({
      dependencies: {
        'package-with-tilde': '~1.2.3',
        'package-with-caret': '^2.3.4',
        'package-with-exact': '3.4.5',
        'package-with-range': '>=4.0.0 <5.0.0',
      },
    });

    const result = await detectDependenciesFromContent(content);

    expect(result).toHaveLength(4);
    expect(result[0].resolvedVersion).toBe('~1.2.3');
    expect(result[1].resolvedVersion).toBe('^2.3.4');
    expect(result[2].resolvedVersion).toBe('3.4.5');
    expect(result[3].resolvedVersion).toBe('>=4.0.0 <5.0.0');
  });

  it('should handle real-world package.json example', async () => {
    const content = JSON.stringify({
      name: 'my-app',
      version: '1.0.0',
      description: 'My awesome app',
      dependencies: {
        react: '^19.0.0',
        'react-dom': '^19.0.0',
        next: '^15.0.0',
        '@heroui/react': '^2.6.0',
        zustand: '^4.5.0',
      },
      devDependencies: {
        typescript: '^5.0.0',
        vitest: '^2.0.0',
        '@testing-library/react': '^16.0.0',
        eslint: '^8.0.0',
        prettier: '^3.0.0',
      },
    });

    const result = await detectDependenciesFromContent(content);

    expect(result).toHaveLength(10);
    expect(result.filter((d) => !d.isDev)).toHaveLength(5);
    expect(result.filter((d) => d.isDev)).toHaveLength(5);

    const reactDep = result.find((d) => d.name === 'react');
    expect(reactDep).toBeDefined();
    expect(reactDep?.declaredRange).toBe('^19.0.0');
    expect(reactDep?.resolvedVersion).toBe('^19.0.0');
    expect(reactDep?.isDev).toBe(false);

    const vitestDep = result.find((d) => d.name === 'vitest');
    expect(vitestDep).toBeDefined();
    expect(vitestDep?.declaredRange).toBe('^2.0.0');
    expect(vitestDep?.resolvedVersion).toBe('^2.0.0');
    expect(vitestDep?.isDev).toBe(true);
  });
});
