from pyspark.sql import SparkSession
from sqlalchemy import create_engine, inspect, text
import pandas as pd


spark = SparkSession.builder.appName("jh_test").master("spark://192.168.0.204:7077").getOrCreate()
engine_mariadb = create_engine('mysql+pymysql://root:1234@192.168.0.204:3306/edu')
inspector = inspect(engine_mariadb)
tables = inspector.get_table_names()
sql = text("select * from seoul_metro where `날짜` like '2011%'")
result = pd.read_sql_query(sql, engine_mariadb)
sDf = spark.createDataFrame(result)
sDf.createOrReplaceTempView("sptable")
sql1 = """
select `역번호`
 from sptable
"""
fIdDf = spark.sql(sql1)
fIdDf.show()

print("Spark 버전:", spark.version)
print("Spark 세션이 성공적으로 생성되었습니다!")


# jdbc_url = "jdbc:mysql://192.168.0.204:3306/edu"
# db_properties = {
#     "user": "root",
#     "password": "1234",
#     "driver": "com.mysql.cj.jdbc.Driver"
# }

# query = "(SELECT * FROM seoul_metro WHERE `날짜` LIKE '2011%') as subquery"
# df_2011 = spark.read \
#     .format("jdbc") \
#     .option("url", jdbc_url) \
#     .option("dbtable", query) \
#     .option("user", db_properties["user"]) \
#     .option("password", db_properties["password"]) \
#     .option("driver", db_properties["driver"]) \
#     .load()


# try:
#     # 데이터 로드 및 출력
#     df_2011.show(5)
    
#     # 프로그램이 바로 죽지 않게 대기 (확인용)
#     input("데이터가 잘 보이나요? 엔터를 누르면 종료합니다...") 
# except Exception as e:
#     print(f"에러 발생: {e}")