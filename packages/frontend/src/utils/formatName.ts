/**
 * Formats a congressional name from the API format into a readable display name.
 *
 * Input:  "Sra. ASTUDILLO P., DANISA"
 * Output: "Danisa Astudillo"
 */
export function formatName(raw: string): string {
  // Remove Sr. / Sra. prefix
  const withoutTitle = raw.replace(/^Sr[a]?\.\s*/i, '').trim();

  // Split into lastname side and firstname side
  const commaIdx = withoutTitle.indexOf(',');
  if (commaIdx === -1) return capitalize(withoutTitle);

  const lastnameSide = withoutTitle.slice(0, commaIdx).trim();
  const firstname = withoutTitle.slice(commaIdx + 1).trim();

  // Remove trailing initial (single uppercase letter + dot, e.g. "P.")
  const lastname = lastnameSide.replace(/\s+[A-ZÁÉÍÓÚÑ]\.$/, '').trim();

  return `${capitalize(firstname)} ${capitalize(lastname)}`;
}

function capitalize(str: string): string {
  return str.toLowerCase().replace(/(?:^|\s)\S/g, (c) => c.toUpperCase());
}
