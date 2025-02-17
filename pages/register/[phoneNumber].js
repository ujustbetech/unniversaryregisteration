import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { db } from "../../firebaseConfig";
import { doc, getDoc, collection, addDoc, updateDoc } from "firebase/firestore";
import QrScanner from "react-qr-scanner";
import Link from "next/link";
import "../event.css";
import Swal from "sweetalert2";

const RegisterPage = () => {
  const router = useRouter();
  const { phoneNumber } = router.query;
  const [success, setSuccess] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [attendanceMarked, setAttendanceMarked] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const [isAllowedDate, setIsAllowedDate] = useState(false);
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [isDisabled, setIsDisabled] = useState(true);


  useEffect(() => {
    const registerUser = async () => {
      try {
        // Register the user in Firestore
        await addDoc(collection(db, "registration"), {
          phoneNumber: phoneNumber,
          registrationTime: new Date(),
        });

        // Fetch user details
        const userRef = doc(db, "userdetails", phoneNumber);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          setUserDetails(userDoc.data());

          // Check attendance
          const registrationRef = doc(db, "registerations", phoneNumber);
          const registrationDoc = await getDoc(registrationRef);

          if (registrationDoc.exists()) {
            const registrationData = registrationDoc.data();
            if (registrationData.attendance) {
              setAttendanceMarked(true);
              setFeedbackVisible(true);
            }
          }
        }

        setSuccess(true);
      } catch (err) {
        console.error("Error registering user:", err);
      }
    };

    if (phoneNumber) {
      registerUser();
    }
  }, [phoneNumber]);

  useEffect(() => {
    const allowedDate = new Date("2025-02-17");
    const today = new Date();
    if (
      today.getFullYear() === allowedDate.getFullYear() &&
      today.getMonth() === allowedDate.getMonth() &&
      today.getDate() === allowedDate.getDate()
    ) {
      setIsAllowedDate(true);
    }
  }, []);


  const handleScan = async (data) => {
    if (data) {
      setScannedData(data);
  
      // Mark attendance
      const userRef = doc(db, "registerations", phoneNumber);
      try {
        await updateDoc(userRef, {
          attendance: true,
          scanTime: new Date().toISOString(),
        });
  
        // Use SweetAlert to show a success message
        Swal.fire({
          title: 'Attendance marked successfully!',
          text: 'Thank you for attending the event.',
          icon: 'success',
          confirmButtonText: 'OK',
        });
  
        setFeedbackVisible(true);
      } catch (err) {
        console.error("Error marking attendance:", err);
        Swal.fire({
          title: 'Failed to mark attendance.',
          text: 'There was an issue marking your attendance. Please try again.',
          icon: 'error',
          confirmButtonText: 'OK',
        });
      } finally {
        setShowScanner(false);
      }
    }
  };
  
 

  useEffect(() => {
    const targetIST = new Date("2025-02-15T18:00:00+05:30"); // 6:00 PM IST
    const checkTime = () => {
      const now = new Date(); // Current time (UTC)
      if (now >= targetIST) {
        setIsDisabled(false);
      }
    };

    checkTime(); // Check initially
    const interval = setInterval(checkTime, 1000); // Check every second

    return () => clearInterval(interval); // Cleanup
  }, []);

  const handleError = (err) => {
    console.error("Error during scanning:", err);
    setCameraError(
      err?.name === "NotAllowedError"
        ? "Camera access denied. Please allow camera access in your browser."
        : "Error accessing the camera. Try refreshing the page or use a different device."
    );
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
              <h1 className="welcomeText">Thank you {userDetails?.[" Name"]}</h1>
              <h2 className="eventName">
                for registering to the Unniversary Celebration!
              </h2>
              <h1 className="detailtext">
                For further details, our support team will get in touch with
                you.
              </h1>
            </ConstantLayout>
          )}

          {/* Div 2: Open Scanner on 30/01/2025 */}
          {isAllowedDate && !feedbackVisible && !attendanceMarked && (
            <ConstantLayout>
              <h1 className="welcomeText">Welcome {userDetails?.[" Name"]}</h1>
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
                    {cameraError ? (
                      <p className="error-text">{cameraError}</p>
                    ) : (
                      <QrScanner
  delay={300}
  onScan={handleScan}
  onError={(err) => {
    console.error("Error during scanning:", err);
    alert(`Scanning error: ${err.message}`);
  }}
  style={{ width: "100%" }}
  constraints={{
    video: { facingMode: "environment" }, // Explicitly request video
  }}
/>

                    )}
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
         
            <ConstantLayout>
              <h1 className="welcomeText">Thankyou {userDetails?.[" Name"]}</h1>
              <h2 className="eventName">for attending the event!</h2>
              <h1 className="detailtext">
                Please give your valuable feedback.
              </h1>
              <Link href={`/feedback/${phoneNumber}`}>
                <div className="agenda">
                <button className="agendabutton" >
     Send Feedback
    </button>
                </div>
               

              </Link>
            </ConstantLayout>
         
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
