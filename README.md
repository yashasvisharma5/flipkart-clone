# 🎬 VideoAI - Professional AI Video Generation Platform

A sophisticated, enterprise-grade React + Node.js web application that generates videos from text prompts using the RunwayML API. Built with the same professional standards as ChatGPT, Claude, and other leading AI platforms.

![VideoAI Platform](https://via.placeholder.com/800x400/667eea/ffffff?text=VideoAI+Platform)

## ✨ Features

### 🎨 Professional AI Platform Design
- **ChatGPT-Style Interface**: Modern, clean design matching industry standards
- **Sidebar Navigation**: Professional navigation with active states and badges
- **Header with Branding**: Polished header with logo and user menu
- **Tabbed Interface**: Organize features with Generate and History tabs
- **Loading Screens**: Professional loading animations and splash screen
- **Inter Typography**: Premium font stack for crisp, readable text

### 🚀 Core Functionality
- **Text-to-Video Generation**: Create videos from creative text prompts
- **Image-to-Video**: Upload reference images to guide video generation
- **Real-time Progress Tracking**: Live status updates during video creation
- **Video History**: Keep track of all generated videos with thumbnails
- **Suggested Prompts**: Quick-start templates for inspiration
- **Video Download**: Download generated videos directly
- **Cloud Integration**: Uses Cloudinary for image storage
- **Mobile Responsive**: Works perfectly on all devices

## 🚀 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Professional Design System** with reusable components
- **Inter Font** for premium typography
- **CSS Grid & Flexbox** for responsive layouts
- **Axios** for API communication
- **Modern Animations** with CSS transforms and transitions
- **Mobile-First Responsive Design**

### Backend
- **Node.js** with Express
- **RunwayML API** for video generation
- **Cloudinary** for image storage and processing
- **File Upload** handling with validation
- **Background polling** for video status

## 📋 Prerequisites

Before running this application, make sure you have:

1. **Node.js** (v16 or higher)
2. **npm** or **yarn**
3. **RunwayML API Key** - [Get one here](https://runwayml.com/)
4. **Cloudinary Account** - [Sign up here](https://cloudinary.com/)

## 🛠️ Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd runwayml-video-generator
```

### 2. Install dependencies
```bash
# Install root dependencies
npm install

# Install all project dependencies (frontend + backend)
npm run install-all
```

### 3. Environment Setup

#### Backend Environment Variables
Create a `.env` file in the `backend` directory:

```env
# RunwayML API Configuration
RUNWAY_API_KEY=your_runway_api_key_here

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Server Configuration
PORT=5000
NODE_ENV=development
```

#### Frontend Environment Variables
Create a `.env` file in the `frontend` directory:

```env
REACT_APP_API_URL=http://localhost:5000
```

### 4. Get API Keys

#### RunwayML API Key
1. Visit [RunwayML](https://runwayml.com/)
2. Sign up for an account
3. Navigate to API settings
4. Generate an API key
5. Add it to your backend `.env` file

#### Cloudinary Configuration
1. Sign up at [Cloudinary](https://cloudinary.com/)
2. Go to your dashboard
3. Copy your Cloud Name, API Key, and API Secret
4. Add them to your backend `.env` file

## 🎯 Usage

### Development Mode

Start both frontend and backend in development mode:

```bash
npm run dev
```

This will start:
- **Backend server** on `http://localhost:5000`
- **Frontend development server** on `http://localhost:3000`

### Individual Services

Start only the backend:
```bash
npm run server
```

Start only the frontend:
```bash
npm run client
```

### Production Build

Build the frontend for production:
```bash
npm run build
```

Start the production server:
```bash
npm start
```

## 🎮 How to Use

1. **Open the application** in your browser at `http://localhost:3000`

2. **Enter a creative prompt** describing the video you want to generate:
   ```
   "A marble Ganesh idol with flowers blowing in the wind, cinematic lighting, 4K quality"
   ```

3. **Upload an image** (optional) to guide the video generation

4. **Click "Generate Video"** and wait for the magic to happen

5. **Download your video** once it's ready!

## 🏗️ Project Structure

```
runwayml-video-generator/
├── backend/                 # Node.js Express server
│   ├── server.js           # Main server file
│   ├── package.json        # Backend dependencies
│   └── .env.example        # Environment variables template
├── frontend/               # React application
│   ├── src/
│   │   ├── App.tsx         # Main React component
│   │   ├── App.css         # Styles
│   │   └── index.tsx       # React entry point
│   ├── package.json        # Frontend dependencies
│   └── .env                # Frontend environment variables
├── package.json            # Root package.json with scripts
└── README.md              # This file
```

## 🔧 API Endpoints

### Backend API

- `GET /` - Health check
- `POST /upload-image` - Upload image to Cloudinary
- `POST /generate-video` - Start video generation
- `GET /video-status/:taskId` - Check video generation status

### Frontend API Communication

The React app communicates with the backend using Axios:
- Uploads images before video generation
- Polls the server for video status updates
- Downloads completed videos

## ⚡ Performance Features

- **Background Processing**: Videos generate in the background
- **Status Polling**: Real-time updates every 5 seconds
- **Error Handling**: Comprehensive error messages
- **File Validation**: Image size and type validation
- **Memory Management**: Automatic cleanup of old tasks

## 🎨 UI/UX Features

- **Modern Design**: Beautiful gradients and animations
- **Responsive Layout**: Works on desktop, tablet, and mobile
- **Loading States**: Engaging animations during processing
- **Error Messages**: Clear, user-friendly error handling
- **Progress Feedback**: Real-time status updates

## 🚨 Error Handling

The application handles various error scenarios:

- **Invalid API keys**: Clear error messages
- **File upload errors**: Size and type validation
- **Network issues**: Retry mechanisms
- **Video generation failures**: Detailed error reporting
- **Timeout handling**: Automatic timeout after 10 minutes

## 🔒 Security Considerations

- **File validation**: Strict image type and size limits
- **Environment variables**: Sensitive data stored securely
- **CORS configuration**: Proper cross-origin handling
- **Input sanitization**: Clean user inputs

## 🐛 Troubleshooting

### Common Issues

1. **"Failed to generate video"**
   - Check your RunwayML API key
   - Ensure you have sufficient API credits
   - Verify your internet connection

2. **"Failed to upload image"**
   - Check your Cloudinary configuration
   - Ensure image is under 50MB
   - Use supported formats (JPEG, PNG, WebP)

3. **Backend not starting**
   - Verify all environment variables are set
   - Check if port 5000 is available
   - Install backend dependencies

### Debug Mode

Set `NODE_ENV=development` in your backend `.env` for detailed logging.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

If you encounter any issues or have questions:

1. Check the troubleshooting section
2. Review the error messages
3. Ensure all API keys are correctly configured
4. Check the browser console for errors

## 🚀 Future Enhancements

- [ ] Video history and gallery
- [ ] Multiple video styles and models
- [ ] Batch video generation
- [ ] User authentication
- [ ] Video editing capabilities
- [ ] Social sharing features

---

**Happy video creating!** 🎬✨