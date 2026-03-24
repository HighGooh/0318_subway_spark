from pyspark.sql import SparkSession, Row
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, APIRouter
import pandas as pd
from src.api import main_jh, main_yw, main_gy



app = FastAPI()

routers = [main_jh, main_yw, main_gy]

for router in routers:
    app.include_router(router.router)


origins = [
    "http://localhost:5173",
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
  return {"team4": "High Go!"}