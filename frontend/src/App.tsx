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
  const [videoHistory, setVideoHistory] = useState<VideoTask[]>([]);
  const [activeTab, setActiveTab] = useState<'generate' | 'history'>('generate');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
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
      
      if (selectedImage) {
        imageUrl = await uploadImage(selectedImage);
      }

      const response = await axios.post(`${API_BASE_URL}/generate-video`, {
        prompt: prompt.trim(),
        imageUrl: imageUrl || undefined,
      });

      const taskId = response.data.taskId;
      pollVideoStatus(taskId);

    } catch (error: any) {
      console.error('Error generating video:', error);
      setError(error.response?.data?.error || 'Failed to generate video');
      setIsGenerating(false);
    }
  };

  const pollVideoStatus = async (taskId: string) => {
    const maxAttempts = 120;
    let attempts = 0;

    const poll = async () => {
      try {
        attempts++;
        const response = await axios.get(`${API_BASE_URL}/video-status/${taskId}`);
        const task: VideoTask = response.data;
        
        setCurrentTask(task);

        if (task.status === 'completed') {
          setIsGenerating(false);
          setVideoHistory(prev => [task, ...prev]);
          // Clear form
          setPrompt('');
          setSelectedImage(null);
          setImagePreview('');
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        } else if (task.status === 'failed' || task.status === 'timeout') {
          setIsGenerating(false);
          setError(task.error || 'Video generation failed');
        } else if (attempts >= maxAttempts) {
          setIsGenerating(false);
          setError('Video generation timed out');
        } else {
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

  const downloadVideo = (videoUrl: string, taskId: string) => {
    const link = document.createElement('a');
    link.href = videoUrl;
    link.download = `ai-video-${taskId}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const suggestedPrompts = [
    "A serene sunset over a mountain lake with gentle ripples",
    "A bustling cyberpunk street scene with neon lights reflecting on wet pavement",
    "A marble statue coming to life in an ancient temple",
    "Cherry blossoms falling in slow motion in a Japanese garden",
    "A majestic eagle soaring through misty mountain peaks",
    "Ocean waves crashing against dramatic coastal cliffs"
  ];

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-left">
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M3 12h18m-9-9v18"/>
            </svg>
          </button>
          <div className="logo">
            <div className="logo-icon">🎬</div>
            <span className="logo-text">VideoAI</span>
          </div>
        </div>
        <div className="header-right">
          <div className="user-menu">
            <div className="user-avatar">AI</div>
          </div>
        </div>
      </header>

      <div className="main-layout">
        {/* Sidebar */}
        <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
          <nav className="sidebar-nav">
            <button 
              className={`nav-item ${activeTab === 'generate' ? 'active' : ''}`}
              onClick={() => setActiveTab('generate')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              <span>Generate</span>
            </button>
            <button 
              className={`nav-item ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z"/>
              </svg>
              <span>History</span>
              {videoHistory.length > 0 && (
                <span className="badge">{videoHistory.length}</span>
              )}
            </button>
          </nav>

          <div className="sidebar-footer">
            <div className="upgrade-card">
              <div className="upgrade-icon">⚡</div>
              <div className="upgrade-content">
                <h4>Upgrade to Pro</h4>
                <p>Unlimited generations, HD quality, and more</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          {activeTab === 'generate' && (
            <div className="generate-section">
              <div className="content-header">
                <h1>Create Your Video</h1>
                <p>Describe your vision and watch AI bring it to life</p>
              </div>

              {/* Input Area */}
              <div className="input-container">
                <div className="prompt-input-wrapper">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe the video you want to create..."
                    disabled={isGenerating}
                    rows={4}
                    className="prompt-input"
                  />
                  
                  <div className="input-actions">
                    <div className="left-actions">
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
                        className="attach-btn"
                        title="Upload reference image"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66L9.64 16.2a2 2 0 01-2.83-2.83l8.49-8.49"/>
                        </svg>
                      </button>
                    </div>
                    
                    <button
                      onClick={generateVideo}
                      disabled={isGenerating || !prompt.trim()}
                      className="generate-btn-main"
                    >
                      {isGenerating ? (
                        <>
                          <div className="spinner"></div>
                          Generating...
                        </>
                      ) : (
                        <>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-7-7l7 7-7 7"/>
                          </svg>
                          Generate
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {imagePreview && (
                  <div className="image-preview-card">
                    <img src={imagePreview} alt="Reference" />
                    <button onClick={removeImage} className="remove-image-btn">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12"/>
                      </svg>
                    </button>
                  </div>
                )}

                {error && (
                  <div className="error-banner">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                    </svg>
                    {error}
                  </div>
                )}
              </div>

              {/* Suggested Prompts */}
              {!isGenerating && !currentTask && (
                <div className="suggestions">
                  <h3>Try these prompts</h3>
                  <div className="suggestions-grid">
                    {suggestedPrompts.map((suggestion, index) => (
                      <button
                        key={index}
                        className="suggestion-card"
                        onClick={() => setPrompt(suggestion)}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Generation Status */}
              {isGenerating && currentTask && (
                <div className="generation-status">
                  <div className="status-card">
                    <div className="status-header">
                      <div className="status-icon">
                        <div className="status-spinner"></div>
                      </div>
                      <div className="status-info">
                        <h3>Creating your video</h3>
                        <p>This usually takes 2-5 minutes</p>
                      </div>
                    </div>
                    <div className="status-details">
                      <div className="detail-item">
                        <span className="label">Prompt:</span>
                        <span className="value">{currentTask.prompt}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Status:</span>
                        <span className="value capitalize">{currentTask.status}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Started:</span>
                        <span className="value">{new Date(currentTask.createdAt).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Completed Video */}
              {currentTask?.videoUrl && (
                <div className="video-result">
                  <div className="result-header">
                    <h3>Your video is ready!</h3>
                    <button 
                      onClick={() => downloadVideo(currentTask.videoUrl!, currentTask.taskId)}
                      className="download-btn-header"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4m7-10l-4 4m4-4l4 4m-4-4v12"/>
                      </svg>
                      Download
                    </button>
                  </div>
                  <div className="video-container">
                    <video 
                      controls 
                      autoPlay 
                      loop
                      src={currentTask.videoUrl}
                      className="result-video"
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                  <div className="result-meta">
                    <span>Generated {new Date(currentTask.completedAt || '').toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="history-section">
              <div className="content-header">
                <h1>Video History</h1>
                <p>Your previously generated videos</p>
              </div>

              {videoHistory.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📼</div>
                  <h3>No videos yet</h3>
                  <p>Your generated videos will appear here</p>
                  <button 
                    onClick={() => setActiveTab('generate')}
                    className="cta-btn"
                  >
                    Create your first video
                  </button>
                </div>
              ) : (
                <div className="history-grid">
                  {videoHistory.map((video) => (
                    <div key={video.taskId} className="history-card">
                      <div className="video-thumbnail">
                        <video 
                          src={video.videoUrl}
                          className="thumbnail-video"
                          muted
                          onMouseEnter={(e) => e.currentTarget.play()}
                          onMouseLeave={(e) => e.currentTarget.pause()}
                        />
                        <div className="video-overlay">
                          <button 
                            onClick={() => downloadVideo(video.videoUrl!, video.taskId)}
                            className="overlay-btn"
                          >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                              <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4m7-10l-4 4m4-4l4 4m-4-4v12"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                      <div className="card-content">
                        <p className="video-prompt">{video.prompt}</p>
                        <div className="video-meta">
                          <span className="video-date">
                            {new Date(video.completedAt || '').toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
