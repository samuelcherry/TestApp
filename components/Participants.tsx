import React from "react";
import { View, Text, StyleSheet, TextInput } from "react-native";

export const Participants = () => {
  return (
    <View>
      {" "}
      <View
        style={{
          borderBottomColor: "gray", // Line color
          borderBottomWidth: StyleSheet.hairlineWidth, // Thin line
          marginTop: 16,
          marginBottom: 16
        }}
      />
      <Text>Participants</Text>
      <TextInput style={styles.input} placeholder="participants" />
    </View>
  );
};

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: "#aaa",
    padding: 12,
    borderRadius: 6,
    marginTop: 4,
    backgroundColor: "#fff"
  }
});
