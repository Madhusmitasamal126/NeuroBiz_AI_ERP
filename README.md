# NeuroBiz AI ERP

Enterprise Business Intelligence & Management Platform built with Python, Django REST Framework, React, PostgreSQL, and Docker.

## Features

- JWT Authentication
- Employee Management
- Department Management
- RESTful APIs
- Role-Based Access Control
- PostgreSQL Database
- Docker Support
- Postman API Collection

## Tech Stack

- Python 3
- Django
- Django REST Framework
- React.js
- PostgreSQL
- Docker
- Git & GitHub

## Installation

```bash
git clone https://github.com/your-username/NeuroBiz-AI-ERP.git
cd NeuroBiz-AI-ERP

python -m venv venv
venv\Scripts\activate

pip install -r requirements.txt

python manage.py migrate

python manage.py runserver
```

## API Endpoints

| Method | Endpoint |
|---------|----------|
| POST | `/api/auth/login/` |
| POST | `/api/auth/refresh/` |
| GET/POST | `/api/employees/` |
| GET/POST | `/api/departments/` |

## Project Structure

```
backend/
├── accounts/
├── employees/
├── departments/
├── backend/
├── manage.py
└── requirements.txt
```

## Author

Madhusmita Samal