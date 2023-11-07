// Using this workaround in order to add !important to some properties like the theme did. https://stackoverflow.com/a/56570994
// For example appearance type inside inputBase.ts is not allowing to have !important, but theme die so
const important = <T extends string>(s: T): T => `${s} !important` as T;

export default important;
