/*
 * Centralised engineering rules used for Power Distribution.
 *
 * These limits define how many LED cabinets can be connected
 * to a single power chain for different installation environments.
 *
 * Both the calculation engine and the PDF documentation use
 * these values, ensuring they always remain consistent.
 */
export const POWER_RULES = {
  /*
   * Indoor installation limits.
   */
  indoor: {
    /*
     * Maximum number of cabinets supported
     * on one power chain.
     */
    maxCabinetsPerChain: 16,

    /*
     * Standard operating voltage.
     */
    voltage: 220,

    /*
     * Recommended power cable specification.
     */
    cable: "2.5 mm² (3 core)",
  },

  /*
   * Outdoor installation limits.
   *
   * Outdoor installations support fewer cabinets
   * per chain due to higher power requirements.
   */
  outdoor: {
    maxCabinetsPerChain: 5,
    voltage: 220,
    cable: "2.5 mm² (3 core)",
  },
};