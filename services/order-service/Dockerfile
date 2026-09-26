# -------------------------
# Stage 1: Builder
# -------------------------
FROM python:3.9-slim AS builder

WORKDIR /build

COPY requirements.txt .

RUN pip install --no-cache-dir --prefix=/install -r requirements.txt


# -------------------------
# Stage 2: Runtime
# -------------------------
FROM python:3.9-slim

WORKDIR /app

COPY --from=builder /install /usr/local

COPY app ./app

EXPOSE 8002

CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8002"]
