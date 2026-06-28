import { supabase } from "../lib/supabase";

export const ProposalRepository = {

  async create(data: any) {
    const { error } = await supabase
      .from("proposals")
      .insert(data);

    if (error) {
      console.error("Proposal insert error:", error);
      throw error;
    }
  },

  async getAll() {
    const { data, error } = await supabase
      .from("proposals")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      throw error;
    }

    return data;
  },

};