from fastapi import APIRouter
from typing import List
from pydantic import BaseModel

from src.core.spark import conn, connection_properties
from src.core.settings import settings

router = APIRouter(tags=["jihwan"])

def getMetros(spark, year:str):
  try:
    condition_list = [ f"날짜 <= '{year}-01-01'", f"날짜 >= '{year}-12-31'" ]
    spDf = spark.read.jdbc(url=settings.jdbc_url, table=settings.target_table_name, predicates=condition_list, properties=connection_properties)
    spDf.createOrReplaceTempView("jhYearTable")
    return True
  except Exception as e:
    print(f"Failed to create Spark session: {e}")
    return False

@router.get('/drunk_info')
def drunk_info(year:str):
  spark = conn()
  status = True
  mssage = None
  try:    
    if getMetros(spark, year):
      sql1 = """
          SELECT
            `역명`,
            Floor(AVG(CAST(`20~21` AS INT) + CAST(`21~22` AS INT) + CAST(`22~23` AS INT)), 0) AS `night_avg`
          FROM jhYearTable
          WHERE (`주말여부` = true
            OR DAYOFWEEK(CAST(`날짜` AS DATE)) = 6)
            AND `구분` = '승차'
          GROUP BY `역명`
          ORDER BY night_avg DESC
          LIMIT 10
          """
      fIdDf = spark.sql(sql1)
      result_data = fIdDf.toPandas().to_dict(orient="records")

    # return {"status": True}
  except Exception as e:
    status = False
    mssage = str(e)
  finally:
    if spark: spark.stop()
  return {"status": status, "data": result_data, "message": mssage}


@router.get('/get_station')
def get_station(year:str):
  spark = conn()
  status = True
  mssage = None
  try:
    if getMetros(spark, year):
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

  except Exception as e:
    status = False
    mssage = str(e)
  finally:
    if spark: spark.stop()
  return {"status": status, "data": station_list, "message": mssage}
  

class SearchQuery(BaseModel):
    start_st: str
    finish_st: str
    stations: List[str]  # ['도봉산역', '모란역']
    time: int
    year: int    # '05~06'

@router.post('/search_complex')
def search_complex(model: SearchQuery):
  spark = conn()
  status = True
  mssage = None
  station_list = [model.start_st, model.finish_st]

  for st in model.stations:
    station_list.append(st)
  stations_formatted = ", ".join([f"'{s}'" for s in station_list])

  try:
    if getMetros(spark, model.year):
      timeList = []
      if model.time != 24:
        for time in range(model.time, model.time+3) :
          if len(str(time)) == 1: timeList.append("0"+str(time))
          else : timeList.append(str(time))
        
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

      else : 
        sql1 = f"""
          SELECT `역명`, ROUND(AVG(CAST(`{time}~{time+1}` AS INT)),0) AS `지정 평균 승객` 
          FROM jhYearTable
          WHERE `역명` IN ({stations_formatted}) 
          GROUP BY `역명`;
            """
        fIdDf1 = spark.sql(sql1)
        result_data1 = fIdDf1.toPandas().to_dict(orient="records")

        sql2 = f'''
        SELECT  ROUND(AVG(CAST(`{time}~{time+1}` AS INT)),0) AS `전체 평균 승객` 
        FROM jhYearTable
        '''
        fIdDf2 = spark.sql(sql2)
        result_data2 = fIdDf2.toPandas().to_dict(orient="records")

  except Exception as e:
    status = False
    mssage = str(e)
  finally:
    if spark: spark.stop()
  return {"status": status, "data1": result_data1, "data2": result_data2, "message": mssage}

  
