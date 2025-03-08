import { useEffect, useRef } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, database } from "../config/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { AppState } from "react-native";

const AUTO_LOGOUT_TIME = 1 * 60 * 1000; // 1 minuta w milisekundach

export const useAutoLogout = () => {
  const lastActivityTime = useRef(Date.now()); // Czas ostatniej aktywności
  const timeoutRef = useRef(null); // Ref do przechowywania timeoutu wylogowania

  // Funkcja aktualizująca status użytkownika (online/offline)
  const updateUserStatus = async (isActive) => {
    if (!auth.currentUser) return;
    const userRef = doc(database, "users", auth.currentUser.uid);

    console.log(`🟢 updateUserStatus(${isActive}) dla UID: ${auth.currentUser.uid}`);

    try {
      await updateDoc(userRef, { isActive });
      console.log(`✅ Status użytkownika (${isActive}) zapisany w Firebase.`);
    } catch (error) {
      console.error("❌ Błąd przy aktualizowaniu statusu użytkownika:", error);
    }
  };

  // Funkcja wylogowująca użytkownika
  const logoutUser = async () => {
    console.log("⏰ Wylogowanie użytkownika z powodu braku aktywności.");

    // Wylogowanie użytkownika i ustawienie statusu na offline
    await updateUserStatus(false);
    await signOut(auth);
  };

  // Funkcja do sprawdzania czasu nieaktywności
  const checkInactivity = () => {
    const currentTime = Date.now();
    if (currentTime - lastActivityTime.current > AUTO_LOGOUT_TIME) {
      logoutUser();
    } else {
      // Jeśli nie minęło 1 minuta, ustaw nowy timeout na 1 minutę
      timeoutRef.current = setTimeout(checkInactivity, AUTO_LOGOUT_TIME);
    }
  };

  // Funkcja monitorująca aktywność użytkownika
  const handleActivity = () => {
    lastActivityTime.current = Date.now(); // Zaktualizuj czas ostatniej aktywności

    // Resetuj poprzedni timeout, jeśli jest aktywny
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Ustaw nowy timeout na 1 minutę
    timeoutRef.current = setTimeout(checkInactivity, AUTO_LOGOUT_TIME);
  };

  useEffect(() => {
    let currentUserUid = auth.currentUser ? auth.currentUser.uid : null;

    // Monitorowanie logowania użytkownika
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        currentUserUid = user.uid;
        updateUserStatus(true); // Użytkownik online
        handleActivity(); // Rozpocznij monitorowanie aktywności
      } else {
        currentUserUid = null;
        updateUserStatus(false); // Użytkownik offline
      }
    });

    // Nasłuchiwanie na zmiany AppState
    const handleAppStateChange = (nextAppState) => {
      console.log(`📱 AppState zmienił się na: ${nextAppState}`);
      if (nextAppState === "background" || nextAppState === "inactive") {
        updateUserStatus(false); // Użytkownik offline
      } else if (nextAppState === "active") {
        updateUserStatus(true); // Użytkownik wrócił do aplikacji
        handleActivity(); // Zaktualizuj czas aktywności
      }
    };

    // Obsługuje zmiany w stanie aplikacji (active, background, inactive)
    const appStateListener = AppState.addEventListener("change", handleAppStateChange);

    // Zainicjowanie monitorowania aktywności
    const touchListener = () => handleActivity();
    AppState.addEventListener("change", touchListener);

    return () => {
      unsubscribeAuth();
      appStateListener.remove();
      clearTimeout(timeoutRef.current);
      AppState.removeEventListener("change", touchListener);
    };
  }, []);

  return null;
};
