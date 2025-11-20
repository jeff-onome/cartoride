import firebase from 'firebase/compat/app';
import 'firebase/compat/analytics';
import 'firebase/compat/auth';
import 'firebase/compat/database';
import 'firebase/compat/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA4p6DHQ1W2N7EUo5nPnvHqV9Djql6uoe4",
  authDomain: "car2lift.firebaseapp.com",
  projectId: "car2lift",
  storageBucket: "car2lift.appspot.com",
  messagingSenderId: "11468301741",
  appId: "1:11468301741:web:649618170ed0a01fdded24",
  databaseURL: "https://car2lift-default-rtdb.firebaseio.com"
};

// Initialize Firebase, preventing re-initialization
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

firebase.analytics.isSupported().then(supported => {
  if (supported) {
    try {
      firebase.analytics();
    } catch (e) {
      console.error("Firebase Analytics not supported in this environment.", e);
    }
  }
});


export const auth = firebase.auth();
export const db = firebase.database();
export const storage = firebase.storage();

export default firebase;