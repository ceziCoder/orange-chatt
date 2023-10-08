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
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { auth, database } from "../config/firebase";
import { useNavigation } from "@react-navigation/native";
import { AntDesign } from "@expo/vector-icons";
import colors from "../colors";

import { Chat, MessageType } from "@flyerhq/react-native-chat-ui";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function Chatt() {
  const [messages, setMessages] = useState([]);
  const navigation = useNavigation();

  const onSignOut = () => {
    signOut(auth)
      .catch((error) => alert(error.message));
  }


  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={{
            marginRight: 10
          }}
          onPress={onSignOut}
        >
          <AntDesign name="logout" size={24} color={colors.gray} style={{marginRight: 10}}/>
        </TouchableOpacity>
      )
    });
  }, [navigation]);

  useLayoutEffect(() => {

    const collectionRef = collection(database, 'chats');
    const q = query(collectionRef, orderBy('createdAt', 'desc'));

const unsubscribe = onSnapshot(q, querySnapshot => {
    console.log('querySnapshot unsusbscribe');
      setMessages(
        querySnapshot.docs.map(doc => ({
          _id: doc.data()._id,
          createdAt: doc.data().createdAt.toDate(),
          text: doc.data().text,
          user: doc.data().user
        }))
      );
    });
return unsubscribe;
  }, [])

  return <GiftedChat></GiftedChat>;
}
