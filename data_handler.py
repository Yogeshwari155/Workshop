import pandas as pd
import json
import io
import requests
from typing import Union, Dict, Any
import streamlit as st

class DataHandler:
    """Handles data loading, processing, and validation for the Creative Data Studio."""
    
    def __init__(self):
        self.supported_formats = ['csv', 'json', 'xlsx', 'xls']
    
    def load_file(self, uploaded_file) -> pd.DataFrame:
        """
        Load data from uploaded file.
        
        Args:
            uploaded_file: Streamlit UploadedFile object
            
        Returns:
            pd.DataFrame: Loaded data
        """
        file_extension = uploaded_file.name.split('.')[-1].lower()
        
        if file_extension not in self.supported_formats:
            raise ValueError(f"Unsupported file format: {file_extension}")
        
        try:
            if file_extension == 'csv':
                return self._load_csv(uploaded_file)
            elif file_extension == 'json':
                return self._load_json(uploaded_file)
            elif file_extension in ['xlsx', 'xls']:
                return self._load_excel(uploaded_file)
        except Exception as e:
            raise Exception(f"Error loading {file_extension.upper()} file: {str(e)}")
    
    def _load_csv(self, uploaded_file) -> pd.DataFrame:
        """Load CSV file with automatic delimiter detection."""
        # Try to detect delimiter
        sample = uploaded_file.read(1024).decode('utf-8')
        uploaded_file.seek(0)
        
        # Common delimiters
        delimiters = [',', ';', '\t', '|']
        delimiter = ','
        
        for delim in delimiters:
            if delim in sample:
                delimiter = delim
                break
        
        try:
            df = pd.read_csv(uploaded_file, delimiter=delimiter)
        except:
            # Fallback to comma delimiter
            uploaded_file.seek(0)
            df = pd.read_csv(uploaded_file)
        
        return self._clean_dataframe(df)
    
    def _load_json(self, uploaded_file) -> pd.DataFrame:
        """Load JSON file and convert to DataFrame."""
        content = uploaded_file.read().decode('utf-8')
        data = json.loads(content)
        
        if isinstance(data, list):
            df = pd.DataFrame(data)
        elif isinstance(data, dict):
            # Try to find the main data array
            if 'data' in data:
                df = pd.DataFrame(data['data'])
            elif 'results' in data:
                df = pd.DataFrame(data['results'])
            elif 'items' in data:
                df = pd.DataFrame(data['items'])
            else:
                # Flatten the dictionary
                df = pd.json_normalize(data)
        else:
            raise ValueError("JSON format not supported. Expected list of objects or object with data array.")
        
        return self._clean_dataframe(df)
    
    def _load_excel(self, uploaded_file) -> pd.DataFrame:
        """Load Excel file."""
        try:
            # Try to read the first sheet
            df = pd.read_excel(uploaded_file, sheet_name=0)
        except Exception as e:
            raise Exception(f"Error reading Excel file: {str(e)}")
        
        return self._clean_dataframe(df)
    
    def _clean_dataframe(self, df: pd.DataFrame) -> pd.DataFrame:
        """Clean and prepare DataFrame for analysis."""
        # Remove completely empty rows and columns
        df = df.dropna(how='all').dropna(axis=1, how='all')
        
        # Strip whitespace from string columns
        string_columns = df.select_dtypes(include=['object']).columns
        for col in string_columns:
            if df[col].dtype == 'object':
                df[col] = df[col].astype(str).str.strip()
        
        # Convert obvious date columns
        date_columns = []
        for col in df.columns:
            if any(word in col.lower() for word in ['date', 'time', 'created', 'updated']):
                try:
                    df[col] = pd.to_datetime(df[col], infer_datetime_format=True, errors='ignore')
                    date_columns.append(col)
                except:
                    pass
        
        # Reset index
        df = df.reset_index(drop=True)
        
        return df
    
    def load_from_api(self, url: str, headers: Dict[str, str] = None) -> pd.DataFrame:
        """
        Load data from API endpoint.
        
        Args:
            url: API endpoint URL
            headers: Optional headers for the request
            
        Returns:
            pd.DataFrame: Loaded data
        """
        try:
            response = requests.get(url, headers=headers or {})
            response.raise_for_status()
            
            content_type = response.headers.get('content-type', '').lower()
            
            if 'application/json' in content_type:
                data = response.json()
                
                if isinstance(data, list):
                    df = pd.DataFrame(data)
                elif isinstance(data, dict):
                    # Try to find the main data array
                    if 'data' in data:
                        df = pd.DataFrame(data['data'])
                    elif 'results' in data:
                        df = pd.DataFrame(data['results'])
                    elif 'items' in data:
                        df = pd.DataFrame(data['items'])
                    else:
                        df = pd.json_normalize(data)
                else:
                    raise ValueError("Unsupported JSON structure")
                    
            elif 'text/csv' in content_type:
                df = pd.read_csv(io.StringIO(response.text))
            else:
                # Try to parse as CSV anyway
                df = pd.read_csv(io.StringIO(response.text))
            
            return self._clean_dataframe(df)
            
        except requests.RequestException as e:
            raise Exception(f"API request failed: {str(e)}")
        except Exception as e:
            raise Exception(f"Error processing API data: {str(e)}")
    
    def get_data_summary(self, df: pd.DataFrame) -> Dict[str, Any]:
        """
        Generate a summary of the dataset.
        
        Args:
            df: DataFrame to summarize
            
        Returns:
            Dict containing summary statistics
        """
        summary = {
            'shape': df.shape,
            'columns': df.columns.tolist(),
            'dtypes': df.dtypes.to_dict(),
            'missing_values': df.isnull().sum().to_dict(),
            'memory_usage': df.memory_usage(deep=True).sum(),
            'numeric_columns': df.select_dtypes(include=['number']).columns.tolist(),
            'categorical_columns': df.select_dtypes(include=['object']).columns.tolist(),
            'date_columns': df.select_dtypes(include=['datetime']).columns.tolist()
        }
        
        # Add basic statistics for numeric columns
        if len(summary['numeric_columns']) > 0:
            summary['numeric_stats'] = df[summary['numeric_columns']].describe().to_dict()
        
        return summary
    
    def validate_data(self, df: pd.DataFrame) -> Dict[str, Any]:
        """
        Validate data quality and return issues found.
        
        Args:
            df: DataFrame to validate
            
        Returns:
            Dict containing validation results
        """
        issues = {
            'empty_dataset': len(df) == 0,
            'no_columns': len(df.columns) == 0,
            'duplicate_rows': df.duplicated().sum(),
            'columns_with_all_nulls': df.isnull().all().sum(),
            'columns_with_single_value': (df.nunique() == 1).sum(),
            'potential_id_columns': [],
            'suspicious_columns': []
        }
        
        # Check for potential ID columns (high cardinality)
        for col in df.columns:
            unique_ratio = df[col].nunique() / len(df)
            if unique_ratio > 0.95:
                issues['potential_id_columns'].append(col)
        
        # Check for suspicious columns (too many missing values)
        for col in df.columns:
            missing_ratio = df[col].isnull().sum() / len(df)
            if missing_ratio > 0.5:
                issues['suspicious_columns'].append({
                    'column': col,
                    'missing_ratio': missing_ratio
                })
        
        return issues
