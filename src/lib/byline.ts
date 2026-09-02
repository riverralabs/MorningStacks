export function authorByline(author: { name: string; role?: string | null }): string {
  const role = author.role?.trim();
  return role ? `${author.name}, ${role}.` : `${author.name}.`;
}
