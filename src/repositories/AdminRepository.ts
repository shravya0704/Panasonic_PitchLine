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
  async updatePassword(password: string) {
  const { error } = await supabase
    .from("admin_settings")
    .update({
      admin_password: password,
    })
    .eq("id", 1);

  if (error) throw error;
}
};