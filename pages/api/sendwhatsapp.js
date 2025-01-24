import axios from 'axios';
import { db } from '../../firebaseConfig'; // Import Firestore
import { collection, getDocs } from 'firebase/firestore'; // Firestore methods

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { template } = req.body;

  if (!template) {
    return res.status(400).json({ error: 'Template data is required' });
  }

  try {
    // Fetch registered phone numbers from the 'registration' table
    const registrationCollectionRef = collection(db, 'registerations');
    const snapshot = await getDocs(registrationCollectionRef);

    if (snapshot.empty) {
      return res.status(404).json({ error: 'No registered users found.' });
    }

    const phoneNumbers = snapshot.docs.map((doc) => doc.id); // Extract document IDs as phone numbers

    const API_URL = 'https://graph.facebook.com/v21.0/527476310441806/messages';
    const ACCESS_TOKEN = process.env.WHATSAPP_API_TOKEN;

    // Prepare the WhatsApp message payload (without the body component)
    const sendPromises = phoneNumbers.map((phone) => {
      const data = {
        messaging_product: 'whatsapp',
        to: phone,
        type: 'template',
        template: {
          name: 'location_variabletemplate',
          language: { code: 'en' },
          components: [
            {
              type: 'header',
              parameters: [
                {
                  type: 'location',
                  location: {
                    name: 'UJustBe Enterprise',
                    address: 'Kamdhenu Shopping Centre, Andheri',
                    latitude: template.latitude,
                    longitude: template.longitude,
                  },
                },
              ],
            },
          ],
        },
      };

      return axios.post(API_URL, data, {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      });
    });

    // Wait for all messages to be sent
    await Promise.all(sendPromises);

    return res.status(200).json({ success: true, message: 'Messages sent successfully!' });
  } catch (error) {
    console.error('Error sending WhatsApp message:', error.response?.data || error.message);
    return res.status(500).json({ success: false, error: error.response?.data || error.message });
  }
}
