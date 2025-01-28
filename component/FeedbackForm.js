import { useState } from 'react';
import { useRouter } from 'next/router';
import { db } from '../firebaseConfig'; // Adjust the path as necessary
import { doc, updateDoc } from 'firebase/firestore';
import Swal from 'sweetalert2';
import "../src/app/styles/main.scss";
import "../pages/feedback.css";
import "../pages/event.css"

const FeedbackForm = () => {
  const router = useRouter();
  const { phoneNumber } = router.query;

  const questions = [
    {
      id: 'q1',
      text: 'How satisfied are you with the event?',
      options: ['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied'],
    },
    {
      id: 'q2',
      text: 'How was the quality of the speakers?',
      options: ['Excellent', 'Good', 'Average', 'Poor'],
    },
    {
      id: 'q3',
      text: 'Was the event organized well?',
      options: ['Yes', 'Mostly', 'Somewhat', 'No'],
    },
    {
      id: 'q4',
      text: 'Would you attend another event like this?',
      options: ['Definitely', 'Maybe', 'Not Sure', 'No'],
    },
    {
      id: 'q5',
      text: 'How likely are you to recommend this event to others?',
      options: ['Very Likely', 'Likely', 'Neutral', 'Unlikely'],
    },
  ];

  const [feedback, setFeedback] = useState(
    questions.reduce((acc, question) => {
      acc[question.id] = [];
      return acc;
    }, { comment: '' })
  );

  const handleChange = (questionId, option) => {
    setFeedback((prev) => {
      const selectedOptions = prev[questionId];
      return {
        ...prev,
        [questionId]: selectedOptions.includes(option)
          ? selectedOptions.filter((opt) => opt !== option)
          : [...selectedOptions, option],
      };
    });
  };

  const handleCommentChange = (e) => {
    setFeedback((prev) => ({ ...prev, comment: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!phoneNumber) {
      Swal.fire({
        icon: 'error',
        title: 'Missing Phone Number',
        text: 'Phone number is missing. Please check the link.',
      });
      return;
    }
    try {
      const registrationRef = doc(db, 'registerations', phoneNumber);
      await updateDoc(registrationRef, { feedback });
      Swal.fire({
        icon: 'success',
        title: 'Thank You!',
        text: 'Your feedback has been successfully submitted.',
      });
    } catch (err) {
      console.error('Error submitting feedback:', err);
      Swal.fire({
        icon: 'error',
        title: 'Submission Failed',
        text: 'An error occurred while submitting your feedback. Please try again later.',
      });
    }
  };

  return (
    <section className='feedbackContainer'>
    <div className='feedback_logo'>
          <img src="/Universary.png" alt="Logo" />
        </div>
      <div className="feedback-form-container">
        <h2 className="feedback-form-title">Feedback Form</h2>
        <form onSubmit={handleSubmit}>
          <ul className="feedback-questions">
            {questions.map((question) => (
              <li className="feedback-question-row" key={question.id}>
                <div className="feedback-options">
                  <h3 className="feedback-question-title">{question.text}</h3>
                  {question.options.map((option, i) => (
                    <label key={i}>
                      <input
                        type="checkbox"
                        value={option}
                        checked={feedback[question.id].includes(option)}
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
                <h3 className="feedback-question-title">Additional Comments</h3>
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
