# BloBax

Django web app for health predictions, emergency guidance (Gemini), and doctor directory.

## Setup

```bash
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
python manage.py migrate
python manage.py runserver
```

## Database

Default MySQL via XAMPP (`baymax_db` in `.env`). SQLite optional with `DB_ENGINE=sqlite`.

## Static assets

- Images: `static/images/blobax1.png` … `blobax5.png`
- Hero video: `static/videos/blobax_intro_video.mp4` (includes intro audio)
- Audio (optional): `static/audio/intro_voice_blobax.wav`

## Project layout

```
blobax/          # Django project settings
users/           # Auth & profile
predictions/     # BMI + ML placeholders
emergency/       # Chat & doctors
dashboard/       # Post-login hub
templates/
static/css/      # style.css, hero-video.css
static/js/       # blobax.js, hero-video.js
```
