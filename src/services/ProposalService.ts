import { ProposalRepository } from "../repositories/ProposalRepository";
import { ProposalInfo } from "../types/ProposalInfo";
import { Product } from "../types/Product";
import { ConfigurationResult } from "../types/ConfigurationResult";

export const ProposalService = {
  async createProposal(
    proposal: ProposalInfo & { proposalId: string },
    product: Product,
    result: ConfigurationResult,
    width: number,
    height: number
  ) {
    return ProposalRepository.create({
      proposal_id: proposal.proposalId,

      project_name: proposal.projectName,

      customer_name: proposal.customerName,

      company_name: proposal.companyName,

      email: proposal.email,

      product_model: product.model,

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
};