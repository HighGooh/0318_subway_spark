from pyspark.sql import SparkSession
from pyspark.sql.functions import avg, col, when
from sqlalchemy import create_engine, inspect, text
from fastapi import FastAPI
import pandas as pd
from settings import settings
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
def kidsDay():
  if not spark:
    return {"status": False, "error": "Spark session not initialized"}
  try:
    engine_mariadb = create_engine('mysql+pymysql://root:1234@192.168.0.204:3306/metro_db')
    inspector = inspect(engine_mariadb)
    tables = inspector.get_table_names()
    print(tables)
    sql = text("""
          SELECT * FROM metro_db.seoul_metro WHERE `날짜` LIKE '%05-05' AND `구분` = '하차'""")
    result = pd.read_sql_query(sql, engine_mariadb)
    spDf = spark.createDataFrame(result)
    spDf.createOrReplaceTempView("kidsDayTable")
    sql2 = """
            SELECT `역명`, `날짜`, `구분`, `합계`, `순위`
            FROM (
                SELECT `역명`, `날짜`, `구분`,
                (CAST(`10~11` AS INT) + CAST(`11~12` AS INT) + CAST(`12~13` AS INT)) as `합계`,
                ROW_NUMBER() OVER (
                    PARTITION BY SUBSTRING(`날짜`, 1, 4)
                    ORDER BY (CAST(`10~11` AS INT) + CAST(`11~12` AS INT) + CAST(`12~13` AS INT)) DESC
                ) as `순위`
                FROM kidsDayTable
            ) tmp
            WHERE `순위` <= 5
            ORDER BY `날짜` ASC, `합계` DESC
        """
    fIdDf = spark.sql(sql2)
    print(fIdDf.show(100))
    result = spDf.limit(50).toPandas().to_dict(orient="records")
    return {"status": True, "data": result}
  except Exception as e:
    return {"status": False, "error": str(e)}
  

@app.get('/covid')
def covid():
    if not spark:
        return {"status": False, "error": "Spark session not initialized"}
    
    try:
        engine_mariadb = create_engine('mysql+pymysql://root:1234@192.168.0.204:3306/metro_db')
        inspector = inspect(engine_mariadb)
        tables = inspector.get_table_names()
        print(tables)
        sql = """
            SELECT 
                SUBSTRING(`날짜`, 1, 4) AS `년도`, 
                SUM(CASE WHEN `구분` = '승차' THEN CAST(`합계` AS SIGNED) ELSE 0 END) AS `승차 총 합`,
                SUM(CASE WHEN `구분` = '하차' THEN CAST(`합계` AS SIGNED) ELSE 0 END) AS `하차 총 합`
            FROM metro_db.seoul_metro
            WHERE `구분` IN ('승차', '하차')
            GROUP BY SUBSTRING(`날짜`, 1, 4)
            ORDER BY `년도`
        """
        result = pd.read_sql_query(sql, engine_mariadb)
        spDf = spark.createDataFrame(result)
        
        # # 코로나 이전 승하차 평균
        # before_df = spDf.filter(spDf['년도'] < '2020')
        # before_on_avg = before_df.agg(avg("승차 총 합")).collect()[0][0]
        # before_off_avg = before_df.agg(avg("하차 총 합")).collect()[0][0]

        # # 코로나 이후 승하차 평균
        # after_df = spDf.filter(spDf['년도'] >= '2020')
        # after_on_avg = after_df.agg(avg("승차 총 합")).collect()[0][0]
        # after_off_avg = after_df.agg(avg("하차 총 합")).collect()[0][0]
        
        # 하나의 collect만 이용
        stats = spDf.select(
            avg(when(col('년도') < '2020', col('승차 총 합'))).alias('before_on_total'),
            avg(when(col('년도') < '2020', col('하차 총 합'))).alias('before_off_total'),
            avg(when(col('년도') >= '2020', col('승차 총 합'))).alias('after_on_total'),
            avg(when(col('년도') >= '2020', col('하차 총 합'))).alias('after_off_total')
        ).collect()[0]


        return {
            "status": True,
            "summary": {
                "before_on_avg": round(stats['before_on_total'],0),
                "before_off_avg": round(stats['before_off_total'],0),
                "after_on_avg": round(stats['after_on_total'],0),
                "after_off_avg": round(stats['after_off_total'],0)
            }
        }
    except Exception as e:
        return {"status": False, "error": str(e)}