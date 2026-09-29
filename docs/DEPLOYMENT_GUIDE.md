# Online Deployment Guide

The classroom demo should use localhost because it avoids Wi-Fi risk. Online deployment is mainly for sharing after the presentation.

## Prepared deployment files
- `Procfile`
- `render.yaml`
- `requirements.txt`
- `server.py`
- trained models in `model/`

## Generic Python host
Build command:

```bash
pip install -r requirements.txt
```

Start command:

```bash
uvicorn server:app --host 0.0.0.0 --port $PORT
```

Health endpoint:

```text
/api/health
```

## Render-style flow
1. Put this folder in a GitHub repository.
2. Create a new Web Service from the repository.
3. Use Python runtime.
4. Build: `pip install -r requirements.txt`
5. Start: `uvicorn server:app --host 0.0.0.0 --port $PORT`
6. Set the health path to `/api/health` if the host supports it.
7. After deployment, test both `/api/health` and the live candidate form.

No secret keys are required by the current application.
