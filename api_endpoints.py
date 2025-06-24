import json
import pandas as pd
import plotly
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import io
import base64
import threading
import uuid
from typing import Dict, Any
import os

class APIServer:
    """Flask-based API server for data integration and visualization sharing."""
    
    def __init__(self, port: int = 8000):
        self.app = Flask(__name__)
        CORS(self.app)
        self.port = port
        self.data_storage = {}
        self.visualization_storage = {}
        self.server = None
        
        self._setup_routes()
    
    def _setup_routes(self):
        """Set up API routes."""
        
        @self.app.route('/api/health', methods=['GET'])
        def health_check():
            """Health check endpoint."""
            return jsonify({
                'status': 'healthy',
                'service': 'Creative Data Studio API',
                'version': '1.0.0'
            })
        
        @self.app.route('/api/upload', methods=['POST'])
        def upload_data():
            """Upload data endpoint."""
            try:
                # Handle different content types
                if request.content_type == 'application/json':
                    data = request.get_json()
                    df = pd.DataFrame(data)
                elif 'multipart/form-data' in request.content_type:
                    if 'file' not in request.files:
                        return jsonify({'error': 'No file provided'}), 400
                    
                    file = request.files['file']
                    if file.filename == '':
                        return jsonify({'error': 'No file selected'}), 400
                    
                    # Process file based on extension
                    if file.filename.endswith('.csv'):
                        df = pd.read_csv(file)
                    elif file.filename.endswith('.json'):
                        data = json.load(file)
                        df = pd.DataFrame(data) if isinstance(data, list) else pd.json_normalize(data)
                    else:
                        return jsonify({'error': 'Unsupported file format'}), 400
                else:
                    return jsonify({'error': 'Unsupported content type'}), 400
                
                # Generate unique ID for the dataset
                data_id = str(uuid.uuid4())
                self.data_storage[data_id] = df
                
                return jsonify({
                    'data_id': data_id,
                    'shape': df.shape,
                    'columns': df.columns.tolist(),
                    'sample': df.head().to_dict('records')
                })
                
            except Exception as e:
                return jsonify({'error': str(e)}), 500
        
        @self.app.route('/api/data/<data_id>', methods=['GET'])
        def get_data(data_id):
            """Get data by ID."""
            if data_id not in self.data_storage:
                return jsonify({'error': 'Data not found'}), 404
            
            df = self.data_storage[data_id]
            
            # Support query parameters for filtering
            limit = request.args.get('limit', type=int, default=100)
            offset = request.args.get('offset', type=int, default=0)
            
            # Apply pagination
            df_subset = df.iloc[offset:offset+limit]
            
            return jsonify({
                'data': df_subset.to_dict('records'),
                'total_rows': len(df),
                'returned_rows': len(df_subset),
                'columns': df.columns.tolist()
            })
        
        @self.app.route('/api/data', methods=['GET'])
        def list_datasets():
            """List all available datasets."""
            datasets = []
            for data_id, df in self.data_storage.items():
                datasets.append({
                    'data_id': data_id,
                    'shape': df.shape,
                    'columns': df.columns.tolist(),
                    'memory_usage': df.memory_usage(deep=True).sum()
                })
            
            return jsonify({'datasets': datasets})
        
        @self.app.route('/api/visualize', methods=['POST'])
        def create_visualization():
            """Create a visualization."""
            try:
                config = request.get_json()
                
                # Validate required fields
                if 'data_id' not in config:
                    return jsonify({'error': 'data_id is required'}), 400
                
                if config['data_id'] not in self.data_storage:
                    return jsonify({'error': 'Data not found'}), 404
                
                df = self.data_storage[config['data_id']]
                
                # Import visualization engine
                from visualization import VisualizationEngine
                viz_engine = VisualizationEngine()
                
                # Create visualization
                fig = viz_engine.create_chart(
                    df,
                    chart_type=config.get('chart_type', 'scatter'),
                    x_col=config.get('x_col'),
                    y_col=config.get('y_col'),
                    color_col=config.get('color_col'),
                    size_col=config.get('size_col'),
                    title=config.get('title', 'API Generated Visualization'),
                    color_theme=config.get('color_theme', 'plotly')
                )
                
                # Generate unique ID for visualization
                viz_id = str(uuid.uuid4())
                self.visualization_storage[viz_id] = {
                    'figure': fig,
                    'config': config,
                    'data_id': config['data_id']
                }
                
                # Return visualization as JSON
                return jsonify({
                    'viz_id': viz_id,
                    'plotly_json': fig.to_json(),
                    'config': config
                })
                
            except Exception as e:
                return jsonify({'error': str(e)}), 500
        
        @self.app.route('/api/visualizations', methods=['GET'])
        def list_visualizations():
            """List all created visualizations."""
            visualizations = []
            for viz_id, viz_data in self.visualization_storage.items():
                visualizations.append({
                    'viz_id': viz_id,
                    'config': viz_data['config'],
                    'data_id': viz_data['data_id']
                })
            
            return jsonify({'visualizations': visualizations})
        
        @self.app.route('/api/export/<viz_id>', methods=['GET'])
        def export_visualization(viz_id):
            """Export a visualization."""
            if viz_id not in self.visualization_storage:
                return jsonify({'error': 'Visualization not found'}), 404
            
            viz_data = self.visualization_storage[viz_id]
            fig = viz_data['figure']
            
            export_format = request.args.get('format', 'json').lower()
            
            try:
                if export_format == 'json':
                    return jsonify(json.loads(fig.to_json()))
                
                elif export_format == 'html':
                    html_str = fig.to_html(include_plotlyjs=True)
                    return html_str, 200, {'Content-Type': 'text/html'}
                
                elif export_format == 'png':
                    img_bytes = fig.to_image(format='png')
                    return send_file(
                        io.BytesIO(img_bytes),
                        mimetype='image/png',
                        as_attachment=True,
                        download_name=f'visualization_{viz_id}.png'
                    )
                
                elif export_format == 'pdf':
                    img_bytes = fig.to_image(format='pdf')
                    return send_file(
                        io.BytesIO(img_bytes),
                        mimetype='application/pdf',
                        as_attachment=True,
                        download_name=f'visualization_{viz_id}.pdf'
                    )
                
                else:
                    return jsonify({'error': f'Unsupported export format: {export_format}'}), 400
                    
            except Exception as e:
                return jsonify({'error': f'Export failed: {str(e)}'}), 500
        
        @self.app.route('/api/stats/<data_id>', methods=['GET'])
        def get_data_stats(data_id):
            """Get statistical summary of a dataset."""
            if data_id not in self.data_storage:
                return jsonify({'error': 'Data not found'}), 404
            
            df = self.data_storage[data_id]
            
            # Calculate statistics
            numeric_stats = df.describe().to_dict() if len(df.select_dtypes(include=['number']).columns) > 0 else {}
            
            stats = {
                'shape': df.shape,
                'dtypes': df.dtypes.astype(str).to_dict(),
                'missing_values': df.isnull().sum().to_dict(),
                'numeric_stats': numeric_stats,
                'unique_values': df.nunique().to_dict(),
                'memory_usage': df.memory_usage(deep=True).sum()
            }
            
            return jsonify(stats)
        
        @self.app.errorhandler(404)
        def not_found(error):
            return jsonify({'error': 'Endpoint not found'}), 404
        
        @self.app.errorhandler(500)
        def internal_error(error):
            return jsonify({'error': 'Internal server error'}), 500
    
    def run(self):
        """Run the Flask server."""
        try:
            self.app.run(host='0.0.0.0', port=self.port, debug=False, threaded=True)
        except Exception as e:
            print(f"API Server error: {e}")
    
    def stop(self):
        """Stop the Flask server."""
        # Note: This is a simplified stop method
        # In production, you'd want a more robust shutdown mechanism
        if self.server:
            self.server.shutdown()
    
    def get_data_storage(self) -> Dict[str, pd.DataFrame]:
        """Get current data storage for debugging."""
        return self.data_storage
    
    def get_visualization_storage(self) -> Dict[str, Any]:
        """Get current visualization storage for debugging."""
        return self.visualization_storage
