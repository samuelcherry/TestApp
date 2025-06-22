import { useLocalSearchParams } from "expo-router";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  ScrollView
} from "react-native";
import { Calendar } from "react-native-calendars";
import { useState, useEffect } from "react";
import supabase from "@/supabaseClient";

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
  const [isExpanded, setIsExpanded] = useState(null);
  const [selectedTimes, setSelectedTimes] = useState<{
    [date: string]: string[];
  }>({});
  const [savedTimes, setSavedTimes] = useState<{
    [date: string]: string[];
  } | null>(null);

  useEffect(() => {
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
      }

      setLoading(false);
    };

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

  const formatSavedTimes = (times: { [date: string]: string[] }) => {
    return Object.entries(times)
      .map(([date, slots]) => `${date}: ${slots.join(", ")}`)
      .join("\n");
  };

  const handleSubmit = async (
    eventId: number,
    newDatesObject: { [key: string]: any }
  ) => {
    try {
      const newDatesArray = Object.keys(newDatesObject);
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
      for (let minute = 0; minute < 60; minute += 15) {
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
      const { data, error } = await supabase
        .from("Events")
        .update({ times: selectedTimes })
        .eq("id", parsedEvent.id);

      if (error) throw error;
    } catch (error) {
      console.error("Error during insert:", error);
    }

    console.log("Saving selectedTimes:", selectedTimes);
    setExpandedDate(null);
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: "bold" }}>
        {parsedEvent?.title}
      </Text>
      <Text style={{ marginVertical: 10 }}>{parsedEvent?.description}</Text>
      <Text style={{ marginBottom: 20 }}>{parsedEvent?.date}</Text>

      {!submitted ? (
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
              styles.button,
              hovered && styles.hover,
              pressed && styles.pressed
            ]}
          >
            <Text style={styles.text}>Submit</Text>
          </Pressable>
        </>
      ) : savedTimes && Object.keys(savedTimes).length > 0 ? (
        // Saved times summary view
        <View>
          <Text style={{ marginVertical: 10, fontWeight: "bold" }}>
            Your selected times:
          </Text>
          <Text>{formatSavedTimes(savedTimes)}</Text>
        </View>
      ) : (
        <View>
          <View style={styles.dateContainer}>
            {Object.keys(selectedDates).map((date, index) => {
              const dateObj = new Date(date);
              const monthName = dateObj.toLocaleString("default", {
                month: "short"
              }); // e.g., "Jun"
              const day = dateObj.getDate(); // e.g., 4
              const isExpanded = expandedDate === date;
              return (
                <View key={index} style={{ alignItems: "center" }}>
                  {isExpanded && (
                    <View style={styles.timePanel}>
                      <ScrollView style={{ maxHeight: 200 }}>
                        {timeSlots.map((slot, i) => {
                          const isSelected =
                            selectedTimes[date]?.includes(slot);
                          return (
                            <TouchableOpacity
                              key={i}
                              style={[
                                styles.timeOption,
                                isSelected && styles.timeOptionSelected
                              ]}
                              onPress={() => toggleTimeForDate(date, slot)}
                            >
                              <Text
                                style={[
                                  styles.timeOptionText,
                                  isSelected && styles.timeOptionTextSelected
                                ]}
                              >
                                {slot}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </ScrollView>
                    </View>
                  )}
                  <TouchableOpacity
                    style={styles.dateCard}
                    onPress={() =>
                      setExpandedDate((prev) => (prev === date ? null : date))
                    }
                  >
                    <View style={styles.dateHeader}>
                      <Text style={styles.headerText}>{monthName}</Text>
                    </View>
                    <View style={styles.dateContent}>
                      <Text style={styles.contentText}>{day}</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
          <Pressable
            onPress={handleSave}
            style={({ hovered, pressed }) => [
              styles.button,
              hovered && styles.hover,
              pressed && styles.pressed,
              { marginTop: 10 }
            ]}
          >
            <Text style={styles.text}>Save</Text>
          </Pressable>
        </View>
      )}
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
