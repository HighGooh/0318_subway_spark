from sqlalchemy import create_engine, inspect
from fastapi import FastAPI, APIRouter
from src.core.spark import conn


router = APIRouter(tags=["gayoung"])
app = FastAPI()

engine_mariadb = create_engine('mysql+pymysql://root:1234@192.168.0.204:3306/metro_db')

inspector = inspect(engine_mariadb)


@router.get('/kidsDay')
def kidsDay(year: str):
  connection_properties = {
      "user": "root",
      "password": "1234",
      "driver": "org.mariadb.jdbc.Driver",
      "char.encoding": "utf-8",
      "characterEncoding": "UTF-8",
      "useUnicode": "true",
      "sessionVariables": "sql_mode='ANSI_QUOTES'"
    }
  spark= conn()
  status = True
  mssage = None
  if not spark:
    return {"status": False, "error": "Spark session not initialized"}
  try:
    query = f"""(SELECT * FROM metro_db.seoul_metro WHERE `날짜` like '{year}-05-05' AND `구분` = '하차') as tmp"""
    spDf = spark.read.jdbc(
        url='jdbc:mariadb://192.168.0.204:3306/metro_db',
        table=query, properties = connection_properties
    )
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
    result =fIdDf.limit(50).toPandas().to_dict(orient="records")
  except Exception as e:
    status = False
    mssage = str(e)
  finally:
    if spark: spark.stop()
  return {"status": status, "data": result, "message": mssage}