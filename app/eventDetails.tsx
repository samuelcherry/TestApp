import { useLocalSearchParams } from "expo-router";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  TouchableOpacity
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

  useEffect(() => {
    const fetchEvent = async () => {
      if (!parsedEvent?.id) return;

      setLoading(true);
      const { data, error } = await supabase
        .from("Events")
        .select("dates, title, description")
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
      ) : (
        <View style={styles.dateContainer}>
          {Object.keys(selectedDates).map((date, index) => {
            const dateObj = new Date(date);
            const monthName = dateObj.toLocaleString("default", {
              month: "short"
            }); // e.g., "Jun"
            const day = dateObj.getDate(); // e.g., 4

            return (
              <TouchableOpacity key={index} style={styles.dateCard}>
                <View style={styles.dateHeader}>
                  <Text style={styles.headerText}>{monthName}</Text>
                </View>
                <View style={styles.dateContent}>
                  <Text style={styles.contentText}>{day}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
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
  }
});
