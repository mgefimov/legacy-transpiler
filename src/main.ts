import { transpile } from './index'

const inputCode = `import { something } from 'some-module'`;

console.log(transpile(inputCode))
