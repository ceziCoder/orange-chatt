import React, {
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
} from "react";
import { TouchableOpacity, Text } from "react-native";
import { GiftedChat } from "react-native-gifted-chat";
import {
  collection,
  addDoc,
  orderBy,
  query,
  onSnapshot,
  where,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { signOut, browserSessionPersistence, setPersistence, getAuth } from "firebase/auth";
import { auth, database, storage } from "../config/firebase";
import { useNavigation } from "@react-navigation/native";
import { AntDesign } from "@expo/vector-icons";
import colors from "../colors";
import { Chat, MessageType } from "@flyerhq/react-native-chat-ui";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { SafeAreaView } from "react-native-safe-area-context";
import moment from "moment";
import { ChatHeader } from "../components/chatheader";

export default function Chatt() {
  const [messages, setMessages] = useState([]);
  const navigation = useNavigation();
  const user = auth.currentUser;
  const [users, setUsers] = useState([]);

  const avatarUrl = user ? user.photoURL : null;




  const onSignOut = async () => {
    if (auth.currentUser) {
      const userRef = doc(database, "users", auth.currentUser.uid);

      // Sprawdź, czy dokument istnieje
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        // Dokument istnieje, zaktualizuj go
        await updateDoc(userRef, { isActive: false });
      } else {
        console.log("Dokument użytkownika nie istnieje. Sprawdź, czy użytkownik został poprawnie zapisany.");
      }
    }

    signOut(auth).catch((error) => alert(error.message));
  };

  useLayoutEffect(() => {
    if (auth.currentUser) {
      navigation.setOptions({
        headerRight: () => (
          <TouchableOpacity
            style={{
              marginRight: 10,
            }}
            onPress={onSignOut}
          >
            <AntDesign
              name="logout"
              size={24}
              color={colors.gray}
              style={{ marginRight: 10 }}
            />
          </TouchableOpacity>
        ),
      });
    }
  }, [navigation, auth.currentUser]); // Dodaj auth.currentUser do zależności


  useLayoutEffect(() => {
    const collectionRef = collection(database, "chats");
    const q = query(collectionRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      console.log("querySnapshot unsusbscribe");
      setMessages(
        querySnapshot.docs.map((doc) => ({
          _id: doc.data()._id,
          createdAt: doc.data().createdAt.toDate(),
          text: doc.data().text,
          user: doc.data().user,
        }))
      );
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const usersRef = collection(database, "users");
    const q = query(usersRef, where("isActive", "==", true));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log("Snapshot:", snapshot.docs);
      const usersList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log("Aktywni użytkownicy:", usersList);
      setUsers(usersList);
    });

    return unsubscribe;
  }, []);

  const onSend = useCallback((messages = []) => {
    setMessages((previousMessages) =>
      GiftedChat.append(previousMessages, messages)
    );
    // setMessages([...messages, ...messages]);
    const { _id, createdAt, text, user } = messages[0];
    addDoc(collection(database, "chats"), {
      _id,
      createdAt,
      text,
      user,


    });
  }, []);

  // Funkcja do renderowania czasu wiadomości
  const renderTime = (props) => {
    return (
      <Text style={{ fontSize: 10, color: "#999", marginHorizontal: 10 }}>
        {moment(props.currentMessage.createdAt).format("HH:mm")} {/* Formatowanie czasu */}
      </Text>
    );
  };

  useEffect(() => {
    console.log("Active users:", users);
  }, [users]);




  return (
    <SafeAreaProvider>
      <ChatHeader users={users} />
      <SafeAreaView style={{ flex: 1 }}>

        <GiftedChat
          // Dodaj nagłówek
          messages={messages}
          showAvatarForEveryMessage={true}
          showUserAvatar={true}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          onSend={(messages) => onSend(messages)}
          messagesContainerStyle={{
            backgroundColor: "#fff",
          }}
          textInputStyle={{
            backgroundColor: "#fff",
            borderRadius: 20,
            margin: 10,
            marginTop: 5,
            padding: 10,
          }}
          user={{
            _id: auth?.currentUser?.email,
            avatar: avatarUrl || 'https://i.pravatar.cc/300',
          }}
          renderTime={renderTime}
        />

      </SafeAreaView>
    </SafeAreaProvider>

  );
}
