import { supabase } from "../lib/supabase";

export const AdminRepository = {
  async getPassword() {
    const { data, error } = await supabase
      .from("admin_settings")
      .select("*");

    console.log("Admin Settings:", data);

    if (error) {
      throw error;
    }

    return data?.[0]?.admin_password;
  },
};