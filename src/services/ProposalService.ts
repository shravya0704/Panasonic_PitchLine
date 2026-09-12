import { ProposalRepository } from "../repositories/ProposalRepository";

const ProposalService = {
  /**
   * Creates a new proposal record in the database with all configuration details.
   * Maps frontend camelCase data to database snake_case schema.
   * Includes all display specifications, power data, and configuration metadata.
   */
  async createProposal(
    proposalData: any,
    product: any,
    result: any,
    width: number,
    height: number
  ) {
    try {
      console.log("Creating proposal with data:", {
        proposalId: proposalData.proposalId,
        customerEmail: proposalData.customerEmail,
        salesContactEmail: proposalData.salesContactEmail,
        model: product.model,
      });

      const createPayload = {
        proposal_id: proposalData.proposalId,
        project_name: proposalData.projectName,
        customer_name: proposalData.customerName,
        company_name: proposalData.companyName,
        email: proposalData.customerEmail,
        sales_contact_email: proposalData.salesContactEmail || null,
        phone_number: proposalData.phoneNumber || null,
        location: proposalData.location || null,
        product_model: product.model,
        series_code: product.seriesCode || null,
        application_type: product.applicationType || null,
        screen_width: width,
        screen_height: height,
        actual_width: result.actualWidth || null,
        actual_height: result.actualHeight || null,
        resolution_w: result.resolutionW || null,
        resolution_h: result.resolutionH || null,
        total_cabinets: result.totalCabinets || null,
        total_modules: result.totalModules || null,
      };

      console.log("Sending to database:", createPayload);
      const result_db = await ProposalRepository.create(createPayload);
      console.log("Proposal created successfully:", result_db.proposal_id);
      return result_db;
    } catch (error) {
      console.error("Failed to create proposal:", error);
      throw error;
    }
  },

  /**
   * Retrieves the complete list of generated proposals/leads.
   * Used primarily by the Admin Dashboard to populate the leads table.
   */
  async getProposals() {
    return ProposalRepository.getAll();
  },
};

export default ProposalService;