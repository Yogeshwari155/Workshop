import base64
import json
import io
import uuid
from typing import Union, Dict, Any
import plotly.graph_objects as go
import plotly.io as pio

def export_visualization(fig: go.Figure, format_type: str) -> Union[bytes, str]:
    """
    Export a Plotly figure to various formats.
    
    Args:
        fig: Plotly figure to export
        format_type: Export format ('PNG', 'PDF', 'HTML', 'JSON')
        
    Returns:
        Exported data as bytes or string
    """
    try:
        if format_type.upper() == 'PNG':
            return fig.to_image(format='png')
        
        elif format_type.upper() == 'PDF':
            return fig.to_image(format='pdf')
        
        elif format_type.upper() == 'HTML':
            return fig.to_html(
                include_plotlyjs=True,
                config={'displayModeBar': True, 'responsive': True}
            )
        
        elif format_type.upper() == 'JSON':
            return fig.to_json()
        
        else:
            raise ValueError(f"Unsupported export format: {format_type}")
            
    except Exception as e:
        raise Exception(f"Export failed: {str(e)}")

def create_shareable_link(fig: go.Figure, base_url: str = "http://localhost:5000") -> str:
    """
    Create a shareable link for a visualization.
    
    Args:
        fig: Plotly figure to share
        base_url: Base URL for the application
        
    Returns:
        Shareable URL
    """
    try:
        # Convert figure to JSON and encode
        fig_json = fig.to_json()
        encoded_data = base64.b64encode(fig_json.encode()).decode()
        
        # Generate unique ID
        share_id = str(uuid.uuid4())[:8]
        
        # Create shareable URL (in production, you'd store this in a database)
        share_url = f"{base_url}/share/{share_id}?data={encoded_data}"
        
        return share_url
        
    except Exception as e:
        raise Exception(f"Failed to create shareable link: {str(e)}")

def validate_chart_config(config: Dict[str, Any]) -> Dict[str, str]:
    """
    Validate chart configuration and return any errors.
    
    Args:
        config: Chart configuration dictionary
        
    Returns:
        Dictionary of validation errors
    """
    errors = {}
    
    required_fields = ['chart_type']
    for field in required_fields:
        if field not in config:
            errors[field] = f"{field} is required"
    
    # Validate chart type
    valid_chart_types = [
        "Scatter Plot", "Line Chart", "Bar Chart", 
        "Histogram", "Box Plot", "Heatmap", "Pie Chart"
    ]
    
    if 'chart_type' in config and config['chart_type'] not in valid_chart_types:
        errors['chart_type'] = f"Invalid chart type. Must be one of: {', '.join(valid_chart_types)}"
    
    # Chart-specific validations
    chart_type = config.get('chart_type')
    
    if chart_type in ["Scatter Plot", "Line Chart"]:
        if 'x_col' not in config or 'y_col' not in config:
            errors['axes'] = "Both x_col and y_col are required for scatter plots and line charts"
    
    elif chart_type == "Bar Chart":
        if 'x_col' not in config or 'y_col' not in config:
            errors['axes'] = "Both x_col and y_col are required for bar charts"
    
    elif chart_type == "Histogram":
        if 'x_col' not in config:
            errors['x_col'] = "x_col is required for histograms"
    
    elif chart_type == "Box Plot":
        if 'y_col' not in config:
            errors['y_col'] = "y_col is required for box plots"
    
    elif chart_type == "Pie Chart":
        if 'values_col' not in config or 'names_col' not in config:
            errors['pie_cols'] = "Both values_col and names_col are required for pie charts"
    
    elif chart_type == "Heatmap":
        if 'selected_cols' not in config:
            errors['selected_cols'] = "selected_cols is required for heatmaps"
    
    return errors

def format_number(value: Union[int, float], decimal_places: int = 2) -> str:
    """
    Format a number for display.
    
    Args:
        value: Number to format
        decimal_places: Number of decimal places
        
    Returns:
        Formatted number string
    """
    if isinstance(value, (int, float)):
        if value >= 1_000_000:
            return f"{value / 1_000_000:.{decimal_places}f}M"
        elif value >= 1_000:
            return f"{value / 1_000:.{decimal_places}f}K"
        else:
            return f"{value:.{decimal_places}f}"
    return str(value)

