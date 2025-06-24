import streamlit as st
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from jose import JWTError, jwt
from database import User, SessionLocal
import bcrypt

# JWT Configuration
SECRET_KEY = "workshop_platform_secret_key_2024"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440  # 24 hours

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str) -> Optional[Dict[str, Any]]:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None

def authenticate_user(email: str, password: str) -> Optional[User]:
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email, User.is_active == True).first()
        if user and user.verify_password(password):
            return user
        return None
    finally:
        db.close()

def register_user(name: str, email: str, password: str, phone: str = None, role: str = "user") -> tuple[bool, str]:
    db = SessionLocal()
    try:
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == email).first()
        if existing_user:
            return False, "User with this email already exists"
        
        # Create new user with appropriate status
        is_active = True if role == "user" else False  # Enterprise accounts need approval
        user = User(
            name=name,
            email=email,
            password_hash=User.hash_password(password),
            phone=phone,
            role=role,
            is_active=is_active
        )
        db.add(user)
        db.commit()
        return True, f"{role.title()} registered successfully"
    except Exception as e:
        db.rollback()
        return False, f"Registration failed: {str(e)}"
    finally:
        db.close()

def get_current_user() -> Optional[User]:
    if 'user_token' not in st.session_state:
        return None
    
    payload = verify_token(st.session_state.user_token)
    if not payload:
        return None
    
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == payload.get("user_id")).first()
        return user
    finally:
        db.close()

def require_auth(role: str = None):
    """Decorator to require authentication"""
    user = get_current_user()
    if not user:
        st.error("Please login to access this page")
        st.stop()
    
    if role and user.role != role:
        st.error(f"Access denied. {role.title()} privileges required.")
        st.stop()
    
    return user

def login_form():
    """Display login form"""
    with st.form("login_form"):
        st.subheader("Login")
        email = st.text_input("Email")
        password = st.text_input("Password", type="password")
        submit_button = st.form_submit_button("Login")
        
        if submit_button:
            if email and password:
                user = authenticate_user(email, password)
                if user:
                    # Create JWT token
                    token_data = {"user_id": user.id, "email": user.email, "role": user.role}
                    token = create_access_token(data=token_data)
                    
                    # Store in session
                    st.session_state.user_token = token
                    st.session_state.user_id = user.id
                    st.session_state.user_email = user.email
                    st.session_state.user_name = user.name
                    st.session_state.user_role = user.role
                    
                    st.success(f"Welcome back, {user.name}!")
                    st.rerun()
                else:
                    st.error("Invalid email or password")
            else:
                st.error("Please enter both email and password")

def register_form():
    """Display registration form"""
    with st.form("register_form"):
        st.subheader("Register")
        
        # Account type selection
        account_type = st.selectbox("Account Type", ["User", "Enterprise"], help="Select 'Enterprise' if you want to create and manage workshops")
        
        name = st.text_input("Full Name" if account_type == "User" else "Company/Organization Name")
        email = st.text_input("Email")
        phone = st.text_input("Phone Number (optional)")
        password = st.text_input("Password", type="password")
        confirm_password = st.text_input("Confirm Password", type="password")
        
        if account_type == "Enterprise":
            st.info("Enterprise accounts can create and manage workshops. They will need admin approval to be activated.")
        
        submit_button = st.form_submit_button("Register")
        
        if submit_button:
            if not all([name, email, password, confirm_password]):
                st.error("Please fill in all required fields")
            elif password != confirm_password:
                st.error("Passwords do not match")
            elif len(password) < 6:
                st.error("Password must be at least 6 characters long")
            else:
                role = "enterprise" if account_type == "Enterprise" else "user"
                success, message = register_user(name, email, password, phone, role)
                if success:
                    st.success(message)
                    if role == "enterprise":
                        st.info("Your enterprise account is pending admin approval. You'll be notified once approved.")
                    else:
                        st.info("Please login with your credentials")
                else:
                    st.error(message)

def logout():
    """Clear session state for logout"""
    for key in ['user_token', 'user_id', 'user_email', 'user_name', 'user_role']:
        if key in st.session_state:
            del st.session_state[key]
    st.success("Logged out successfully")
    st.rerun()

def auth_sidebar():
    """Display authentication options in sidebar"""
    user = get_current_user()
    
    if user:
        st.sidebar.success(f"Welcome, {user.name}")
        st.sidebar.write(f"Role: {user.role.title()}")
        if st.sidebar.button("Logout"):
            logout()
        return user
    else:
        tab1, tab2 = st.sidebar.tabs(["Login", "Register"])
        
        with tab1:
            login_form()
        
        with tab2:
            register_form()
        
        return None