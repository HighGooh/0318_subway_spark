from pyspark.sql import SparkSession

# 1. Spark 세션 생성 (드라이버 경로는 본인의 환경에 맞게 설정)
# 만약 jar 파일을 특정 경로에 두었다면 .config("spark.jars", "/경로/mysql-connector-java.jar") 사용
spark = SparkSession.builder.appName("MetroAnalysis").config("spark.jars.packages", "mysql:mysql-connector-java:8.0.28").getOrCreate()

# 2. DB 접속 정보
jdbc_url = "jdbc:mysql://192.168.0.204:3306/edu" # MariaDB 서버 주소
db_properties = {
    "user": "root",
    "password": "1234",
    "driver": "com.mysql.cj.jdbc.Driver" # MySQL 커넥터 클래스명
}

# 3. 데이터 로드 테스트
try:
    df = spark.read.jdbc(url=jdbc_url, table="seoul_metro", properties=db_properties)
    print("연결 성공!")
    df.show(5)
except Exception as e:
    print(f"연결 실패: {e}")