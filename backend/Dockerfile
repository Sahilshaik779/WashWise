# /backend/Dockerfile

# 1. Base Image
FROM python:3.10-slim

# 2. Set working directory
WORKDIR /app

# 3. Install system dependencies (needed for some python packages)
RUN apt-get update && apt-get install -y gcc libpq-dev

# 4. Copy requirements and install dependencies
# (Make sure you generated this with: pip freeze > requirements.txt)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 5. Copy the rest of the application code
COPY . .

# 6. Expose the port
EXPOSE 8000

# 7. Run the command
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]