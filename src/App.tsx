import { useEffect } from 'react';
import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';

function App() {
  useEffect(() => {
    const checkFirebaseConnection = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "menu-items"));
        console.log("Successfully connected to Firestore!");
        querySnapshot.forEach((doc) => {
          console.log("Found a document with ID: ", doc.id);
        });
      } catch (error) {
        console.error("Error connecting to Firebase:", error);
      }
    };

    checkFirebaseConnection();
  }, []);

  return (
    <div>
      <h1>My Allergy Matrix App</h1>
    </div>
  );
}

export default App;