def detect_data_types(df) -> Dict[str, str]:
    """
    Detect and suggest appropriate data types for DataFrame columns.
    
    Args:
        df: Pandas DataFrame
        
    Returns:
        Dictionary mapping column names to suggested types
    """
    suggestions = {}
    
    for col in df.columns:
        if df[col].dtype == 'object':
            # Check if it's actually numeric
            try:
                pd.to_numeric(df[col])
                suggestions[col] = 'numeric'
            except:
                # Check if it's a date
                try:
                    pd.to_datetime(df[col])
                    suggestions[col] = 'datetime'
                except:
                    suggestions[col] = 'categorical'
        elif df[col].dtype in ['int64', 'float64']:
            suggestions[col] = 'numeric'
        elif df[col].dtype == 'datetime64[ns]':
            suggestions[col] = 'datetime'
        else:
            suggestions[col] = 'other'
    
    return suggestions

def clean_column_names(df) -> 'pd.DataFrame':
    """
    Clean column names for better display and processing.
    
    Args:
        df: Pandas DataFrame
        
    Returns:
        DataFrame with cleaned column names
    """
    # Create a copy to avoid modifying the original
    df_clean = df.copy()
    
    # Clean column names
    df_clean.columns = (
        df_clean.columns
        .str.strip()  # Remove leading/trailing whitespace
        .str.replace(' ', '_')  # Replace spaces with underscores
        .str.replace('[^a-zA-Z0-9_]', '', regex=True)  # Remove special characters
        .str.lower()  # Convert to lowercase
    )
    
    # Handle duplicate column names
    seen = set()
    new_columns = []
    for col in df_clean.columns:
        if col in seen:
            counter = 1
            new_col = f"{col}_{counter}"
            while new_col in seen:
                counter += 1
                new_col = f"{col}_{counter}"
            new_columns.append(new_col)
            seen.add(new_col)
        else:
            new_columns.append(col)
            seen.add(col)
    
    df_clean.columns = new_columns
    return df_clean

def generate_color_palette(n_colors: int, palette_name: str = "plotly") -> list:
    """
    Generate a color palette with specified number of colors.
    
    Args:
        n_colors: Number of colors needed
        palette_name: Name of the color palette
        
    Returns:
        List of color codes
    """
    import plotly.express as px
    
    palettes = {
        'plotly': px.colors.qualitative.Plotly,
        'viridis': px.colors.sequential.Viridis,
        'plasma': px.colors.sequential.Plasma,
        'inferno': px.colors.sequential.Inferno,
        'magma': px.colors.sequential.Magma,
        'cividis': px.colors.sequential.Cividis,
        'set1': px.colors.qualitative.Set1,
        'set2': px.colors.qualitative.Set2,
        'pastel': px.colors.qualitative.Pastel
    }
    
    base_palette = palettes.get(palette_name, px.colors.qualitative.Plotly)
    
    # If we need more colors than available, repeat the palette
    if n_colors > len(base_palette):
        multiplier = (n_colors // len(base_palette)) + 1
        extended_palette = base_palette * multiplier
        return extended_palette[:n_colors]
    
    return base_palette[:n_colors]

def calculate_chart_dimensions(chart_type: str, data_size: int) -> Dict[str, int]:
    """
    Calculate optimal chart dimensions based on chart type and data size.
    
    Args:
        chart_type: Type of chart
        data_size: Number of data points
        
    Returns:
        Dictionary with width and height
    """
    base_width = 800
    base_height = 600
    
    # Adjust based on chart type
    if chart_type in ["Bar Chart", "Histogram"]:
        if data_size > 50:
            base_width = max(800, data_size * 15)
    
    elif chart_type == "Heatmap":
        # Square aspect ratio for heatmaps
        base_height = base_width
    
    elif chart_type == "Pie Chart":
        # Ensure pie charts are circular
        base_height = base_width
    
    # Ensure reasonable limits
    width = max(400, min(base_width, 1200))
    height = max(300, min(base_height, 800))
    
    return {"width": width, "height": height}
