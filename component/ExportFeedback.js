import { collection, getDocs } from "firebase/firestore";
import * as XLSX from "xlsx";
import { db } from "../firebaseConfig"; // Adjust path as necessary
import Swal from "sweetalert2";

const ExportFeedback = async () => {
  try {
    const registrationsRef = collection(db, "registerations");
    const querySnapshot = await getDocs(registrationsRef);

    const feedbackData = [];

    querySnapshot.forEach((doc) => {
      const userData = doc.data();
      if (userData.feedback) {
        feedbackData.push({
          phoneNumber: doc.id, // Phone number as document ID
          userName: userData.Name || "Unknown",
          ...userData.feedback, // Spread feedback responses
        });
      }
    });

    if (feedbackData.length === 0) {
      Swal.fire({
        icon: "info",
        title: "No Feedback Found",
        text: "No feedback data is available for export.",
      });
      return;
    }

    // Convert JSON to Excel format
    const worksheet = XLSX.utils.json_to_sheet(feedbackData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Feedback");

    // Download the Excel file
    XLSX.writeFile(workbook, `Feedback_${new Date().toISOString().split('T')[0]}.xlsx`);

    Swal.fire({
      icon: "success",
      title: "Export Successful",
      text: "Feedback data has been exported successfully!",
    });

  } catch (error) {
    console.error("Error exporting feedback:", error);
    Swal.fire({
      icon: "error",
      title: "Export Failed",
      text: "Failed to export feedback. Please try again.",
    });
  }
};

const ExportButton = () => {
  return (
    <button className="export-btn" onClick={ExportFeedback}>
      Export Feedback to Excel
    </button>
  );
};

export default ExportButton;
