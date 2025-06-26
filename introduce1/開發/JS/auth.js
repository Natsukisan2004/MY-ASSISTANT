import { loadEvents } from './eventStorage.js';
import { setEvents, createCalendar } from './calendar.js';

let authReadyCallback = null;

export function initAuth() {
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      const userUId = user.uid;
      const userName = user.displayName;

      localStorage.setItem("userUId", userUId);
      localStorage.setItem("userName", userName);

      if (typeof authReadyCallback === 'function') {
        authReadyCallback(userUId, userName);
      }
    } else {
      console.error("ユーザーがログインしていません");
      window.location.href = "index.html";
    }
  });
}

export function onAuthReady(callback) {
  authReadyCallback = callback;
}
