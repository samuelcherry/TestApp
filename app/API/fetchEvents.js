import AsyncStorage from "@react-native-async-storage/async-storage";
import supabase from "../../supabaseClient";

export const fetchEvents = async () => {
  const uuid = await AsyncStorage.getItem("uuid");
  if (!uuid) return [];

  const { data: data, error } = await supabase
    .from("Events")
    .select("*")
    .eq("ownerId", uuid);

  if (error) {
    console.error("Error fetching events:", error.message);
    return [];
  }

  return data;
};
