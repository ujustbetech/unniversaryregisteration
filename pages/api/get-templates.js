import axios from 'axios';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { bodyText, image, template } = req.body;

    // Validate the inputs
    if (!bodyText || !template) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
      // Define the phone number to send the message to
      const recipientPhoneNumber = '9372321663'; // Hardcoded phone number

      // Prepare your API payload
      const payload = {
        messaging_product: 'whatsapp',
        to: recipientPhoneNumber, // Send to the specific number
        type: 'template',
        template: {
          name: template,
          language: {
            code: 'en', // Language code for template
          },
          components: [
            {
              type: 'body',
              parameters: [
                {
                  type: 'text',
                  text: bodyText, // Dynamic body text
                },
              ],
            },
          ],
        },
      };

      if (image) {
        // Add the image to the payload if necessary
        payload.template.components.push({
          type: 'header',
          parameters: [
            {
              type: 'image',
              image: {
                url: image, // Add the image URL
              },
            },
          ],
        });
      }

      // Make the API call to WhatsApp
      const response = await axios.post(
        `https://graph.facebook.com/v21.0/${process.env.PHONE_NUMBER_ID}/messages`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${process.env.WHATSAPP_API_TOKEN}`,
          },
        }
      );

      // Respond with success
      res.status(200).json({ success: true, data: response.data });
    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({ error: 'Failed to send message' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
