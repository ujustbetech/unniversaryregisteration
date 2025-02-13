import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { db } from "../firebaseConfig"; // Adjust as necessary
import { doc, getDoc, updateDoc } from "firebase/firestore";
import Swal from "sweetalert2";
import "../src/app/styles/main.scss";
import "../pages/feedback.css";
import "../pages/event.css";

const FeedbackForm = () => {
  const router = useRouter();
  const { phoneNumber } = router.query; // Get phone number from URL

  const [userName, setUserName] = useState(""); // Store user name
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Store error messages
  const [feedback, setFeedback] = useState({ comment: "" });

  useEffect(() => {
    const fetchUserName = async () => {
      if (phoneNumber) {
        try {
          const userDoc = await getDoc(doc(db, "registerations", phoneNumber));
          if (userDoc.exists()) {
            setUserName(userDoc.data().Name || "Participant");
          } else {
            setUserName("Participant"); // Default if user not found
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserName();
  }, [phoneNumber]);

  const questions = [
    { id: "q1", text: "How did you like the event overall?", options: [
      "Absolutely amazing – I’m ready for next year already! 🎊",
      "Loved it! But can someone pass me a water bottle? 🏃‍♂️💦",
      "It was good, but my team deserved to win! 🏆😜",
      "Meh… Next time, add a DJ, fireworks, and a unicorn! 🦄🔥🎶"
    ]},
    { id: "q2", text: "How was the game experience?", options: [
      "Super fun! I may have discovered my hidden sports talent! 🤩",
      "Great, but I should have trained more! 🏋️‍♂️",
      "Enjoyed watching more than playing – commentator material here! 🎙️😆",
      "Where was the referee when I needed them?! 🤨⚖️"
    ]},
    { id: "q3", text: "Have you connected or built relationships with other Orbiters?", options: [
      "Yes! I made some great connections and can’t wait to collaborate! 🤝",
      "Yes, but I wish we had more structured engagement activities! 🎤👥",
      "A little bit, but I mostly stuck with people I already knew! 🏡",
      "No, I was too focused on winning the games! 🏆😆"
    ]},
    { id: "q4", text: "Would you attend the next UJustBe's next events?", options: [
      "100% – Book my slot already! 📅🔥",
      "Yes, if there’s a post-game pizza party! 🍕",
      "Maybe… can I be the referee instead? 🤔",
      "Only if I don’t have to run too much! 🏃‍♂️💨"
    ]}
  ];

  // Handle radio button selection (single selection)
  const handleChange = (questionId, option) => {
    setFeedback((prev) => ({
      ...prev,
      [questionId]: option,
    }));
  };

  // Handle comment input change
  const handleCommentChange = (e) => {
    setFeedback((prev) => ({ ...prev, comment: e.target.value }));
  };

  // Validate feedback before submission
  const validateFeedback = () => {
    for (const question of questions) {
      if (!feedback[question.id]) {
        Swal.fire({
          icon: "warning",
          title: "Incomplete Feedback",
          text: `Please answer: '${question.text}'`,
        });
        return false;
      }
    }
    return true;
  };

  // Send WhatsApp message
  const sendWhatsAppMessage = async (userName, phoneNumber) => {
    try {
      const response = await fetch("/api/SendThankyou", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumbers: [phoneNumber], // User's phone number
          userDetails: { name: userName }, // Only name is dynamic
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        console.error("WhatsApp API response error:", data);
        Swal.fire({
          icon: "error",
          title: "Message Failed",
          text: "Failed to send WhatsApp message.",
        });
      } else {
        console.log("WhatsApp message sent successfully:", data);
      }
    } catch (error) {
      console.error("Error sending WhatsApp message:", error);
    }
  };

  // Submit feedback to Firestore
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!phoneNumber) {
      Swal.fire({
        icon: "error",
        title: "Missing Phone Number",
        text: "Phone number is missing. Please check the link.",
      });
      return;
    }

    if (!validateFeedback()) return; // Stop submission if validation fails

    try {
      const registrationRef = doc(db, "registerations", phoneNumber);
      await updateDoc(registrationRef, { feedback });

      Swal.fire({
        icon: "success",
        title: "Thank You!",
        text: "Your feedback has been successfully submitted.",
      });

      // ✅ Send WhatsApp message with user's name from Firestore
      sendWhatsAppMessage(userName, phoneNumber);
    } catch (err) {
      console.error("Error submitting feedback:", err);
      Swal.fire({
        icon: "error",
        title: "Submission Failed",
        text: "An error occurred while submitting your feedback. Please try again later.",
      });
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <section className="feedbackContainer">
      <div className="feedback_logo">
        <img src="/Universary.png" alt="Logo" />
      </div>
      <div className="feedback-form-container">
        <h2 className="feedback-form-title">Feedback Form</h2>
        {error && <p className="error-message">{error}</p>} {/* Display error messages */}
        <form onSubmit={handleSubmit}>
          <ul className="feedback-questions">
            {questions.map((question) => (
              <li className="feedback-question-row" key={question.id}>
                <div className="feedback-options">
                  <h3 className="feedback-question-title">{question.text}</h3>
                  {question.options.map((option, i) => (
                    <label key={i}>
                      <input
                        type="radio" // ✅ Changed to radio button (single select)
                        name={question.id}
                        value={option}
                        checked={feedback[question.id] === option}
                        onChange={() => handleChange(question.id, option)}
                      />
                      {option}
                    </label>
                  ))}
                </div>
              </li>
            ))}
             <li className="feedback-question-row">
              <div className="feedback-options">
                <h3 className="feedback-question-title">Overall feedback or shoutouts? (Type away! 🚀)</h3>
                <textarea
                  className="feedback-comment-box"
                  value={feedback.comment}
                  onChange={handleCommentChange}
                  placeholder="Write your comments here"
                />
              </div>
            </li>
          </ul>
          <button className="submitbtns" type="submit">
            Submit
          </button>
        </form>
      </div>
    </section>
  );
};

export default FeedbackForm;
