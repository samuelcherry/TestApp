import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert
} from "react-native";
import supabase from "@/supabaseClient";
import { router } from "expo-router";

export default function AuthScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [isSignup, setIsSignUp] = useState(false);

  const handleAuth = async () => {
    if (isSignup) {
      await handleRegistration();
    } else {
      await handleLogin();
    }
  };

  const handleRegistration = async () => {
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp(
      {
        email,
        password
      }
    );

    if (signUpError) {
      Alert.alert("Registration error", signUpError.message);
      return;
    }

    const userId = signUpData?.user?.id;

    if (userId) {
      const { error: profileError } = await supabase.from("profiles").insert([
        {
          id: userId,
          username
        }
      ]);

      if (profileError) {
        Alert.alert("Profile creation error", profileError.message);
        return;
      }

      Alert.alert("Success", "Check your email to confirm registration.");
    }
  };
  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      Alert.alert("Login error", error.message);
    } else {
      Alert.alert("Logged in!");
      router.replace("/(tabs)/" as const);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{isSignup ? "Register" : "Login"}</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        onChangeText={setEmail}
        value={email}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        autoCapitalize="none"
        secureTextEntry
        onChangeText={setPassword}
        value={password}
      />

      {isSignup && (
        <TextInput
          style={styles.input}
          placeholder="Username"
          autoCapitalize="none"
          onChangeText={setUsername}
          value={username}
        />
      )}

      <Pressable style={styles.button} onPress={handleAuth}>
        <Text style={styles.buttonText}>{isSignup ? "Register" : "Login"}</Text>
      </Pressable>

      <Pressable onPress={() => setIsSignUp(!isSignup)}>
        <Text style={styles.switch}>
          {isSignup
            ? "Already have an account? Login"
            : "Don't have an account? Register"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    marginBottom: 10,
    borderRadius: 5
  },
  button: {
    backgroundColor: "#4e8cff",
    padding: 12,
    borderRadius: 5,
    alignItems: "center"
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
  switch: { textAlign: "center", marginTop: 12, color: "#4e8cff" }
});
