import React, { useState, useRef } from 'react';
import axios from 'axios';
import './App.css';

interface VideoTask {
  taskId: string;
  status: 'processing' | 'completed' | 'failed' | 'timeout';
  prompt: string;
  imageUrl?: string;
  videoUrl?: string;
  error?: string;
  createdAt: string;
  completedAt?: string;
}

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function App() {
  const [prompt, setPrompt] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [currentTask, setCurrentTask] = useState<VideoTask | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        setError('Image file size must be less than 50MB');
        return;
      }
      
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setError('Please select a valid image file (JPEG, PNG, or WebP)');
        return;
      }

      setSelectedImage(file);
      setError('');
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await axios.post(`${API_BASE_URL}/upload-image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.imageUrl;
  };

  const generateVideo = async () => {
    if (!prompt.trim()) {
      setError('Please enter a creative prompt');
      return;
    }

    setIsGenerating(true);
    setError('');
    setCurrentTask(null);

    try {
      let imageUrl = '';
      
      // Upload image if selected
      if (selectedImage) {
        console.log('Uploading image...');
        imageUrl = await uploadImage(selectedImage);
        console.log('Image uploaded:', imageUrl);
      }

      // Start video generation
      console.log('Starting video generation...');
      const response = await axios.post(`${API_BASE_URL}/generate-video`, {
        prompt: prompt.trim(),
        imageUrl: imageUrl || undefined,
      });

      const taskId = response.data.taskId;
      console.log('Video generation started, task ID:', taskId);

      // Start polling for status
      pollVideoStatus(taskId);

    } catch (error: any) {
      console.error('Error generating video:', error);
      setError(error.response?.data?.error || 'Failed to generate video');
      setIsGenerating(false);
    }
  };

  const pollVideoStatus = async (taskId: string) => {
    const maxAttempts = 120; // 10 minutes with 5-second intervals
    let attempts = 0;

    const poll = async () => {
      try {
        attempts++;
        const response = await axios.get(`${API_BASE_URL}/video-status/${taskId}`);
        const task: VideoTask = response.data;
        
        setCurrentTask(task);

        if (task.status === 'completed') {
          setIsGenerating(false);
          console.log('Video generation completed!');
        } else if (task.status === 'failed' || task.status === 'timeout') {
          setIsGenerating(false);
          setError(task.error || 'Video generation failed');
        } else if (attempts >= maxAttempts) {
          setIsGenerating(false);
          setError('Video generation timed out');
        } else {
          // Continue polling
          setTimeout(poll, 5000);
        }
      } catch (error: any) {
        console.error('Polling error:', error);
        if (attempts >= maxAttempts) {
          setIsGenerating(false);
          setError('Failed to check video status');
        } else {
          setTimeout(poll, 5000);
        }
      }
    };

    poll();
  };

  const downloadVideo = () => {
    if (currentTask?.videoUrl) {
      const link = document.createElement('a');
      link.href = currentTask.videoUrl;
      link.download = `generated-video-${currentTask.taskId}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const resetForm = () => {
    setPrompt('');
    setSelectedImage(null);
    setImagePreview('');
    setCurrentTask(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="App">
      <div className="container">
        <header className="header">
          <h1>🎬 AI Video Generator</h1>
          <p>Create stunning videos from text prompts using RunwayML</p>
        </header>

        <div className="main-content">
          {!currentTask?.videoUrl && (
            <div className="input-section">
              <div className="prompt-section">
                <label htmlFor="prompt">
                  <h3>✨ Describe your video scene</h3>
                </label>
                <textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., A marble Ganesh idol with flowers blowing in the wind, cinematic lighting, 4K quality..."
                  disabled={isGenerating}
                  rows={4}
                />
              </div>

              <div className="image-section">
                <h3>🖼️ Optional: Upload reference image</h3>
                {!imagePreview ? (
                  <div className="image-upload">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      disabled={isGenerating}
                      style={{ display: 'none' }}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isGenerating}
                      className="upload-btn"
                    >
                      Choose Image
                    </button>
                    <p className="upload-note">Supports JPEG, PNG, WebP (max 50MB)</p>
                  </div>
                ) : (
                  <div className="image-preview">
                    <img src={imagePreview} alt="Preview" />
                    <button 
                      onClick={removeImage} 
                      disabled={isGenerating}
                      className="remove-btn"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              {error && (
                <div className="error-message">
                  ⚠️ {error}
                </div>
              )}

              <button
                onClick={generateVideo}
                disabled={isGenerating || !prompt.trim()}
                className="generate-btn"
              >
                {isGenerating ? '🔄 Generating Video...' : '🚀 Generate Video'}
              </button>
            </div>
          )}

          {isGenerating && (
            <div className="loading-section">
              <div className="loading-animation">
                <div className="loading-spinner"></div>
                <h3>🎥 Creating your video...</h3>
                <p>This may take a few minutes. Please don't close this tab.</p>
                {currentTask && (
                  <div className="task-info">
                    <p><strong>Prompt:</strong> {currentTask.prompt}</p>
                    <p><strong>Status:</strong> {currentTask.status}</p>
                    <p><strong>Started:</strong> {new Date(currentTask.createdAt).toLocaleTimeString()}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {currentTask?.videoUrl && (
            <div className="result-section">
              <h3>🎉 Your video is ready!</h3>
              <div className="video-player">
                <video 
                  controls 
                  autoPlay 
                  loop
                  src={currentTask.videoUrl}
                  className="generated-video"
                >
                  Your browser does not support the video tag.
                </video>
              </div>
              
              <div className="video-actions">
                <button onClick={downloadVideo} className="download-btn">
                  📥 Download Video
                </button>
                <button onClick={resetForm} className="new-video-btn">
                  ✨ Create New Video
                </button>
              </div>

              <div className="video-details">
                <p><strong>Prompt:</strong> {currentTask.prompt}</p>
                {currentTask.imageUrl && (
                  <p><strong>Reference Image:</strong> Used</p>
                )}
                <p><strong>Generated:</strong> {new Date(currentTask.completedAt || '').toLocaleString()}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
