export function createHTMLElement<T extends HTMLElement = HTMLElement>({
  tag,
  attributes = {},
  children = [],
  modifier = undefined,
}: {
  tag: string;
  attributes?: Record<string, string | string>;
  children?: HTMLElement[];
  modifier?: ((el: T) => void) | undefined;
}): T {
  const el = document.createElement(tag) as T;
  for (const att in attributes) {
    el.setAttribute(att, attributes[att]);
  }
  for (let i = 0; i < children.length; i++) {
    el.appendChild(children[i]);
  }
  if (modifier !== undefined) {
    modifier(el);
  }

  return el;
}
