import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { resolve, join } from 'path';
import { transpile } from './index';

const BASE_URL = 'https://assets-proxy.anthropic.com/claude-ai/v2/assets/v1';
const resolveModule = (source: string) => `${BASE_URL}/${source.replace(/^\.\//, '')}`;
const staticImportModule = async (resolvedSource: string) => {
  // In a real implementation, this would fetch the module and store it in a way that it can be accessed at runtime.
  // For testing, we can just log it or do nothing.
}

const inputDir = resolve(__dirname, '../assets/input');
const outputDir = resolve(__dirname, '../assets/output');

const files = readdirSync(inputDir).filter(f => f.endsWith('.js'));

(async () => {
  for (const file of files) {
    const inputPath = join(inputDir, file);
    const outputPath = join(outputDir, file);

    const inputCode = readFileSync(inputPath, 'utf-8');
    const src = `${BASE_URL}/${file}`;
    const result = await transpile(inputCode, { resolveModule, src, minify: false, staticImportModule });

    writeFileSync(outputPath, result);
    console.log(`${file} -> assets/output/${file}`);
  }

  console.log(`\nTranspiled ${files.length} file(s)`);
})();
