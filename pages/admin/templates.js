import { useEffect, useState } from 'react';
import { db } from '../../firebaseConfig'; // Import Firestore
import { collection, getDocs } from 'firebase/firestore'; // Import Firestore methods

const TemplateListPage = () => {
  const [templates, setTemplates] = useState([]); // State for templates
  const [loading, setLoading] = useState(true); // State for loading
  const [error, setError] = useState(null); // State for error
  const [sending, setSending] = useState(false); // State for sending status

  // Fetch templates from Firestore on component load
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const templatesCollectionRef = collection(db, 'templates');
        const snapshot = await getDocs(templatesCollectionRef);

        if (snapshot.empty) {
          setTemplates([]);
        } else {
          const templatesList = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              name: data.name || 'Unnamed',
              bodyText: data.bodyText || 'No content',
              latitude: data.latitude || null,
              longitude: data.longitude || null,
              imageURL: data.imageURL || '/placeholder.jpg',
              createdAt: data.createdAt?.toDate().toLocaleDateString() || 'N/A',
            };
          });
          setTemplates(templatesList);
        }
      } catch (error) {
        console.error('Error fetching templates:', error);
        setError('Failed to load templates.');
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  const handleSendToRegisteredUsers = async (template) => {
    if (!template || sending) return;
    setSending(true);

    try {
      const response = await fetch('/api/sendwhatsapp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          template,
        }),
      });

      const result = await response.json();
      if (result.success) {
        alert('Messages sent successfully to registered users!');
      } else {
        console.error('Failed to send messages:', result.error);
        alert('Failed to send messages. Check console for details.');
      }
    } catch (error) {
      console.error('Error sending messages:', error);
      alert('An error occurred while sending messages.');
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div>Loading templates...</div>;
  if (error) return <div>{error}</div>;

  return (
    <>
      {loading ? (
        <div className="loader">
          <span className="loader2"></span>
        </div>
      ) : (
        <section className="c-userslist box">
          <h2>Templates Listing</h2>
          <button className="m-button-5" onClick={() => window.history.back()}>
            Back
          </button>
          {templates.length === 0 ? (
            <p>No templates found.</p>
          ) : (
            <table className="table-class">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Body Text</th>
                  <th>Latitude</th>
                  <th>Longitude</th>
                  <th>Image</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {templates.map((template) => (
                  <tr key={template.id}>
                    <td>{template.name}</td>
                    <td>{template.bodyText}</td>
                    <td>{template.latitude || 'N/A'}</td>
                    <td>{template.longitude || 'N/A'}</td>
                    <td>
                      <img
                        src={template.imageURL}
                        alt="Template"
                        style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                      />
                    </td>
                    <td>{template.createdAt}</td>
                    <td>
                      <button className='submitbtns'
                        onClick={() => handleSendToRegisteredUsers(template)}
                        disabled={sending}
                      >
                        {sending ? 'Sending...' : 'Send'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      )}
    </>
  );
};

export default TemplateListPage;