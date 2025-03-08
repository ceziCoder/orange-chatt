import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  Alert,
  TextInput,
  Image,
} from "react-native";
import { createUserWithEmailAndPassword, updateProfile, getAuth, browserSessionPersistence } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL, getStorage } from "firebase/storage";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { auth, database } from "../config/firebase";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";


const backImage = require("../assets/or.jpg");

export default function Signup({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [imageUrl, setImageUrl] = useState(null);

  const auth = getAuth();
  const storage = getStorage();

  

  const onHandleSignup = async () => {
    if (email !== "" && password !== "") {
      try {
        const authUser = await createUserWithEmailAndPassword(auth, email, password);

        let photoURL = null;
        if (imageUrl) {
          photoURL = await uploadImageAndUpdateProfile(imageUrl, authUser.user.uid);
        }

        await updateProfile(authUser.user, {
          displayName: email.split("@")[0],
          photoURL: photoURL || null,
        });
        updateUserStatus()
        Alert.alert("Sukces", "Rejestracja zakończona pomyślnie!");
      } catch (err) {
        Alert.alert("Błąd rejestracji", err.message);
      }
    } else {
      Alert.alert("Błąd", "Wprowadź email i hasło.");
    }
  };

  const selectImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert("Błąd", "Uprawnienia do dostępu do galerii są wymagane.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      if (result.assets.length > 0) {
        // Kompresja obrazu po jego wyborze
        const compressedImage = await compressImage(result.assets[0].uri);
        setImageUrl(compressedImage.uri);
      }
    }
  };

  const uploadImageAndUpdateProfile = async (fileUri, userId) => {
    try {
      const response = await fetch(fileUri);
      const blob = await response.blob();
      const filename = `profile_pictures/${userId}.jpg`;
      const storageRef = ref(storage, filename);
      await uploadBytes(storageRef, blob);
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error("Błąd przesyłania zdjęcia:", error);
      throw error;
    }
  };

  const updateUserStatus = async () => {
    if (auth.currentUser) {
      const userRef = doc(database, "users", auth.currentUser.uid);

      // Zaloguj dane, które chcesz zapisać
      console.log("Updating user status:", {
        name: auth.currentUser.displayName || "Anonim",
        avatar: auth.currentUser.photoURL || "https://i.pravatar.cc/300",
        isActive: true
      });

      // Zaktualizuj użytkownika z domyślnymi wartościami
      await setDoc(userRef, {
        name: auth.currentUser.displayName || "Anonim",
        avatar: auth.currentUser.photoURL || "https://i.pravatar.cc/300",
        isActive: true
      }, { merge: true }); // Merge zapewnia, że inne dane nie zostaną nadpisane
    }
  };
    // Wywołaj funkcję po zalogowaniu
   useEffect(() => {
      updateUserStatus();
   }, []);

  const compressImage = async (uri) => {
    try {
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 600 } }], // Zmniejsz do szerokości 600px
        {
          compress: 0.3, // Kompresja do 30% oryginalnej jakości (możesz dostosować)
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );
      return manipulatedImage;
    } catch (error) {
      console.error("Błąd kompresji obrazu:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={backImage} style={styles.backImage} />
      <View style={styles.whiteSheet} />
      <SafeAreaView style={styles.form}>
        <Text style={styles.title}>Sign Up</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter email"
          autoCapitalize="none"
          keyboardType="email-address"
          textContentType="emailAddress"
          autoFocus={true}
          value={email}
          onChangeText={(text) => setEmail(text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Enter password"
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry={true}
          textContentType="password"
          value={password}
          onChangeText={(text) => setPassword(text)}
        />
        {imageUrl && (
          <Image source={{ uri: imageUrl }} style={{ width: 100, height: 100, alignSelf: "center", marginBottom: 20 }} />
        )}
        <TouchableOpacity onPress={selectImage} style={[styles.button, { backgroundColor: "#4CAF50", marginBottom: 20 }]}>
          <Text style={{ fontWeight: "bold", color: "#fff", fontSize: 18 }}>Choose Image</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={onHandleSignup}>
          <Text style={{ fontWeight: "bold", color: "#fff", fontSize: 18 }}>Sign Up</Text>
        </TouchableOpacity>
        <View style={{ marginTop: 20, flexDirection: "row", alignItems: "center", alignSelf: "center" }}>
          <Text style={{ color: "gray", fontWeight: "600", fontSize: 14 }}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={{ color: "#f57c00", fontWeight: "600", fontSize: 14 }}>Log In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
      <StatusBar barStyle="light-content" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "orange",
    alignSelf: "center",
    paddingBottom: 24,
  },
  input: {
    backgroundColor: "#F6F7FB",
    height: 58,
    marginBottom: 20,
    fontSize: 16,
    borderRadius: 10,
    padding: 12,
  },
  backImage: {
    width: "100%",
    height: 340,
    position: "absolute",
    top: 0,
    resizeMode: "cover",
  },
  whiteSheet: {
    width: "100%",
    height: "75%",
    position: "absolute",
    bottom: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 60,
  },
  form: {
    flex: 1,
    justifyContent: "center",
    marginHorizontal: 30,
  },
  button: {
    backgroundColor: "#f57c00",
    height: 58,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
  },
});
