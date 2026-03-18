from pyspark.sql import SparkSession
from pyspark.sql import functions as F

def main():
    driver_path = "/opt/jupyter/works/driver/mariadb-java-client-3.1.2.jar"
    
    spark = SparkSession.builder \
        .appName("Subway_Analysis_D1_2") \
        .master("spark://master:7077") \
        .config("spark.jars", driver_path) \
        .config("spark.driver.extraClassPath", driver_path) \
        .getOrCreate()

    spark.sparkContext.setLogLevel("WARN")

    jdbc_url = "jdbc:mariadb://192.168.0.204:3306/edu?useUnicode=true&characterEncoding=UTF-8"
    db_properties = {
        "user": "root",
        "password": "1234",
        "driver": "org.mariadb.jdbc.Driver"
    }

    print(">>> MariaDB에서 데이터를 로드하는 중...")
    # [수정] 테이블 전체를 읽어오되 스키마를 먼저 확인합니다.
    raw_df = spark.read.jdbc(url=jdbc_url, table="seoul_metro", properties=db_properties)
    
    # [중요 체크 1] Spark가 인식한 데이터 타입을 출력합니다.
    print("--- [DEBUG] 데이터 스키마 확인 ---")
    raw_df.printSchema()
    
    # [중요 체크 2] 필터링 전 원본 데이터 5줄의 '날짜' 컬럼 상세 확인
    print("--- [DEBUG] 원본 데이터 상세 샘플 ---")
    raw_df.select("날짜").show(5, truncate=False)

    # 3. 데이터 정제 (조건 완화)
    # rlike가 실패할 수 있으므로, 우선 '날짜'라는 글자만 아니면 다 통과시켜 봅니다.
    df_cleaned = raw_df.filter(F.trim(F.col("날짜")) != "날짜")
    
    # 만약 rlike 패턴이 너무 엄격하다면 아래 한 줄을 주석 처리하고 테스트해보세요.
    # df_cleaned = df_cleaned.filter(F.col("날짜").rlike(r"\d{4}-\d{2}-\d{2}"))

    # 4. Wide to Long 변환
    time_cols = [f"`{h:02d}~{h+1:02d}`" for h in range(5, 24)]
    stack_expr = f"stack({len(time_cols)}, " + \
                 ", ".join([f"'{c.replace('`','')}', {c}" for c in time_cols]) + \
                 ") as (time_range, passenger_count)"

    # 안전하게 select 실행
    try:
        long_df = df_cleaned.select(
            "날짜", "역번호", "역명", "구분", 
            F.expr(stack_expr)
        ).withColumn("passenger_count", F.col("passenger_count").cast("integer"))

        total_count = long_df.count()
        print(f">>> 전처리 완료! 총 행 수: {total_count}")
        
        if total_count > 0:
            long_df.show(10)
            long_df.cache()
            return long_df
        else:
            print("!!! 필터링 후 데이터가 유실되었습니다. 상단의 [DEBUG] 출력을 확인하세요.")
            
    except Exception as e:
        print(f"!!! 에러 발생: {e}")

if __name__ == "__main__":
    main()