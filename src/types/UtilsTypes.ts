export type IconFactoryFunc = (fill: string, size: string) => string;
export type IconFactory = Record<string, IconFactoryFunc>;
