import { transpile } from './index'

const inputCode = `import { something } from './vendor-Dfbm12k5.js';`;

const BASE_URL = 'https://assets-proxy.anthropic.com/claude-ai/v2/assets/v1';

const resolveModule = (source: string) => `${BASE_URL}/${source.replace(/^\.\//, '')}`;

console.log(transpile(inputCode, { resolveModule }))
