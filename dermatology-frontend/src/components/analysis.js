import React, { useState } from 'react';
import axios from 'axios';

const AnalysisPage = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [prediction, setPrediction] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
        setError('Only JPEG/JPG/PNG images are allowed');
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }

      setSelectedFile(file);
      setError('');
      setPrediction(null);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await axios.post('http://localhost:8502/api/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setPrediction(response.data);
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err.response?.data?.detail || 'Failed to analyze image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Patch Test Analysis</h1>
          <p className="mt-2 text-gray-600">Upload an image to analyze with our AI model</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Image *
            </label>
            <div className="flex items-center">
              <label className="cursor-pointer bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition">
                <span>Choose Image</span>
                <input
                  type="file"
                  accept="image/jpeg, image/jpg, image/png"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
              {selectedFile && (
                <span className="ml-3 text-sm text-gray-600 truncate max-w-xs">
                  {selectedFile.name}
                </span>
              )}
            </div>
          </div>

          {previewImage && (
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-800 mb-2">Preview</h3>
              <img 
                src={previewImage} 
                alt="Preview" 
                className="max-w-full h-auto rounded-lg mx-auto"
              />
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading || !selectedFile}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                isLoading || !selectedFile ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing...
                </>
              ) : 'Analyze Image'}
            </button>
          </div>
        </form>

        {prediction && (
          <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg">
            <h2 className="text-xl font-bold text-green-800 mb-4">Analysis Results</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-800">Predicted Class</h3>
                <p className="text-2xl font-bold text-green-600">{prediction.predicted_class}</p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-800">Probabilities</h3>
                <div className="space-y-2">
                  {Object.entries(prediction.probabilities).map(([className, probability]) => (
                    <div key={className} className="flex items-center">
                      <span className="w-32 text-gray-700">{className}</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-4">
                        <div 
                          className="bg-indigo-600 h-4 rounded-full" 
                          style={{ width: `${probability * 100}%` }}
                        ></div>
                      </div>
                      <span className="ml-2 w-16 text-gray-700">{(probability * 100).toFixed(2)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisPage;