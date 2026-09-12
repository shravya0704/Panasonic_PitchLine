import { supabase } from "../lib/supabase";

export interface ProposalRecord {
  id: string;
  proposal_id: string;
  project_name: string;
  customer_name: string;
  company_name: string;
  email: string;
  sales_contact_email?: string | null;
  product_model: string;
  phone_number?: string | null;
  location?: string | null;
  series_code?: string;
  application_type?: string;
  screen_width?: number;
  screen_height?: number;
  actual_width?: number;
  actual_height?: number;
  resolution_w?: number;
  resolution_h?: number;
  total_cabinets?: number;
  total_modules?: number;
  pdf_url?: string;
  created_at: string;
  updated_at: string;
}

export class ProposalRepository {
  static async create(proposal: Omit<ProposalRecord, "id" | "created_at" | "updated_at">): Promise<ProposalRecord> {
    const { data, error } = await supabase
      .from("proposals")
      .insert([proposal])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getById(id: string): Promise<ProposalRecord | null> {
    const { data, error } = await supabase
      .from("proposals")
      .select()
      .eq("id", id)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data || null;
  }

  static async getByProposalId(proposalId: string): Promise<ProposalRecord | null> {
    const { data, error } = await supabase
      .from("proposals")
      .select()
      .eq("proposal_id", proposalId)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data || null;
  }

  static async getAll(): Promise<ProposalRecord[]> {
    const { data, error } = await supabase
      .from("proposals")
      .select()
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async update(
    id: string,
    updates: Partial<Omit<ProposalRecord, "id" | "created_at" | "updated_at">>
  ): Promise<ProposalRecord> {
    const { data, error } = await supabase
      .from("proposals")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from("proposals")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }

  static async deleteByProposalId(proposalId: string): Promise<void> {
    const { error } = await supabase
      .from("proposals")
      .delete()
      .eq("proposal_id", proposalId);

    if (error) throw error;
  }

  static async search(searchTerm: string): Promise<ProposalRecord[]> {
    const { data, error } = await supabase
      .from("proposals")
      .select()
      .or(
        `project_name.ilike.%${searchTerm}%,customer_name.ilike.%${searchTerm}%,company_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,product_model.ilike.%${searchTerm}%`
      )
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  }
}