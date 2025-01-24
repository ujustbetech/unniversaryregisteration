import { IncomingForm } from 'formidable';
import axios from 'axios';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method === 'POST') {
    console.log('Received POST request.');

    const form = new IncomingForm();

    // Parse the incoming form data
    form.parse(req, async (err, fields) => {
      if (err) {
        console.error('Error parsing form data:', err);
        return res.status(500).json({ error: 'Error parsing form data' });
      }

      let { bodyText, templateId, imageURL, phoneNumbers } = fields;

      // Ensure templateId is extracted correctly as a string
      const templateName = Array.isArray(templateId) ? templateId[0] : templateId;

      if (!templateName || typeof templateName !== 'string') {
        console.error('Invalid template name:', templateName);
        return res.status(400).json({ error: 'Invalid or missing template name' });
      }

      // Ensure bodyText, imageURL, and phoneNumbers are properly extracted
      bodyText = Array.isArray(bodyText) ? bodyText[0] : bodyText;
      imageURL = Array.isArray(imageURL) ? imageURL[0] : imageURL;
      phoneNumbers = Array.isArray(phoneNumbers) ? phoneNumbers : [phoneNumbers]; // Ensure phoneNumbers is an array

      if (!phoneNumbers || phoneNumbers.length === 0) {
        console.error('No phone numbers provided.');
        return res.status(400).json({ error: 'No phone numbers provided' });
      }

      // Construct the payload for WhatsApp API
      const payload = phoneNumbers.map((phone) => ({
        messaging_product: 'whatsapp',
        to: phone, 
        type: 'template',
        template: {
          name: templateName,
          language: { code: 'en' },
          components: [
            {
              type: 'header',
              parameters: [
                {
                  type: 'image',
                  image: { link: imageURL || '' }, // Ensure image URL is correctly set
                },
              ],
            },
            {
              type: 'body',
              parameters: [
                { type: 'text', text: bodyText || 'Default body text' }, // Fallback for bodyText
              ],
            },
            
          ],
        },
      }));

      console.log('Prepared WhatsApp API payload:', JSON.stringify(payload, null, 2));

      try {
        // Send the payload to WhatsApp API
        const response = await Promise.all(
          payload.map(async (messagePayload) => {
            return await axios.post(
              `https://graph.facebook.com/v21.0/${process.env.PHONE_NUMBER_ID}/messages`,
              messagePayload,
              {
                headers: {
                  Authorization: `Bearer ${process.env.WHATSAPP_API_TOKEN}`,
                  'Content-Type': 'application/json',
                },
              }
            );
          })
        );

        console.log('WhatsApp API response:', response);
        return res.status(200).json({ success: true, data: response });
      } catch (error) {
        if (error.response) {
          console.error('Error response from WhatsApp API:', error.response.data);
          return res.status(500).json({ error: error.response.data });
        } else {
          console.error('Error sending message:', error.message);
          return res.status(500).json({ error: 'Failed to send message' });
        }
      }
    });
  } else {
    console.error('Invalid request method:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
