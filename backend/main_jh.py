from pyspark.sql import SparkSession, Row
from sqlalchemy import create_engine, inspect, text
from fastapi import FastAPI
import pandas as pd
from settings import settings
import os
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from fastapi import Query
from pydantic import BaseModel

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


spark = None

@app.on_event("startup")
def startup_event():
  global spark
  try:
    spark = SparkSession.builder \
      .appName("mySparkApp_jh") \
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
def year_select(year:str):
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
    spDf.createOrReplaceTempView("jhYearTable")
    
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
        FROM jhYearTable
        WHERE (`주말여부` = 1
          OR DAYOFWEEK(CAST(`날짜` AS DATE)) = 6)
          AND `구분` = '승차'
        GROUP BY `역명`
        ORDER BY night_avg DESC
        LIMIT 10
        """
    fIdDf = spark.sql(sql1)
    result_data = fIdDf.toPandas().to_dict(orient="records")
    return {"status": True, "data": result_data}
  except Exception as e:
    return {"status": False, "error": str(e)}


@app.get('/get_station')
def get_station():
  try:
    sql1 = """
        SELECT
          `역명`
        FROM jhYearTable
        GROUP BY `역명`
        """
    fIdDf = spark.sql(sql1)
    result_data = fIdDf.toPandas().to_dict(orient="records")
    station_list = []
    for data in result_data:
      station_list.append(data["역명"])
    station_list.sort()

    return {"status": True, "data": station_list}
  except Exception as e:
    return {"status": False, "error": str(e)}
  

class SearchQuery(BaseModel):
    start_st: str
    finish_st: str
    stations: List[str]  # ['도봉산역', '모란역']
    time: int    # '05~06'

@app.post('/search_complex')
def search_complex(model: SearchQuery):

  timeList = []
  for time in range(model.time, model.time+3) :
    if len(str(time)) == 1: timeList.append("0"+str(time))
    else : timeList.append(str(time))
  
  station_list = [model.start_st, model.finish_st]
  for st in model.stations:
    station_list.append(st)

  
  print(timeList)
  stations_formatted = ", ".join([f"'{s}'" for s in station_list])

  try:
    sql1 = f"""
      SELECT `역명`, ROUND(AVG(CAST(`{timeList[0]}~{timeList[1]}` AS INT) + CAST(`{timeList[1]}~{timeList[2]}` AS INT)),0) AS `지정 평균 승객` 
      FROM jhYearTable
      WHERE `역명` IN ({stations_formatted}) 
      GROUP BY `역명`;
        """
    fIdDf1 = spark.sql(sql1)
    result_data1 = fIdDf1.toPandas().to_dict(orient="records")

    sql2 = f'''
    SELECT  ROUND(AVG(CAST(`{timeList[0]}~{timeList[1]}` AS INT) + CAST(`{timeList[1]}~{timeList[2]}` AS INT)),0) AS `전체 평균 승객` 
    FROM jhYearTable
    '''
    fIdDf2 = spark.sql(sql2)
    result_data2 = fIdDf2.toPandas().to_dict(orient="records")


    return {"status": True, "data1": result_data1, "data2": result_data2}
  except Exception as e:
    return {"status": False, "error": str(e)}
  
