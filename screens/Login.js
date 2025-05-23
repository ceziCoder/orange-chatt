import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, Button, TextInput, Image, SafeAreaView, TouchableOpacity, StatusBar, Alert } from "react-native";
import { signInWithEmailAndPassword, setPersistence, browserSessionPersistence, getAuth } from "firebase/auth";
import { auth, database } from "../config/firebase";
import { doc, setDoc, updateDoc } from "firebase/firestore";
const backImage = require("../assets/or.jpg");




export default function Login({ navigation }) {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");


    const onHandleLogin = () => {
        if (email !== "" && password !== "") {
          signInWithEmailAndPassword(auth, email, password)

            .then(() => {
              Alert.alert("Login success")

              // After successful login, update the user status
              updateUserStatus();


            })

                .catch((err) => Alert.alert("Login error", err.message));
        }
    }




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
    }, { merge: true });// Merge zapewnia, że inne dane nie zostaną nadpisane
  }
};

  ///
  // Wywołaj funkcję po zalogowaniu
// useEffect(() => {
  //  updateUserStatus();
 // }, []);


    return (

      <View style={styles.container}>
      <Image source={backImage} style={styles.backImage} />
      <View style={styles.whiteSheet} />
      <SafeAreaView style={styles.form}>
        <Text style={styles.title}>Log In</Text>
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
      <TouchableOpacity style={styles.button} onPress={onHandleLogin}>
        <Text style={{fontWeight: 'bold', color: '#fff', fontSize: 18}}> Log In</Text>
      </TouchableOpacity>
      <View style={{marginTop: 20, flexDirection: 'row', alignItems: 'center', alignSelf: 'center'}}>
        <Text style={{color: 'gray', fontWeight: '600', fontSize: 14}}>Don't have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
          <Text style={{color: '#f57c00', fontWeight: '600', fontSize: 14}}> Sign Up</Text>
        </TouchableOpacity>
      </View>
      </SafeAreaView>
      <StatusBar barStyle="light-content" />
    </View>




    )

  }

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#fff",
    },
    title: {
      fontSize: 36,
      fontWeight: 'bold',
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
      resizeMode: 'cover',
    },
    whiteSheet: {
      width: '100%',
      height: '75%',
      position: "absolute",
      bottom: 0,
      backgroundColor: '#fff',
      borderTopLeftRadius: 60,
    },
    form: {
      flex: 1,
      justifyContent: 'center',
      marginHorizontal: 30,
    },
    button: {
      backgroundColor: '#f57c00',
      height: 58,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 40,
    },
  });