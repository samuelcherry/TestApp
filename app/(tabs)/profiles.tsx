import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  TextInput
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const profiles = () => {
  const [uuid, setUuid] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const loadUserData = async () => {
      const uuid = await AsyncStorage.getItem("uuid");
      const username = await AsyncStorage.getItem("username");

      setUuid(uuid);
      setUsername(username);
    };

    loadUserData();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>
        {username ? `Welcome, ${username}!` : "Loading..."}
      </Text>
    </View>
  );
};

export default profiles;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff"
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold"
  }
});
