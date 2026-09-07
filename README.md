# 🎬 AI Video Automation SaaS

An AI-powered video automation platform that transforms a simple topic into a complete short-form video using **AI-generated scripts, professional voiceovers, AI-generated video scenes, and automated FFmpeg processing**.

The system is designed as a scalable SaaS architecture using **Django, Celery, Redis, PostgreSQL, Next.js, Gemini, ElevenLabs, KIE AI, and FFmpeg**.

---

## ✨ Overview

Creating videos manually requires scripting, voice recording, visual production, editing, captions, and exporting.

This platform automates the entire workflow:

```text
User Topic
    ↓
AI Script Generation
    ↓
Scene Generation
    ↓
AI Voiceover
    ↓
AI Video Generation
    ↓
Webhook Processing
    ↓
Download Video Scenes
    ↓
FFmpeg Processing
    ↓
Final Video
    ↓
Ready for Download / Publishing
```

The goal is to provide a production-ready platform for creating content for:

* YouTube Shorts
* TikTok
* Instagram Reels
* Educational videos
* Faceless YouTube channels
* Motivational content
* Documentary-style videos
* Product marketing
* Social media content

---

## 🚀 Key Features

### 🤖 AI Script Generation

Uses Google Gemini to generate structured video scripts.

Each generated video contains:

* Video title
* Narration
* Multiple scenes
* Visual prompts
* Scene descriptions

Example:

```json
{
  "title": "The Future of Artificial Intelligence",
  "scenes": [
    {
      "scene_number": 1,
      "narration": "Artificial intelligence is changing...",
      "visual_prompt": "A cinematic futuristic city..."
    }
  ]
}
```

---

### 🎙️ AI Voice Generation

Uses ElevenLabs to convert the generated script into natural-sounding narration.

The generated audio is stored and associated with the video.

```text
Gemini Script
     ↓
ElevenLabs
     ↓
MP3 Narration
```

---

### 🎥 AI Video Generation

Each scene is independently generated using KIE AI.

Instead of generating one large video, the system creates individual scene jobs:

```text
Scene 1 → KIE Task
Scene 2 → KIE Task
Scene 3 → KIE Task
Scene 4 → KIE Task
Scene 5 → KIE Task
```

This provides better control, retry capabilities, and future scene editing.

---

### 🔔 Webhook-Based Processing

KIE AI sends a webhook when a scene finishes processing.

The backend:

1. Receives the webhook.
2. Identifies the corresponding task.
3. Finds the matching video scene.
4. Downloads the generated MP4.
5. Updates the scene status.
6. Checks whether all scenes are complete.
7. Starts final video processing.

Example:

```text
KIE
 │
 │ Webhook
 ▼
Django
 │
 ▼
Find Scene
 │
 ▼
Download MP4
 │
 ▼
Update Database
```

---

### ⚙️ Celery Background Processing

Long-running AI operations are handled asynchronously using Celery.

This prevents API requests from blocking while AI services generate content.

Current pipeline:

```text
Django API
    ↓
Celery
    ↓
Gemini
    ↓
ElevenLabs
    ↓
KIE AI
```

---

### 🔴 Redis

Redis is used as the Celery message broker and result backend.

```text
Django
   ↓
Redis
   ↓
Celery Worker
   ↓
AI Processing
```

---

### 🎞️ FFmpeg Video Processing

FFmpeg is used for final video processing.

Planned processing pipeline:

```text
Scene 1 ─┐
Scene 2 ─┤
Scene 3 ─┼──→ FFmpeg ──→ Combined Video
Scene 4 ─┤
Scene 5 ─┘

ElevenLabs Audio ────────→ Audio Mixing
                              ↓
                         Final MP4
```

The final processing stage will support:

* Scene concatenation
* Voiceover synchronization
* Audio mixing
* Background music
* Video resizing
* Aspect ratio conversion
* Captions
* Fade effects

---

## 🏗️ Architecture

```text
                        ┌──────────────┐
                        │    User      │
                        └──────┬───────┘
                               │
                               ▼
                     ┌──────────────────┐
                     │    Next.js       │
                     │    Frontend      │
                     └────────┬─────────┘
                              │
                              ▼
                     ┌──────────────────┐
                     │  Django REST API │
                     └────────┬─────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
                    ▼                   ▼
                 PostgreSQL           Redis
                    │                   │
                    │                   ▼
                    │                Celery
                    │                   │
                    │          ┌────────┼─────────┐
                    │          │        │         │
                    ▼          ▼        ▼         ▼
                 Videos      Gemini  ElevenLabs  KIE
                    │
                    ▼
                  FFmpeg
                    │
                    ▼
               Final Video
```

---

## 🛠️ Technology Stack

### Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS
* Fetch API

### Backend

* Python
* Django
* Django REST-style API architecture
* Celery
* Redis

### Database

* PostgreSQL

### AI Services

* Google Gemini — script and scene generation
* ElevenLabs — AI voice generation
* KIE AI — AI video generation

### Media Processing

* FFmpeg

### Development & Deployment

* Git
* GitHub
* Docker
* Vercel
* Render / AWS

---

## 📁 Project Structure

```text
ai-video-automation/
│
├── backend/
│   │
│   ├── ai/
│   │   ├── llm.py
│   │   ├── elevenlabs.py
│   │   └── kie.py
│   │
│   ├── videos/
│   │   ├── models.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   └── tasks.py
│   │
│   ├── config/
│   │   ├── settings.py
│   │   ├── urls.py
│   │   ├── celery.py
│   │   └── __init__.py
│   │
│   ├── media/
│   │   ├── voices/
│   │   └── videos/
│   │
│   ├── manage.py
│   ├── requirements.txt
│   └── .env
│
└── frontend/
    │
    ├── app/
    │   ├── create/
    │   ├── dashboard/
    │   └── videos/
    │
    ├── components/
    ├── lib/
    ├── types/
    ├── package.json
    └── .env.local
```

---

# 🗄️ Video Data Model

The system tracks the complete video lifecycle.

```text
pending
   ↓
script_generating
   ↓
script_ready
   ↓
voice_generating
   ↓
video_generating
   ↓
processing
   ↓
completed
```

If an operation fails:

```text
Any Stage
    ↓
  failed
```

Each scene also maintains its own state:

```text
processing
    ↓
completed
```

or:

```text
processing
    ↓
failed
```

---

# 🔐 Environment Variables

Create a `.env` file inside the backend.

```env
GEMINI_API_KEY=your_gemini_api_key

ELEVENLABS_API_KEY=your_elevenlabs_api_key
ELEVENLABS_VOICE_ID=your_voice_id

KIE_API_KEY=your_kie_api_key
KIE_VIDEO_MODEL=wan/2-7-text-to-video

KIE_CALLBACK_URL=https://your-ngrok-url.ngrok-free.app/api/webhooks/kie/

POSTGRES_DB=your_database
POSTGRES_USER=your_user
POSTGRES_PASSWORD=your_password
POSTGRES_HOST=localhost
POSTGRES_PORT=5432

REDIS_URL=redis://localhost:6379/0
```

### ⚠️ Security

Never commit `.env` files or API keys to GitHub.

Add:

```text
.env
.env.local
__pycache__/
*.pyc
node_modules/
.next/
media/
```

to `.gitignore` where appropriate.

---

# ⚙️ Backend Setup

Clone the repository:

```bash
git clone https://github.com/your-username/ai-video-automation.git
cd ai-video-automation/backend
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate it on Windows:

```powershell
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run migrations:

```bash
python manage.py migrate
```

Start Django:

```bash
python manage.py runserver
```

---

# 🔴 Start Redis

Make sure Redis is running:

```bash
redis-server
```

or run Redis through Docker:

```bash
docker run -d -p 6379:6379 redis
```

---

# ⚡ Start Celery

From the backend directory:

```powershell
celery -A config worker --loglevel=info --pool=solo
```

For Windows development, `--pool=solo` is recommended.

---

# 🎨 Frontend Setup

