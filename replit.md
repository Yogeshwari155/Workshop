# Creative Data Studio

## Overview

Creative Data Studio is a Streamlit-based web application for interactive data visualization and analysis. The application provides a user-friendly interface for uploading datasets in various formats (CSV, JSON, Excel) and creating dynamic, shareable visualizations using Plotly. The system includes both a main Streamlit interface and a Flask-based API server for programmatic access and data sharing capabilities.

## System Architecture

The application follows a modular, component-based architecture with clear separation of concerns:

- **Frontend**: Streamlit web interface providing an intuitive dashboard for data upload, visualization, and export
- **Backend**: Flask API server for RESTful endpoints and data sharing functionality
- **Data Processing**: Pandas-based data handling with support for multiple file formats
- **Visualization Engine**: Plotly-powered interactive chart generation with multiple chart types and themes
- **Utility Layer**: Export functionality and shareable link generation

The architecture prioritizes modularity and extensibility, allowing for easy addition of new chart types, data sources, and export formats.

## Key Components

### 1. Main Application (`app.py`)
- **Purpose**: Primary Streamlit interface and application orchestration
- **Responsibilities**: UI layout, component integration, session state management
- **Design Decision**: Streamlit chosen for rapid prototyping and built-in interactivity features

### 2. Data Handler (`data_handler.py`)
- **Purpose**: Data ingestion and preprocessing
- **Supported Formats**: CSV, JSON, Excel (xlsx/xls)
- **Features**: Automatic delimiter detection for CSV, error handling, data validation
- **Design Decision**: Pandas used as the core data manipulation library for its robust file format support

### 3. Visualization Engine (`visualization.py`)
- **Purpose**: Chart creation and customization
- **Chart Types**: Scatter, line, bar, histogram, box plots, pie charts, heatmaps, 3D scatter
- **Features**: Multiple color themes, interactive controls, responsive design
- **Design Decision**: Plotly selected for its interactive capabilities and web-native rendering

### 4. API Server (`api_endpoints.py`)
- **Purpose**: RESTful API for programmatic access and data sharing
- **Endpoints**: Health check, data upload, visualization sharing
- **Features**: CORS support, multi-format data acceptance, visualization storage
- **Design Decision**: Flask chosen for lightweight API implementation with easy CORS integration

### 5. Utilities (`utils.py`)
- **Purpose**: Export functionality and link sharing
- **Export Formats**: PNG, PDF, HTML, JSON
- **Features**: Base64 encoding, shareable link generation
- **Design Decision**: Modular utility functions for reusability across components

## Data Flow

1. **Data Upload**: Users upload files through Streamlit interface
2. **Data Processing**: DataHandler validates and loads data into pandas DataFrame
3. **Visualization Creation**: VisualizationEngine generates interactive charts based on user selections
4. **Export/Sharing**: Users can export visualizations or generate shareable links via API
5. **API Access**: External systems can upload data and retrieve visualizations via Flask endpoints

## External Dependencies

### Core Libraries
- **Streamlit** (^1.46.0): Web application framework
- **Pandas** (^2.3.0): Data manipulation and analysis
- **Plotly** (^6.1.2): Interactive visualization library
- **Flask** (^3.1.1): API server framework
- **NumPy** (^2.3.1): Numerical computing support

### Supporting Libraries
- **Flask-CORS** (^6.0.1): Cross-origin resource sharing
- **Kaleido** (^1.0.0): Static image export for Plotly
- **OpenPyXL** (^3.1.5): Excel file support
- **Requests** (^2.32.4): HTTP client library

### Rationale
Dependencies were chosen to balance functionality, performance, and ecosystem maturity. Plotly provides superior interactivity compared to matplotlib, while Streamlit offers rapid development capabilities for data applications.

## Deployment Strategy

### Replit Configuration
- **Runtime**: Python 3.11 on Nix stable-24_05
- **Deployment Target**: Autoscale for automatic scaling
- **Port Configuration**: Streamlit runs on port 5000
- **Parallel Workflows**: Supports concurrent task execution

### Deployment Process
1. Application runs via Streamlit server on port 5000
2. Flask API server can be started independently for API access
3. Autoscale deployment handles traffic management
4. Static assets served directly by Streamlit

### Design Decision
Streamlit's built-in server chosen for simplicity and rapid deployment. The autoscale target ensures the application can handle varying loads without manual intervention.

## Changelog

```
Changelog:
- June 24, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```