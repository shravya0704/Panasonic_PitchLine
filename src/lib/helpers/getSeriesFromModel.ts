export const getSeriesFromModel = (
  model: string
): string => {
  if (
    model.startsWith("PFP")
  ) {
    return "PFP";
  }

  if (
    model.startsWith("PIQ")
  ) {
    return "PIQ";
  }

  if (
    model.startsWith("PEM")
  ) {
    return "PEM";
  }

  return "";
};