Move to the frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
```

Start the development server:

```bash
npm run dev
```

The frontend will be available at:

```text
http://localhost:3000
```

---

# 🌐 KIE Webhook Development

KIE needs to reach your local Django server.

Because:

```text
localhost:8000
```

is not publicly accessible, use ngrok.

Start Django:

```bash
python manage.py runserver
```

Then:

```bash
ngrok http 8000
```

Copy the HTTPS URL and configure:

```env
KIE_CALLBACK_URL=https://your-ngrok-url.ngrok-free.app/api/webhooks/kie/
```

Restart the Celery worker after changing environment variables.

---

# 🔄 Video Generation Workflow

When a user submits:

```text
"The Future of Artificial Intelligence"
```

the system performs:

### 1. Create Video

```text
POST /api/videos/create/
```

### 2. Generate Script

Gemini generates the structured script and scenes.

### 3. Generate Voice

ElevenLabs generates the narration.

### 4. Create KIE Tasks

Each scene receives an independent KIE task.

```text
Scene 1 → Task A
Scene 2 → Task B
Scene 3 → Task C
Scene 4 → Task D
Scene 5 → Task E
```

### 5. Receive Webhooks

KIE calls:

```text
POST /api/webhooks/kie/
```

### 6. Download Scenes

Each completed scene is saved locally.

```text
media/videos/
├── video_1_scene_1.mp4
├── video_1_scene_2.mp4
├── video_1_scene_3.mp4
├── video_1_scene_4.mp4
└── video_1_scene_5.mp4
```

### 7. Combine Scenes

FFmpeg combines all scenes.

### 8. Add Narration

The ElevenLabs audio is synchronized with the final video.

### 9. Final Video

The finished video is stored as:

```text
media/videos/video_1_final.mp4
```

and the database status becomes:

```text
completed
```

---

# 📌 API Endpoints

## Create Video

```http
POST /api/videos/create/
```

Request:

```json
{
  "title": "The Future of AI",
  "topic": "Explain how artificial intelligence will change society"
}
```

Response:

```json
{
  "id": 1,
  "title": "The Future of AI",
  "topic": "Explain how artificial intelligence will change society",
  "status": "pending"
}
```

---

## Get Videos

```http
GET /api/videos/
```

---

## Get Video

```http
GET /api/videos/{id}/
```

---

## KIE Webhook

```http
POST /api/webhooks/kie/
```

Used internally by KIE AI to report generation results.

---

# 🚧 Roadmap

## Phase 1 — Core AI Pipeline

* [x] Gemini script generation
* [x] Multi-scene generation
* [x] ElevenLabs voice generation
* [x] KIE video generation
* [x] KIE webhook integration
* [x] Scene-level task tracking
* [ ] FFmpeg final processing
* [ ] Final MP4 generation

## Phase 2 — Professional Video Editor

* [ ] Scene editor
* [ ] Scene regeneration
* [ ] Scene reordering
* [ ] Caption generation
* [ ] Background music
* [ ] Audio mixing
* [ ] Video transitions
* [ ] Multiple aspect ratios
* [ ] Thumbnail generation

## Phase 3 — SaaS Platform

* [ ] User registration
* [ ] Authentication
* [ ] User dashboard
* [ ] Video history
* [ ] Usage tracking
* [ ] Credit system
* [ ] Subscription plans
* [ ] Stripe integration

## Phase 4 — Production Infrastructure

* [ ] AWS S3 / object storage
* [ ] Automatic task retries
* [ ] Celery task monitoring
* [ ] WebSocket real-time progress
* [ ] Rate limiting
* [ ] Logging
* [ ] Error monitoring
* [ ] AI content moderation

## Phase 5 — Social Media Automation

* [ ] YouTube publishing
* [ ] TikTok publishing
* [ ] Instagram publishing
* [ ] Facebook publishing
* [ ] Content scheduling
* [ ] Publishing history
* [ ] Social media analytics

---

# 📊 Future Dashboard

The planned dashboard will provide:

```text
┌──────────────────────────────────────────────┐
│             AI VIDEO DASHBOARD               │
├──────────────────────────────────────────────┤
│                                              │
│  Videos Created       Credits Remaining      │
│       24                    76                │
│                                              │
│  ──────────────────────────────────────────  │
│                                              │
│  Recent Videos                               │
│                                              │
│  AI Revolution       Completed       ▶       │
│  Future of Robotics  Processing      ⏳      │
│  Space Exploration   Completed       ▶       │
│                                              │
└──────────────────────────────────────────────┘
```

---

# 🎯 Production Goals

The long-term goal is to turn the project into a complete AI content automation platform:

```text
Idea
 ↓
AI Research
 ↓
Script
 ↓
Scenes
 ↓
Voice
 ↓
Video
 ↓
Captions
 ↓
Music
 ↓
Thumbnail
 ↓
Quality Check
 ↓
User Approval
 ↓
Schedule
 ↓
Social Media Publishing
 ↓
Analytics
```

---

# 💡 Why This Project

This project demonstrates practical experience with:

* Full-stack development
* AI API integration
* Asynchronous processing
* Webhooks
* Background jobs
* REST APIs
* PostgreSQL
* Redis
* Celery
* Video processing
* FFmpeg
* Next.js
* TypeScript
* Django
* Cloud deployment
* SaaS architecture

It is designed not just as an AI demo, but as a foundation for a **production-grade AI automation SaaS**.

---

# 👨‍💻 Author

**Alemayehu Taweke**

Full-Stack Developer | AI Automation Developer

### Core Technologies

```text
React
Next.js
TypeScript
Tailwind CSS
Django
Python
Node.js
PostgreSQL
Redis
Celery
Docker
AI APIs
FFmpeg
```

---

## ⭐ Project Status

🚧 **Active Development**

The core AI generation pipeline is operational, including:

* Gemini script generation
* ElevenLabs voice generation
* KIE scene generation
* KIE webhook processing
* Multi-scene task tracking

The next major milestone is **FFmpeg-based final video processing**.
