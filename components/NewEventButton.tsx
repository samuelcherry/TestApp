import { Pressable, Text, StyleSheet } from "react-native";
import React, { useState } from "react";

interface NewEventButtonProps {
  title: string;
  onPress: () => void;
}

const NewEventButton: React.FC<NewEventButtonProps> = ({ title, onPress }) => {
  const [pressed, setPressed] = useState(false);

  return (
    <Pressable
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      onPress={() => {
        console.log("New Event Pressed");
        onPress(); // Call the passed onPress function from parent
      }}
      style={({ hovered }) => [
        styles.button,
        hovered && styles.hover,
        pressed && styles.pressed
      ]}
    >
      <Text style={styles.text}>New Event</Text>
    </Pressable>
  );
};

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
  }
});

export default NewEventButton;
