import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { db } from '../../firebaseConfig'; // Adjust path as necessary
import { doc, getDoc, collection, addDoc } from 'firebase/firestore';
import Link from 'next/link';
import "../event.css"

const RegisterPage = () => {
  const router = useRouter();
  const { phoneNumber } = router.query;
  const [success, setSuccess] = useState(false);
  const [userDetails, setUserDetails] = useState(null);

  useEffect(() => {
    const registerUser = async () => {
      try {
        // Add the registration data to Firestore
        await addDoc(collection(db, 'eventRegistrations'), {
          phoneNumber: phoneNumber,
          registrationTime: new Date(),
        });

        // Fetch user details from the 'userdetails' collection
        const userRef = doc(db, 'userdetails', phoneNumber);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          setUserDetails(userDoc.data()); // Set user details if document exists
        }

        setSuccess(true); // Set success after registration and user details fetch
      } catch (err) {
        console.error('Error registering user:', err);
      }
    };

    if (phoneNumber) {
      registerUser();
    }
  }, [phoneNumber]);

  return (
    <>
      {success ? (
        userDetails ? (
          <div  className="mainContainer" >
            <div className="UserDetails">
              <h1 className="welcomeText">Welcome {userDetails[' Name']}</h1>
              <h2 className="eventName">to UJustBe Universe’s Anniversary Celebration</h2>
            </div>
            <div className="eventDetails">
              <p>Time: 3:00 PM to 7:00 PM</p>
              <h1 className="eventName">Thank You!</h1>
              <h1 className="eventName">for Registering.</h1>
            </div>
            <div className="UserDetails">
            <h1 className="welcomeText">
            For further details, our support team will get in touch with you.</h1>
            </div>
            <Link href={`/feedback/${phoneNumber}`}>
            <div className='agenda'>
        <button className="agendabutton">Give Feedback</button>
        </div>
      </Link>
          </div>
        ) : (
          <p>User details not found</p>
        )
      ) : (
        <div className="loader">
        <span className="loader2"></span>
      </div>
      )}
    </>
  );
};

export default RegisterPage;
