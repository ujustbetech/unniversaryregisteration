import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { db } from "../../firebaseConfig";
import { doc, getDoc, collection, addDoc, updateDoc } from "firebase/firestore";
import QrScanner from "react-qr-scanner";
import Link from "next/link";
import "../event.css";

const RegisterPage = () => {
  const router = useRouter();
  const { phoneNumber } = router.query;
  const [success, setSuccess] = useState(false); // Tracks if the user has registered
  const [userDetails, setUserDetails] = useState(null); // Stores user details
  const [attendanceMarked, setAttendanceMarked] = useState(false); // Tracks if attendance is marked
  const [showScanner, setShowScanner] = useState(false); // Toggles the QR scanner
  const [scannedData, setScannedData] = useState(null); // Stores scanned QR data
  const [isAllowedDate, setIsAllowedDate] = useState(false); // Tracks if the current date matches 30/01/2025
  const [feedbackVisible, setFeedbackVisible] = useState(false); // Tracks if feedback should be visible

  useEffect(() => {
    const registerUser = async () => {
      try {
        // Add the registration data to Firestore
        await addDoc(collection(db, "registration"), {
          phoneNumber: phoneNumber,
          registrationTime: new Date(),
        });

        // Fetch user details from the 'userdetails' collection
        const userRef = doc(db, "userdetails", phoneNumber);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          setUserDetails(userDoc.data()); // Set user details if document exists

          // Check if the user's attendance has already been marked
          const registrationRef = doc(db, "registerations", phoneNumber);
          const registrationDoc = await getDoc(registrationRef);

          if (registrationDoc.exists()) {
            const registrationData = registrationDoc.data();
            if (registrationData.attendance) {
              setAttendanceMarked(true); // If attendance is true, mark attendance as done
              setFeedbackVisible(true); // Show feedback section immediately
            }
          }
        }

        setSuccess(true); // Registration successful
      } catch (err) {
        console.error("Error registering user:", err);
      }
    };

    if (phoneNumber) {
      registerUser();
    }
  }, [phoneNumber]);

  useEffect(() => {
    // Define the allowed date for the scanner
    const allowedDate = new Date("2025-02-15"); // Target date
    const today = new Date();

    // Check if today's date matches the allowed date
    if (
      today.getFullYear() === allowedDate.getFullYear() &&
      today.getMonth() === allowedDate.getMonth() &&
      today.getDate() === allowedDate.getDate()
    ) {
      setIsAllowedDate(true); // Enable the scanner on the allowed date
    }
  }, []);

  const handleScan = async (data) => {
    if (data) {
      setScannedData(data); // Store scanned QR data

      // Mark attendance in Firestore
      const userRef = doc(db, "registerations", phoneNumber);
      try {
        await updateDoc(userRef, {
          attendance: true,
          scanTime: new Date().toISOString(),
        });
        alert("Attendance marked successfully!");
        setFeedbackVisible(true); // Show feedback section
      } catch (err) {
        console.error("Error marking attendance:", err);
        alert("Failed to mark attendance.");
      } finally {
        setShowScanner(false); // Close the scanner
      }
    }
  };

  const handleError = (err) => {
    console.error("Error during scanning:", err);
  };

  const ConstantLayout = ({ children }) => {
    return (
      <div className="mainContainer">
        <div className="ujb_logo">
          <img src="/ujustlogo.png" alt="Logo" />
        </div>
        <div className="UserDetails">
          <div className="logoContainer">
            <img src="/Universary.png" alt="Logo" />
          </div>
          {children}
        </div>
      </div>
    );
  };

  return (
    <>
      {success ? (
        <>
          {/* Div 1: After Registration */}
          {!isAllowedDate && !feedbackVisible && !attendanceMarked && (
            <ConstantLayout>
              <h1 className="welcomeText">Thank you {userDetails[" Name"]}</h1>
              <h2 className="eventName">
                for registering to the Unniversary Celebration!
              </h2>
              <h1 className="detailtext">
                For further details, our support team will get in touch with you.
              </h1>
            </ConstantLayout>
          )}

          {/* Div 2: Open Scanner on 30/01/2025 */}
          {isAllowedDate && !feedbackVisible && !attendanceMarked && (
            <ConstantLayout>
              <h1 className="welcomeText">Welcome {userDetails[" Name"]}</h1>
              <h2 className="eventName">to the Unniversary Celebration!</h2>
              <button
                onClick={() => setShowScanner(true)}
                className="modalButton"
              >
                Open QR Scanner
              </button>
              {showScanner && (
                <div className="qrBox">
                  <div className="scanner-box">
                    <QrScanner
                      className="scanner-video"
                      delay={300}
                      onScan={handleScan}
                      onError={handleError}
                      style={{ width: "100%" }}
                      constraints={{ facingMode: "environment" }}
                    />
                  </div>
                  <p className="scanner-text">Scan the QR code</p>
                  <button
                    className="close-button"
                    onClick={() => setShowScanner(false)}
                  >
                    ×
                  </button>
                </div>
              )}
            </ConstantLayout>
          )}

          {/* Div 3: Send Feedback */}
          {feedbackVisible && (
            <ConstantLayout>
              <h1 className="welcomeText">Thankyou {userDetails[" Name"]}</h1>
              <h2 className="eventName">for attending the event!</h2>
              <h1 className="detailtext">
                Please give your valuable feedback.
              </h1>
              <Link href={`/feedback/${phoneNumber}`}>
                <div className="agenda">
                  <button className="agendabutton">Send Feedback</button>
                </div>
              </Link>
            </ConstantLayout>
          )}
        </>
      ) : (
        <div className="loader">
          <span className="loader2"></span>
        </div>
      )}
    </>
  );
};

export default RegisterPage;
