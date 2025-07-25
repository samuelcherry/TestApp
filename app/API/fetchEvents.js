import supabase from "../../supabaseClient";

export const fetchEvents = async (uuid) => {
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

export const fetchEventsUserIsIn = async (username) => {
  const { data, error } = await supabase
    .from("Events")
    .select("*")
    .contains("participants", [username]);

  if (error) {
    console.error("Error fetching participant events:", error.message);
    return [];
  }

  return data;
};
