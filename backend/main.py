from pyspark.sql import SparkSession, Row
from fastapi import FastAPI
import pandas as pd
from settings import settings
import os

app = FastAPI()

spark = None

@app.on_event("startup")
def startup_event():
  global spark
  try:
    spark = SparkSession.builder \
      .appName("mySparkApp_yw") \
      .master(settings.spark_url) \
      .config("spark.driver.host", settings.host_ip) \
      .config("spark.driver.bindAddress", "0.0.0.0") \
      .config("spark.driver.port", "10000") \
      .config("spark.blockManager.port", "10001") \
      .config("spark.cores.max", "2") \
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
    # ANSI = cp949, UTF = utf-8

    # 모든 컬럼 이름의 앞뒤 공백 제거
    df.columns = df.columns.str.strip()
    # 모든 문자열 데이터의 앞뒤 공백 제거
    df = df.apply(lambda x: x.str.strip() if x.dtype == "object" else x)
    spDf = spark.createDataFrame(df)

    # sql문 영역
    view_name = fileName.split('.')[0]
    spDf.createOrReplaceTempView(f"subway_{view_name}")

    # SQL 쿼리 실행
    sql_result = spark.sql(f"""
        SELECT `역명`, `구분`, SUM( `06~07` + `07~08` + `08~09` ) as `출근시간대_승차`
        FROM subway_{view_name}
        WHERE `역명` LIKE '서울역%' AND `구분` = '승차'
        GROUP BY `역명`, `구분`
        """)

    # 결과 확인
    sql_result.show()

    result = sql_result.limit(50).toPandas().to_dict(orient="records")
    return {"status": True, "data": result}
  except Exception as e:
    return {"status": False, "error": str(e)}
