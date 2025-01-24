import { IncomingForm } from 'formidable';
import { storage, db } from '../../firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false, // Disable default body parser for file uploads
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const form = new IncomingForm();
  form.uploadDir = path.join(process.cwd(), 'public/uploads'); // Custom upload directory
  form.keepExtensions = true; // Keep file extensions

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Error parsing form data:', err);
      return res.status(500).json({ error: 'Error parsing form data' });
    }

    console.log('Fields:', fields); // Debug fields
    console.log('Files:', files);   // Debug files

    const { bodyText, template, latitude, longitude } = fields;
    const image = files?.image;

    // Validate required fields
    if (!bodyText || !template) {
      return res.status(400).json({ error: 'Missing required fields (bodyText or template)' });
    }

    // For location templates, check latitude and longitude
    if (template === 'location_variabletemplate') {
      if (!latitude || !longitude) {
        return res.status(400).json({ error: 'Latitude and longitude are required for location templates' });
      }

      const latitudeValue = parseFloat(latitude);
      const longitudeValue = parseFloat(longitude);

      if (isNaN(latitudeValue) || isNaN(longitudeValue)) {
        return res.status(400).json({ error: 'Latitude and longitude must be valid numbers' });
      }

      // Save location template in Firestore
      try {
        const templatesCollection = collection(db, 'templates');
        await addDoc(templatesCollection, {
          name: template,
          bodyText,
          latitude: latitudeValue,
          longitude: longitudeValue,
          createdAt: serverTimestamp(),
        });

        res.status(200).json({ success: true, message: 'Location template saved successfully' });
      } catch (error) {
        console.error('Error saving location template:', error);
        res.status(500).json({ error: 'Failed to save location template' });
      }
    } else {
      // Handle image templates (if any)
      if (!image) {
        return res.status(400).json({ error: 'Image file not found' });
      }

      if (!image[0]?.filepath) {
        return res.status(400).json({ error: 'Image file not found' });
      }

      const fileName = `${Date.now()}_${image[0].originalFilename}`;
      const storageRef = ref(storage, `template_images/${fileName}`);
      
      // Ensure the file exists before attempting to read it
      const fileBuffer = await fs.promises.readFile(image[0].filepath);
      const uploadResult = await uploadBytes(storageRef, fileBuffer);

      const imageUrl = await getDownloadURL(uploadResult.ref);

      // Save other templates (image templates)
      try {
        const templatesCollection = collection(db, 'templates');
        await addDoc(templatesCollection, {
          name: template,
          bodyText,
          imageURL: imageUrl,
          createdAt: serverTimestamp(),
        });

        res.status(200).json({ success: true, message: 'Template saved successfully', imageUrl });
      } catch (error) {
        console.error('Error saving template:', error);
        res.status(500).json({ error: 'Failed to save template' });
      }
    }
  });
}
