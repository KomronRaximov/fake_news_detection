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
5. Start server: `python manage.py runserver 127.0.0.1:8001`.

*Note: Models are excluded from this repository due to size. Ensure the `backend/models/` directory is populated with relevant model files before running.*

### Frontend
1. Go to `frontend/` directory.
2. Install dependencies: `npm install`.
3. Start development server: `npm run dev`.

## Production Ports

Backend runs on `127.0.0.1:8001`.

Nginx should serve the frontend and proxy API requests to Django:

- Nginx config: `deploy/nginx/truthlens.conf`
- systemd service: `deploy/systemd/truthlens-backend.service`

Example deploy commands on the server:

```bash
sudo cp deploy/nginx/truthlens.conf /etc/nginx/sites-available/truthlens
sudo ln -sf /etc/nginx/sites-available/truthlens /etc/nginx/sites-enabled/truthlens
sudo nginx -t
sudo systemctl reload nginx

sudo cp deploy/systemd/truthlens-backend.service /etc/systemd/system/truthlens-backend.service
sudo systemctl daemon-reload
sudo systemctl enable --now truthlens-backend
```
