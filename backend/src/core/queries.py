# /fromdb에서 사용(STATION_CHARACTER_LOGIC, get_analysis_sql,get_comment_optimization_sql)
# 공통 성격 판별 로직 (재사용성을 위해 분리)
STATION_CHARACTER_LOGIC = """
CASE 
    -- 조건 1: 두 비율 모두 높음 OR 조건 2: 출근 하차가 압도적
    WHEN (`출근_하차비율` >= :off_min AND `퇴근_승차비율` >= :off_sub) OR (`출근_하차비율` >= :off_ext) THEN '오피스'
    -- 조건 1: 두 비율 모두 높음 OR 조건 2: 출근 승차가 압도적
    WHEN (`출근_승차비율` >= :home_min AND `퇴근_하차비율` >= :home_sub) OR (`출근_승차비율` >= :home_ext) THEN '주거단지'
    ELSE '상업/복합'
END AS `역성격`
"""

# 연도별 지하철 승하차 패턴 분석 쿼리 생성
def get_analysis_sql():
    return f"""
        SELECT 
            `역번호`, `역명`, `출근_승차합`, `출근_하차합`, `퇴근_승차합`, `퇴근_하차합`,
            ROUND(`출근_하차합` / NULLIF(`출근_승차합`, 0), 2) AS `출근_하차비율`,
            ROUND(`퇴근_승차합` / NULLIF(`퇴근_하차합`, 0), 2) AS `퇴근_승차비율`,
            ROUND(`출근_승차합` / NULLIF(`출근_하차합`, 0), 2) AS `출근_승차비율`,
            ROUND(`퇴근_하차합` / NULLIF(`퇴근_승차합`, 0), 2) AS `퇴근_하차비율`,
            {STATION_CHARACTER_LOGIC}
        FROM (
            SELECT 
                `역번호`, `역명`,
                SUM(CASE WHEN `구분` = '승차' THEN (CAST(`06~07` AS INT) + CAST(`07~08` AS INT) + CAST(`08~09` AS INT)) ELSE 0 END) AS `출근_승차합`,
                SUM(CASE WHEN `구분` = '하차' THEN (CAST(`06~07` AS INT) + CAST(`07~08` AS INT) + CAST(`08~09` AS INT)) ELSE 0 END) AS `출근_하차합`,
                SUM(CASE WHEN `구분` = '승차' THEN (CAST(`17~18` AS INT) + CAST(`18~19` AS INT) + CAST(`19~20` AS INT)) ELSE 0 END) AS `퇴근_승차합`,
                SUM(CASE WHEN `구분` = '하차' THEN (CAST(`17~18` AS INT) + CAST(`18~19` AS INT) + CAST(`19~20` AS INT)) ELSE 0 END) AS `퇴근_하차합`
            FROM temp_analysis_target
            GROUP BY `역번호`, `역명`
        )
        ORDER BY CAST(`역번호` AS INT)
    """

# 타입 최적화 및 컬럼 코멘트 추가 SQL
def get_comment_optimization_sql(table_name):
    return f"""
        ALTER TABLE `{table_name}` 
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
        MODIFY COLUMN `역성격` VARCHAR(20) COMMENT '승하차 비율 기반 역 분류'
    """

