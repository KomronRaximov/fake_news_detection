# Fake News Detection System

This project is a web application for detecting fake news using deep learning models (BERT).

## Project Structure

- `frontend/`: React-based user interface.
- `backend/`: Django-based API server.

## Setup

### Backend
1. Go to `backend/` directory.
2. Create and activate a virtual environment.
3. Install dependencies: `pip install -r requirements.txt`.
4. Run migrations: `python manage.py migrate`.
5. Start server: `python manage.py runserver`.

*Note: Models are excluded from this repository due to size. Ensure the `backend/models/` directory is populated with relevant model files before running.*

### Frontend
1. Go to `frontend/` directory.
2. Install dependencies: `npm install`.
3. Start development server: `npm run dev`.
