import axios from "axios";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { phoneNumbers, userDetails } = req.body;
    const token = "EAAHwbR1fvgsBOZBLeLD7wdbDO7sOGgYPYJ3z6c9dlSl8VflexOPOWP2JcKGCLUHIo7r7TfIfLIJCbnek7VprT8ZBTH7iYL8CjPZCWjT9u5tmNaRw71e9vs3u0nAn6VeAVHJLCveIM8ZBZChT9loyWtya5ZB94IgG2oGzqYS5FHeTgxbAMAjE55SgMIFJR8QzFKGUXpYiCTpCYeLx4S1T8rKFyAA3aZCQEBLPQm6ZAxJw";

    if (!phoneNumbers || !Array.isArray(phoneNumbers) || phoneNumbers.length === 0) {
      return res.status(400).json({ error: "Invalid or missing phoneNumbers array" });
    }
    if (!userDetails || !userDetails.name) {
      return res.status(400).json({ error: "Invalid or missing userDetails.name" });
    }

    try {
      const results = await Promise.all(
        phoneNumbers.map(async (phone) => {
          const payload = {
            messaging_product: "whatsapp",
            to: phone,
            type: "template",
            template: {
              name: "post_thankyou", // ✅ Updated template name
              language: { code: "en" },
              components: [
                {
                  type: "body",
                  parameters: [{ type: "text", text: userDetails.name }], // ✅ Only name is dynamic
                },
              ],
            },
          };

          const response = await axios.post(
            `https://graph.facebook.com/v21.0/527476310441806/messages`,
            payload,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          return response.data;
        })
      );

      res.status(200).json({ message: "Message sent successfully", results });
    } catch (error) {
      console.error("Error sending message:", error.response?.data || error.message);
      res.status(500).json({ error: "Failed to send message" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
