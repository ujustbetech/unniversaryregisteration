import { useState } from 'react';
import { useRouter } from 'next/router';
import { db } from '../firebaseConfig'; // Adjust path as necessary
import { doc, getDoc, setDoc } from 'firebase/firestore'; 
import "./event.css"

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
      // Fetch user details from Firestore
      const userRef = doc(db, 'userdetails', phoneNumber); // Phone number used as document ID
      const userDoc = await getDoc(userRef);
  
      if (userDoc.exists()) {
        const userData = userDoc.data();
  
        // Save user details in the registration table
        const registrationRef = doc(db, 'registeration', phoneNumber);
        await setDoc(registrationRef, {
          Name: userData[' Name'] || '',
          Category: userData.Category || '',
          DOB: userData.DOB || '',
          Email: userData.Email || '',
          Gender: userData.Gender || '',
          UJBCode: userData['UJB Code'] || '',
          registeredAt: new Date(),
        });
  
        // Navigate to the welcome page with phone number in the URL
        router.push(`/register/${phoneNumber}`);
      } else {
        setError('User not found. Please check the phone number.');
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
