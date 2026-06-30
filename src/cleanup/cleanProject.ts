// src/cleanup/cleanProject.ts
import { promises as fs } from 'fs';
import fsSync from 'fs';
import glob from 'fast-glob';
import * as ts from 'typescript';
import path from 'path';

// ---------------------------------------------------------------------------
// Helper: find all import/require references in the TS/JS source tree
// ---------------------------------------------------------------------------
async function getAllReferencedFiles(root: string): Promise<Set<string>> {
  const entryGlobs = ['src/**/*.tsx', 'src/**/*.ts', 'src/**/*.jsx', 'src/**/*.js'];
  const entryFiles = await glob(entryGlobs, { cwd: root, absolute: true });

  const referenced = new Set<string>();

  for (const file of entryFiles) {
    const source = await fs.readFile(file, 'utf8');
    const srcFile = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);

    const visit = (node: ts.Node) => {
      // import ... from '...'
      if (ts.isImportDeclaration(node) && node.moduleSpecifier) {
        const spec = (node.moduleSpecifier as ts.StringLiteral).text;
        maybeAdd(spec);
      }
      // import('...')
      if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword) {
        const arg = node.arguments[0];
        if (ts.isStringLiteral(arg)) maybeAdd(arg.text);
      }
      // require('...')
      if (
        ts.isCallExpression(node) &&
        node.expression.getText() === 'require' &&
        node.arguments.length === 1 &&
        ts.isStringLiteral(node.arguments[0])
      ) {
        maybeAdd(node.arguments[0].text);
      }
      ts.forEachChild(node, visit);
    };

    const maybeAdd = (importPath: string) => {
      // Resolve relative imports only – ignore node_modules packages
      if (importPath.startsWith('.')) {
        const resolved = path.resolve(path.dirname(file), importPath);
        // Try both .ts/.tsx/.js/.jsx extensions and index files
        const candidates = [
          `${resolved}.ts`,
          `${resolved}.tsx`,
          `${resolved}.js`,
          `${resolved}.jsx`,
          path.join(resolved, 'index.ts'),
          path.join(resolved, 'index.tsx'),
          path.join(resolved, 'index.js'),
          path.join(resolved, 'index.jsx'),
        ];
        for (const c of candidates) {
          try {
            // sync existence check via stat

            const stat = fsSync.statSync(c);
            if (stat.isFile()) {
              referenced.add(path.normalize(c));
              break;
            }
          } catch (error) { console.error(error); }
        }
      }
    };

    visit(srcFile);
  }

  return referenced;
}

// ---------------------------------------------------------------------------
// Step 1 – Detect unused files (components, pages, hooks, contexts, utils)
// ---------------------------------------------------------------------------
async function deleteUnusedFiles() {
  const projectRoot = path.resolve(__dirname, '../../'); // project root
  const allFiles = await glob('src/**/*.{ts,tsx,js,jsx,css,scss}', {
    cwd: projectRoot,
    absolute: true,
    ignore: ['src/cleanup/**'], // keep the script itself
  });

  const referenced = await getAllReferencedFiles(projectRoot);

  for (const file of allFiles) {
    const normalized = path.normalize(file);
    if (!referenced.has(normalized)) {
      
      await fs.unlink(file);
    }
  }
}

// ---------------------------------------------------------------------------
// Step 2 – Delete empty directories (recursively)
// ---------------------------------------------------------------------------
async function deleteEmptyDirs(dir: string) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await deleteEmptyDirs(fullPath);
    }
  }

  const remaining = await fs.readdir(dir);
  if (remaining.length === 0) {
    
    await fs.rmdir(dir);
  }
}

// ---------------------------------------------------------------------------
// Step 3 – Remove console.* debugging statements (only if not in production)
// ---------------------------------------------------------------------------
async function stripDebugConsole() {
  const files = await glob('src/**/*.{ts,tsx,js,jsx}', {
    cwd: path.resolve(__dirname, '../../'),
    absolute: true,
  });

  const consoleRegex = /console\.(log|error|debug)\s*\([^;]*\);?/g;

  for (const file of files) {
    let content = await fs.readFile(file, 'utf8');
    if (consoleRegex.test(content)) {
      content = content.replace(consoleRegex, '');
      await fs.writeFile(file, content, 'utf8');
      
    }
  }
}

// ---------------------------------------------------------------------------
// Step 4 – Prune unused npm dependencies
// ---------------------------------------------------------------------------
async function pruneDependencies() {
  const { exec } = await import('child_process');
  exec('npx depcheck --json', { cwd: process.cwd() }, async (err, stdout) => {
    if (err) {
      
      return;
    }
    const report = JSON.parse(stdout);
    const unused = Object.keys(report.dependencies);
    if (unused.length === 0) {
      
      return;
    }
    
    const pkgPath = path.resolve('package.json');
    const pkg = JSON.parse(await fs.readFile(pkgPath, 'utf8'));
    for (const dep of unused) {
      delete pkg.dependencies?.[dep];
      delete pkg.devDependencies?.[dep];
    }
    await fs.writeFile(pkgPath, JSON.stringify(pkg, null, 2), 'utf8');
    
  });
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------
async function main() {
  
  await deleteUnusedFiles();
  await deleteEmptyDirs(path.resolve(__dirname, '../../src'));
  await stripDebugConsole();
  await pruneDependencies();
  
}

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
if (process.argv[1] === __filename) {
  main().catch(() => {
    
    process.exit(1);
  });
}
