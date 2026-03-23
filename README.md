# 0318

1. 기간
진행 : 3/20(금) 8교시까지
발표 : 3/23(월)

2. 주요 수행 내용
데이터 처리 : 스파크 이용 - 지하철 유동인구 데이터
시각화 : 리액트 이용  
문서 작업 : 기능 정의서, 기술 스택 정리, WBS, PPT

3. 진행 계획
3/18(수) : 스파크(pyspark) 이용 순유입량 및 역 성격 데이터 적재
3/19(목) : 시각화 / 분석 정리
3/20(금) : 프로젝트 보완 / ppt 작성, 발표 준비

4. 주제
- **승하차 비율을 통한 역 성격 규명 및 혼잡도 추정**

## Project 03

# 🦕 어린이날 지하철 혼잡도 분석 (Seoul Metro Congestion Analysis)
> **2008년~2021년 어린이날 하차 데이터를 활용한 나들이 트렌드 시각화 프로젝트**

## 📌 Project Overview
어린이날 가족 나들이객의 이동 패턴을 분석하여, 연도별 혼잡 거점의 변화를 파악하고 사용자에게 직관적인 시각화 데이터를 제공하는 풀스택 웹 애플리케이션입니다. 1,100만 건 이상의 대용량 공공 데이터를 Apache Spark를 활용해 효율적으로 처리했습니다.

## 🛠 Tech Stack
- **Frontend**: React, Recharts, Axios, Bootstrap
- **Backend**: FastAPI (Python), SQLAlchemy
- **Big Data**: Apache Spark (PySpark)
- **Database**: MariaDB
- **DevOps**: Docker

## 🏗 System Architecture
![System Architecture]("./images/architecture_gy.png")
*사용자 요청부터 MariaDB 필터링, Spark 연산, React 시각화로 이어지는 전체 데이터 파이프라인 설계*

## 💡 가설 & 증명
### 1. 대용량 데이터 최적화 (Big Data Processing)
- **Problem**: 1,100만 행의 전수 조사 시 쿼리 속도 저하 문제 발생.
- **Solution**: MariaDB에서 날짜/시간대 1차 필터링 후, Spark의 `ROW_NUMBER()` 윈도우 함수를 이용해 분산 환경에서 Top 5 순위 산출.

### 2. 가설 검증: 나들이 패러다임의 변화
- **Hypothesis**: 어린이날은 '어린이대공원'으로 가장 많이 몰릴 것이다.
- **Result**: 과거엔 가설이 맞았으나, 최근으로 올수록 홍대입구·고속터미널 등 복합 문화/쇼핑 상권의 비중이 높아지는 트렌드 전이 확인.

### 3. 실시간 시각화 대시보드
- Recharts를 활용해 하차 인원 수와 전 기간 누적 이용객 대비 비중(%)을 직관적인 그래프로 구현.

## 🔍 핵심 쿼리 로직 (Core Logic)
```sql
select `역명`,`날짜`,`구분`,`합계`, `순위`
from
(select `역명`,`날짜`,`구분`,
(`10~11`+`11~12`+`12~13`) as 합계,
row_number() over(
	partition by SUBSTRING(`날짜`,1,4)
	order by (`10~11`+`11~12`+`12~13`) desc) as 순위
from metro_db.seoul_metro
where `날짜` like '%05-05'
and `구분` = '하차') tmp
where 순위 <= 5
order by `날짜`,`합계` desc;
```

## 🔨 트러블 슈팅 레포트
### 1. 대용량 데이터 처리 및 시스템 부하 문제
- **Problem**: 서울시 지하철 이용 데이터 약 1,100만 행을 일반적인 DB 쿼리로만 처리할 때 속도가 저하되고 시스템 부하가 발생함.
- **Solution**: MariaDB에서 필요한 날짜(5/5)와 시간대(10~13시)만 1차 필터링한 후, **Apache Spark(PySpark)**의 분산 처리 엔진을 활용하여 메모리 내 연산으로 속도를 최적화함.
- **Result**: 전체 데이터 전수 조사 대비 분석 속도를 획기적으로 단축하고, 복잡한 랭킹 로직(ROW_NUMBER)을 안정적으로 수행함.

### 2. 리액트 차트 렌더링 동기화 오류
- **Problem** 연도를 변경할 때 API 통신 속도와 차트 애니메이션 주기가 맞지 않아, 이전 데이터가 차트에 남거나 로딩 중 차트가 깨져 보이는 현상 발생.
- **Solution** isLoading 상태값에 따라 조건부 렌더링을 적용하고, Recharts의 ResponsiveContainer에 고유 key 값을 부여하여 데이터 업데이트 시 차트가 정확하게 재렌더링되도록 로직 수정.
- **Result** 사용자 경험(UX) 측면에서 매끄러운 화면 전환과 정확한 데이터 시각화 구현.