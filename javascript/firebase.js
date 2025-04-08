import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDGUh3XUEWXyIsknEW80GdAgQaYPMXF940",
  authDomain: "copy-and-paste-20a70.firebaseapp.com",
  projectId: "copy-and-paste-20a70",
  storageBucket: "copy-and-paste-20a70.firebasestorage.app",
  messagingSenderId: "351356462120",
  appId: "1:351356462120:web:2be213e2c3e1f4d77b411d"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export async function getFiles() {
  const docRef = doc(db, "copy-and-paste", "37cBpb4hJmmtHVJGAath");
  const snapshot = await getDoc(docRef);
  return snapshot.exists() ? snapshot.data().items : [];
}

export async function saveFiles(items) {
  const docRef = doc(db, "copy-and-paste", "37cBpb4hJmmtHVJGAath");
  await setDoc(docRef, { items });
}
