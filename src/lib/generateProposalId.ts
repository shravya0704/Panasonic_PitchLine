/**
 * Generates a unique, standardized identifier for a new proposal.
 * The resulting format (PAN-YYYYMMDD-XXXXXX) ensures the ID is easily identifiable, 
 * chronologically sortable by humans, and sufficiently unique to prevent database collisions.
 *
 * @returns {string} The formatted proposal ID string.
 */
export const generateProposalId = () => {
  const date = new Date();

  const y = date.getFullYear();

  // JavaScript months are zero-indexed, so we add 1. 
  // We use padStart to guarantee a consistent two-digit format, which ensures 
  // that alphabetical database sorts will accurately reflect chronological order.
  const m = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const d = String(
    date.getDate()
  ).padStart(2, "0");

  // We use the crypto API to guarantee high-entropy randomness, drastically reducing the 
  // chance of ID collisions if multiple admins generate proposals simultaneously. 
  // Slicing it to 6 characters keeps the ID short enough for humans to easily read and reference.
  const randomPart =
    crypto.randomUUID()
      .replace(/-/g, "")
      .substring(0, 6)
      .toUpperCase();

  return `PAN-${y}${m}${d}-${randomPart}`;
};