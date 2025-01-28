import { db } from "../../firebaseConfig"; // Ensure firebaseConfig is correctly set up
import { doc, getDoc, setDoc } from "firebase/firestore";

export default async function handler(req, res) {
  const { method } = req;

  if (method === "POST") {
    const { phoneNumber } = req.body;

    try {
      const userDoc = doc(db, "userdetails", phoneNumber);
      const userSnap = await getDoc(userDoc);

      if (userSnap.exists()) {
        // Return the user's details from the userdetails table
        res.status(200).json({ user: userSnap.data() });
      } else {
        // User is not found in the company database
        res.status(404).json({ error: "User not found" });
      }
    } catch (error) {
      console.error("Error retrieving user:", error);
      res.status(500).json({ error: "Failed to retrieve user" });
    }
  } else if (method === "PUT") {
    const { phoneNumber, userData } = req.body;

    try {
      console.log("Received PUT request for user:", phoneNumber);
      console.log("User Data:", userData);

      // Check if the user exists in the userdetails table
      const userDoc = doc(db, "userdetails", phoneNumber);
      const userSnap = await getDoc(userDoc);

      if (userSnap.exists()) {
        // User is part of the company, retain their existing category
        const existingCategory = userSnap.data().Category || "Unknown";
        userData.Category = existingCategory; // Use the correct category from the database
      } else {
        // User is a guest, set Category and validate required fields
        userData.Category = "Guest"; // Capitalize the "C" in guest
        userData["Mobile no"] = phoneNumber; // Save the entered mobile number

        if (!userData.Name || !userData.relativeOf) {
          return res.status(400).json({
            error: "Guest users must provide name and relativeOf fields.",
          });
        }
      }

      // Save the registration data to the registereduser table
      const registeredUserDoc = doc(db, "registerations", phoneNumber);
      await setDoc(registeredUserDoc, userData, { merge: true });

      res.status(200).json({ message: "User registered successfully." });
    } catch (error) {
      console.error("Error writing to Firestore:", error);
      res.status(500).json({ error: "Failed to register user." });
    }
  } else {
    res.status(405).json({ error: "Method not allowed." });
  }
}
