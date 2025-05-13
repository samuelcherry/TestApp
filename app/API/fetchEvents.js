import supabase from "../../supabaseClient";

const fetchEvents = async () => {
  try {
    const { data: eventData, error } = await supabase
      .from("Events")
      .select("*");
    if (error) throw error;
    return eventData;
  } catch (error) {
    console.error(error.message);
    return [];
  }
};

export default fetchEvents;
