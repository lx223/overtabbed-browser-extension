import { execSync } from 'node:child_process';
import { existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, '..', '..');
const generatedDir = join(__dirname, 'src', 'generated');

/**
 * Removes existing generated files from src/generated
 */
function cleanGeneratedFiles(): void {
  if (existsSync(generatedDir)) {
    console.log(`Cleaning existing generated files from ${generatedDir}...`);
    rmSync(generatedDir, { recursive: true, force: true });
    console.log('Cleaned existing generated files.');
  } else {
    console.log('No existing generated files to clean.');
  }
}

/**
 * Generates code from proto files using buf
 */
function generateCode(): void {
  console.log('Generating code from proto files...');
  try {
    const nodeBinPath = join(__dirname, '..', 'node_modules', '.bin');
    const pathEnv = process.env.PATH || '';
    const newPath = `${nodeBinPath}${process.platform === 'win32' ? ';' : ':'}${pathEnv}`;
    
    execSync('buf generate', {
      cwd: __dirname,
      stdio: 'inherit',
      env: {
        ...process.env,
        PATH: newPath,
      },
    });
    console.log('Code generation completed successfully.');
  } catch (error) {
    console.error('Code generation failed:', error);
    process.exit(1);
  }
}

/**
 * Main function
 */
function main(): void {
  console.log('Starting code generation...');
  cleanGeneratedFiles();
  generateCode();
  console.log('Code generation process completed.');
}

main();


