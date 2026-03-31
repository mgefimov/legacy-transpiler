import * as acorn from 'acorn';
import * as walk from 'acorn-walk';

export interface ReplaceImportMetaOptions {
  url?: string;
}

export function createImportMetaVisitor(options?: ReplaceImportMetaOptions): walk.SimpleVisitors<unknown> {
  return {
    MemberExpression(node: acorn.MemberExpression) {
      if (
        node.object.type === 'MetaProperty' &&
        node.object.meta.name === 'import' &&
        node.object.property.name === 'meta' &&
        node.property.type === 'Identifier' &&
        node.property.name === 'url'
      ) {
        if (options?.url) {
          const literal: acorn.Literal = {
            type: 'Literal',
            value: options.url,
            raw: JSON.stringify(options.url),
            start: node.start,
            end: node.end,
          };
          Object.assign(node, literal);
        } else {
          const replacement: acorn.MemberExpression = {
            type: 'MemberExpression',
            object: {
              type: 'MemberExpression',
              object: { type: 'Identifier', name: 'document', start: node.start, end: node.end },
              property: { type: 'Identifier', name: 'currentScript', start: node.start, end: node.end },
              computed: false,
              optional: false,
              start: node.start,
              end: node.end,
            },
            property: { type: 'Identifier', name: 'src', start: node.start, end: node.end },
            computed: false,
            optional: false,
            start: node.start,
            end: node.end,
          };
          Object.assign(node, replacement);
        }
      }
    },
  };
}
