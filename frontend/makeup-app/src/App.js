import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const App = () => {
  const [file, setFile] = useState(null);
  const [skinTone, setSkinTone] = useState("");
  const [quizData, setQuizData] = useState({
    makeupStyle: "",
    skinType: "",
    finish: "",
  });
  const [recommendations, setRecommendations] = useState([]);
  const [step, setStep] = useState(1); // Controls quiz steps

  // Handle file upload
  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  // Handle quiz input change
  const handleQuizChange = (event) => {
    setQuizData({
      ...quizData,
      [event.target.name]: event.target.value,
    });
    setStep(step + 1); // Move to next question automatically
  };

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!file) {
      alert("Please select an image!");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    try {
      // Step 1: Upload Image & Detect Skin Tone
      const response = await fetch("http://127.0.0.1:5000/upload-image", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setSkinTone(data.skin_tone);

      // Step 2: Send Quiz Data + Skin Tone to Backend
      const recResponse = await fetch("http://127.0.0.1:5000/full-makeup-recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          skin_tone: data.skin_tone, 
          makeupStyle: quizData.makeupStyle,
          skinType: quizData.skinType,
          finish: quizData.finish
        }),
      });

      const recData = await recResponse.json();
      setRecommendations(recData.recommendations);

    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong. Please try again!");
    }
  };

  return (
    <div className="container text-center mt-5" style={{ backgroundColor: "#2F2963", minHeight: "100vh", padding: "30px", borderRadius: "20px" }}>
      <h1 className="fw-bold text-primary"> Personalized Makeup Quiz </h1>

      {/* Image Upload Section */}
      {step === 1 && (
        <div className="mt-4">
          <h2 className="text-secondary"> Upload a Selfie</h2>
          <input type="file" onChange={handleFileChange} accept="image/*" className="form-control mb-3" />
          <button className="btn btn-dark" onClick={() => setStep(2)}>Next →</button>
        </div>
      )}

      {/* Quiz Section */}
      {step === 2 && (
        <div className="mt-4">
          <h2 className="text-secondary"> What's your preferred makeup style?</h2>
          <button className="btn btn-outline-dark w-100 mt-2" name="makeupStyle" value="natural" onClick={handleQuizChange}>Natural</button>
          <button className="btn btn-outline-dark w-100 mt-2" name="makeupStyle" value="glam" onClick={handleQuizChange}>Glam</button>
          <button className="btn btn-outline-dark w-100 mt-2" name="makeupStyle" value="bold" onClick={handleQuizChange}>Bold</button>
        </div>
      )}

      {step === 3 && (
        <div className="mt-4">
          <h2 className="text-secondary"> What's your skin type?</h2>
          <button className="btn btn-outline-dark w-100 mt-2" name="skinType" value="oily" onClick={handleQuizChange}>Oily</button>
          <button className="btn btn-outline-dark w-100 mt-2" name="skinType" value="dry" onClick={handleQuizChange}>Dry</button>
          <button className="btn btn-outline-dark w-100 mt-2" name="skinType" value="combination" onClick={handleQuizChange}>Combination</button>
        </div>
      )}

      {step === 4 && (
        <div className="mt-4">
          <h2 className="text-secondary">What type of finish do you prefer?</h2>
          <button className="btn btn-outline-dark w-100 mt-2" name="finish" value="matte" onClick={handleQuizChange}>Matte</button>
          <button className="btn btn-outline-dark w-100 mt-2" name="finish" value="dewy" onClick={handleQuizChange}>Dewy</button>
        </div>
      )}

      {step === 5 && (
        <div className="mt-4">
          <button className="btn btn-success px-4 py-2" onClick={handleSubmit}>✨ Get Recommendations! ✨</button>
        </div>
      )}

      {/* Display Results */}
      {skinTone && <h2 className="mt-4"> Detected Skin Tone: <span className="text-primary">{skinTone}</span></h2>}
      
      {recommendations.length > 0 && (
        <div className="mt-4">
          <h2>💄 Recommended Products:</h2>
          <div className="row justify-content-center">
            {recommendations.map((product) => (
              <div key={product.id} className="col-md-3 mb-3">
                <div className="card shadow-sm">
                  <div className="card-body">
                    <h5 className="card-title">{product.name}</h5>
                    <a href={product.link} target="_blank" rel="noopener noreferrer" className="btn btn-outline-dark btn-sm">
                      View Product
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
