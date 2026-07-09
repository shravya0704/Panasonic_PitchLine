/*
 * Centralised engineering rules used for Data Flow calculations.
 *
 * These values represent Panasonic engineering constraints and are
 * consumed by both the calculation engine and the PDF generator.
 *
 * NOTE:
 * If Panasonic updates its supported pixel capacity or routing
 * methodology, only this file should be modified.
 */
export const DATA_RULES = {
  /*
   * Maximum number of LED pixels that can be driven
   * through a single LAN/data cable.
   *
   * This value is used to calculate the maximum number
   * of cabinets that can belong to one data chain.
   */
  maxPixelsPerCable: 655000,

  /*
   * Standard routing strategy used while generating
   * the engineering Data Flow Diagram.
   */
  routing: "Vertical column routing",

  /*
   * Description displayed in the proposal PDF so the
   * generated engineering assumptions remain transparent
   * to customers and installation teams.
   */
  note:
    "Maximum cabinets per cable are calculated using cabinet resolution.",
};