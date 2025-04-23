import {
  Image,
  StyleSheet,
  Platform,
  View,
  Text,
  Button,
  TextInput,
  ScrollView
} from "react-native";
import React, { useState } from "react";
import NewEventButton from "@/components/NewEventButton";

export default function HomeScreen() {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [participants, setParticipants] = useState("");

  const handleSubmit = () => {
    console.log("New Event:", { title, description, date, participants });
    setShowForm(false);
    setTitle("");
    setDescription("");
    setDate("");
    setParticipants("");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <NewEventButton
        title="New Event"
        onPress={() => {
          console.log("Button pressed, showing form..");
          setShowForm(true);
        }}
      />

      {showForm && (
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
          <TextInput
            style={styles.input}
            value={date}
            onChangeText={setDate}
            placeholder="YYYY-MM-DD"
          />

          <Text style={styles.label}>Participants</Text>
          <TextInput
            style={styles.input}
            value={participants}
            onChangeText={setParticipants}
            placeholder="Participants"
          />

          <Button title="Submit" onPress={handleSubmit} />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingTop: 64
  },
  form: {
    marginTop: 24
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
  }
});
