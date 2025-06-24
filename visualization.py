import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import pandas as pd
import numpy as np
from typing import Optional, List, Union

class VisualizationEngine:
    """Handles creation of interactive visualizations using Plotly."""
    
    def __init__(self):
        self.color_palettes = {
            'plotly': px.colors.qualitative.Plotly,
            'viridis': px.colors.sequential.Viridis,
            'plasma': px.colors.sequential.Plasma,
            'inferno': px.colors.sequential.Inferno,
            'magma': px.colors.sequential.Magma,
            'cividis': px.colors.sequential.Cividis
        }
    
    def create_chart(self, 
                    df: pd.DataFrame, 
                    chart_type: str,
                    x_col: Optional[str] = None,
                    y_col: Optional[str] = None,
                    color_col: Optional[str] = None,
                    size_col: Optional[str] = None,
                    selected_cols: Optional[List[str]] = None,
                    values_col: Optional[str] = None,
                    names_col: Optional[str] = None,
                    bins: Optional[int] = 30,
                    title: str = "Visualization",
                    color_theme: str = "plotly") -> go.Figure:
        """
        Create a chart based on the specified type and parameters.
        
        Args:
            df: DataFrame containing the data
            chart_type: Type of chart to create
            x_col, y_col: Column names for axes
            color_col: Column name for color encoding
            size_col: Column name for size encoding
            selected_cols: List of columns for certain chart types
            values_col, names_col: For pie charts
            bins: Number of bins for histograms
            title: Chart title
            color_theme: Color theme to use
            
        Returns:
            Plotly Figure object
        """
        try:
            if chart_type == "Scatter Plot":
                return self._create_scatter_plot(df, x_col, y_col, color_col, size_col, title, color_theme)
            
            elif chart_type == "Line Chart":
                return self._create_line_chart(df, x_col, y_col, color_col, title, color_theme)
            
            elif chart_type == "Bar Chart":
                return self._create_bar_chart(df, x_col, y_col, color_col, title, color_theme)
            
            elif chart_type == "Histogram":
                return self._create_histogram(df, x_col, color_col, bins, title, color_theme)
            
            elif chart_type == "Box Plot":
                return self._create_box_plot(df, y_col, x_col, title, color_theme)
            
            elif chart_type == "Heatmap":
                return self._create_heatmap(df, selected_cols, title, color_theme)
            
            elif chart_type == "Pie Chart":
                return self._create_pie_chart(df, values_col, names_col, title, color_theme)
            
            else:
                raise ValueError(f"Unsupported chart type: {chart_type}")
                
        except Exception as e:
            raise Exception(f"Error creating {chart_type}: {str(e)}")
    
    def _create_scatter_plot(self, df, x_col, y_col, color_col, size_col, title, color_theme):
        """Create an interactive scatter plot."""
        fig = px.scatter(
            df, 
            x=x_col, 
            y=y_col,
            color=color_col,
            size=size_col,
            hover_data=df.columns.tolist(),
            title=title,
            color_continuous_scale=color_theme if color_col and df[color_col].dtype in ['int64', 'float64'] else None,
            color_discrete_sequence=self.color_palettes.get(color_theme, px.colors.qualitative.Plotly)
        )
        
        fig.update_layout(
            hovermode='closest',
            showlegend=True if color_col else False
        )
        
        return fig
    
    def _create_line_chart(self, df, x_col, y_col, color_col, title, color_theme):
        """Create an interactive line chart."""
        if color_col:
            fig = px.line(
                df.sort_values(x_col), 
                x=x_col, 
                y=y_col,
                color=color_col,
                title=title,
                color_discrete_sequence=self.color_palettes.get(color_theme, px.colors.qualitative.Plotly)
            )
        else:
            fig = px.line(
                df.sort_values(x_col), 
                x=x_col, 
                y=y_col,
                title=title
            )
            fig.update_traces(line_color=self.color_palettes.get(color_theme, px.colors.qualitative.Plotly)[0])
        
        fig.update_layout(hovermode='x unified')
        return fig
    
    def _create_bar_chart(self, df, x_col, y_col, color_col, title, color_theme):
        """Create an interactive bar chart."""
        # Aggregate data if needed
        if df[x_col].dtype == 'object':
            # Group by categorical x_col and sum y_col
            df_agg = df.groupby(x_col)[y_col].sum().reset_index()
        else:
            df_agg = df
        
        fig = px.bar(
            df_agg,
            x=x_col,
            y=y_col,
            color=color_col,
            title=title,
            color_discrete_sequence=self.color_palettes.get(color_theme, px.colors.qualitative.Plotly)
        )
        
        fig.update_layout(showlegend=True if color_col else False)
        return fig
    
    def _create_histogram(self, df, x_col, color_col, bins, title, color_theme):
        """Create an interactive histogram."""
        fig = px.histogram(
            df,
            x=x_col,
            color=color_col,
            nbins=bins,
            title=title,
            color_discrete_sequence=self.color_palettes.get(color_theme, px.colors.qualitative.Plotly)
        )
        
        fig.update_layout(
            bargap=0.1,
            showlegend=True if color_col else False
        )
        return fig
    
    def _create_box_plot(self, df, y_col, x_col, title, color_theme):
        """Create an interactive box plot."""
        if x_col:
            fig = px.box(
                df,
                x=x_col,
                y=y_col,
                title=title,
                color_discrete_sequence=self.color_palettes.get(color_theme, px.colors.qualitative.Plotly)
            )
        else:
            fig = px.box(
                df,
                y=y_col,
                title=title
            )
            fig.update_traces(marker_color=self.color_palettes.get(color_theme, px.colors.qualitative.Plotly)[0])
        
        return fig
    
    def _create_heatmap(self, df, selected_cols, title, color_theme):
        """Create a correlation heatmap."""
        if not selected_cols:
            # Use all numeric columns
            numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
            selected_cols = numeric_cols[:10]  # Limit to first 10 for performance
        
        # Calculate correlation matrix
        corr_matrix = df[selected_cols].corr()
        
        fig = px.imshow(
            corr_matrix,
            title=title,
            color_continuous_scale=color_theme,
            aspect="auto"
        )
        
        fig.update_layout(
            xaxis_title="Variables",
            yaxis_title="Variables"
        )
        
        return fig
    
    def _create_pie_chart(self, df, values_col, names_col, title, color_theme):
        """Create an interactive pie chart."""
        # Aggregate data by names_col
        df_agg = df.groupby(names_col)[values_col].sum().reset_index()
        
        fig = px.pie(
            df_agg,
            values=values_col,
            names=names_col,
            title=title,
            color_discrete_sequence=self.color_palettes.get(color_theme, px.colors.qualitative.Plotly)
        )
        
        fig.update_traces(textposition='inside', textinfo='percent+label')
        return fig
    
    def create_dashboard(self, df: pd.DataFrame, charts_config: List[dict]) -> go.Figure:
        """
        Create a dashboard with multiple charts.
        
        Args:
            df: DataFrame containing the data
            charts_config: List of chart configurations
            
        Returns:
            Plotly Figure with subplots
        """
        n_charts = len(charts_config)
        
        # Calculate subplot grid
        if n_charts <= 2:
            rows, cols = 1, n_charts
        elif n_charts <= 4:
            rows, cols = 2, 2
        else:
            rows = int(np.ceil(n_charts / 3))
            cols = 3
        
        # Create subplots
        fig = make_subplots(
            rows=rows, 
            cols=cols,
            subplot_titles=[config.get('title', f'Chart {i+1}') for i, config in enumerate(charts_config)]
        )
        
        for i, config in enumerate(charts_config):
            row = (i // cols) + 1
            col = (i % cols) + 1
            
            # Create individual chart
            chart_fig = self.create_chart(df, **config)
            
            # Add traces to subplot
            for trace in chart_fig.data:
                fig.add_trace(trace, row=row, col=col)
        
        fig.update_layout(
            height=300 * rows,
            showlegend=False,
            title_text="Dashboard"
        )
        
        return fig
    
    def apply_theme(self, fig: go.Figure, theme: str = "plotly") -> go.Figure:
        """
        Apply a consistent theme to a figure.
        
        Args:
            fig: Plotly figure to theme
            theme: Theme name
            
        Returns:
            Themed figure
        """
        if theme == "dark":
            fig.update_layout(
                template="plotly_dark",
                paper_bgcolor="rgba(0,0,0,0)",
                plot_bgcolor="rgba(0,0,0,0)"
            )
        elif theme == "minimal":
            fig.update_layout(
                template="simple_white",
                showlegend=False
            )
        elif theme == "presentation":
            fig.update_layout(
                template="presentation",
                font_size=14,
                title_font_size=18
            )
        else:
            fig.update_layout(template="plotly")
        
        return fig
