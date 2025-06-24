import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import json
import io
import base64
from PIL import Image
import threading
import time

from data_handler import DataHandler
from visualization import VisualizationEngine
from api_endpoints import APIServer
from utils import export_visualization, create_shareable_link

# Initialize session state
if 'data' not in st.session_state:
    st.session_state.data = None
if 'uploaded_file_name' not in st.session_state:
    st.session_state.uploaded_file_name = None
if 'api_server' not in st.session_state:
    st.session_state.api_server = None

# Initialize components
data_handler = DataHandler()
viz_engine = VisualizationEngine()

# Page configuration
st.set_page_config(
    page_title="Creative Data Studio",
    page_icon="📊",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for better styling
st.markdown("""
<style>
.main-header {
    text-align: center;
    padding: 1rem 0;
    border-bottom: 2px solid #f0f2f6;
    margin-bottom: 2rem;
}
.metric-card {
    background-color: #f8f9fa;
    padding: 1rem;
    border-radius: 0.5rem;
    border-left: 4px solid #1f77b4;
}
</style>
""", unsafe_allow_html=True)

# Main header
st.markdown('<div class="main-header">', unsafe_allow_html=True)
st.title("📊 Creative Data Studio")
st.markdown("*Powerful data analysis and visualization for creative professionals*")
st.markdown('</div>', unsafe_allow_html=True)

# Sidebar for navigation and controls
with st.sidebar:
    st.header("🎛️ Control Panel")
    
    # Start/Stop API Server
    st.subheader("API Server")
    col1, col2 = st.columns(2)
    
    with col1:
        if st.button("Start API", type="primary"):
            if st.session_state.api_server is None:
                st.session_state.api_server = APIServer()
                thread = threading.Thread(target=st.session_state.api_server.run, daemon=True)
                thread.start()
                st.success("API Server started on port 8000")
            else:
                st.info("API Server already running")
    
    with col2:
        if st.button("Stop API"):
            if st.session_state.api_server:
                st.session_state.api_server.stop()
                st.session_state.api_server = None
                st.success("API Server stopped")
            else:
                st.info("API Server not running")
    
    # API Status
    if st.session_state.api_server:
        st.success("🟢 API Server Active")
        st.markdown("**Endpoints:**")
        st.code("""
POST /api/upload - Upload data
GET /api/data - Get current data
POST /api/visualize - Create visualization
GET /api/export/{viz_id} - Export visualization
        """)
    else:
        st.error("🔴 API Server Inactive")

# Main content area
tab1, tab2, tab3, tab4 = st.tabs(["📁 Data Import", "🔍 Explore", "📈 Visualize", "📤 Export & Share"])

with tab1:
    st.header("Data Import")
    
    # File upload section
    st.subheader("Upload Data Files")
    uploaded_file = st.file_uploader(
        "Choose a file",
        type=['csv', 'json', 'xlsx'],
        help="Supported formats: CSV, JSON, Excel"
    )
    
    if uploaded_file is not None:
        try:
            with st.spinner("Processing file..."):
                st.session_state.data = data_handler.load_file(uploaded_file)
                st.session_state.uploaded_file_name = uploaded_file.name
            
            st.success(f"✅ Successfully loaded: {uploaded_file.name}")
            
            # Display basic info
            col1, col2, col3 = st.columns(3)
            with col1:
                st.metric("Rows", len(st.session_state.data))
            with col2:
                st.metric("Columns", len(st.session_state.data.columns))
            with col3:
                st.metric("Size", f"{st.session_state.data.memory_usage(deep=True).sum() / 1024:.1f} KB")
                
        except Exception as e:
            st.error(f"❌ Error loading file: {str(e)}")
    
    # API Data Import
    st.subheader("Import from API")
    api_url = st.text_input("API URL", placeholder="https://api.example.com/data")
    api_key = st.text_input("API Key (optional)", type="password")
    
    if st.button("Fetch Data"):
        if api_url:
            try:
                with st.spinner("Fetching data from API..."):
                    headers = {"Authorization": f"Bearer {api_key}"} if api_key else {}
                    import requests
                    response = requests.get(api_url, headers=headers)
                    response.raise_for_status()
                    
                    if response.headers.get('content-type', '').startswith('application/json'):
                        data = response.json()
                        st.session_state.data = pd.json_normalize(data)
                    else:
                        st.session_state.data = pd.read_csv(io.StringIO(response.text))
                    
                    st.session_state.uploaded_file_name = "API Data"
                    st.success("✅ Data fetched successfully!")
                    
            except Exception as e:
                st.error(f"❌ Error fetching data: {str(e)}")

with tab2:
    st.header("Data Exploration")
    
    if st.session_state.data is not None:
        df = st.session_state.data
        
        # Data overview
        st.subheader("Dataset Overview")
        col1, col2 = st.columns([2, 1])
        
        with col1:
            st.dataframe(df.head(100), use_container_width=True)
        
        with col2:
            st.markdown("**Data Types:**")
            st.write(df.dtypes)
            
            st.markdown("**Missing Values:**")
            missing = df.isnull().sum()
            st.write(missing[missing > 0])
        
        # Data filtering
        st.subheader("Data Filtering")
        
        # Column selection
        selected_columns = st.multiselect(
            "Select columns to display",
            df.columns.tolist(),
            default=df.columns.tolist()[:5]
        )
        
        if selected_columns:
            filtered_df = df[selected_columns]
            
            # Numeric filters
            numeric_columns = filtered_df.select_dtypes(include=['number']).columns
            if len(numeric_columns) > 0:
                st.markdown("**Numeric Filters:**")
                for col in numeric_columns:
                    min_val, max_val = float(filtered_df[col].min()), float(filtered_df[col].max())
                    range_val = st.slider(
                        f"{col}",
                        min_val, max_val, (min_val, max_val),
                        key=f"filter_{col}"
                    )
                    filtered_df = filtered_df[
                        (filtered_df[col] >= range_val[0]) & 
                        (filtered_df[col] <= range_val[1])
                    ]
            
            # Text filters
            text_columns = filtered_df.select_dtypes(include=['object']).columns
            if len(text_columns) > 0:
                st.markdown("**Text Filters:**")
                for col in text_columns[:3]:  # Limit to 3 to avoid clutter
                    unique_values = filtered_df[col].unique()
                    if len(unique_values) <= 50:  # Only show multiselect for manageable number of options
                        selected_values = st.multiselect(
                            f"{col}",
                            unique_values,
                            key=f"text_filter_{col}"
                        )
                        if selected_values:
                            filtered_df = filtered_df[filtered_df[col].isin(selected_values)]
            
            # Display filtered data
            st.subheader("Filtered Data")
            st.dataframe(filtered_df, use_container_width=True)
            
            # Basic statistics
            if len(numeric_columns) > 0:
                st.subheader("Statistics")
                st.write(filtered_df[numeric_columns].describe())
    else:
        st.info("Please upload data in the 'Data Import' tab to start exploring.")

with tab3:
    st.header("Create Visualizations")
    
    if st.session_state.data is not None:
        df = st.session_state.data
        
        # Visualization controls
        col1, col2 = st.columns([1, 2])
        
        with col1:
            st.subheader("Chart Configuration")
            
            chart_type = st.selectbox(
                "Chart Type",
                ["Scatter Plot", "Line Chart", "Bar Chart", "Histogram", "Box Plot", "Heatmap", "Pie Chart"]
            )
            
            # Dynamic column selection based on chart type
            numeric_cols = df.select_dtypes(include=['number']).columns.tolist()
            categorical_cols = df.select_dtypes(include=['object']).columns.tolist()
            all_cols = df.columns.tolist()
            
            if chart_type in ["Scatter Plot", "Line Chart"]:
                x_col = st.selectbox("X-axis", all_cols)
                y_col = st.selectbox("Y-axis", numeric_cols)
                color_col = st.selectbox("Color by (optional)", [None] + all_cols)
                size_col = st.selectbox("Size by (optional)", [None] + numeric_cols)
                
            elif chart_type in ["Bar Chart"]:
                x_col = st.selectbox("X-axis", categorical_cols + numeric_cols)
                y_col = st.selectbox("Y-axis", numeric_cols)
                color_col = st.selectbox("Color by (optional)", [None] + categorical_cols)
                
            elif chart_type == "Histogram":
                x_col = st.selectbox("Column", numeric_cols)
                color_col = st.selectbox("Color by (optional)", [None] + categorical_cols)
                bins = st.slider("Number of bins", 10, 100, 30)
                
            elif chart_type == "Box Plot":
                y_col = st.selectbox("Y-axis", numeric_cols)
                x_col = st.selectbox("Group by (optional)", [None] + categorical_cols)
                
            elif chart_type == "Heatmap":
                selected_cols = st.multiselect("Select numeric columns", numeric_cols, default=numeric_cols[:5])
                
            elif chart_type == "Pie Chart":
                values_col = st.selectbox("Values", numeric_cols)
                names_col = st.selectbox("Labels", categorical_cols)
            
            # Chart styling
            st.subheader("Styling")
            title = st.text_input("Chart Title", value=f"{chart_type} - {st.session_state.uploaded_file_name or 'Data'}")
            color_theme = st.selectbox("Color Theme", ["plotly", "viridis", "plasma", "inferno", "magma", "cividis"])
            
        with col2:
            st.subheader("Preview")
            
            try:
                # Create visualization based on type
                fig = viz_engine.create_chart(
                    df, chart_type, 
                    x_col=locals().get('x_col'),
                    y_col=locals().get('y_col'),
                    color_col=locals().get('color_col'),
                    size_col=locals().get('size_col'),
                    selected_cols=locals().get('selected_cols'),
                    values_col=locals().get('values_col'),
                    names_col=locals().get('names_col'),
                    bins=locals().get('bins'),
                    title=title,
                    color_theme=color_theme
                )
                
                if fig:
                    st.plotly_chart(fig, use_container_width=True)
                    
                    # Store current visualization in session state
                    st.session_state.current_viz = fig
                    st.session_state.current_viz_config = {
                        'chart_type': chart_type,
                        'title': title,
                        'color_theme': color_theme
                    }
                else:
                    st.error("Could not create visualization with current settings.")
                    
            except Exception as e:
                st.error(f"Error creating visualization: {str(e)}")
    else:
        st.info("Please upload data in the 'Data Import' tab to create visualizations.")

with tab4:
    st.header("Export & Share")
    
    if 'current_viz' in st.session_state:
        col1, col2 = st.columns(2)
        
        with col1:
            st.subheader("Export Options")
            
            export_format = st.selectbox("Format", ["PNG", "PDF", "HTML", "JSON"])
            
            if st.button("Export Visualization", type="primary"):
                try:
                    exported_data = export_visualization(st.session_state.current_viz, export_format)
                    
                    if export_format in ["PNG", "PDF"]:
                        st.download_button(
                            label=f"Download {export_format}",
                            data=exported_data,
                            file_name=f"visualization.{export_format.lower()}",
                            mime=f"image/{export_format.lower()}" if export_format == "PNG" else "application/pdf"
                        )
                    elif export_format == "HTML":
                        st.download_button(
                            label="Download HTML",
                            data=exported_data,
                            file_name="visualization.html",
                            mime="text/html"
                        )
                    elif export_format == "JSON":
                        st.download_button(
                            label="Download JSON",
                            data=exported_data,
                            file_name="visualization.json",
                            mime="application/json"
                        )
                    
                    st.success(f"✅ Visualization exported as {export_format}")
                    
                except Exception as e:
                    st.error(f"❌ Export failed: {str(e)}")
        
        with col2:
            st.subheader("Shareable Link")
            
            if st.button("Generate Shareable Link"):
                try:
                    link = create_shareable_link(st.session_state.current_viz)
                    st.success("✅ Shareable link generated!")
                    st.code(link)
                    st.info("This link allows others to view your visualization online.")
                except Exception as e:
                    st.error(f"❌ Failed to generate link: {str(e)}")
        
        # Visualization summary
        st.subheader("Current Visualization")
        if 'current_viz_config' in st.session_state:
            config = st.session_state.current_viz_config
            col1, col2, col3 = st.columns(3)
            with col1:
                st.metric("Chart Type", config['chart_type'])
            with col2:
                st.metric("Title", config['title'])
            with col3:
                st.metric("Theme", config['color_theme'])
    else:
        st.info("Create a visualization in the 'Visualize' tab to enable export options.")

# Footer
st.markdown("---")
st.markdown(
    """
    <div style='text-align: center; color: #666; padding: 1rem;'>
    Creative Data Studio - Empowering creative professionals with data insights
    </div>
    """, 
    unsafe_allow_html=True
)
