from pyspark.sql import SparkSession, Row
from sqlalchemy import create_engine, inspect, text
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
      .appName("mySparkApp") \
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
    # 모든 컬럼 이름의 앞뒤 공백 제거
    df.columns = df.columns.str.strip()
    # 모든 문자열 데이터의 앞뒤 공백 제거
    df = df.apply(lambda x: x.str.strip() if x.dtype == "object" else x)
    spDf = spark.createDataFrame(df)
    spDf.createOrReplaceTempView("sptable")
    sql1 = """
    select `05~06`, `06~07`, `07~08`
    from sptable
    limit 10;
    """
    fIdDf = spark.sql(sql1)
    print(fIdDf.show())

    result = spDf.limit(50).toPandas().to_dict(orient="records")
    return {"status": True, "data": result}
  except Exception as e:
    return {"status": False, "error": str(e)}


@app.get('/year_select')
def year_select(year:int):
  if not spark:
    return {"status": False, "error": "Spark session not initialized"}
  try:
    engine_mariadb = create_engine('mysql+pymysql://root:1234@192.168.0.204:3306/metro_db')
    inspector = inspect(engine_mariadb)
    tables = inspector.get_table_names()
    print(tables)
    sql = text(f"select * from seoul_metro where `날짜` like '{year}%'")
    print(sql)
    result = pd.read_sql_query(sql, engine_mariadb)
    spDf = spark.createDataFrame(result)
    spDf.createOrReplaceTempView("drunkTable")
    
    return {"status": True}
  except Exception as e:
    return {"status": False, "error": str(e)}
  

@app.get('/drunk_info')
def drunk_info():
  try:
    sql1 = """
        SELECT
          `역명`,
          Floor(AVG(CAST(`20~21` AS INT) + CAST(`21~22` AS INT) + CAST(`22~23` AS INT)), 0) AS `night_avg`
        FROM drunkTable
        WHERE `주말여부` = 1
          OR DAYOFWEEK(CAST(`날짜` AS DATE)) = 6
        GROUP BY `역명`
        ORDER BY night_avg DESC
        LIMIT 10
        """
    fIdDf = spark.sql(sql1)
    result_data = fIdDf.toPandas().to_dict(orient="records")
    return {"status": True, "data": result_data}
  except Exception as e:
    return {"status": False, "error": str(e)}

  