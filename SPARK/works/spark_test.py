from pyspark.sql import SparkSession

# 1. Spark 세션 생성
spark = SparkSession.builder \
    .appName("MetroAnalysis") \
    .getOrCreate()

# 2. DB 접속 정보 및 설정
# fetchsize를 properties 안에 넣어서 관리하면 코드가 더 깔끔합니다.
jdbc_url = "jdbc:mysql://192.168.0.204:3306/edu"
db_properties = {
    "user": "root",
    "password": "1234",
    "driver": "com.mysql.cj.jdbc.Driver",
    "fetchsize": "100"  # <-- 여기서 한 번에 가져올 양을 조절합니다.
}

# 3. 데이터 로드 테스트
try:
    # spark.read.jdbc 방식에 properties를 전달하면 옵션이 적용됩니다.
    df = spark.read.jdbc(url=jdbc_url, table="seoul_metro", properties=db_properties)
    
    print("연결 성공! 데이터를 불러오는 중입니다...")
    
    # 상위 5개 행만 출력 (show가 실행될 때 실제 데이터 로드가 시작됩니다)
    df.show(5)
    
    # 데이터 전체 개수 확인 (선택 사항)
    # print(f"전체 데이터 개수: {df.count()}")

except Exception as e:
    print(f"연결 실패 혹은 메모리 부족: {e}")