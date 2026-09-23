/** Turn Keystatic MDX into something the React compiler can render. */
export function prepareMdx(source: string, slug: string): string {
  let body = source;
  const imports = [
    ...body.matchAll(/^import\s+(\w+)\s+from\s+['"]([^'"]+)['"];?\s*$/gm),
  ];
  body = body.replace(/^import\s+.*?from\s+['"][^'"]+['"];?\s*$/gm, '');
  for (const match of imports) {
    const name = match[1];
    const file = match[2]?.split('/').pop();
    if (!name || !file) continue;
    body = body.replaceAll(`{${name}}`, `"/media/articles/${slug}/${file}"`);
  }
  return body.replaceAll(' class=', ' className=');
}
