from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .models import *

app = FastAPI(title="EnglishWorld API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由 — 直接导入router对象
from app.routers.learning import router as learning_router
from app.routers.pet import router as pet_router
from app.routers.review import router as review_router
from app.routers.reading import router as reading_router

app.include_router(learning_router)
app.include_router(pet_router)
app.include_router(review_router)
app.include_router(reading_router)


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)


@app.get("/health")
def health():
    return {"status": "ok", "app": "EnglishWorld"}
