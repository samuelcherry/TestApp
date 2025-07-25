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
import { fetchEvents, fetchEventsUserIsIn } from "../API/fetchEvents";
import { router } from "expo-router";
import { Event } from "../types";
import { useIsFocused } from "@react-navigation/native";
import Icon from "react-native-vector-icons/FontAwesome";
import { FontAwesome } from "@expo/vector-icons";
import { Session } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Status, StatusData } from "../types";

export default function HomeScreen() {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [participants, setParticipants] = useState("");
  const [events, setEvents] = useState<Event[]>([]);
  const isFocused = useIsFocused();
  const [uuid, setUuid] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("selectATime");

  const statusData: StatusData = {
    timeFound: { color: "green", icon: "check" },
    noTimeFound: { color: "red", icon: "times" },
    waitingOnOthers: { color: "orange", icon: "hourglass-half" },
    selectATime: { color: "blue", icon: "calendar" }
  };

  useEffect(() => {
    const loadUserData = async () => {
      const uuid = await AsyncStorage.getItem("uuid");
      const username = await AsyncStorage.getItem("username");

      setUuid(uuid);
      setUsername(username);
    };

    loadUserData();
  }, []);

  useEffect(() => {
    if (isFocused) {
      const loadEvents = async () => {
        const uuid = await AsyncStorage.getItem("uuid");
        const username = await AsyncStorage.getItem("username");
        const data = await fetchEvents(uuid);
        const participatingEvents = await fetchEventsUserIsIn(username);
        const combinedEvents = [...data, ...participatingEvents];
        setEvents(combinedEvents);
      };
      loadEvents();
    }
  }, [isFocused]);

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      const session: Session | null = data.session;

      if (!session) {
        router.replace("/AuthScreen");
      }
    };

    checkAuth();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session) {
          router.replace("/AuthScreen");
        }
      }
    );
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const navigateToEvent = (event: Event) => {
    router.push({
      pathname: "/eventDetails",
      params: { event: JSON.stringify(event) }
    });
  };

  const handleSubmit = async () => {
    try {
      const { data: userData, error: userError } = await supabase
        .from("Events")
        .insert([
          {
            title,
            description,
            ownerId: uuid,
            status: "selectATime"
          }
        ])
        .select();

      if (userError) throw userError;

      if (userData && userData.length > 0) {
        const newEvent = userData[0];
        setEvents((prev) => [...prev, newEvent]);
        router.push({
          pathname: "/eventDetails",
          params: { event: JSON.stringify(newEvent) }
        });
      }
    } catch (error) {
      console.error("Error during insert:", error);
    }
    setShowForm(false);
    setTitle("");
    setDescription("");
    setDate("");
    setParticipants("");
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
    } catch (error) {}
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
          events.map((event, index) => {
            const status = event.status || "pending"; // fallback if status is missing
            const { color, icon } = statusData[status] || {
              color: "selectATime",
              icon: "question"
            };

            return (
              <TouchableOpacity
                key={index}
                style={styles.eventCard}
                onPress={() => navigateToEvent(event)}
              >
                <View style={styles.eventTop}>
                  <View>
                    <Text style={styles.title}>{event.title}</Text>
                    <Text style={styles.description}>{event.description}</Text>
                  </View>
                  <View>
                    <View style={[styles.colorBox, { backgroundColor: color }]}>
                      <FontAwesome name={icon} size={50} color="white" />
                    </View>
                  </View>
                </View>
                <Text style={styles.date}>{event.date}</Text>
                <TouchableOpacity
                  style={styles.button}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleDelete(event.id);
                  }}
                >
                  <Icon name="trash" size={24} color="#fff" />
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })
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
  input: {
    borderWidth: 1,
    borderColor: "#aaa",
    padding: 12,
    borderRadius: 6,
    marginTop: 4,
    backgroundColor: "#fff"
  },
  form: {
    marginTop: 24,
    margin: 10,
    width: "90%",
    backgroundColor: "white",
    padding: 10,
    borderRadius: 15
  },
  label: {
    fontWeight: "bold",
    marginTop: 12
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
  eventTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center", // vertically center them if needed
    backgroundColor: "#f5f5f5"
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
  deleteButton: {
    backgroundColor: "#1877F2",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    alignSelf: "center",
    marginTop: 50,
    marginBottom: 15
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
  },
  colorBox: {
    width: 75,
    height: 75,
    backgroundColor: "blue",
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center"
  }
});
