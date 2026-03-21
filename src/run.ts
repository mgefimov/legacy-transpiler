import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { resolve, join } from 'path';
import { transpile } from './index';

const BASE_URL = 'https://assets-proxy.anthropic.com/claude-ai/v2/assets/v1';
const resolveModule = (source: string) => `${BASE_URL}/${source.replace(/^\.\//, '')}`;

const inputDir = resolve(__dirname, '../assets/input');
const outputDir = resolve(__dirname, '../assets/output');

const files = readdirSync(inputDir).filter(f => f.endsWith('.js'));

for (const file of files) {
  const inputPath = join(inputDir, file);
  const outputPath = join(outputDir, file);

  const inputCode = readFileSync(inputPath, 'utf-8');
  const result = transpile(inputCode, { resolveModule, minify: true });

  writeFileSync(outputPath, result);
  console.log(`${file} -> assets/output/${file}`);
}

console.log(`\nTranspiled ${files.length} file(s)`);
