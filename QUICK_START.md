# 🚀 Quick Start Guide

Get your professional VideoAI platform running in 5 minutes!

## Prerequisites
- Node.js (v16+)
- RunwayML API Key
- Cloudinary Account

## Installation

```bash
# 1. Install all dependencies
npm run install-all

# 2. Create backend environment file
cp backend/.env.example backend/.env

# 3. Edit backend/.env with your API keys
# RUNWAY_API_KEY=your_actual_runway_api_key
# CLOUDINARY_CLOUD_NAME=your_cloud_name
# CLOUDINARY_API_KEY=your_api_key
# CLOUDINARY_API_SECRET=your_api_secret
```

## Get API Keys

### RunwayML API Key
1. Go to [RunwayML](https://runwayml.com/)
2. Sign up → Go to Settings → API Keys
3. Create new API key
4. Copy to your backend/.env file

### Cloudinary Setup
1. Go to [Cloudinary](https://cloudinary.com/)
2. Sign up → Dashboard
3. Copy Cloud Name, API Key, API Secret
4. Add to your backend/.env file

## Run the Application

```bash
# Start both frontend and backend
npm run dev
```

Open http://localhost:3000 in your browser!

## Test Video Generation

1. Enter a creative prompt:
   ```
   "A serene sunset over a mountain lake with gentle ripples"
   ```

2. Optionally upload an image

3. Click "Generate Video"

4. Wait for the magic! ✨

## Troubleshooting

If you encounter issues:

```bash
# Check setup
npm run setup-check

# Individual services
npm run server  # Backend only
npm run client  # Frontend only
```

## Quick Tips

- Video generation takes 2-5 minutes
- Use descriptive, cinematic prompts
- Images should be under 50MB
- Supported formats: JPEG, PNG, WebP

---

**Ready to create amazing videos!** 🎬