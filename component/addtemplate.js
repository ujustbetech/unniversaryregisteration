import { useState } from 'react';

const AdminTemplateEditor = () => {
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [bodyText, setBodyText] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const templates = [
    { name: 'daily_reminder', language: 'English' },
    { name: 'location_variabletemplate', language: 'English' },
    // Add more templates as needed
  ];

  const handleTemplateChange = (e) => {
    setSelectedTemplate(e.target.value);
    // Reset all fields when template changes
    setBodyText('');
    setLatitude('');
    setLongitude('');
    setImage(null);
    setImagePreview(null);
    setImageUrl(null);
  };

  const handleBodyTextChange = (e) => setBodyText(e.target.value);

  const handleLatitudeChange = (e) => setLatitude(e.target.value);

  const handleLongitudeChange = (e) => setLongitude(e.target.value);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should not exceed 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result); // Set image preview
        setImage(file); // Store the file object for upload
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveTemplate = async () => {
    // Validate common fields
    if (!selectedTemplate || !bodyText) {
      alert('Please fill all required fields.');
      return;
    }
  
    // Additional validation for location_template
    if (selectedTemplate === 'location_variabletemplate' && (!latitude || !longitude)) {
      alert('Please provide latitude and longitude for the location template.');
      return;
    }
  
    // Additional validation for daily_reminder
    if (selectedTemplate === 'daily_reminder' && !image) {
      alert('Please upload an image for the daily reminder template.');
      return;
    }
  
    setIsLoading(true);
  
    const payload = {
      template: selectedTemplate,
      bodyText,
    };
  
    // Add template-specific fields
    if (selectedTemplate === 'location_variabletemplate') {
      payload.latitude = latitude;
      payload.longitude = longitude;
    } else if (selectedTemplate === 'daily_reminder') {
      payload.image = image; // You may need to handle image uploads separately
    }
  
    try {
      const response = await fetch('/api/SaveTemplate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
  
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          alert('Template saved successfully!');
          // Reset form after success
          setSelectedTemplate('');
          setBodyText('');
          setLatitude('');
          setLongitude('');
          setImage(null);
          setImagePreview(null);
        } else {
          alert('Failed to save template. Please try again.');
        }
      } else {
        const error = await response.text();
        alert('Error: ' + error);
        console.error('Error response:', error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Unexpected error occurred while saving template.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <section className="c-form box">
      <h2>Template Editor</h2>
      <div>
        <label htmlFor="template-select">Select Template:</label>
        <select
          id="template-select"
          value={selectedTemplate}
          onChange={handleTemplateChange}
        >
          <option value="">Select Template</option>
          {templates.map((template) => (
            <option key={template.name} value={template.name}>
              {template.name} - {template.language}
            </option>
          ))}
        </select>
      </div>

      {selectedTemplate && (
        <div>
          <div>
            <label htmlFor="body-text">Body Text:</label>
            <textarea
              id="body-text"
              placeholder="Enter body text"
              value={bodyText}
              onChange={handleBodyTextChange}
              rows="4"
              cols="50"
              required
            />
          </div>

          {selectedTemplate === 'location_variabletemplate' && (
            <>
              <div>
                <label htmlFor="latitude">Latitude:</label>
                <input
                  id="latitude"
                  type="text"
                  placeholder="Enter latitude"
                  value={latitude}
                  onChange={handleLatitudeChange}
                  required
                />
              </div>
              <div>
                <label htmlFor="longitude">Longitude:</label>
                <input
                  id="longitude"
                  type="text"
                  placeholder="Enter longitude"
                  value={longitude}
                  onChange={handleLongitudeChange}
                  required
                />
              </div>
            </>
          )}

          {selectedTemplate === 'daily_reminder' && (
            <>
              <div>
                <label htmlFor="image-upload">Upload Image:</label>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  required
                />
              </div>
              {imagePreview && (
                <div>
                  <h3>Image Preview:</h3>
                  <img
                    src={imagePreview}
                    alt="Image Preview"
                    style={{
                      width: '150px',
                      height: '150px',
                      objectFit: 'cover',
                    }}
                  />
                </div>
              )}
            </>
          )}

          <button
            onClick={handleSaveTemplate}
            disabled={isLoading}
            style={{
              backgroundColor: isLoading ? 'gray' : '#007bff',
              color: 'white',
              padding: '10px 20px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              marginTop: '10px',
            }}
          >
            {isLoading ? 'Saving...' : 'Save Template'}
          </button>
        </div>
      )}
    </section>
  );
};

export default AdminTemplateEditor;
