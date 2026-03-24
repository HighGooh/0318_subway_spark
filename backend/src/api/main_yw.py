from fastapi import APIRouter
from sqlalchemy import create_engine, text
import pandas as pd

from src.core.spark import conn
from pyspark.sql.functions import regexp_replace
from src.core.queries import get_analysis_sql, get_comment_optimization_sql, get_union_part_sql, STATION_SEARCH_SQL, STATION_CODE_SQL, get_station_history_sql

router = APIRouter(tags=["yoonwoo"])

# 판별 기준값
ANALYSIS_PARAMS = {
    "off_min": 2.0, "off_sub": 1.3, "off_ext": 4.0,
    "home_min": 2.0, "home_sub": 1.3, "home_ext": 4.0
}

# DB 연결 정보
DB_URL_FLOW = 'mysql+pymysql://root:1234@192.168.0.204:3306/metro_flow'

@router.get('/fromdb')
def fromdb(year: str, external_spark=None):
  # spark 연결
  spark= external_spark if external_spark else conn()
  if not spark:
    return {"status": False, "error": "Spark session not initialized"}
  try:
    connection_properties = {
            "user": "root",
            "password": "1234",
            "driver": "org.mariadb.jdbc.Driver",
            "char.encoding": "utf-8",
            "characterEncoding": "UTF-8",
            "useUnicode": "true",
            "sessionVariables": "sql_mode='ANSI_QUOTES'"
        }    
    query = f"(select * from `seoul_metro` where `날짜` like '{year}%') as tmp"
    spDf = spark.read.jdbc(url='jdbc:mariadb://192.168.0.204:3306/edu', table=query, properties= connection_properties)
    # 역명에서 (역번호) 제거
    spDf = spDf.withColumn("역명", regexp_replace("역명", r"\(\d+\)", ""))
    spDf.createOrReplaceTempView("temp_analysis_target")
    # 쿼리에 주입할 파라미터 정의 (딕셔너리), 외부 SQL 가져오기 및 실행
    result_df = spark.sql(get_analysis_sql(), args=ANALYSIS_PARAMS)
    # Spark 결과(Spark DataFrame)를 Pandas 데이터프레임으로 변환
    analysis_pandas_df = result_df.toPandas()
    # 저장할 새 테이블 이름 설정
    new_table_name = f"metro_flow_{year}"
    # DB 연결 엔진 생성 (기존 engine_mariadb를 그대로 사용하거나 새로 생성)
    engine_mariadb = create_engine('mysql+pymysql://root:1234@192.168.0.204:3306/metro_flow')
    # DB에 저장, if_exists='replace': 이미 테이블이 있으면 지우고 새로 만듦, index=False: Pandas의 인덱스 번호는 저장하지 않음
    analysis_pandas_df.to_sql(name=new_table_name, con=engine_mariadb, if_exists='replace', index=False)
    # 타입 최적화 및 컬럼 코멘트 추가
    with engine_mariadb.connect() as conn_db:
        optimize_sql = get_comment_optimization_sql(new_table_name)
        conn_db.execute(text(optimize_sql))
        conn_db.commit()
        print(f"성공: {new_table_name} 테이블 저장 및 코멘트 추가 완료")
    return {"status": True, "message": f"{year}년 완료"}
  except Exception as e:
    return {"status": False, "message": str(e)}
  finally:
    if not external_spark and spark: spark.stop()
  
@router.get('/analyze_all_years')
def analyze_all_years():
    main_spark = conn()
    if not main_spark:
        return {"status": False, "error": "Spark session failed"}
    # 2008년부터 2024년까지 리스트 생성
    years = [str(y) for y in range(2008, 2025)]
    summary = []
    try:
        for year in years:
            print(f"--- {year}년 데이터 분석 및 저장 시작 ---")
            result = fromdb(year, external_spark=main_spark)
            summary.append({
                "year": year,
                "status": result.get("status"),
                "message": result.get("message") if not result.get("status") else None
            })  
        return {"status": True, "details": summary}
    except Exception as e:
        print(f"전체 공정 중 오류 발생: {e}")
        return {"status": False, "error": str(e), "partial_details": summary}
    finally:
        if main_spark:
            main_spark.stop()

@router.get('/create_integrated_view')
def create_integrated_view():
    # 17개년 데이터를 역번호 기준으로 합산하여 중복을 제거한 통합 뷰 생성
    engine_flow = create_engine(DB_URL_FLOW)
    years = [str(y) for y in range(2008, 2025)]
    # 쿼리 조립 (파라미터 바인딩 준비)
    try:
        union_queries = [get_union_part_sql(year) for year in years]
        full_query = "CREATE OR REPLACE VIEW `v_metro_analysis_all` AS " + " UNION ALL ".join(union_queries)
        with engine_flow.connect() as conn_db:
            # text()와 파라미터를 함께 전달하여 안전하게 실행
            conn_db.execute(text(full_query), ANALYSIS_PARAMS)
            conn_db.commit()
        return {"status": True, "message": "17개년 통합 뷰 생성 완료"}
    except Exception as e:
        return {"status": False, "error": str(e)}

@router.get('/station_history')
def get_station_history(station_name: str):
    # 이름 검색하면 최신년도 역번호 찾아 17년치 변화 반환
    engine_flow = create_engine(DB_URL_FLOW)
    try:
        with engine_flow.connect() as conn_db:
            # 1단계: 가장 적절한 역명 찾기
            search_res = conn_db.execute(text(STATION_SEARCH_SQL), {"name": f"%{station_name}%", "raw_name": station_name}).fetchone()
            if not search_res:
                return {"status": False, "error": "역을 찾을 수 없습니다."}
            # 최종적으로 결정한 정확한 이름
            official_name = search_res[0]
            # 2단계: 결정된 'official_name'을 사용하는 모든 역번호(환승역) 리스트 확보
            code_res = conn_db.execute(text(STATION_CODE_SQL), {"name": official_name}).fetchall()
            target_codes = [r[0] for r in code_res]
            # 3단계: 히스토리 조회
            # IN 연산자에 리스트를 넣기 위해 파라미터 딕셔너리 병합
            history_params = {**ANALYSIS_PARAMS, "codes": target_codes}
            df = pd.read_sql_query(text(get_station_history_sql()), conn_db, params=history_params)
        return {"status": True, "station_name": official_name, "station_code": target_codes, "data": df.to_dict(orient="records")}
    except Exception as e:
        return {"status": False, "error": str(e)}