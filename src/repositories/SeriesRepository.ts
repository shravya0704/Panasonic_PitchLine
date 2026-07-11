import { supabase } from "../lib/supabase";

export const SeriesRepository = {
  async getByCode(code: string) {
    const { data, error } = await supabase
      .from("series")
      .select("*");

    console.log(
      "ALL SERIES:",
      data
    );

    console.log(
      "LOOKING FOR:",
      code
    );

    if (error) {
      throw error;
    }

    const series = data?.find(
      (s) => s.code === code
    );

    if (!series) {
      throw new Error(
        `Series '${code}' not found in the series table.`
      );
    }

    return series;
  },

  async getAll() {
    const { data, error } = await supabase
      .from("series")
      .select("*");

    if (error) {
      throw error;
    }

    return data ?? [];
  },
};