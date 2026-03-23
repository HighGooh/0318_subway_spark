from pyspark.sql import SparkSession
from pyspark.sql.functions import avg, col, when
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, inspect, text
from fastapi import FastAPI
import pandas as pd
from settings import settings
from fastapi import Request
import os
import sys

os.environ['PYSPARK_PYTHON'] = sys.executable
os.environ['PYSPARK_DRIVER_PYTHON'] = sys.executable
os.environ['PYSPARK_SUBMIT_ARGS'] = (
    '--conf "spark.driver.extraJavaOptions=--add-opens=java.base/javax.security.auth=ALL-UNNAMED" '
    '--conf "spark.executor.extraJavaOptions=--add-opens=java.base/javax.security.auth=ALL-UNNAMED" '
    'pyspark-shell'
)

app = FastAPI()

spark = None

origins = [
    "http://192.168.0.109:5173",
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

engine_mariadb = create_engine('mysql+pymysql://root:1234@192.168.0.204:3306/metro_db')

inspector = inspect(engine_mariadb)

@app.on_event("startup")
def startup_event():
  global spark
  try:
    spark = SparkSession.builder \
      .appName("Gayoung") \
      .master(settings.spark_url) \
      .config("spark.driver.host", settings.host_ip) \
      .config("spark.driver.bindAddress", "0.0.0.0") \
      .config("spark.driver.port", "10000") \
      .config("spark.blockManager.port", "10001") \
      .config("spark.cores.max", "2") \
      .config("spark.driver.extraJavaOptions", "--add-opens=java.base/javax.security.auth=ALL-UNNAMED") \
      .config("spark.executor.extraJavaOptions", "--add-opens=java.base/javax.security.auth=ALL-UNNAMED") \
      .getOrCreate()
    print("Spark Session Created Successfully!")
  except Exception as e:
    print(f"Failed to create Spark session: {e}")
  
@app.on_event("shutdown")
def shutdown_event():
  if spark:
    spark.stop()

@app.get("/")
def read_root(fileName:str):
  if not spark:
    return {"status": False, "error": "Spark session not initialized"}
  try:
    file_path = os.path.join(settings.file_dir, fileName)
    df = pd.read_csv(file_path, encoding="cp949", header=0, thousands=',', quotechar='"', skipinitialspace=True)
    spDf = spark.createDataFrame(df)
    result = spDf.limit(50).toPandas().to_dict(orient="records")
    return {"status": True, "data": result}
  except Exception as e:
    return {"status": False, "error": str(e)}


@app.get('/kidsDay')
def kidsDay(year: str, req: Request):
  if not spark:
    return {"status": False, "error": "Spark session not initialized"}
  try:
    # tables = inspector.get_table_names()
    # print(tables)
    sql = text(f"""
          SELECT * FROM metro_db.seoul_metro WHERE `날짜` like '{year}-05-05' AND `구분` = '하차'""")
    result = pd.read_sql_query(sql, engine_mariadb)
    spDf = spark.createDataFrame(result)
    spDf.createOrReplaceTempView("kidsDayTable")
    sql2 = """
            SELECT `역명`, `날짜`, `구분`, `합계`, `순위`
            FROM (
                SELECT `역명`, `날짜`, `구분`,
                (CAST(`10~11` AS INT) + CAST(`11~12` AS INT) + CAST(`12~13` AS INT)) as `합계`,
                ROW_NUMBER() OVER (
                    ORDER BY (CAST(`10~11` AS INT) + CAST(`11~12` AS INT) + CAST(`12~13` AS INT)) DESC
                ) as `순위`
                FROM kidsDayTable
            ) tmp
            WHERE `순위` <= 5
            ORDER BY `날짜` ASC, `합계` DESC
        """
    fIdDf = spark.sql(sql2)
    # print(fIdDf.show(100))
    result =fIdDf.limit(50).toPandas().to_dict(orient="records")
    return {"status": True, "data": result}
  except Exception as e:
    return {"status": False, "error": str(e)}