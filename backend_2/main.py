import os
import sys


os.environ['PYSPARK_PYTHON'] = sys.executable
os.environ['PYSPARK_DRIVER_PYTHON'] = sys.executable
# 1. 자바 보안 에러(getSubject) 해결을 위한 환경 변수 설정
os.environ['PYSPARK_SUBMIT_ARGS'] = (
    '--conf "spark.driver.extraJavaOptions=--add-opens=java.base/javax.security.auth=ALL-UNNAMED" '
    'pyspark-shell'
)

from pyspark.sql import SparkSession
from sqlalchemy import create_engine, text
import pandas as pd

# 2. 마스터를 "local[*]"로 변경하여 클러스터 리소스 대기 문제 해결
spark = SparkSession.builder \
    .appName("Gayoung") \
    .master("local[*]") \
    .getOrCreate()

try:
    # MariaDB 연결 및 데이터 로드
    engine_mariadb = create_engine('mysql+pymysql://root:1234@192.168.0.204:3306/edu')
    sql = text("select * from `metro_db`.`seoul_metro` where `날짜` like '2011%'")
    
    print("데이터를 DB에서 가져오는 중...")
    result = pd.read_sql_query(sql, engine_mariadb)
    
    # Spark DataFrame 생성
    sDf = spark.createDataFrame(result)
    sDf.createOrReplaceTempView("sptable")
    
    # SQL 실행 및 결과 출력
    print("Spark SQL 실행 결과:")
    fIdDf = spark.sql("select `역번호` from sptable")
    fIdDf.show()

    print("Spark 버전:", spark.version)
    print("성공적으로 실행되었습니다!")

finally:
    spark.stop()