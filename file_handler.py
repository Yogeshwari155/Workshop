import streamlit as st
import os
import uuid
from PIL import Image
import base64
from io import BytesIO

def save_uploaded_file(uploaded_file, folder="uploads"):
    """Save uploaded file and return the file path"""
    try:
        # Create uploads directory if it doesn't exist
        os.makedirs(folder, exist_ok=True)
        
        # Generate unique filename
        file_extension = uploaded_file.name.split('.')[-1]
        unique_filename = f"{uuid.uuid4()}.{file_extension}"
        file_path = os.path.join(folder, unique_filename)
        
        # Save file
        with open(file_path, "wb") as f:
            f.write(uploaded_file.getbuffer())
        
        return file_path
    except Exception as e:
        st.error(f"Error saving file: {str(e)}")
        return None

def display_image(file_path, max_width=300):
    """Display image from file path"""
    try:
        if os.path.exists(file_path):
            image = Image.open(file_path)
            st.image(image, width=max_width)
        else:
            st.error("Image file not found")
    except Exception as e:
        st.error(f"Error displaying image: {str(e)}")

def encode_image_to_base64(image_file):
    """Convert uploaded image to base64 string"""
    try:
        if image_file is not None:
            # Convert to base64
            buffered = BytesIO()
            image = Image.open(image_file)
            image.save(buffered, format="PNG")
            img_str = base64.b64encode(buffered.getvalue()).decode()
            return f"data:image/png;base64,{img_str}"
        return None
    except Exception as e:
        st.error(f"Error encoding image: {str(e)}")
        return None