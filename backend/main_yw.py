from pyspark.sql import SparkSession, Row
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, inspect, text
from fastapi import FastAPI
import pandas as pd
from settings import settings
import os
import re

app = FastAPI()
# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

spark = None

@app.on_event("startup")
def startup_event():
  global spark
  try:
    spark = SparkSession.builder \
      .appName("mySparkApp_yw") \
      .master(settings.spark_url) \
      .config("spark.driver.host", settings.host_ip) \
      .config("spark.driver.bindAddress", "0.0.0.0") \
      .config("spark.driver.port", "10000") \
      .config("spark.blockManager.port", "10001") \
      .config("spark.cores.max", "2") \
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
    # ANSI = cp949, UTF = utf-8

    # 모든 컬럼 이름의 앞뒤 공백 제거
    df.columns = df.columns.str.strip()
    # 모든 문자열 데이터의 앞뒤 공백 제거
    df = df.apply(lambda x: x.str.strip() if x.dtype == "object" else x)
    spDf = spark.createDataFrame(df)

    # sql문 영역
    view_name = fileName.split('.')[0]
    spDf.createOrReplaceTempView(f"subway_{view_name}")

    # SQL 쿼리 실행
    sql_result = spark.sql(f"""
        SELECT `역명`, `구분`, SUM( `06~07` + `07~08` + `08~09` ) as `출근시간대_승차`
        FROM subway_{view_name}
        WHERE `역명` LIKE '서울역%' AND `구분` = '승차'
        GROUP BY `역명`, `구분`
        """)

    # 결과 확인
    sql_result.show()

    result = sql_result.limit(50).toPandas().to_dict(orient="records")
    return {"status": True, "data": result}
  except Exception as e:
    return {"status": False, "error": str(e)}