# /create_integrated_view 에서 사용 (get_union_part_sql)
# 통합 뷰 생성용 개별 연도 쿼리 (UNION ALL 조립용)
def get_union_part_sql(year):
    # 안전 장치 (화이트리스트 검증)
    # 입력값이 숫자로만 되어 있는지, 혹은 2000~2026 사이인지 체크
    if not str(year).isdigit() or not (2008 <= int(year) <= 2026):
        raise ValueError(f"Invalid year input: {year}")
    # 검증된 값만 f-string에 삽입
    return f"""
        SELECT 
            '{year}' AS `연도`, `역번호`, MAX(`역명`) AS `역명`,
            SUM(`출근_승차합`) AS `출근_승차합`,
            SUM(`출근_하차합`) AS `출근_하차합`,
            SUM(`퇴근_승차합`) AS `퇴근_승차합`,
            SUM(`퇴근_하차합`) AS `퇴근_하차합`,
            ROUND(SUM(`출근_하차합`) / NULLIF(SUM(`출근_승차합`), 0), 2) AS `출근_하차비율`,
            ROUND(SUM(`퇴근_승차합`) / NULLIF(SUM(`퇴근_하차합`), 0), 2) AS `퇴근_승차비율`,
            ROUND(SUM(`출근_승차합`) / NULLIF(SUM(`출근_하차합`), 0), 2) AS `출근_승차비율`,
            ROUND(SUM(`퇴근_하차합`) / NULLIF(SUM(`퇴근_승차합`), 0), 2) AS `퇴근_하차비율`,
            CASE 
                WHEN (SUM(`출근_하차합`) / NULLIF(SUM(`출근_승차합`), 0) >= :off_min AND SUM(`퇴근_승차합`) / NULLIF(SUM(`퇴근_하차합`), 0) >= :off_sub) 
                     OR (SUM(`출근_하차합`) / NULLIF(SUM(`출근_승차합`), 0) >= :off_ext) THEN '오피스'
                WHEN (SUM(`출근_승차합`) / NULLIF(SUM(`출근_하차합`), 0) >= :home_min AND SUM(`퇴근_하차합`) / NULLIF(SUM(`퇴근_승차합`), 0) >= :home_sub) 
                     OR (SUM(`출근_승차합`) / NULLIF(SUM(`출근_하차합`), 0) >= :home_ext) THEN '주거단지'
                ELSE '상업/복합'
            END AS `역성격`
        FROM `metro_flow_{year}`
        GROUP BY `역번호`
    """

# /station_history 에서 사용 (STATION_SEARCH_SQL, STATION_CODE_SQL, get_station_history_sql)
# 역 이름 검색 SQL (유사 검색 후 가장 정확한 것 하나 선택)
STATION_SEARCH_SQL = """
    SELECT DISTINCT `역명` 
    FROM `metro_flow_2024` 
    WHERE `역명` LIKE :name
    ORDER BY (CASE WHEN `역명` = :raw_name THEN 0 ELSE 1 END), LENGTH(`역명`) ASC
    LIMIT 1
"""

# 해당 역의 모든 역번호(환승역 포함) 조회 SQL
STATION_CODE_SQL = """
    SELECT DISTINCT `역번호` 
    FROM `metro_flow_2024` 
    WHERE `역명` = :name
"""

# 통합 뷰 기반 연도별 히스토리 조회 SQL
def get_station_history_sql():
    return """
        SELECT 
            `연도`,
            SUM(`출근_승차합`) as `출근_승차합`,
            SUM(`출근_하차합`) as `출근_하차합`,
            SUM(`퇴근_승차합`) as `퇴근_승차합`,
            SUM(`퇴근_하차합`) as `퇴근_하차합`,
            ROUND(SUM(`출근_하차합`) / NULLIF(SUM(`출근_승차합`), 0), 2) AS `출근_하차비율`,
            ROUND(SUM(`출근_승차합`) / NULLIF(SUM(`출근_하차합`), 0), 2) AS `출근_승차비율`,
            CASE 
                WHEN (SUM(`출근_하차합`) / NULLIF(SUM(`출근_승차합`), 0) >= :off_min AND SUM(`퇴근_승차합`) / NULLIF(SUM(`퇴근_하차합`), 0) >= :off_sub)
                     OR (SUM(`출근_하차합`) / NULLIF(SUM(`출근_승차합`), 0) >= :off_ext) THEN '오피스'
                WHEN (SUM(`출근_승차합`) / NULLIF(SUM(`출근_하차합`), 0) >= :home_min AND SUM(`퇴근_하차합`) / NULLIF(SUM(`퇴근_승차합`), 0) >= :home_sub)
                     OR (SUM(`출근_승차합`) / NULLIF(SUM(`출근_하차합`), 0) >= :home_ext) THEN '주거단지'
                ELSE '상업/복합'
            END AS `역성격`
        FROM `v_metro_analysis_all`
        WHERE `역번호` IN :codes
        GROUP BY `연도`
        ORDER BY `연도` ASC
    """

# 어린이날 데이터 수집 SQL
KIDSDAY_SEARCH_SQL = """
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