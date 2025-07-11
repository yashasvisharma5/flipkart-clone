const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const fileUpload = require('express-fileupload');
const axios = require('axios');
const cloudinary = require('cloudinary').v2;
const { v4: uuidv4 } = require('uuid');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/',
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
}));

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Store for tracking video generation tasks
const videoTasks = new Map();

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'RunwayML Video Generator API is running!' });
});

// Upload image to Cloudinary
app.post('/upload-image', async (req, res) => {
  try {
    if (!req.files || !req.files.image) {
      return res.status(400).json({ error: 'No image file uploaded' });
    }

    const image = req.files.image;
    
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(image.tempFilePath, {
      folder: 'runwayml-uploads',
      resource_type: 'image',
      transformation: [
        { width: 1280, height: 720, crop: 'fill' }, // Standard video dimensions
        { quality: 'auto' }
      ]
    });

    res.json({
      success: true,
      imageUrl: result.secure_url,
      publicId: result.public_id
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// Generate video using RunwayML API
app.post('/generate-video', async (req, res) => {
  try {
    const { prompt, imageUrl } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const taskId = uuidv4();
    
    // Store task info
    videoTasks.set(taskId, {
      status: 'processing',
      prompt,
      imageUrl,
      createdAt: new Date()
    });

    // RunwayML API call (Gen-3 Alpha Turbo)
    const runwayPayload = {
      model: 'gen3a_turbo',
      prompt_text: prompt,
      duration: 5, // 5 seconds
      ratio: '16:9',
      seed: Math.floor(Math.random() * 1000000)
    };

    // Add image if provided
    if (imageUrl) {
      runwayPayload.prompt_image = imageUrl;
    }

    console.log('Sending request to RunwayML:', runwayPayload);

    const runwayResponse = await axios.post(
      'https://api.runwayml.com/v1/image_to_video',
      runwayPayload,
      {
        headers: {
          'Authorization': `Bearer ${process.env.RUNWAY_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const runwayTaskId = runwayResponse.data.id;
    
    // Update task with RunwayML task ID
    videoTasks.set(taskId, {
      ...videoTasks.get(taskId),
      runwayTaskId,
      status: 'processing'
    });

    res.json({
      success: true,
      taskId,
      message: 'Video generation started'
    });

    // Poll RunwayML API for completion (in background)
    pollVideoStatus(taskId, runwayTaskId);

  } catch (error) {
    console.error('Video generation error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to generate video',
      details: error.response?.data?.message || error.message
    });
  }
});

// Check video generation status
app.get('/video-status/:taskId', (req, res) => {
  const { taskId } = req.params;
  const task = videoTasks.get(taskId);

  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  res.json(task);
});

// Poll RunwayML API for video completion
async function pollVideoStatus(taskId, runwayTaskId) {
  const maxAttempts = 60; // 5 minutes with 5-second intervals
  let attempts = 0;

  const poll = async () => {
    try {
      attempts++;
      
      const response = await axios.get(
        `https://api.runwayml.com/v1/tasks/${runwayTaskId}`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.RUNWAY_API_KEY}`,
          },
        }
      );

      const status = response.data.status;
      const task = videoTasks.get(taskId);

      if (status === 'SUCCEEDED') {
        // Video is ready
        const videoUrl = response.data.output?.[0] || response.data.output;
        
        videoTasks.set(taskId, {
          ...task,
          status: 'completed',
          videoUrl,
          completedAt: new Date()
        });
        
        console.log(`Video generation completed for task ${taskId}`);
        return;
      } else if (status === 'FAILED') {
        videoTasks.set(taskId, {
          ...task,
          status: 'failed',
          error: response.data.failure_reason || 'Unknown error',
          failedAt: new Date()
        });
        
        console.log(`Video generation failed for task ${taskId}`);
        return;
      } else if (attempts >= maxAttempts) {
        videoTasks.set(taskId, {
          ...task,
          status: 'timeout',
          error: 'Video generation timed out',
          failedAt: new Date()
        });
        
        console.log(`Video generation timed out for task ${taskId}`);
        return;
      }

      // Continue polling
      setTimeout(poll, 5000); // Poll every 5 seconds
    } catch (error) {
      console.error('Polling error:', error.response?.data || error.message);
      
      if (attempts >= maxAttempts) {
        const task = videoTasks.get(taskId);
        videoTasks.set(taskId, {
          ...task,
          status: 'failed',
          error: 'Polling failed',
          failedAt: new Date()
        });
      } else {
        setTimeout(poll, 5000);
      }
    }
  };

  poll();
}

// Clean up old tasks (optional)
setInterval(() => {
  const now = new Date();
  for (const [taskId, task] of videoTasks.entries()) {
    const age = now - task.createdAt;
    if (age > 24 * 60 * 60 * 1000) { // 24 hours
      videoTasks.delete(taskId);
    }
  }
}, 60 * 60 * 1000); // Run every hour

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Environment variables check:');
  console.log('- RUNWAY_API_KEY:', process.env.RUNWAY_API_KEY ? 'Set' : 'Not set');
  console.log('- CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? 'Set' : 'Not set');
});