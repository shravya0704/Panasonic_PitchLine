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

  /**
   * Delete a single proposal by ID
   * @param proposalId - The proposal ID to delete
   */
  async deleteById(id: string) {
    const { error } = await supabase
      .from("proposals")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(`Proposal delete error for ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete multiple proposals by ID array
   * @param proposalIds - Array of proposal IDs to delete
   */
  async deleteMultiple(ids: string[]) {
    if (!ids || ids.length === 0) {
      throw new Error("No proposal IDs provided for deletion");
    }

    const { error } = await supabase
      .from("proposals")
      .delete()
      .in("id", ids);

    if (error) {
      console.error(`Proposal bulk delete error:`, error);
      throw error;
    }
  },

};