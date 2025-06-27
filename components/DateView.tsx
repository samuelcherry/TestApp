import { useLocalSearchParams } from "expo-router";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  ScrollView
} from "react-native";
import React from "react";

interface DateViewProps {
  selectedDates: { [key: string]: any };
  selectedTimes: { [date: string]: string[] };
  toggleTimeForDate: (date: string, time: string) => void;
  timeSlots: string[];
  expandedDate: string | null;
  setExpandedDate: React.Dispatch<React.SetStateAction<string | null>>;
  handleSave: () => void;
  handleEdit: () => void;
}

export default function DateView({
  selectedDates,
  selectedTimes,
  toggleTimeForDate,
  timeSlots,
  expandedDate,
  setExpandedDate,
  handleSave,
  handleEdit
}: DateViewProps) {
  return (
    <View>
      <View style={styles.dateContainer}>
        {Object.keys(selectedDates).map((date, index) => {
          const [year, month, dayStr] = date.split("-");
          const day = parseInt(dayStr, 10);
          const monthName = new Date(`${year}-${month}-01`).toLocaleString(
            "default",
            {
              month: "short"
            }
          );
          const isExpanded = expandedDate === date;

          return (
            <View key={index} style={{ alignItems: "center" }}>
              {isExpanded && (
                <View style={styles.timePanel}>
                  <ScrollView style={{ maxHeight: 200 }}>
                    {timeSlots.map((slot, i) => {
                      const isSelected = selectedTimes[date]?.includes(slot);
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
      <View style={styles.buttonContainer}>
        <Pressable
          onPress={handleEdit}
          style={({ hovered, pressed }) => [
            styles.button,
            hovered && styles.hover,
            pressed && styles.pressed
          ]}
        >
          <Text style={styles.text}>Edit</Text>
        </Pressable>
        <Pressable
          onPress={handleSave}
          style={({ hovered, pressed }) => [
            styles.button,
            hovered && styles.hover,
            pressed && styles.pressed
          ]}
        >
          <Text style={styles.text}>Save</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignContent: "center"
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
    marginTop: 50,
    marginBottom: 15,
    marginLeft: 15,
    alignContent: "center"
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