@app.get('/fromdb')
def fromdb(year: str):
  if not spark:
    return {"status": False, "error": "Spark session not initialized"}
  try:
    engine_mariadb = create_engine('mysql+pymysql://root:1234@192.168.0.204:3306/edu')
    inspector = inspect(engine_mariadb)
    tables = inspector.get_table_names()
    # print(tables)
    sql = text(f"select * from `seoul_metro` where `날짜` like '{year}%'")

    # 데이터 로드 후 전처리
    result = pd.read_sql_query(sql, engine_mariadb)
    result.columns = result.columns.str.strip()

    # 역명에서 (역번호)만 제거하는 로직 추가
    result['역명'] = result['역명'].apply(lambda x: re.sub(r"\(\d{3,}\)", "", str(x)).strip())

    spDf = spark.createDataFrame(result)
    spDf.createOrReplaceTempView(f"analysis_{year}")

    # spark로 작업할 sql문
    analysis_sql = f"""
        SELECT 
            `역번호`, 
            `역명`,
            `출근_승차합`, `출근_하차합`, `퇴근_승차합`, `퇴근_하차합`,
            -- 1. 4대 성격 비율 계산 (이미 계산된 합계를 가져와서 나누기만 하면 됨)
            ROUND(`출근_하차합` / NULLIF(`출근_승차합`, 0), 2) AS `출근_하차비율`,
            ROUND(`퇴근_승차합` / NULLIF(`퇴근_하차합`, 0), 2) AS `퇴근_승차비율`,
            ROUND(`출근_승차합` / NULLIF(`출근_하차합`, 0), 2) AS `출근_승차비율`,
            ROUND(`퇴근_하차합` / NULLIF(`퇴근_승차합`, 0), 2) AS `퇴근_하차비율`,
            -- 2. 역 성격 규명 로직
            CASE 
              -- [오피스 판별]
              WHEN (
                  -- 조건 1: 둘 다 적당히 높음
                  (`출근_하차비율` >= 2.0 AND `퇴근_승차비율` >= 1.3)
                  OR 
                  -- 조건 2: 출근 하차가 압도적 (퇴근 상관 없음)
                  (`출근_하차비율` >= 4.0)
              ) THEN '오피스'
              -- [주거단지 판별]
              WHEN (
                  -- 조건 1: 둘 다 적당히 높음
                  (`출근_승차비율` >= 2.0 AND `퇴근_하차비율` >= 1.3)
                  OR 
                  -- 조건 2: 출근 승차가 압도적 (퇴근 상관 없음)
                  (`출근_승차비율` >= 4.0)
              ) THEN '주거단지'

              ELSE '상업/복합'
            END AS `역성격`
        FROM (
            -- [서브쿼리] 먼저 모든 합계를 계산
            SELECT 
                `역번호`, 
                `역명`,
                SUM(CASE WHEN `구분` = '승차' THEN (CAST(`06~07` AS INT) + CAST(`07~08` AS INT) + CAST(`08~09` AS INT)) ELSE 0 END) AS `출근_승차합`,
                SUM(CASE WHEN `구분` = '하차' THEN (CAST(`06~07` AS INT) + CAST(`07~08` AS INT) + CAST(`08~09` AS INT)) ELSE 0 END) AS `출근_하차합`,
                SUM(CASE WHEN `구분` = '승차' THEN (CAST(`17~18` AS INT) + CAST(`18~19` AS INT) + CAST(`19~20` AS INT)) ELSE 0 END) AS `퇴근_승차합`,
                SUM(CASE WHEN `구분` = '하차' THEN (CAST(`17~18` AS INT) + CAST(`18~19` AS INT) + CAST(`19~20` AS INT)) ELSE 0 END) AS `퇴근_하차합`
            FROM `analysis_{year}`
            GROUP BY `역번호`, `역명`
        )
        ORDER BY CAST(`역번호` AS INT)
    """
    
    result_df = spark.sql(analysis_sql)
    # Spark 결과(Spark DataFrame)를 Pandas 데이터프레임으로 변환
    analysis_pandas_df = result_df.toPandas()
    final_result = analysis_pandas_df.head(50).to_dict(orient="records")

    try:
      # 저장할 새 테이블 이름 설정 (예: metro_summary_2008)
      new_table_name = f"metro_flow_{year}"

      # DB 연결 엔진 생성 (기존 engine_mariadb를 그대로 사용하거나 새로 생성)
      engine_mariadb = create_engine('mysql+pymysql://root:1234@192.168.0.204:3306/metro_flow')
      
      # DB에 저장
      # if_exists='replace': 이미 테이블이 있으면 지우고 새로 만듦
      # index=False: Pandas의 인덱스 번호는 저장하지 않음
      analysis_pandas_df.to_sql(name=new_table_name, con=engine_mariadb, if_exists='replace', index=False)
      
      # 타입 최적화 및 컬럼 코멘트 추가
      with engine_mariadb.connect() as conn:
          conn.execute(text(f"""
              ALTER TABLE `{new_table_name}` 
              MODIFY COLUMN `역번호` INT COMMENT '지하철 역 고유 번호',
              MODIFY COLUMN `역명` VARCHAR(20) COMMENT '지하철 역 이름',
              MODIFY COLUMN `출근_승차합` INT COMMENT '06~09시 승차 합계',
              MODIFY COLUMN `출근_하차합` INT COMMENT '06~09시 하차 합계',
              MODIFY COLUMN `퇴근_승차합` INT COMMENT '17~20시 승차 합계',
              MODIFY COLUMN `퇴근_하차합` INT COMMENT '17~20시 하차 합계',
              MODIFY COLUMN `출근_하차비율` FLOAT COMMENT '오피스 지표1: 아침에 얼마나 내리는가',
              MODIFY COLUMN `퇴근_승차비율` FLOAT COMMENT '오피스 지표2: 저녁에 얼마나 타는가',
              MODIFY COLUMN `출근_승차비율` FLOAT COMMENT '주거 지표1: 아침에 얼마나 타는가',
              MODIFY COLUMN `퇴근_하차비율` FLOAT COMMENT '주거 지표2: 저녁에 얼마나 내리는가',
              MODIFY COLUMN `역성격` VARCHAR(20) COMMENT '승하차 비율 기반 역 분류, 오피스:(출근_하차비율2이상and퇴근_승차비율1.5이상), 주거단지:(오피스 조건의 반대), 상업/복합:else'
          """))
          conn.commit()
      
      print(f"성공: {new_table_name} 테이블 저장 및 코멘트 추가 완료")

    except Exception as save_error:
        print(f"DB 저장 중 오류 발생: {save_error}")
    return {"status": True, "data": final_result}
  except Exception as e:
    return {"status": False, "error": str(e)}
  
@app.get('/analyze_all_years')
def analyze_all_years():
    if not spark:
        return {"status": False, "error": "Spark session not initialized"}
    
    # 2008년부터 2024년까지 리스트 생성
    years = [str(y) for y in range(2008, 2025)]
    summary = []
    
    try:
        for year in years:
            print(f"--- {year}년 데이터 분석 및 저장 시작 ---")
            result = fromdb(year)
            
            summary.append({
                "year": year,
                "status": result.get("status"),
                "error": result.get("error") if not result.get("status") else None
            })
            
        return {
            "status": True, 
            "message": "전체 연도(2008-2024) 처리가 완료되었습니다.", 
            "details": summary
        }
    except Exception as e:
        return {"status": False, "error": f"일괄 처리 중 예외 발생: {str(e)}"}

# DB 연결 정보
DB_URL_EDU = 'mysql+pymysql://root:1234@192.168.0.204:3306/edu'
DB_URL_FLOW = 'mysql+pymysql://root:1234@192.168.0.204:3306/metro_flow'

