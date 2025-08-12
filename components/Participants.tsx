import {
  View,
  TextInput,
  FlatList,
  Text,
  Pressable,
  StyleSheet
} from "react-native";
import { useState, useEffect } from "react";
import supabase from "@/supabaseClient";
import { FontAwesome } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";

type User = {
  id: string;
  username: string;
  email: string;
};

export function Participants() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [results, setResults] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { event } = useLocalSearchParams();
  const parsedEvent = event ? JSON.parse(event as string) : null;

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      searchUsers(searchQuery);
    }, 300); // Debounce input to avoid spamming DB

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const searchUsers = async (query: string) => {
    if (!query) {
      setResults([]);
      return;
    }

    setLoading(true);

    const { data, error } = await supabase
      .from("Profiles")
      .select("username")
      .ilike("username", `%${query}%`);

    if (error) {
      console.error("Search error:", error);
      setResults([]);
    } else {
      setResults(data as User[]);
    }
    setLoading(false);
  };

  const handleParticipants = async (username: string) => {
    try {
      if (!parsedEvent?.id) {
        console.error("No event ID found");
        return;
      }

      const { data: currentData, error: fetchError } = await supabase
        .from("Events")
        .select("participants")
        .eq("id", parsedEvent.id)
        .single();

      if (fetchError) throw fetchError;

      const existingParticipants = currentData.participants || [];

      const updatedParticipants = [
        ...new Set([...existingParticipants, username])
      ];

      const { data, error } = await supabase
        .from("Events")
        .select("times, status")
        .eq("id", parsedEvent.id)
        .single();

      if (error) {
        console.error("Fetch error:", error);
        return;
      }

      const currentTimes = data.times || {};
      const currentStatus = data.status || {};

      const { error: updateError } = await supabase
        .from("Events")
        .update({
          participants: updatedParticipants,
          times: {
            ...currentTimes,
            [username]: {}
          },
          status: { ...currentStatus, [username]: "selectATime" }
        })
        .eq("id", parsedEvent.id);
      console.log("pressed");
      if (updateError) throw updateError;
    } catch (error) {
      console.error("Error updating participants:", error);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Search for a user..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      {loading && <Text>Searching...</Text>}
      <FlatList
        data={results}
        keyExtractor={(item, index) => `${item.username}-${index}`}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <Pressable style={styles.resultItem}>
            <View style={styles.searchResults}>
              <Pressable
                onPress={() => handleParticipants(item.username)}
                style={styles.addButton}
              >
                <FontAwesome name="plus" size={36} color="#007AFF" />
              </Pressable>
              <Text style={styles.resultText}>{item.username}</Text>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10
  },
  resultItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee"
  },
  resultText: {
    fontSize: 16
  },
  addButton: {
    marginRight: 10,
    padding: 6
  },
  searchResults: {
    flexDirection: "row",
    marginLeft: 5,
    alignItems: "center"
  }
});
