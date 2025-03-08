import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";

export const ChatHeader = ({ users }) => {
  console.log("Users in ChatHeader:", users);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Akcive</Text>
      <View style={styles.userList}>
        {users.map((user, index) => (
          <View key={user.uid} style={[styles.user, { zIndex: users.length - index }]}>
            <Image source={{ uri: user.avatar || "https://i.pravatar.cc/300" }} style={styles.avatar} />
            <Text style={styles.username}>{user.name}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  userList: {
    flexDirection: "row", // Align users horizontally
    justifyContent: "flex-start",
    alignItems: "center",
  },
  user: {
    marginLeft: -15, // Negative margin to make the avatars overlap
    alignItems: "center",
    padding: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#fff", // Add a white border around the avatar for better visibility
  },
  username: {
    fontSize: 12,
    color: "#333",
    marginTop: 5,
  },
});
