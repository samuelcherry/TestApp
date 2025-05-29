import { useLocalSearchParams } from "expo-router";
import { View, Text } from "react-native";

export default function EventDetailsScreen() {
  const { event } = useLocalSearchParams();

  const parsedEvent = event ? JSON.parse(event as string) : null;

  return (
    <View>
      <Text>{parsedEvent?.title}</Text>
      <Text>{parsedEvent?.description}</Text>
      <Text>{parsedEvent?.date}</Text>
    </View>
  );
}
