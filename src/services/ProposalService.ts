import { ProposalRepository } from "../repositories/ProposalRepository";
import { Product } from "../types/Product";
import { ConfigurationResult } from "../types/ConfigurationResult";

/**
 * Service layer responsible for handling proposal and lead generation data.
 * Acts as the bridge between the complex frontend state (user inputs, product specs, 
 * calculated results) and the flat database schema used in Supabase.
 */
export const ProposalService = {
  /**
   * Compiles data from various frontend sources into a single, flat database record.
   * This is triggered when a user successfully exports a PDF, acting as the lead capture mechanism.
   *
   * @param {any} proposalData - The customer information collected from the export modal form.
   * @param {Product} product - The specific LED product model the user configured.
   * @param {ConfigurationResult} result - The mathematical and physical output from the configuration engine.
   * @param {number} width - The original target width requested by the user.
   * @param {number} height - The original target height requested by the user.
   * @returns {Promise<any>} A promise that resolves when the lead is successfully saved to the database.
   */
  async createProposal(
    proposalData: any,
    product: Product,
    result: ConfigurationResult,
    width: number,
    height: number
  ) {
    // We flatten the nested frontend state (proposal info + product specs + calculated results) 
    // into a single object with snake_case keys to strictly match the Supabase table schema.
    return ProposalRepository.create({
      proposal_id: proposalData.proposalId,
      project_name: proposalData.projectName,
      customer_name: proposalData.customerName,
      company_name: proposalData.companyName,
      email: proposalData.email,

      // NEW
      // Supabase/Postgres prefers explicit NULLs over undefined for empty optional fields.
      // This fallback prevents potential database insertion errors if the user left these blank.
      phone_number: proposalData.phoneNumber || null,

      // NEW
      location: proposalData.location || null,

      product_model: product.model,

      // Matches your Supabase schema
      series_code: product.seriesCode,
      application_type: product.applicationType,
      screen_width: width,
      screen_height: height,
      actual_width: result.actualWidth,
      actual_height: result.actualHeight,
      resolution_w: result.resolutionW,
      resolution_h: result.resolutionH,
      total_cabinets: result.totalCabinets,
      total_modules: result.totalModules,
    });
  },

  /**
   * Retrieves the complete list of generated proposals/leads.
   * Used primarily by the Admin Dashboard to populate the leads table.
   *
   * @returns {Promise<any>} A promise resolving to an array of all recorded proposals.
   */
  async getProposals() {
    return ProposalRepository.getAll();
  },
};