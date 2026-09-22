// The implementation is compiled once as CommonJS. This small ESM facade keeps
// one runtime implementation while providing a real conditional ESM entry.
import * as cjs from '../dist/cjs/src/index.js';

export const ReplyNodes = cjs.ReplyNodes;
export const ReplyNodesError = cjs.ReplyNodesError;
export const ReplyNodesTimeoutError = cjs.ReplyNodesTimeoutError;
export const PUBLIC_OPERATION_REGISTRY = cjs.PUBLIC_OPERATION_REGISTRY;
export default cjs.ReplyNodes;

export type * from '../dist/cjs/src/index.js';
