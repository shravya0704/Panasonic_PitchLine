import { supabase } from "../lib/supabase";

export const ProposalRepository = {
  async create(data: any) {
    const { error } = await supabase
      .from("proposals")
      .insert(data);

    if (error) {
      throw error;
    }
  },
};