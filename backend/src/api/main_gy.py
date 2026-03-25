from fastapi import APIRouter
from src.core.spark import conn, connection_properties
from src.core.settings import settings
from src.core.queries import KIDSDAY_YEAR_SQL, KIDSDAY_STATION_SQL
router = APIRouter(tags=["gayoung"])

@router.get('/kidsDayYear')
def kidsDay(year: str):
  spark= conn()
  status = True
  msg = None
  if not spark:
    return {"status": False, "error": "Spark session not initialized"}
  try:
    query = f"""(SELECT * FROM metro_db.seoul_metro WHERE `날짜` like '{year}-05-05' AND `구분` = '하차') as tmp"""
    spDf = spark.read.jdbc(
        url=settings.jdbc_url,
        table=query, properties = connection_properties
  )
    spDf.createOrReplaceTempView("kidsDayTable")
    fIdDf = spark.sql(KIDSDAY_YEAR_SQL)
    result =fIdDf.limit(50).toPandas().to_dict(orient="records")
  except Exception as e:
    status = False
    msg = str(e)
  finally:
    if spark: spark.stop()
  return {"status": status, "data": result, "message": msg}

@router.get('/kidsDayStation')
def kidsDayStation(search: str):
  spark= conn()
  status = True
  msg = None
  if not spark:
    return {"status": False, "error": "Spark session not initialized"}
  try:
    query = f"(SELECT * FROM metro_db.seoul_metro WHERE `역명` LIKE '%{search}%' AND `구분` = '하차') as tmp"
    spDf = spark.read.jdbc(
        url=settings.jdbc_url,
        table=query, properties = connection_properties
  )
    spDf.createOrReplaceTempView("kidsDayStationTable")
    fIdDf = spark.sql(KIDSDAY_STATION_SQL)
    result =fIdDf.toPandas().to_dict(orient="records")
  except Exception as e:
    status = False
    msg = str(e)
  finally:
    if spark: spark.stop()
  return {"status": status, "data": result, "message": msg}