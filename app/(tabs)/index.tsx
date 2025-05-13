import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal
} from "react-native";
import React, { useEffect, useState } from "react";
import NewEventButton from "@/components/NewEventButton";
import supabase from "@/supabaseClient";
import fetchEvents from "../API/fetchEvents";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function HomeScreen() {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [participants, setParticipants] = useState("");
  const [events, setEvents] = useState<Event[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);

  type Event = {
    id: number;
    title: string;
    description: string;
    date: string;
    participants: string[];
  };

  useEffect(() => {
    const loadEvents = async () => {
      const data = await fetchEvents();
      setEvents(data);
    };
    loadEvents();
  }, []);

  const handleSubmit = async () => {
    try {
      const { data: userData, error: userError } = await supabase
        .from("Events")
        .insert([
          {
            title,
            description,
            date
          }
        ]);
      if (userError) {
        throw userError;
      }

      const updatedEvents = await fetchEvents();
      setEvents(updatedEvents);
    } catch (error) {
      console.error("Error during insert:", error);
    }
    setShowForm(false);
    setTitle("");
    setDescription("");
    setDate("");
    setParticipants("");
    setSelectedDate(null);
  };

  const handleDelete = async (id: number) => {
    try {
      const { data, error } = await supabase
        .from("Events")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setEvents((prevEvents) => prevEvents.filter((event) => event.id !== id));
      console.log("Delete");
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.container}>
        <NewEventButton
          title="New Event"
          onPress={() => {
            console.log("Button pressed, showing form..");
            setShowForm(true);
          }}
        />
        {events.length > 0 ? (
          events.map((event, index) => (
            <View key={index} style={styles.eventCard}>
              <Text style={styles.title}>{event.title}</Text>
              <Text style={styles.description}>{event.description}</Text>
              <Text style={styles.date}>{event.date}</Text>
              <TouchableOpacity
                style={styles.button}
                onPress={() => handleDelete(event.id)}
              >
                <Text style={styles.buttonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <Text style={{ textAlign: "center", marginTop: 20 }}>No Events</Text>
        )}
      </ScrollView>
      <Modal visible={showForm} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.form}>
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Event title"
            />
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={styles.input}
              value={description}
              onChangeText={setDescription}
              placeholder="Event Description"
            />
            <Text style={styles.label}>Date</Text>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={styles.input}
            >
              <Text style={{ color: selectedDate ? "#000" : "#999" }}>
                {selectedDate
                  ? selectedDate.toLocaleDateString()
                  : "Select a date"}
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={selectedDate || new Date()}
                mode="date"
                display="default"
                onChange={(event, selected) => {
                  setShowDatePicker(false);
                  if (selected) {
                    setSelectedDate(selected);
                    const formattedDate = selected.toISOString().split("T")[0];
                    setDate(formattedDate); // ✅ Save to DB-friendly string
                  }
                }}
              />
            )}
            <View style={styles.buttonRow}>
              <Button title="Submit" onPress={handleSubmit} />
              <Button title="Close" onPress={() => setShowForm(false)} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingTop: 64
  },
  form: {
    width: "90%", // or try "100%" with padding if you want full screen
    backgroundColor: "white", // optional: makes it look more like a modal
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  label: {
    fontWeight: "bold",
    marginTop: 12
  },
  input: {
    borderWidth: 1,
    borderColor: "#aaa",
    padding: 8,
    borderRadius: 6,
    marginTop: 4
  },
  eventCard: {
    backgroundColor: "#f5f5f5",
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
    marginLeft: 15,
    marginRight: 15
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4
  },
  description: {
    fontSize: 14,
    color: "#444",
    marginBottom: 6
  },
  date: {
    fontSize: 12,
    color: "#888"
  },

  button: {
    backgroundColor: "#1877F2",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    alignSelf: "center",
    marginTop: 50
  },

  buttonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center"
  },

  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    gap: 10
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(157, 157, 157, 0.8)",
    justifyContent: "center",
    alignItems: "center"
  }
});
