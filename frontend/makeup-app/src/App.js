import React, { useState, useRef, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css"; // Make sure you create and include this CSS file

const App = () => {
  const [step, setStep] = useState(0);
  const [quizData, setQuizData] = useState({
    makeupStyle: "",
    skinType: "",
    finish: "",
  });
  const [file, setFile] = useState(null);
  const [skinTone, setSkinTone] = useState("");
  const [recommendations, setRecommendations] = useState({});
  const sectionsRef = useRef([]);

  useEffect(() => {
    if (sectionsRef.current[step]) {
      sectionsRef.current[step].scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [step]);

  const handleQuizChange = (event) => {
    setQuizData({ ...quizData, [event.target.name]: event.target.value });
    setTimeout(() => setStep((prevStep) => prevStep + 1), 700);
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) {
      alert("Please select an image!");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch("http://127.0.0.1:5000/upload-image", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      setSkinTone(data.skin_tone);

      const recResponse = await fetch(
        "http://127.0.0.1:5000/full-makeup-recommend",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            skin_tone: data.skin_tone,
            ...quizData,
          }),
        }
      );
      const recData = await recResponse.json();
      setRecommendations(recData.recommendations);
      setTimeout(() => setStep((prevStep) => prevStep + 1), 700);
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong. Please try again!");
    }
  };

  return (
    <div className="app-container">
      <h1>Makeup Recommender</h1>

      <div className="progress-bar-container">
        <div className="progress-bar" style={{ width: `${(step / 4) * 100}%` }}></div>
      </div>

      <div className="card-container">
        {step === 0 && (
          <div ref={(el) => (sectionsRef.current[0] = el)}>
            <h3>What is your preferred makeup style?</h3>
            <select name="makeupStyle" onChange={handleQuizChange} className="form-select">
              <option value="">Select</option>
              <option value="natural">Natural</option>
              <option value="glam">Glam</option>
              <option value="bold">Bold</option>
            </select>
          </div>
        )}

        {step === 1 && (
          <div ref={(el) => (sectionsRef.current[1] = el)}>
            <h3>What is your skin type?</h3>
            <select name="skinType" onChange={handleQuizChange} className="form-select">
              <option value="">Select</option>
              <option value="oily">Oily</option>
              <option value="dry">Dry</option>
              <option value="combination">Combination</option>
            </select>
          </div>
        )}

        {step === 2 && (
          <div ref={(el) => (sectionsRef.current[2] = el)}>
            <h3>What kind of finish do you prefer?</h3>
            <select name="finish" onChange={handleQuizChange} className="form-select">
              <option value="">Select</option>
              <option value="matte">Matte</option>
              <option value="dewy">Dewy</option>
            </select>
          </div>
        )}

        {step === 3 && (
          <div ref={(el) => (sectionsRef.current[3] = el)}>
            <h3>Upload an Image</h3>
            <input type="file" onChange={handleFileChange} className="form-control mb-3" accept="image/*" />
            <button className="btn btn-primary w-100" onClick={handleSubmit}>Get Recommendations</button>
          </div>
        )}
      </div>

      {step === 4 && skinTone && (
        <div ref={(el) => (sectionsRef.current[4] = el)} className="recommendations-container">
          <h2>Detected Skin Tone: {skinTone}</h2>
          <h4>Recommended Products:</h4>

          {recommendations && Object.entries(recommendations).map(([category, products]) => (
            <div key={category} className="category-section">
              <h2>{category.toUpperCase()}</h2>
              <div className="product-scroll-container">
                {products.map((product, index) => (
                  <div key={index} className="product-card">
                    <img src={product.image} alt={product.name} className="product-image" />
                    <p><strong>{product.brand}</strong>: {product.name}</p>
                    <p>{product.price}</p>
                    <a href={product.link} target="_blank" rel="noopener noreferrer" className="view-button">View Product</a>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default App;
