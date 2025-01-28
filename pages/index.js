import { useState } from 'react';
import { useRouter } from 'next/router';
import { db } from '../firebaseConfig'; // Adjust path as necessary
import { doc, getDoc, setDoc } from 'firebase/firestore';
import './event.css';

const EventRegistrationPage = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Check if the user is already registered
      const registrationRef = doc(db, 'registerations', phoneNumber);
      const registrationDoc = await getDoc(registrationRef);

      if (registrationDoc.exists()) {
        // If registered, navigate to the registration page
        router.push(`/register/${phoneNumber}`);
        return;
      }

      // Check if the user exists in 'userdetails'
      const userRef = doc(db, 'userdetails', phoneNumber);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        // Save user details in the 'registerations' collection
        const userData = userDoc.data();
        await setDoc(registrationRef, {
          [' Name']: userData[' Name'] || '',
          Category: userData.Category || '',
          DOB: userData.DOB || '',
          Email: userData.Email || '',
          Gender: userData.Gender || '',
          UJBCode: userData['UJB Code'] || '',
          ['Mobile no']: phoneNumber,
          registeredAt: new Date(),
        });

        // Navigate to the registration page
        router.push(`/register/${phoneNumber}`);
      } else {
        // If no record found, save as a guest and navigate
        await setDoc(registrationRef, {
          [' Name']: 'Guest',
          Category: 'Guest',
          DOB: '',
          Email: '',
          Gender: 'Unknown',
          UJBCode: 'Guest',
          ['Mobile no']: phoneNumber,
          registeredAt: new Date(),
        });

        // Navigate to the registration page
        router.push(`/register/${phoneNumber}`);
      }
    } catch (err) {
      console.error('Error during registration:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneNumberChange = (e) => {
    setPhoneNumber(e.target.value);
  };

  return (
    <div className="mainContainer">
      <div className="ujb_logo">
        <img src="/ujustlogo.png" alt="Logo" />
      </div>
      <div className="signin">
        <div className="loginInput">
          <div className="logoContainer">
            <img src="/Universary.png" alt="Logo" />
          </div>
          <form onSubmit={handleRegister}>
            <ul>
              <li>
                <input
                  type="text"
                  placeholder="Enter your phone number"
                  value={phoneNumber}
                  onChange={handlePhoneNumberChange}
                  required
                />
              </li>
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
