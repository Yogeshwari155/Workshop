# Workshop Management System

## Project Overview

The Workshop Management System is a web-based application developed to manage workshops, users, and registrations efficiently. It supports both **admin** and **user** roles, enabling smooth workshop creation, registration, and management.

## Features

* User registration and login
* Admin and user role management
* Workshop creation and editing (admin)
* Workshop registration for users
* Payment verification for workshop enrollment
* Secure data handling and validation
* Improved admin dashboard to view user information

## Technology Stack

* **Backend:** Python
* **Framework:** Streamlit
* **Database:** SQLite / Relational Database
* **Authentication:** Role-based access control

## Project Structure

```
.
├── app.py                # Main application file
├── auth.py               # Authentication and authorization logic
├── database.py           # Database connection and operations
├── workshop_manager.py   # Workshop creation and management
├── file_handler.py       # File and payment handling
├── attached_assets/      # Static assets
├── .streamlit/           # Streamlit configuration
└── replit.md             # Project documentation
```

## User Roles

### Admin

* Create and manage workshops
* View registered users
* Verify payments
* Edit workshop details

### User

* Register and log in
* View available workshops
* Register for workshops
* Upload payment details

## How to Run the Project

1. Clone the repository:

```
git clone <repository-url>
cd workshop-management-system
```

2. Install required dependencies:

```
pip install -r requirements.txt
```

3. Run the application:

```
streamlit run app.py
```

## Learning Outcomes

* Full-stack application development
* Role-based authentication
* Database integration
* Secure user and payment handling
* Real-world workshop management workflow

## License

This project is developed for educational purposes.

## Author

Developed by **Yogeshwari155**
