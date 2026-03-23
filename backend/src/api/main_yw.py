from pyspark.sql import SparkSession, Row
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, inspect, text
from fastapi import APIRouter, FastAPI
import pandas as pd
import os
import re
from src.core.spark import conn
from src.core.settings import settings
import sys
from pyspark.sql.functions import regexp_replace
import numpy as np


router = APIRouter(tags=["yunwoo"])

@router.get('/fromdb')
def fromdb(year: str):
  spark= conn()
  status = True
  mssage = None
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
    spDf = spark.read.jdbc(
        url='jdbc:mariadb://192.168.0.204:3306/edu',
        table=query,
        properties= connection_properties
        
    )
    

    # 역명에서 (역번호)만 제거하는 로직 추가
    spDf = spDf.withColumn("역명", regexp_replace("역명", r"\(\d+\)", ""))
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
      with engine_mariadb.connect() as conn_db:
          conn_db.execute(text(f"""
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
          conn_db.commit()
      
      print(f"성공: {new_table_name} 테이블 저장 및 코멘트 추가 완료")

    except Exception as save_error:
        print(f"DB 저장 중 오류 발생: {save_error}")
  except Exception as e:
    status = False
    mssage = str(e)
  finally:
    if spark: spark.stop()
  return {"status": status,"data": final_result, "message": mssage}
  
@router.get('/analyze_all_years')
def analyze_all_years():
    spark = conn()
    status = True
    mssage = None
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
            
        
    except Exception as e:
        status = False
        mssage = str(e)
    finally:
        if spark: spark.stop()
    return {
            "status": status, 
            "message": "전체 연도(2008-2024) 처리가 완료되었습니다.", 
            "details": summary,
            "message": mssage
        }

# DB 연결 정보
DB_URL_EDU = 'mysql+pymysql://root:1234@192.168.0.204:3306/edu'
DB_URL_FLOW = 'mysql+pymysql://root:1234@192.168.0.204:3306/metro_flow'

@router.get('/create_integrated_view')
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
        with engine_flow.connect() as conn_db:
            conn_db.execute(text(full_query))
            conn_db.commit()
        return {"status": True, "message": "중복 제거된 17개년 통합 뷰 생성 완료"}
    except Exception as e:
        return {"status": False, "error": str(e)}

@router.get('/station_history')
def get_station_history(station_name: str):
    # 이름 검색하면 최신년도 역번호 찾아 17년치 변화 반환
    engine_flow = create_engine(DB_URL_FLOW)
    try:
        with engine_flow.connect() as conn_db:
           # 1단계: 2024년 데이터에서 검색어와 관련된 역명 후보들을 가져옴
            # ORDER BY를 통해 검색어와 정확히 일치하는 이름이 가장 위(첫 번째)로 오게 함
            # 예: "동대문" 검색 시 "동대문"이 "동대문역사문화공원"보다 먼저 선택됨
            search_query = text("""
                SELECT DISTINCT `역명` 
                FROM `metro_flow_2024` 
                WHERE `역명` LIKE :name
                ORDER BY (CASE WHEN `역명` = :raw_name THEN 0 ELSE 1 END), LENGTH(`역명`) ASC
                LIMIT 1
            """)
            
            # LIKE 검색용(% 포함)과 정확한 비교용(raw)을 따로 넘김
            search_res = conn_db.execute(search_query, {
                "name": f"%{station_name}%", 
                "raw_name": station_name
            }).fetchone()
            
            if not search_res:
                return {"status": False, "error": "역을 찾을 수 없습니다."}
            
            # 우리가 최종적으로 결정한 '정확한 대표 이름'
            official_name = search_res[0]

            # 2단계: 결정된 'official_name'을 사용하는 모든 역번호(환승역) 리스트 확보
            # 이제 LIKE가 아니라 '='을 써서 "동대문"과 "동대문역사문화공원"을 철저히 분리함
            code_query = text("""
                SELECT DISTINCT `역번호` 
                FROM `metro_flow_2024` 
                WHERE `역명` = :name
            """)
            code_res = conn_db.execute(code_query, {"name": official_name}).fetchall()
            target_codes = [r[0] for r in code_res]

            # 3단계: 통합 뷰에서 '해당 번호들 전체'를 연도별로 SUM(합산)하여 조회합니다.
            # IN 연산자를 사용하여 여러 역번호의 데이터를 한꺼번에 가져옵니다.
            history_query = text("""
                SELECT 
                    `연도`,
                    -- 여러 호선(번호)의 인원수를 합산하여 실제 그 지역의 총 규모를 계산
                    SUM(`출근_승차합`) as `출근_승차합`,
                    SUM(`출근_하차합`) as `출근_하차합`,
                    SUM(`퇴근_승차합`) as `퇴근_승차합`,
                    SUM(`퇴근_하차합`) as `퇴근_하차합`,
                    -- 합산된 인원수로 비율을 다시 계산 (이게 진짜 그 역의 성격입니다)
                    ROUND(SUM(`출근_하차합`) / NULLIF(SUM(`출근_승차합`), 0), 2) AS `출근_하차비율`,
                    ROUND(SUM(`출근_승차합`) / NULLIF(SUM(`출근_하차합`), 0), 2) AS `출근_승차비율`,
                    -- 성격도 합산된 지표로 재판정
                    CASE 
                        WHEN (SUM(`출근_하차합`) / NULLIF(SUM(`출근_승차합`), 0) >= 2.0 AND SUM(`퇴근_승차합`) / NULLIF(SUM(`퇴근_하차합`), 0) >= 1.3)
                             OR (SUM(`출근_하차합`) / NULLIF(SUM(`출근_승차합`), 0) >= 4.0) THEN '오피스'
                        WHEN (SUM(`출근_승차합`) / NULLIF(SUM(`출근_하차합`), 0) >= 2.0 AND SUM(`퇴근_하차합`) / NULLIF(SUM(`퇴근_승차합`), 0) >= 1.3)
                             OR (SUM(`출근_승차합`) / NULLIF(SUM(`출근_하차합`), 0) >= 4.0) THEN '주거단지'
                        ELSE '상업/복합'
                    END AS `역성격`
                FROM `v_metro_analysis_all`
                WHERE `역번호` IN :codes
                GROUP BY `연도`
                ORDER BY `연도` ASC
            """)
            
            # 파라미터 전달 시 리스트 형식을 그대로 넘깁니다.
            df = pd.read_sql_query(history_query, conn_db, params={"codes": target_codes})

        return {"status": True, "station_name": official_name, "station_code": target_codes, "data": df.to_dict(orient="records")}
    except Exception as e:
        return {"status": False, "error": str(e)}
    
# @router.get('/map_summary/{year}')
# def get_map_summary(year: str):
#     # 특정 연도의 모든 역 성격 데이터 (지도 시각화용)
#     engine_flow = create_engine(DB_URL_FLOW)
#     try:
#         df = pd.read_sql_query(text("SELECT `역번호`, `역명`, `역성격` FROM `v_metro_analysis_all` WHERE `연도` = :year"), 
#                                engine_flow, params={"year": year})
#         return {"status": True, "data": df.to_dict(orient="records")}
#     except Exception as e:
#         return {"status": False, "error": str(e)}

# @router.get('/ranking/{year}/{category}')
# def get_ranking(year: str, category: str):
#     # 연도별/성격별 TOP 10 랭킹
#     engine_flow = create_engine(DB_URL_FLOW)
#     # 성격에 따른 정렬 기준 (합산된 SUM 값을 기준으로 계산)
#     sort_logic = "SUM(`출근_하차합`) / NULLIF(SUM(`출근_승차합`), 0)" if category == '오피스' else "SUM(`출근_승차합`) / NULLIF(SUM(`출근_하차합`), 0)"
#     try:
#         # 뷰에서 데이터를 가져온 뒤 '역명'으로 묶어 인원수를 합산하고 비율을 다시 계산합니다.
#         query = text(f"""
#             SELECT 
#                 `역명`, 
#                 ROUND({sort_logic}, 2) as `ratio`
#             FROM `v_metro_analysis_all` 
#             WHERE `연도` = :year AND `역성격` = :cat 
#             GROUP BY `역명` 
#             ORDER BY `ratio` DESC 
#             LIMIT 10
#         """)
#         df = pd.read_sql_query(query, engine_flow, params={"year": year, "cat": category})
#         return {"status": True, "data": df.to_dict(orient="records")}
#     except Exception as e:
#         return {"status": False, "error": str(e)}