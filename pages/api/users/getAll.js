import { db } from "../../../firebaseConfig";  // Correct path to your Firebase config
import { collection, getDocs } from "firebase/firestore";

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const usersCollection = collection(db, "registerations");
      const snapshot = await getDocs(usersCollection);
      const usersList = snapshot.docs.map((doc) => doc.data());

      res.status(200).json({ users: usersList });
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
