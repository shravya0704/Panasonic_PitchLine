import { ProposalRepository } from "../repositories/ProposalRepository";
import { Product } from "../types/Product";
import { ConfigurationResult } from "../types/ConfigurationResult";

export const ProposalService = {

  async createProposal(
    proposalData: any,
    product: Product,
    result: ConfigurationResult,
    width: number,
    height: number
  ) {

    return ProposalRepository.create({

      proposal_id: proposalData.proposalId,

      project_name: proposalData.projectName,

      customer_name: proposalData.customerName,

      company_name: proposalData.companyName,

      email: proposalData.email,

      product_model: product.model,

      // ✅ Matches your Supabase schema
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

  async getProposals() {
    return ProposalRepository.getAll();
  },

};