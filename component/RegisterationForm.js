import React, { useState } from "react";
import emailjs from 'emailjs-com';


const RegistrationForm = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [userDetails, setUserDetails] = useState(null);
  const [formData, setFormData] = useState({
    locationType: "",
    locationName: "",
    specialMoment: "",
    gameInterest: [],
    achievements: "",
    skills: "",
    Name: "", // Use Name (capital N) for both guest and non-guest
    relativeOf: "",
    dob: "",
    email: "",
  });
  const [isGuest, setIsGuest] = useState(false); // Track if the user is a guest

  const handleRetrieveUser = async () => {
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber }),
      });

      if (response.ok) {
        const data = await response.json();
        setUserDetails(data.user);
        setIsGuest(false); // User is not a guest
      } else {
        setIsGuest(true); // User is a guest
        setUserDetails(null); // Clear user details
      }
    } catch (error) {
      console.error("Error retrieving user:", error);
    }
  };

  const handleCheckboxChange = (game) => {
    setFormData((prev) => ({
      ...prev,
      gameInterest: prev.gameInterest.includes(game)
        ? prev.gameInterest.filter((g) => g !== game)
        : [...prev.gameInterest, game],
    }));
  };
  const handleFormSubmit = async (e) => {
    e.preventDefault();
  
    const requiredFields = [
      "locationType",
      "locationName",
      "specialMoment",
      "gameInterest",
      "achievements",
    ];
  
    if (isGuest) {
      requiredFields.push("Name", "relativeOf", "dob", "email");
    }
  
    for (const field of requiredFields) {
      if (
        !formData[field] ||
        (Array.isArray(formData[field]) && formData[field].length === 0)
      ) {
        alert(`Please fill out all required fields. Missing: ${field}`);
        return;
      }
    }
  
    if (isGuest && !/\S+@\S+\.\S+/.test(formData.email)) {
      alert("Please enter a valid email address.");
      return;
    }
  
    const registrationData = {
      ...userDetails,
      ...formData,
      Name: isGuest ? formData.Name : userDetails?.[" Name"]?.trim(),
      Mobile_no: phoneNumber,
      Category: isGuest ? "Guest" : userDetails?.Category,
    };
  
    try {
      const response = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber,
          userData: registrationData,
        }),
      });
  
      if (response.ok) {
        alert("User registered successfully!");
        await sendWhatsAppMessage(phoneNumber, registrationData);
        await sendEmail(isGuest ? formData.email : userDetails?.Email, registrationData);
        resetForm();
      } else {
        alert("Failed to register user.");
      }
    } catch (error) {
      console.error("Error registering user:", error);
    }
  };
  

  const sendWhatsAppMessage = async (phoneNumber, userDetails) => {
    try {
      const response = await fetch("/api/SendMessage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumbers: [phoneNumber],
          userDetails: {
            name: userDetails.Name,
            location: userDetails.locationName,
            gamesInterest: userDetails.gameInterest.join(", "),
          },
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        console.error("WhatsApp API response error:", data);
        alert("Failed to send WhatsApp message. Please check the server.");
      } else {
        console.log("WhatsApp message sent successfully:", data);
      }
    } catch (error) {
      console.error("Error sending WhatsApp message:", error);
      alert("An error occurred while sending the WhatsApp message.");
    }
  };

  const sendEmail = async (email, userDetails) => {
    try {
      // Ensure the correct parameters are being passed to email template
      const templateParams = {
        to_email: email,
        to_name: userDetails.Name || formData.Name, // Guest or existing user name
        locationName: formData.locationName || userDetails.locationName, // Location Name
        gameInterest: formData.gameInterest.length > 0 ? formData.gameInterest.join(", ") : userDetails.gameInterest?.join(", "), // Ensure game interest is fetched
        achievements: formData.achievements || userDetails.achievements, // Achievements (either from form data or user details)
      };
  
      const result = await emailjs.send(
        "service_acyimrs",       // Your EmailJS service ID
        "template_bb5fxij",      // Your EmailJS template ID
        templateParams,          // The template parameters
        "w7YI9DEqR9sdiWX9h"      // Your EmailJS user ID
      );
  
      console.log("Email sent successfully:", result.text);
    } catch (error) {
      console.error("Error sending email:", error);
      alert("An error occurred while sending the email.");
    }
  };
  

  return (
    <>
    <section className='c-form  box'>
      <h2>New Registeration</h2>     
      <form onSubmit={handleFormSubmit}>
        <ul>
      <li className='form-row'>
            <h4>Mobile Number:<sup>*</sup></h4>
            <div className='multipleitem'>
              
            <input
            type="text"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
          />
           
           <div>
          <button className="submitbtn" type="button" onClick={handleRetrieveUser}>
            Search
          </button>
          </div>
          
            </div>
            
          </li>
      

        {userDetails && !isGuest && (
          <>
        <li className="form-row">
  <h4><strong>Name:</strong></h4>
  <div className="multipleitem">
    <p>{userDetails[" Name"]}</p>
  </div>
</li>
<li className="form-row">
  <h4><strong>Category:</strong></h4>
  <div className="multipleitem">
    <p>{isGuest ? "Guest" : userDetails?.Category}</p>
  </div>
</li>

<li className="form-row">
  <h4><strong>Mobile No:</strong></h4>
  <div className="multipleitem">
    <p>{userDetails["Mobile no"]}</p>
  </div>
</li>
<li className="form-row">
  <h4><strong>UJB Code:</strong></h4>
  <div className="multipleitem">
    <p>{userDetails["UJB Code"]}</p>
  </div>
</li>
<li className="form-row">
  <h4><strong>DOB:</strong></h4>
  <div className="multipleitem">
    <p>{userDetails["DOB"]}</p>
  </div>
</li>
<li className="form-row">
  <h4><strong>Email:</strong></h4>
  <div className="multipleitem">
    <p>{userDetails["Email"]}</p>
  </div>
</li>
<li className="form-row">
    <h4>Location Name:<sup>*</sup></h4>
    <div className="multipleitem">
              
              <input
                type="text"
                value={formData.locationName}
                onChange={(e) =>
                  setFormData({ ...formData, locationName: e.target.value })
                }
                required
                placeholder="Enter Location's name"
              />
            </div>
            </li>
<li className="form-row">
    <h4>Location Type:<sup>*</sup></h4>
    <div className="multipleitem">
              
              <select
                value={formData.locationType}
                onChange={(e) =>
                  setFormData({ ...formData, locationType: e.target.value })
                }
                required
              >
                <option value="">Select</option>
                <option value="Western">Western</option>
                <option value="Central">Central</option>
                <option value="Harbour">Harbour</option>
              </select>
            </div>
</li>
<li className="form-row">
    <h4>Special Moment:<sup>*</sup></h4>
    <div className="multipleitem">
         
              <textarea
                value={formData.specialMoment}
                onChange={(e) =>
                  setFormData({ ...formData, specialMoment: e.target.value })
                }
              />
            </div>
</li>
<li className="form-row">
  <h4>Game Interest:<sup>*</sup></h4>
  <div className="multipleitem">
    {["Cricket", "Football", "None"].map((game) => (
      <label key={game} style={{ marginRight: "10px" }}>
        <input
          type="checkbox"
          checked={formData.gameInterest.includes(game)}
          onChange={() => handleCheckboxChange(game)}
        />
        {game}
      </label>
    ))}
  </div>
</li>

<li className="form-row">
    <h4>Achievements <sup>*</sup></h4>
    <div className="multipleitem">
              
              <textarea
                placeholder="Describe your achievements..."
                value={formData.achievements}
                onChange={(e) =>
                  setFormData({ ...formData, achievements: e.target.value })
                }
              />
            </div>
</li>
<li className="form-row">
    <h4>Skills<sup>*</sup></h4>
    <div className="multipleitem">
              
              <textarea
                placeholder="Describe your skills..."
                value={formData.skills}
                onChange={(e) =>
                  setFormData({ ...formData, skills: e.target.value })
                }
              />
            </div>
</li>
<li className='form-row'>
<div>
            <button className='submitbtn' type="submit">Register</button>
            </div>
            </li>
          </>
        )}

{isGuest && (
  <>
    <li className="form-row">
      <h4>Name:<sup>*</sup></h4>
      <div className="multipleitem">
        <input
          type="text"
          value={formData.Name}
          onChange={(e) => setFormData({ ...formData, Name: e.target.value })}
          required
          placeholder="Enter your name"
        />
      </div>
    </li>
    <li className="form-row">
      <h4>Connect Of:<sup>*</sup></h4>
      <div className="multipleitem">
        <input
          type="text"
          value={formData.relativeOf}
          onChange={(e) =>
            setFormData({ ...formData, relativeOf: e.target.value })
          }
          required
          placeholder="Enter relative's name"
        />
      </div>
    </li>
    <li className="form-row">
      <h4>DOB:<sup>*</sup></h4>
      <div className="multipleitem">
        <input
          type="date"
          value={formData.dob}
          onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
          required
        />
      </div>
    </li>
    <li className="form-row">
      <h4>Email:<sup>*</sup></h4>
      <div className="multipleitem">
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
          placeholder="Enter your email"
        />
      </div>
    </li>

            <li className="form-row">
    <h4>Location Name:<sup>*</sup></h4>
    <div className="multipleitem">
              
              <input
                type="text"
                value={formData.locationName}
                onChange={(e) =>
                  setFormData({ ...formData, locationName: e.target.value })
                }
                required
                placeholder="Enter Location's name"
              />
            </div>
            </li>
            <li className="form-row">
    <h4>Location Type:<sup>*</sup></h4>
    <div className="multipleitem">
              
              <select
                value={formData.locationType}
                onChange={(e) =>
                  setFormData({ ...formData, locationType: e.target.value })
                }
                required
              >
                <option value="">Select</option>
                <option value="Western">Western</option>
                <option value="Central">Central</option>
                <option value="Harbour">Harbour</option>
              </select>
            </div>
</li>
<li className="form-row">
    <h4>Special Moment:<sup>*</sup></h4>
    <div className="multipleitem">
         
              <textarea
                value={formData.specialMoment}
                onChange={(e) =>
                  setFormData({ ...formData, specialMoment: e.target.value })
                }
              />
            </div>
</li>
<li className="form-row">
  <h4>Game Interest:<sup>*</sup></h4>
  <div className="multipleitem">
    {["Cricket", "Football", "None"].map((game) => (
      <label key={game} style={{ marginRight: "10px" }}>
        <input
          type="checkbox"
          checked={formData.gameInterest.includes(game)}
          onChange={() => handleCheckboxChange(game)}
        />
        {game}
      </label>
    ))}
  </div>
</li>


<li className="form-row">
    <h4>Achievements or Skills<sup>*</sup></h4>
    <div className="multipleitem">
              
              <textarea
                placeholder="Describe your achievements or skills..."
                value={formData.achievements}
                onChange={(e) =>
                  setFormData({ ...formData, achievements: e.target.value })
                }
              />
            </div>
</li>
<li className="form-row">
    <h4>Skills<sup>*</sup></h4>
    <div className="multipleitem">
              
              <textarea
                placeholder="Describe your skills..."
                value={formData.skills}
                onChange={(e) =>
                  setFormData({ ...formData, skills: e.target.value })
                }
              />
            </div>
</li>
<li className='form-row'>
<div>
            <button className='submitbtn' type="submit">Register</button>
            </div>
            </li>
          </>
        )}
        </ul>
      </form>
      </section>
    
    </>
  );
};

export default RegistrationForm;
