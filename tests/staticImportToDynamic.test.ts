import { describe, it, expect } from 'vitest';
import { staticImportToDynamic } from '../src/transforms/staticImportToDynamic';

describe('staticImportToDynamic', () => {
  it('converts named import', () => {
    const input = `import { something } from 'some-module';`;
    expect(staticImportToDynamic(input)).toBe("const {something} = await import('some-module');\n");
  });

  it('converts aliased named import', () => {
    const input = `import { x as y } from 'some-module';`;
    expect(staticImportToDynamic(input)).toBe("const {x: y} = await import('some-module');\n");
  });

  it('converts default import', () => {
    const input = `import defaultExport from 'some-module';`;
    expect(staticImportToDynamic(input)).toBe("const {default: defaultExport} = await import('some-module');\n");
  });

  it('converts namespace import', () => {
    const input = `import * as mod from 'some-module';`;
    expect(staticImportToDynamic(input)).toBe("const mod = await import('some-module');\n");
  });

  it('converts side-effect import', () => {
    const input = `import 'some-module';`;
    expect(staticImportToDynamic(input)).toBe("await import('some-module');\n");
  });

  it('converts mixed default and named import', () => {
    const input = `import defaultExport, { named } from 'some-module';`;
    expect(staticImportToDynamic(input)).toBe("const {default: defaultExport, named} = await import('some-module');\n");
  });

  it('converts multiple named imports', () => {
    const input = `import { a, b, c } from 'some-module';`;
    expect(staticImportToDynamic(input)).toBe("const {a, b, c} = await import('some-module');\n");
  });
});
