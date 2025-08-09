import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import React from "react";
import Icon from "react-native-vector-icons/FontAwesome";

interface TimesViewProps {
  savedTimes: {
    [username: string]: { [date: string]: string[] };
  } | null;
  setEditingTimes: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function TimesView({
  savedTimes,
  setEditingTimes
}: TimesViewProps) {
  return (
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
          Object.entries(savedTimes).map(([username, dates]) => (
            <View key={username} style={{ marginBottom: 20 }}>
              <Text
                style={{
                  fontWeight: "bold",
                  fontSize: 16,
                  marginBottom: 10,
                  color: "#333"
                }}
              >
                {username}
              </Text>
              {Object.entries(
                dates as unknown as { [date: string]: string[] }
              ).map(([date, times]) => (
                <View key={date}>
                  <Text>{date}</Text>
                  <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                    {Array.isArray(times) &&
                      times.map((time: string) => (
                        <Pressable
                          key={`${date}-${time}`}
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
            </View>
          ))}
      </ScrollView>
      <Pressable
        onPress={() => setEditingTimes(true)}
        style={({ hovered }) => [styles.editButton, hovered && styles.hover]}
      >
        <Icon name="edit" size={24} color="#fff" />
      </Pressable>
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
