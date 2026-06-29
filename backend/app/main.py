"""
AlgoViz Backend — FastAPI application entry point.
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.api.v1.auth import router as auth_router
from app.api.v1.configs import router as configs_router
from app.api.v1.projects import router as projects_router
from app.api.v1.history import router as history_router
from app.api.v1.analyses import router as analyses_router

app = FastAPI(
    title="AlgoViz API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(auth_router, prefix="/api/v1")
app.include_router(configs_router, prefix="/api/v1")
app.include_router(projects_router, prefix="/api/v1")
app.include_router(history_router, prefix="/api/v1")
app.include_router(analyses_router, prefix="/api/v1")


# ---- Global Exception Handlers ----

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"code": exc.status_code, "message": exc.detail, "data": None},
    )


@app.exception_handler(Exception)
async def general_exception_handler(request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"code": 500, "message": "服务器内部错误", "data": None},
    )


@app.get("/api/health")
async def health_check():
    return {"status": "ok", "service": "AlgoViz Backend"}
