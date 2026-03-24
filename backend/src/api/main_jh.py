from fastapi import APIRouter
from typing import List
from pydantic import BaseModel

from src.core.spark import conn, connection_properties
from src.core.settings import settings
from src.core.queries import Jh_DRUNK_INFO_SQL, Jh_GET_STATION_SQL, search_complex_sql1, search_complex_sql2, search_complex_sql3,search_complex_sql4


router = APIRouter(tags=["jihwan"])

def getMetros(spark, year: str):
    try:
        # 1. 필터링된 테이블 정의 (서브쿼리 방식)
        # predicates 대신 이 방식을 쓰면 DB단에서 필터링 후 가져오므로 훨씬 빠릅니다.
        pushdown_query = f"""
            (SELECT * FROM {settings.target_table_name} 
             WHERE 날짜 >= '{year}-01-01' AND 날짜 <= '{year}-12-31') AS jh_filtered
        """

        # 2. 데이터 읽기
        spDf = spark.read.jdbc(
            url=settings.jdbc_url, 
            table=pushdown_query, 
            properties=connection_properties
        )

        # 3. 뷰 생성
        spDf.createOrReplaceTempView("jhYearTable")
        return True

    except Exception as e:
        # 백엔드 개발 시 에러 로그는 더 상세히 남기는 것이 좋습니다.
        print(f"Error loading MariaDB to Spark: {e}")
        return False

@router.get('/drunk_info')
def drunk_info(year:str):
  spark = conn()
  status = True
  mssage = None
  try:    
    if getMetros(spark, year):
      fIdDf = spark.sql(Jh_DRUNK_INFO_SQL)
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
      fIdDf = spark.sql(Jh_GET_STATION_SQL)
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
        fIdDf1 = spark.sql(search_complex_sql1(timeList,stations_formatted))
        result_data1 = fIdDf1.toPandas().to_dict(orient="records")
        fIdDf2 = spark.sql(search_complex_sql2(timeList))
        result_data2 = fIdDf2.toPandas().to_dict(orient="records")

      else : 
        fIdDf1 = spark.sql(search_complex_sql3(model.time,stations_formatted))
        result_data1 = fIdDf1.toPandas().to_dict(orient="records")
        fIdDf2 = spark.sql(search_complex_sql4(model.time))
        result_data2 = fIdDf2.toPandas().to_dict(orient="records")

  except Exception as e:
    status = False
    mssage = str(e)
  finally:
    if spark: spark.stop()
  return {"status": status, "data1": result_data1, "data2": result_data2, "message": mssage}

  
