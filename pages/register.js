import { useState } from 'react';
import { useRouter } from 'next/router';
import { db } from '../firebaseConfig'; // Adjust path as necessary
import { doc, getDoc, setDoc } from 'firebase/firestore'; 
import "./event.css";

const EventRegistrationPage = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isGuest, setIsGuest] = useState(false); // To check if the user is a guest
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Check if the user is already registered in the 'registeration' table
      const registrationRef = doc(db, 'registerations', phoneNumber);
      const registrationDoc = await getDoc(registrationRef);

      if (registrationDoc.exists()) {
        // If the user is already registered, navigate to the registration page
        router.push(`/register/${phoneNumber}`);
      } else {
        // If user is not registered, fetch user details from Firestore
        const userRef = doc(db, 'userdetails', phoneNumber); // Phone number used as document ID
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          // User exists in 'userdetails', proceed to save to 'registeration' table
          const userData = userDoc.data();
          await setDoc(registrationRef, {
            [' Name']: userData[' Name'] || '',
            Category: userData.Category || '',
            DOB: userData.DOB || '',
            Email: userData.Email || '',
            Gender: userData.Gender || '',
            UJBCode: userData['UJB Code'] || '',
            ['Mobile no']: phoneNumber, // Added phone number here
            registeredAt: new Date(),
          });

          // Navigate to the registration page with phone number in the URL
          router.push(`/register/${phoneNumber}`);
        } else {
          // User is not found, add them as a guest and allow them to input their name
          setIsGuest(true); // Show input for name
          const guestRef = doc(db, 'userdetails', phoneNumber); // Add user as guest
          await setDoc(guestRef, {
            ' Name': name || 'Guest',
            Category: 'Guest',
            DOB: '',
            Email: '',
            Gender: 'Unknown',
            UJBCode: 'Guest',
            PhoneNumber: phoneNumber, // Added phone number here for guest
          });

          // Now proceed with adding the guest's details to the registration table
          await setDoc(registrationRef, {
            Name: name || 'Guest',
            Category: 'Guest',
            DOB: '',
            Email: '',
            Gender: 'Unknown',
            UJBCode: 'Guest',
            PhoneNumber: phoneNumber, // Added phone number here
            registeredAt: new Date(),
          });

          router.push(`/register/${phoneNumber}`);
        }
      }
    } catch (err) {
      console.error('Error during registration:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='mainContainer'>
      <div className='logosContainer'>
        <img src="/ujustlogo.png" alt="Logo" className="logo" />
      </div>
      <div className="signin">
        <div className="loginInput">
          <div className='logoContainer'>
            <img src="/Universary.png" alt="Logo" className="logos" />
          </div>
          <form onSubmit={handleRegister}>
            <ul>
              <li>
                <input
                  type="text"
                  placeholder="Enter your phone number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                />
              </li>
              {isGuest && (
                <li>
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </li>
              )}
              <li>
                <button className="login" type="submit" disabled={loading}>
                  {loading ? 'Registering...' : 'Register'}
                </button>
              </li>
            </ul>
          </form>
          {error && <p className="error">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default EventRegistrationPage;
