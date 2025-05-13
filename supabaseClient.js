import { createClient } from "@supabase/supabase-js";
import Constants from "expo-constants";

const { supabaseUrl, supabaseAnonKey } = Constants.expoConfig.extra;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase env vars");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
