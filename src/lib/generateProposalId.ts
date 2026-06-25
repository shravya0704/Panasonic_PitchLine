export const generateProposalId = () => {
  const date = new Date();

  const y = date.getFullYear();

  const m = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const d = String(
    date.getDate()
  ).padStart(2, "0");

  const randomPart =
    crypto.randomUUID()
      .replace(/-/g, "")
      .substring(0, 6)
      .toUpperCase();

  return `PAN-${y}${m}${d}-${randomPart}`;
};