@app.get('/create_integrated_view')
def create_integrated_view():
    # 17개년 데이터를 역번호 기준으로 합산하여 중복을 제거한 통합 뷰 생성
    engine_flow = create_engine(DB_URL_FLOW)
    years = [str(y) for y in range(2008, 2025)]
    
    union_queries = []
    for year in years:
        query = f"""
            SELECT 
                '{year}' AS `연도`,
                `역번호`,
                MAX(`역명`) AS `역명`, -- 일단 가져오지만 중요하지 않음
                SUM(`출근_승차합`) AS `출근_승차합`,
                SUM(`출근_하차합`) AS `출근_하차합`,
                SUM(`퇴근_승차합`) AS `퇴근_승차합`,
                SUM(`퇴근_하차합`) AS `퇴근_하차합`,
                -- 비율 및 성격 재계산 (확정된 로직 적용)
                ROUND(SUM(`출근_하차합`) / NULLIF(SUM(`출근_승차합`), 0), 2) AS `출근_하차비율`,
                ROUND(SUM(`퇴근_승차합`) / NULLIF(SUM(`퇴근_하차합`), 0), 2) AS `퇴근_승차비율`,
                ROUND(SUM(`출근_승차합`) / NULLIF(SUM(`출근_하차합`), 0), 2) AS `출근_승차비율`,
                ROUND(SUM(`퇴근_하차합`) / NULLIF(SUM(`퇴근_승차합`), 0), 2) AS `퇴근_하차비율`,
                CASE 
                    WHEN (SUM(`출근_하차합`) / NULLIF(SUM(`출근_승차합`), 0) >= 2.0 AND SUM(`퇴근_승차합`) / NULLIF(SUM(`퇴근_하차합`), 0) >= 1.3)
                         OR (SUM(`출근_하차합`) / NULLIF(SUM(`출근_승차합`), 0) >= 4.0) THEN '오피스'
                    WHEN (SUM(`출근_승차합`) / NULLIF(SUM(`출근_하차합`), 0) >= 2.0 AND SUM(`퇴근_하차합`) / NULLIF(SUM(`퇴근_승차합`), 0) >= 1.3)
                         OR (SUM(`출근_승차합`) / NULLIF(SUM(`출근_하차합`), 0) >= 4.0) THEN '주거단지'
                    ELSE '상업/복합'
                END AS `역성격`
            FROM `metro_flow_{year}`
            GROUP BY `역번호`
        """
        union_queries.append(query)
    
    full_query = "CREATE OR REPLACE VIEW `v_metro_analysis_all` AS " + " UNION ALL ".join(union_queries)
    
    try:
        with engine_flow.connect() as conn:
            conn.execute(text(full_query))
            conn.commit()
        return {"status": True, "message": "중복 제거된 17개년 통합 뷰 생성 완료"}
    except Exception as e:
        return {"status": False, "error": str(e)}

@app.get('/station_history')
def get_station_history(station_name: str):
    # 이름 검색하면 최신년도 역번호 찾아 17년치 변화 반환
    engine_flow = create_engine(DB_URL_FLOW)
    try:
        with engine_flow.connect() as conn:
            # 1단계: 2024년 데이터에서 해당 이름의 역번호 찾기
            code_query = text("""
                SELECT `역번호`, `역명` 
                FROM `metro_flow_2024` 
                WHERE `역명` LIKE :name 
                LIMIT 1
            """)
            code_res = conn.execute(code_query, {"name": f"%{station_name}%"}).fetchone()
            
            if not code_res:
                return {"status": False, "error": "역을 찾을 수 없습니다."}

            # 2단계: 통합 뷰에서 해당 역번호 히스토리 조회
            history_query = text("""
                SELECT *
                FROM `v_metro_analysis_all`
                WHERE `역번호` = :code
                ORDER BY `연도` ASC
            """)
            df = pd.read_sql_query(history_query, conn, params={"code": code_res[0]})
            
        return {"status": True, "station_name": code_res[1], "station_code": code_res[0], "data": df.to_dict(orient="records")}
    except Exception as e:
        return {"status": False, "error": str(e)}
    
@app.get('/map_summary/{year}')
def get_map_summary(year: str):
    # 특정 연도의 모든 역 성격 데이터 (지도 시각화용)
    engine_flow = create_engine(DB_URL_FLOW)
    try:
        df = pd.read_sql_query(text("SELECT `역번호`, `역명`, `역성격` FROM `v_metro_analysis_all` WHERE `연도` = :year"), 
                               engine_flow, params={"year": year})
        return {"status": True, "data": df.to_dict(orient="records")}
    except Exception as e:
        return {"status": False, "error": str(e)}

@app.get('/ranking/{year}/{category}')
def get_ranking(year: str, category: str):
    # 연도별/성격별 TOP 10 랭킹
    engine_flow = create_engine(DB_URL_FLOW)
    sort_col = "`출근_하차비율`" if category == '오피스' else "`출근_승차비율`"
    try:
        df = pd.read_sql_query(text(f"""
            SELECT `역명`, {sort_col} as `ratio` FROM `v_metro_analysis_all` 
            WHERE `연도` = :year AND `역성격` = :cat ORDER BY {sort_col} DESC LIMIT 10
        """), engine_flow, params={"year": year, "cat": category})
        return {"status": True, "data": df.to_dict(orient="records")}
    except Exception as e:
        return {"status": False, "error": str(e)}