import { ProposalRepository } from "../repositories/ProposalRepository";

export const ProposalService = {

  async save(data: any) {
    return ProposalRepository.create(data);
  },

  async getProposals() {
    return ProposalRepository.getAll();
  },

};