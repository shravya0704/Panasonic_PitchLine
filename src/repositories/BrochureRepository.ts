import { supabase } from "../lib/supabase";

export const BrochureRepository = {
  async getPages(
    seriesCode: string
  ) {
    const { data, error } =
      await supabase
        .from("brochure_pages")
        .select("*")
        .eq(
          "series_code",
          seriesCode
        )
        .order(
          "page_number",
          { ascending: true }
        );

    if (error) {
      throw error;
    }

    return data ?? [];
  },
};