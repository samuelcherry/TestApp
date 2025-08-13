import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Calendar } from "react-native-calendars";
import { useState, useEffect } from "react";
import supabase from "@/supabaseClient";
import DateView from "@/components/DateView";
import TimesView from "@/components/TimesView";
import Icon from "react-native-vector-icons/FontAwesome";
import { Participants } from "@/components/Participants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TimeSlot } from "../types";
import { checkForEmptyTimesArray } from ".";
import { useStatus } from "../context/StatusContext";
import { useFocusEffect } from "@react-navigation/native";
import React from "react";

export default function EventDetailsScreen() {
  const { event } = useLocalSearchParams();
  const parsedEvent = event ? JSON.parse(event as string) : null;
  const [pressed, setPressed] = useState("");
  const [selectedDates, setSelectedDates] = useState<{ [key: string]: any }>(
    {}
  );
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expandedDate, setExpandedDate] = useState<string | null>(null);
  const [selectedTimes, setSelectedTimes] = useState<{
    [date: string]: string[];
  }>({});
  const [savedTimes, setSavedTimes] = useState<{
    [username: string]: { [date: string]: string[] };
  } | null>(null);
  const [editingTimes, setEditingTimes] = useState(false);
  const [editEvent, setEditEvent] = useState(false);
  const [title, setTitle] = useState(parsedEvent?.title || "");
  const [description, setDescription] = useState(
    parsedEvent?.description || ""
  );
  const [possibleTimes, setPossibleTimes] = useState<TimeSlot[] | null>(null);
  const { status, setStatus } = useStatus();

  const fetchEvent = async () => {
    if (!parsedEvent?.id) return;

    setLoading(true);
    const { data, error } = await supabase
      .from("Events")
      .select("dates, title, description, times, possibleTimes")
      .eq("id", parsedEvent.id)
      .maybeSingle();

    if (error) {
      console.error("Error fetching event:", error);
    } else {
      if (data.dates && data.dates.length > 0) {
        setSelectedDates(convertArrayToMarkedDates(data.dates));
        setSubmitted(true);
      } else {
        setSelectedDates({});
        setSubmitted(false);
      }
      setSavedTimes(data.times || null);

      setTitle(data.title || "");
      setDescription(data.description || "");
      setPossibleTimes(data.possibleTimes || null);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchEvent();
  }, [parsedEvent?.id]);

  useFocusEffect(
    React.useCallback(() => {
      checkForEmptyTimesArray(setStatus);
      fetchEvent();
    }, [])
  );

  const convertArrayToMarkedDates = (datesArray: string[]) => {
    const markedDates: { [key: string]: any } = {};
    datesArray.forEach((date) => {
      markedDates[date] = { selected: true, selectedColor: "#00adf5" };
    });
    return markedDates;
  };

  const toggleTimeForDate = (date: string, time: string) => {
    setSelectedTimes((prev) => {
      const currentTimes = prev[date] || [];
      const isSelected = currentTimes.includes(time);
      const updatedTimes = isSelected
        ? currentTimes.filter((t) => t !== time)
        : [...currentTimes, time];

      return {
        ...prev,
        [date]: updatedTimes
      };
    });
  };

  const toggleDate = (day: { dateString: string }) => {
    const date = day.dateString;
    setSelectedDates((prev) => {
      const updated = { ...prev };
      if (updated[date]) {
        delete updated[date];
      } else {
        updated[date] = {
          selected: true,
          selectedColor: "#00adf5"
        };
      }
      return updated;
    });
  };

  const handleSaveDates = async (
    eventId: number,
    newDatesObject: { [key: string]: any }
  ) => {
    try {
      const newDatesArray = newDatesObject;
      const { error } = await supabase
        .from("Events")
        .update({ dates: newDatesArray })
        .eq("id", eventId);

      if (error) throw error;

      setSubmitted(true);
      setEditingTimes(true);
    } catch (error) {
      console.error(error);
    }
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${String(hour).padStart(2, "0")}:${String(
          minute
        ).padStart(2, "0")}`;
        slots.push(time);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const handleSaveTimes = async () => {
    const username = await AsyncStorage.getItem("username");

    if (!username) {
      console.error("Username not found in AsyncStorage.");
      return;
    }

    try {
      const selectedDateKeys = Object.keys(selectedDates);
      const filteredTimes: { [key: string]: string[] } = {};
      selectedDateKeys.forEach((date) => {
        if (selectedTimes[date]) {
          filteredTimes[date] = selectedTimes[date];
        }
      });

      setSavedTimes((prev) => ({
        ...prev,
        [username]: filteredTimes
      }));
      setSelectedTimes(filteredTimes);

      const { data: existingData, error: fetchError } = await supabase
        .from("Events")
        .select("times, status")
        .eq("id", parsedEvent.id)
        .single();

      if (fetchError) throw fetchError;

      const currentStatus = existingData.status || {};

      const UserIdWithTimes = {
        ...(existingData?.times || {}),
        [username]: filteredTimes
      };

      //Add date/times to supabase
      await supabase
        .from("Events")
        .update({
          dates: selectedDateKeys,
          times: UserIdWithTimes,
          status: { ...currentStatus, [username]: "waitingOnOthers" }
        })
        .eq("id", parsedEvent.id);

      await fetchEvent();

      setSelectedTimes(filteredTimes);
      setSubmitted(true);
      setEditingTimes(false);
      setExpandedDate(null);
      checkForEmptyTimesArray(setStatus);
      fetchEvent();
    } catch (error) {
      console.error("Error during insert:", error);
    }

    console.log("Saving selectedTimes:", selectedTimes);
    setExpandedDate(null);
    setEditingTimes(false);
  };

  //Edited event details
  const handleEdit = async () => {
    setSubmitted(false);
  };

  const handleEditEvent = async () => {
    setEditEvent(true);
    console.log("Edit event");
  };

  const handleEditSave = async () => {
    try {
      const { data, error: userError } = await supabase
        .from("Events")
        .update([
          {
            title,
            description
          }
        ])
        .eq("id", parsedEvent.id);

      if (userError) throw userError;

      await fetchEvent();
      console.log("event edited");
    } catch (error) {
      console.error("Error during updating:", error);
    }
    setEditEvent(false);
  };
  //Seperate Views into their own components
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* EVENT HEADER */}
        {!fetchEvent ? (
          <View>
            <Text>Test</Text>
          </View>
        ) : !editEvent ? (
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <View>
              <Text style={{ fontSize: 20, fontWeight: "bold" }}>{title}</Text>
              <Text style={{ marginVertical: 10 }}>{description}</Text>
              <View
                style={[
                  styles.possibleTimesContainer,
                  {
                    backgroundColor:
                      possibleTimes && possibleTimes.length !== 0
                        ? "green"
                        : "red"
                  }
                ]}
              >
                <Text style={styles.possibleTimesTitle}>POSSIBLE TIMES</Text>
                {possibleTimes?.length ? (
                  possibleTimes.map((slot, index) => (
                    <Text style={styles.possibleTimes} key={index}>
                      {slot.date} at {slot.time}
                    </Text>
                  ))
                ) : (
                  <Text style={styles.possibleTimes}>
                    No matching times found
                  </Text>
                )}
              </View>
            </View>
            <Pressable
              onPress={handleEditEvent}
              style={({ hovered, pressed }) => [
                styles.editButton,
                hovered && styles.hover,
                pressed && styles.pressed,
                { alignSelf: "flex-start", marginTop: 2 }
              ]}
            >
              <Icon name="edit" size={24} color="#fff" />
            </Pressable>
          </View>
        ) : (
          <View>
            <TextInput
              style={{
                fontSize: 20,
                fontWeight: "bold",
                borderBottomWidth: 1
              }}
              value={title}
              onChangeText={setTitle}
              placeholder="Title"
            />
            <TextInput
              style={{ marginVertical: 10, borderBottomWidth: 1 }}
              value={description}
              onChangeText={setDescription}
              placeholder="Description"
              multiline
            />
            <Pressable
              onPress={handleEditSave}
              style={({ hovered }) => [
                styles.button,
                hovered && styles.hover,
                pressed && styles.pressed
              ]}
            >
              <Icon name="save" size={20} color="#fff" />
            </Pressable>
          </View>
        )}
        {!submitted ? (
          // CALENDAR VIEW
          <>
            <Calendar
              onDayPress={toggleDate}
              markedDates={selectedDates}
              markingType={"multi-dot"}
            />
            <Pressable
              onPress={() =>
                handleSaveDates(parsedEvent.id, Object.keys(selectedDates))
              }
              style={({ hovered }) => [
                styles.editButton,
                hovered && styles.hover,
                pressed && styles.pressed
              ]}
            >
              <Icon name="save" size={24} color="#fff" />
            </Pressable>
          </>
        ) : editingTimes ? (
          // DATE VIEW (edit times)
          <View>
            <DateView
              selectedDates={selectedDates}
              selectedTimes={selectedTimes}
              toggleTimeForDate={toggleTimeForDate}
              timeSlots={timeSlots}
              expandedDate={expandedDate}
              setExpandedDate={setExpandedDate}
              handleSaveTimes={handleSaveTimes}
              handleEdit={handleEdit}
            />
          </View>
        ) : (
          //Times View
          <View>
            <TimesView
              savedTimes={savedTimes}
              setEditingTimes={setEditingTimes}
            />
          </View>
        )}
        <View>
          <Participants />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

//Same note as index, I'd like to move this somewhere central
const styles = StyleSheet.create({
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
    marginTop: 50,
    marginBottom: 15
  },
  editButton: {
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
  horizontalLine: {
    borderBottomColor: "#ccc",
    borderBottomWidth: 1,
    marginVertical: 10
  },
  text: {
    color: "white",
    fontWeight: "600",
    fontSize: 16
  },
  hover: {
    opacity: 0.9
  },
  pressed: {
    transform: [{ scale: 0.97 }]
  },
  dateCard: {
    backgroundColor: "#F8F8F8",
    margin: 2,
    width: 100,
    height: 100,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    justifyContent: "center",
    alignItems: "center"
  },
  dateContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center"
  },

  dateHeader: {
    height: "33%", // top third
    width: "100%",
    backgroundColor: "#1877F2", // your header color
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10
  },
  dateContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 5,
    width: "100%"
  },
  headerText: {
    color: "white",
    fontWeight: "600",
    fontSize: 22,
    textAlign: "center",
    paddingTop: 4
  },
  contentText: {
    fontSize: 50,
    fontWeight: "bold",
    color: "#333"
  },
  timePanel: {
    backgroundColor: "#FFF",
    borderRadius: 10,
    padding: 8,
    marginBottom: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
    width: 100
  },
  timeOption: {
    paddingVertical: 6,
    alignItems: "center"
  },
  timeOptionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1877F2"
  },
  timeOptionSelected: {
    backgroundColor: "#1877F2",
    borderRadius: 5
  },
  timeOptionTextSelected: {
    color: "#fff",
    fontWeight: "bold"
  },
  possibleTimesTitle: {
    fontWeight: 800,
    fontSize: 30,
    color: "white"
  },
  possibleTimes: {
    fontWeight: 400,
    fontSize: 15,
    color: "white"
  },
  possibleTimesContainer: {
    padding: 15,
    alignItems: "center",
    borderRadius: 15
  }
});
