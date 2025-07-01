import { useLocalSearchParams } from "expo-router";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  TextInput
} from "react-native";
import { Calendar } from "react-native-calendars";
import { useState, useEffect } from "react";
import supabase from "@/supabaseClient";
import DateView from "@/components/DateView";
import Icon from "react-native-vector-icons/FontAwesome";
import Participants from "@/components/Participants";

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
    [date: string]: string[];
  } | null>(null);
  const [editingTimes, setEditingTimes] = useState(false);
  const [editEvent, setEditEvent] = useState(false);
  const [title, setTitle] = useState(parsedEvent?.title || "");
  const [description, setDescription] = useState(
    parsedEvent?.description || ""
  );

  const fetchEvent = async () => {
    if (!parsedEvent?.id) return;

    setLoading(true);
    const { data, error } = await supabase
      .from("Events")
      .select("dates, title, description, times")
      .eq("id", parsedEvent.id)
      .single();

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
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchEvent();
  }, [parsedEvent?.id]);

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

  // const formatSavedTimes = (times: { [date: string]: string[] }) => {
  //   return Object.entries(times)
  //     .map(([date, slots]) => `${date}: ${slots.join(", ")}`)
  //     .join("\n");
  // };

  const handleSubmit = async (
    eventId: number,
    newDatesObject: { [key: string]: any }
  ) => {
    try {
      const newDatesArray = newDatesObject;
      const { data, error } = await supabase
        .from("Events")
        .update({ dates: newDatesArray })
        .eq("id", eventId);

      if (error) throw error;

      setSubmitted(true);
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

  const handleSave = async () => {
    try {
      const selectedDateKeys = Object.keys(selectedDates);
      const filteredTimes: { [key: string]: string[] } = {};
      selectedDateKeys.forEach((date) => {
        if (selectedTimes[date]) {
          filteredTimes[date] = selectedTimes[date];
        }
      });

      const { data, error } = await supabase
        .from("Events")
        .update({
          dates: selectedDateKeys,
          times: filteredTimes
        })
        .eq("id", parsedEvent.id);

      if (error) throw error;

      setSavedTimes(filteredTimes);
      setSelectedTimes(filteredTimes);
      setSubmitted(true);
      setEditingTimes(false);
      setExpandedDate(null);
    } catch (error) {
      console.error("Error during insert:", error);
    }

    console.log("Saving selectedTimes:", selectedTimes);
    setExpandedDate(null);
    setEditingTimes(false);
  };

  const handleEdit = async () => {
    setSubmitted(false);
  };

  const handleEditEvent = async () => {
    setEditEvent(true);
    console.log("Edit event");
  };

  const handleEditSave = async () => {
    try {
      const { data: userData, error: userError } = await supabase
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

  return (
    <View style={{ flex: 1, padding: 20 }}>
      {!editEvent ? (
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
            style={{ fontSize: 20, fontWeight: "bold", borderBottomWidth: 1 }}
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
              handleSubmit(parsedEvent.id, Object.keys(selectedDates))
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
        <DateView
          selectedDates={selectedDates}
          selectedTimes={selectedTimes}
          toggleTimeForDate={toggleTimeForDate}
          timeSlots={timeSlots}
          expandedDate={expandedDate}
          setExpandedDate={setExpandedDate}
          handleSave={handleSave}
          handleEdit={handleEdit}
        />
      ) : (
        // SAVED TIMES
        <View>
          <View
            style={{
              borderBottomColor: "gray", // Line color
              borderBottomWidth: StyleSheet.hairlineWidth, // Thin line
              marginTop: 16,
              marginBottom: 16
            }}
          />
          <Text style={{ marginVertical: 10, fontWeight: "bold" }}>
            Your selected times:
          </Text>
          <ScrollView style={{ maxHeight: 300 }}>
            {savedTimes &&
              Object.entries(savedTimes).map(([date, times]) => (
                <View key={date} style={{ marginBottom: 20 }}>
                  <Text style={{ fontWeight: "bold", marginBottom: 5 }}>
                    {date}
                  </Text>
                  <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                    {times.map((time) => (
                      <Pressable
                        key={time}
                        style={{
                          backgroundColor: "#1877F2",
                          borderRadius: 6,
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                          margin: 4
                        }}
                      >
                        <Text style={{ color: "white", fontWeight: "600" }}>
                          {time}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              ))}
          </ScrollView>
          <Pressable
            onPress={() => setEditingTimes(true)}
            style={({ hovered }) => [
              styles.editButton,
              hovered && styles.hover,
              pressed && styles.pressed
            ]}
          >
            <Icon name="edit" size={24} color="#fff" />
          </Pressable>
        </View>
      )}
      <View>
        <View
          style={{
            borderBottomColor: "gray", // Line color
            borderBottomWidth: StyleSheet.hairlineWidth, // Thin line
            marginTop: 16,
            marginBottom: 16
          }}
        />
        <Text>Participants</Text>
      </View>
    </View>
  );
}

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
  }
});
