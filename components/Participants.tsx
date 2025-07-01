import React from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  TextInput
} from "react-native";

const Participants = () => {
  return (
    <div>
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
    </div>
  );
};

export default Participants;
