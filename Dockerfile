# Use official Python runtime
FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Install system dependencies for pytesseract
RUN apt-get update && \
    apt-get install -y tesseract-ocr libtesseract-dev libleptonica-dev pkg-config poppler-utils && \
    rm -rf /var/lib/apt/lists/*

# Copy backend files
COPY requirements.txt ./
COPY ./*.py ./
# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install pytesseract

# Copy the already built frontend
COPY frontend/build ./frontend/build

# Expose backend port
EXPOSE 5000

# Run the backend
CMD ["python", "server.py"]
