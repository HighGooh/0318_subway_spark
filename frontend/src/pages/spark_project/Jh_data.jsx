import { useEffect, useRef, useState } from "react";
import "@styles/App.css";
import ReactMarkdown from 'react-markdown';
import 'highlight.js/styles/github.css'; // 테마 선택
import { Map, MapMarker } from "react-kakao-maps-sdk";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, ResponsiveContainer, Cell } from 'recharts'
import { api, n8n_api } from "@utils/network.js";



//header 컴포넌트
const Header = () => (
  <div className="bg-primary p-5 text-white text-center">
    <h2 className="fw-bold mb-2">지하철 데이터 시각화 프로젝트</h2>
    <p className="opacity-75">서울교통공사 데이터를 활용한 혼잡도 및 맛집 분석</p>
  </div>
);

// 연도 선택 컴포넌트
const YearSection = ({ yearStyles, yearSubmit, yearSel, setYearSel, option }) => {
  return (
    <section style={yearStyles.section}>
      <form onSubmit={yearSubmit} className="text-center">
        <h5 className="fw-bold mb-4 text-secondary">📅 분석 연도 설정</h5>

        <div style={yearStyles.container}>
          {/* 연도 선택 셀렉트 박스 */}
          <select
            className="form-select form-select-lg"
            style={yearStyles.select}
            onChange={(e) => setYearSel(Number(e.target.value))}
            value={yearSel}
          >
            {option.map((v, i) => (
              <option key={i} value={v}>{v}년도 데이터</option>
            ))}
          </select>

          {/* 적용 버튼 */}
          <button
            type="submit"
            className="btn btn-primary btn-lg px-4"
            style={yearStyles.button}
          >
            적용
          </button>
        </div>
      </form>
    </section>
  );
};

// 메뉴 선택 컴포넌트
const MenuTabs = ({ subWaySel, drunkSearch, setDrunkSearch, progremOption }) => (
  <div className={`${subWaySel ? "d-flex" : "d-none"} justify-content-center gap-2 mb-5`}>
    {progremOption.map((v, i) => (
      <button
        key={i}
        className={`btn px-4 py-2 rounded-pill fw-bold transition-all ${drunkSearch === i ? "btn-dark shadow" : "btn-outline-secondary"
          }`}
        onClick={() => setDrunkSearch(i)}
      >
        {i === 0 ? "🍺 맛있는 술집 추천" : "🚉 경로 혼잡도 비교"}
      </button>
    ))}
  </div>
);

// 프로젝트1 컴포넌트
const DrunkProject = ({
  yearNum, drunkLoad, DrunkLoad, drunkList, Send, setInput,
  inputLoad, messages, msgLoad, scrollRef, mapRef,
  placeList, placeClick, setPlaceClick, placeName, drunkStyles, chartStyles
}) => {


  return (
    <div className="animate__animated animate__fadeIn">
      {/* 데이터 수집 섹션 */}
      <div style={drunkStyles.sectionCard}>
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 text-center text-md-start">
          <div>
            <h5 className="fw-bold mb-1 fs-5">야간 번화가 데이터 검색</h5>
            <p className="text-muted small mb-0 text-truncate">
              선택하신 {yearNum}년도의 유동인구 데이터를 기반으로 분석합니다.
            </p>
          </div>
          <button className="btn btn-primary fw-bold px-4" onClick={DrunkLoad}>
            데이터 수집 시작
          </button>
        </div>
        {drunkLoad && (
          <p className="loading_chat text-center mt-3">
            데이터를 수집 중 <span>•</span><span>•</span><span>•</span>
          </p>
        )}
      </div>

      {drunkList && (
        <div className="row g-4 mb-5">
          {/* 역 선택 버튼 목록 */}
          <div className="col-12">
            <form onSubmit={Send} style={drunkStyles.buttonForm} className="shadow-sm">
              {drunkList.map((v, i) => (
                <button
                  key={i}
                  type="submit"
                  className="btn btn-sm btn-outline-primary rounded-pill px-3 fw-medium"
                  onClick={() => setInput(v['역명'])}
                  disabled={inputLoad}
                >
                  #{v['역명']}
                </button>
              ))}
            </form>
          </div>

          {/* 채팅 영역 (iPhone Frame) */}
          <div className="col-lg-5">
            <div style={drunkStyles.iphoneFrame}>
              <div style={drunkStyles.chatWindow}>
                <div className="p-3 bg-light border-bottom text-center fw-bold">Gemma AI 추천</div>
                <div className="flex-grow-1 p-3 overflow-auto hide-scrollbar">
                  {messages.map((msg, idx) => (
                    <div key={idx} className={`d-flex mb-3 ${msg.role === "user" ? "justify-content-end" : "justify-content-start"}`}>
                      <div className={`p-3 rounded-4 shadow-sm ${msg.role === "user" ? "bg-primary text-white" : "bg-light border text-dark"}`} style={{ maxWidth: "85%" }}>
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    </div>
                  ))}
                  {msgLoad && (
                    <div className="d-flex justify-content-start mb-3">
                      <div className="p-3 rounded-4 shadow-sm bg-light border text-dark">
                        <div className="loading_chat"><span>•</span><span>•</span><span>•</span></div>
                      </div>
                    </div>
                  )}
                  <div ref={scrollRef} />
                </div>
              </div>
            </div>
          </div>

          {/* 지도 영역 */}
          <div className="col-lg-7">
            <div style={drunkStyles.mapCard}>
              <h5 className="fw-bold mb-3 border-start border-primary border-4 ps-2">📍 주변 추천 장소 지도</h5>
              <div style={drunkStyles.mapBox}>
                <Map
                  ref={mapRef}
                  center={placeList && placeList.length > 0 ? placeList[0] : { lat: 37.499, lng: 127.029 }}
                  style={{ width: "100%", height: "450px" }}
                  level={4}
                >
                  {placeList?.map((loc, idx) => (
                    <MapMarker
                      key={idx}
                      position={loc}
                      onClick={() => setPlaceClick(placeClick === idx ? null : idx)}
                    >
                      {placeClick === idx && (
                        <div style={drunkStyles.infoWindow} onClick={(e) => { e.stopPropagation(); setPlaceClick(null); }}>
                          <span style={{ fontSize: "10px", color: "#007bff", fontWeight: "bold" }}>추천 장소</span>
                          <div style={{ color: "#222", fontSize: "14px", fontWeight: "700", textAlign: "center" }}>
                            {placeName[idx]}
                          </div>
                          {/* 화살표 아이콘 */}
                          <div style={{ position: "absolute", bottom: "-8px", left: "50%", transform: "translateX(-50%)", width: "0", height: "0", borderLeft: "8px solid transparent", borderRight: "8px solid transparent", borderTop: "8px solid #fff" }}></div>
                        </div>
                      )}
                    </MapMarker>
                  ))}
                </Map>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 차트 영역 */}
      {drunkList && (
        <div className="card border-0 shadow-sm rounded-4 p-4 mt-4 bg-white">
          <DrunkChart drunkList={drunkList} chartStyles={chartStyles} />
        </div>
      )}
    </div>
  );
};

// 프로젝트1 차트
const DrunkChart = ({ drunkList, chartStyles }) => {
  // 이미지의 데이터를 기반으로 구성한 리스트
  if (!drunkList) return
  // 상위 3개 역에 강조 색상을 주기 위한 설정
  const colors = ['#8884d8', '#82ca9d', '#ffc658'];

  return (
    <div style={chartStyles.container}>
      <h3 style={chartStyles.title}>역별 야간 평균 이용객 순위</h3>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart data={drunkList} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="역명" tick={{ fontSize: 12 }} />
          <YAxis />
          <Tooltip
            cursor={{ fill: '#eee' }}
            formatter={(value) => [`${value.toLocaleString()} 명`, '야간 평균']}
          />
          <Bar dataKey="night_avg" radius={[5, 5, 0, 0]}>
            {drunkList.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={index < 3 ? colors[index] : '#ccc'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// 프로젝트2 컴포넌트
const PathCongestionProject = ({
  yearNum, getStation, stationLoad, stationList, start_st_input,
  setStart_st_input, stationList_start, start_st, setStart_st,
  start_st_list, finish_st_input, setFinish_st_input, stationList_finish,
  finish_st, setFinish_st, finish_st_list, station_search,
  stationSearchLoad, tStation, search_complex, timeSelect,
  setTimeSelect, timeList, searchComplexLoad, complexTotalData, complexData, pathStyles, compStyles
}) => {

  return (
    <div className="animate__animated animate__fadeIn">
      <div style={pathStyles.card} className="card border">
        {/* 1. 상단 타이틀 및 초기화 버튼 */}
        <div className="d-flex align-items-center justify-content-center mb-4">
          <h5 className="fw-bold text-center mb-0 me-3">
            🚉 {yearNum}년도 환승역 및 혼잡도 분석
          </h5>
          <button
            type="button"
            className="btn btn-primary px-4 fw-bold shadow-sm"
            onClick={getStation}
          >
            환승역 데이터 로드
          </button>
        </div>

        {/* 로딩 표시 */}
        {stationLoad && (
          <p className="loading_chat text-center mt-2">
            지하철 역 정보를 불러오는 중 <span>•</span><span>•</span><span>•</span>
          </p>
        )}

        {/* 2. 역 선택 섹션 */}
        <div className={`station_wrap ${stationList ? "" : "d-none"}`}>
          <div className="row g-3 mb-4">
            {/* 출발역 설정 */}
            <div className="col-md-6">
              <div style={pathStyles.stationBox}>
                <label className="fw-bold mb-2 small text-primary">START STATION</label>
                <input
                  className="form-control mb-2 border-2"
                  value={start_st_input || ""}
                  onChange={(e) => {
                    setStart_st_input(e.target.value);
                    stationList_start(e.target.value);
                  }}
                  placeholder="출발역 검색 (예: 강남)"
                />
                <select
                  className="form-select border-2"
                  value={start_st}
                  onChange={(e) => setStart_st(e.target.value)}
                >
                  {(start_st_list || stationList || []).map((v, i) => (
                    <option key={i} value={v}>{v}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 도착역 설정 */}
            <div className="col-md-6">
              <div style={pathStyles.stationBox}>
                <label className="fw-bold mb-2 small text-success">END STATION</label>
                <input
                  className="form-control mb-2 border-2"
                  value={finish_st_input || ""}
                  onChange={(e) => {
                    setFinish_st_input(e.target.value);
                    stationList_finish(e.target.value);
                  }}
                  placeholder="도착역 검색 (예: 시청)"
                />
                <select
                  className="form-select border-2"
                  value={finish_st}
                  onChange={(e) => setFinish_st(e.target.value)}
                >
                  {(finish_st_list || stationList || []).map((v, i) => (
                    <option key={i} value={v}>{v}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 경로 검색 실행 버튼 */}
          <div className="text-center mb-5">
            <button
              onClick={station_search}
              className="btn btn-dark btn-lg px-5 rounded-pill shadow fw-bold"
              disabled={stationSearchLoad}
            >
              {stationSearchLoad ? "경로 계산 중..." : "최적 환승 경로 탐색"}
            </button>
          </div>

          {/* 3. 탐색 결과 및 시간대 선택 */}
          {tStation && (
            <div style={pathStyles.resultBanner} className="animate__animated animate__fadeInUp shadow-sm">
              <div className="d-flex flex-column flex-md-row align-items-center gap-4">
                <div className="text-center" style={{ minWidth: "100px" }}>
                  <span className="badge bg-primary mb-1">Route Info</span>
                  <h4 className="fw-bold mb-0">{tStation.length}개 역</h4>
                </div>
                <div className="flex-grow-1">
                  <div className="d-flex flex-wrap gap-2">
                    {tStation.map((v, i) => (
                      <span key={i} className="badge rounded-2" style={pathStyles.stationBadge}>
                        {v}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* 시간대 선택 폼 */}
              <div className="mt-5 border-top pt-4">
                <form
                  onSubmit={(e) => { e.preventDefault(); search_complex(e); }}
                  className="row g-3 align-items-center justify-content-center"
                >
                  <div className="col-auto">
                    <label className="fw-bold text-secondary small">⏰ 분석할 출발 시간대:</label>
                  </div>
                  <div className="col-auto">
                    <select
                      className="form-select w-auto border-2 shadow-sm"
                      onChange={(e) => setTimeSelect(e.target.value)}
                      value={timeSelect}
                    >
                      {timeList.map((v, i) => (
                        <option key={i} value={v}>{v}시</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-auto">
                    <button type='submit' className="btn btn-primary px-4 fw-bold">혼잡도 비율 분석</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* 4. 최종 분석 차트 영역 */}
        {searchComplexLoad && (
          <p className="loading_chat text-center mt-4">
            구간별 혼잡도를 계산하고 있습니다 <span>•</span><span>•</span><span>•</span>
          </p>
        )}

        {complexTotalData && complexTotalData.length > 0 && (
          <div style={pathStyles.chartSection} className="animate__animated animate__fadeIn">
            <h6 className="fw-bold mb-4 text-center">📊 선택 경로 구간별 혼잡도 비교</h6>
            <ComplexComparisonChart
              complexData={complexData}
              complexTotalData={complexTotalData}
              compStyles={compStyles}
            />
          </div>
        )}
      </div>
    </div>
  );
};

// 프로젝트2 컴포넌트
const ComplexComparisonChart = ({ complexData, complexTotalData, compStyles }) => {
  // 1. 차트 전용 스타일 객체
  
  // 전체 평균값 추출 (데이터가 없을 경우를 대비해 0으로 기본값 설정)
  const totalAvg = complexTotalData[0]?.["전체 평균 승객"] || 0;

  return (
    <div style={compStyles.container}>
      <h4 style={compStyles.title}>지정역 vs 전체 평균 승객 비교</h4>

      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={complexData}
          margin={{ top: 25, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="역명" tick={{ fontSize: 12 }} />
          <YAxis />
          <Tooltip cursor={{ fill: '#f5f5f5' }} />
          <Legend verticalAlign="top" height={36} />

          {/* 막대 그래프 및 조건부 색상 로직 */}
          <Bar dataKey="지정 평균 승객" name="평균 승객수" radius={[4, 4, 0, 0]}>
            {complexData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry["지정 평균 승객"] > totalAvg
                  ? compStyles.colors.above
                  : compStyles.colors.below
                }
              />
            ))}
          </Bar>

          {/* 전체 평균 기준선 */}
          <ReferenceLine
            y={totalAvg}
            stroke={compStyles.refLine.stroke}
            strokeDasharray={compStyles.refLine.strokeDasharray}
            label={{
              ...compStyles.refLine.label,
              value: `전체 평균: ${totalAvg.toLocaleString()}`
            }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};


const Jh_data = () => {

  // 연도 선택 컴포넌트 스타일
  const yearStyles = {
    section: {
      marginBottom: '3rem', // mb-5
      borderBottom: '1px solid #dee2e6', // border-bottom
      paddingBottom: '3rem', // pb-5
      marginTop: '3rem', // mt-5
    },
    container: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '1rem', // gap-3
      maxWidth: '500px',
      margin: '0 auto'
    },
    select: {
      borderWidth: '2px', // border-2
    },
    button: {
      width: '150px',
      fontWeight: '700' // fw-bold
    }
  };

  // 프로젝트1 컴포넌트 스타일
  const drunkStyles = {
    // 전체 컨테이너 및 섹션 카드
    sectionCard: {
      border: 'none',
      backgroundColor: '#f8f9fa', // bg-light
      padding: '1.5rem',
      marginBottom: '1.5rem',
      borderRadius: '1rem',
    },

    // 역 선택 버튼 폼 컨테이너
    buttonForm: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0.5rem',
      justifyContent: 'center',
      padding: '1rem',
      backgroundColor: '#fff',
      border: '1px solid #dee2e6',
      borderRadius: '1rem',
    },

    // 아이폰 프레임 (채팅창 외곽)
    iphoneFrame: {
      border: '8px solid #333',
      height: '600px',
      backgroundColor: '#212529', // bg-dark
      padding: '1rem',
      borderRadius: '3rem', // rounded-5
      boxShadow: '0 1rem 3rem rgba(0,0,0,0.175)',
    },

    // 채팅 내부 윈도우
    chatWindow: {
      backgroundColor: '#fff',
      height: '100%',
      borderRadius: '1.5rem',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    },

    // 지도 카드 컨테이너
    mapCard: {
      border: 'none',
      borderRadius: '1rem',
      height: '100%',
      padding: '1.5rem',
      backgroundColor: '#fff',
      boxShadow: '0 .125rem .25rem rgba(0,0,0,0.075)',
    },

    // 지도 실제 영역
    mapBox: {
      borderRadius: '1rem',
      overflow: 'hidden',
      border: '1px solid #dee2e6',
    },

    // 마커 정보창 커스텀 스타일
    infoWindow: {
      minWidth: "150px",
      padding: "10px",
      backgroundColor: "#fff",
      borderRadius: "12px",
      boxShadow: "0 4px 15px rgba(0,0,0,0.15)",
      border: "1px solid #eee",
      cursor: "pointer",
      position: "relative",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "4px"
    }
  };

  // 프로젝트1 차트 컴포넌트 스타일
  const chartStyles = {
    container: {
      width: '100%',
      height: 400,
      padding: '20px',
      backgroundColor: '#f9f9f9',
      borderRadius: '10px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.05)' // 살짝 그림자 추가
    },
    title: {
      textAlign: 'center',
      marginBottom: '20px',
      fontWeight: '700', // fw-bold 느낌
      fontSize: '1.25rem', // fs-5 느낌
      color: '#333'
    },
    xAxisTick: {
      fontSize: 12,
      fontWeight: 500 // fw-medium 느낌
    }
  };

  // 프로젝트2 컴포넌트 스타일
  const pathStyles = {
    // 메인 카드 컨테이너
    card: {
      border: 'none',
      boxShadow: '0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)',
      borderRadius: '1rem',
      padding: '1.5rem',
    },

    // 출발/도착역 입력 박스
    stationBox: {
      padding: '1rem',
      backgroundColor: '#f8f9fa', // bg-light
      borderRadius: '1rem',
      border: '1px solid #dee2e6'
    },

    // 경로 결과 섹션 (tStation 결과창)
    resultBanner: {
      backgroundColor: '#fff',
      border: '1px solid #dee2e6',
      borderRadius: '1rem',
      padding: '1.5rem',
      marginBottom: '1.5rem'
    },

    // 경로 역 이름 뱃지 커스텀
    stationBadge: {
      backgroundColor: '#f8f9fa',
      color: '#212529',
      fontWeight: '500',
      border: '1px solid #dee2e6',
      padding: '0.5rem 0.75rem',
      fontSize: '0.9rem'
    },

    // 하단 차트 영역 컨테이너
    chartSection: {
      marginTop: '1.5rem',
      padding: '1.5rem',
      backgroundColor: '#f8f9fa',
      borderRadius: '1rem',
      border: '1px solid #dee2e6'
    }
  };

  // 프로젝트2 차트 컴포넌트 스타일
  const compStyles = {
    container: {
      width: '100%',
      height: 400,
      marginTop: '20px',
      padding: '15px',
      backgroundColor: '#fff',
      borderRadius: '12px'
    },
    title: {
      textAlign: 'center',
      marginBottom: '1.5rem',
      fontWeight: '700',
      color: '#2d3436'
    },
    // 기준선(ReferenceLine) 관련 설정
    refLine: {
      stroke: '#ff580a',
      strokeDasharray: '3 3',
      label: {
        position: 'top',
        fill: '#ff580a',
        fontSize: 13,
        fontWeight: 'bold'
      }
    },
    // 막대 색상 정의
    colors: {
      above: "#00a2ff96", // 평균 이상 (파란색 계열)
      below: "#87d884",   // 평균 이하 (초록색 계열)
      default: "#ff580a"
    }
  };

  // ==========================================================
// [프로젝트 1: 술집 추천 채팅 관련 상태(State)]
// ==========================================================
const [messages, setMessages] = useState([
  { role: "bot", content: "어느 역의 맛집을 추천해드릴까요?" },
]); // 채팅 메시지 내역 (봇/유저 대화 저장)
const [input, setInput] = useState(""); // 유저가 현재 입력창에 타이핑 중인 텍스트
const [startBool, setStartBool] = useState(true); // 지도 리레이아웃 및 렌더링 제어를 위한 스위치 변수
const scrollRef = useRef(null); // 채팅창 하단 자동 스크롤을 위한 DOM 참조 변수
const [msgLoad, setMsgLoad] = useState(false); // AI 답변 로딩 중 상태 (말풍선 대기 표시용)
const [inputLoad, setInputLoad] = useState(false); // 메시지 전송 중 입력창 비활성화 여부

// ==========================================================
// [공통 설정 및 메인 메뉴 관련 상태]
// ==========================================================
const [yearSel, setYearSel] = useState(2008); // 드롭다운(select)에서 임시로 선택한 연도
const [yearNum, setYearNum] = useState(null); // '적용' 버튼 클릭 후 최종 확정된 분석 연도
const [subWaySel, setSubWaySel] = useState(false); // 연도 확정 후 하단 메뉴(술집/경로) 표시 여부

const [drunkSearch, setDrunkSearch] = useState(null); // 현재 어떤 프로젝트(1 or 2)를 선택했는지 식별
const [drunkList, setDrunkList] = useState(null); // 야간 유동인구 기반 번화가 역 리스트 데이터
const [drunkLoad, setDrunkLoad] = useState(false); // 번화가 리스트 수집 로딩 상태
const [drunkResult, setDrunkResult] = useState(""); // 분석 결과 텍스트 데이터

// ==========================================================
// [프로젝트 1: 지도 및 장소 추천 관련 상태]
// ==========================================================
const [placeList, setPlaceList] = useState(null); // AI가 추천한 맛집들의 위도/경도(좌표) 리스트
const [placeClick, setPlaceClick] = useState(null); // 지도에서 특정 장소(마커) 클릭 시 상태 저장
const [placeName, setPlaceName] = useState([]); // AI가 추천한 맛집들의 상호명 리스트

// ==========================================================
// [공통 옵션 및 연도 설정 로직]
// ==========================================================
const option = []; // 연도 선택 드롭다운에 들어갈 2008~2024 배열
const progremOption = [ // 상단 탭 메뉴 구성 옵션
  { id: 1, content: "맛있는 술집 추천" },
  { id: 2, content: "도착지" },
];

for (let i = 2008; i <= 2024; i++) {
  option.push(i);
}

/**
 * [함수] 연도 제출 및 상태 초기화
 * 선택한 연도를 확정하고, 기존에 수행했던 모든 프로젝트 결과물들을 초기화합니다.
 */
const yearSubmit = (e) => {
  e.preventDefault();
  setDrunkList(null);
  setDrunkSearch(null);
  setYearNum(yearSel);
  setSubWaySel(true);
  setStationList(null);
};

// ==========================================================
// [프로젝트 1: 데이터 수집 및 채팅 전송 함수]
// ==========================================================

/**
 * [함수] 번화가 역 목록 API 요청
 * 백엔드 서버로부터 유동인구 상위 역 정보를 가져옵니다.
 */
const searchDrunkList = () => {
  api.get('/drunk_info', { params: { year: yearNum } }).then(
    res => {
      if (res.data.status) {
        alert('데이터 수집 완료');
        setDrunkList(res.data.data);
        setDrunkLoad(false);
      } else alert('오류가 발생했습니다.');
    }
  ).catch(
    err => {
      console.log(err);
      alert('오류가 발생했습니다.');
      setDrunkLoad(false);
    }
  );
};

/**
 * [함수] 번화가 데이터 수집 실행 핸들러
 * 로딩 상태를 활성화하고 수집 함수를 호출합니다.
 */
const DrunkLoad = () => {
  setDrunkLoad(true);
  setDrunkList(null);
  searchDrunkList();
};

/**
 * [함수] 채팅 메시지 전송 및 AI 응답 처리
 * 사용자가 입력한 메시지를 서버(Webhook)로 전송하고 추천 장소 정보를 받아와 업데이트합니다.
 */
const Send = (e) => {
  e.preventDefault();
  if (!input.trim()) return;
  setPlaceClick(null);
  setMsgLoad(true);
  setInputLoad(true);
  setPlaceList(null);

  if (input) {
    setStartBool(true);
  }

  const item = { input, yearNum };

  n8n_api
    .post("/webhook/drunk", item)
    .then((res) => {
      const { info, where, name } = messageReform(res.data["result"]);
      setPlaceList([...where]);
      setPlaceName([...name]);
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          content: info,
          example: "..."
        },
      ]);
      setMsgLoad(false);
      setInputLoad(false);
    })
    .catch((err) => {
      console.log(err);
      setMsgLoad(false);
      setInputLoad(false);
      alert("네트워크 연결을 확인해주세요");
    });

  setMessages((prev) => [...prev, { role: "user", content: input }]);
  setInput("");
};

/**
 * [함수] AI 응답 데이터 정제
 * AI로부터 받은 문자열 내의 JSON 코드 블록을 제거하고 실제 객체로 파싱합니다.
 */
const messageReform = (data) => {
  const res = data.replace(/```json|```/g, '').trim(); // 정규식 활용
  try {
    return JSON.parse(res);
  } catch (e) {
    console.error("JSON 파싱 에러:", e);
    return null;
  }
};

// ==========================================================
// [자동 스크롤 및 지도 제어 Side Effect]
// ==========================================================

// 채팅 메시지가 추가될 때마다 채팅창 하단으로 부드럽게 스크롤 이동
useEffect(() => {
  if (scrollRef.current) {
    scrollRef.current.scrollIntoView({
      behavior: "smooth",
      block: "nearest"
    });
  }
}, [messages]);

const mapRef = useRef(null); // 카카오 지도 인스턴스 참조를 위한 변수

// 지도가 로드되거나 장소 목록이 갱신될 때 지도 레이아웃을 다시 잡고 첫 번째 장소로 중심 이동
useEffect(() => {
  if (startBool && mapRef.current) {
    mapRef.current.relayout();
    if (placeList && placeList.length > 0) {
      const { kakao } = window;
      const center = new kakao.maps.LatLng(placeList[0].lat, placeList[0].lng);
      mapRef.current.setCenter(center);
    }
  }
}, [startBool, placeList]);

// ==========================================================
// [프로젝트 2: 경로 탐색 및 혼잡도 분석 관련 상태]
// ==========================================================

const [stationList, setStationList] = useState(null); // 분석 가능한 전체 지하철역 리스트
const [stationLoad, setStationLoad] = useState(false); // 역 목록 로딩 상태
const [stationSearchLoad, setStationSearchLoad] = useState(false); // 경로 탐색 로딩 상태

const [start_st_input, setStart_st_input] = useState(""); // 출발역 검색 입력값
const [start_st_list, setStart_st_list] = useState(null); // 검색어로 필터링된 출발역 후보 목록
const [start_st, setStart_st] = useState(""); // 최종 선택된 출발역

const [finish_st_input, setFinish_st_input] = useState(""); // 도착역 검색 입력값
const [finish_st_list, setFinish_st_list] = useState(null); // 검색어로 필터링된 도착역 후보 목록
const [finish_st, setFinish_st] = useState(""); // 최종 선택된 도착역

const [tStation, setTStation] = useState(null); // AI가 탐색해준 출발역~도착역 사이의 경유역 목록

const timeList = Array.from({ length: 20 }, (_, i) => String(i + 5).padStart(2, '0')); // 05~24시 시간 선택 옵션 배열
const [timeSelect, setTimeSelect] = useState("05"); // 유저가 선택한 분석 기준 시간

const [searchComplexLoad, setSeachComplexLoad] = useState(false); // 혼잡도 데이터 분석 로딩 상태
const [complexData, setComplexData] = useState([]); // 경로 구간별 혼잡도 결과 데이터
const [complexTotalData, setComplexTotalData] = useState([]); // 비교용 전체 평균 혼잡도 데이터

// ==========================================================
// [프로젝트 2: 기능 함수]
// ==========================================================

/**
 * [함수] 분석용 지하철역 전체 목록 조회
 */
const getStation = () => {
  setStationLoad(true);
  setStart_st_input(null);
  setFinish_st_input(null);
  setTStation(null);
  setComplexData([]);
  setComplexTotalData([]);
  setStationList(null);
  api.get('/get_station', { params: { year: yearNum } }).then(
    res => {
      if (res.data.status) {
        alert('데이터 수집 완료');
        setStationList(res.data.data);
        setStationLoad(false);
        setStart_st(res.data.data[0]);
        setFinish_st(res.data.data[0]);
      }
    }
  ).catch(err => {
    console.log(err);
    alert('오류가 발생했습니다.');
    setStationLoad(false);
    setDrunkSearch(null);
  });
};

/**
 * [함수] 출발역 자동완성 필터링
 * 전체 리스트 중 유저가 입력한 텍스트를 포함하는 역들만 걸러냅니다.
 */
const stationList_start = (e) => {
  if (e) {
    setStart_st_list(stationList.filter((v) => v.includes(e)));
  } else {
    setStart_st_list([...stationList]);
  }
};

/**
 * [함수] 도착역 자동완성 필터링
 */
const stationList_finish = (e) => {
  if (e) {
    setFinish_st_list(stationList.filter((v) => v.includes(e)));
  } else {
    setFinish_st_list([...stationList]);
  }
};

// 후보 리스트가 갱신되면 리스트의 첫 번째 항목을 자동으로 최종 선택역으로 설정
useEffect(() => {
  if (start_st_list) setStart_st(start_st_list[0]);
  if (finish_st_list) setFinish_st(finish_st_list[0]);
}, [start_st_list, finish_st_list]);

/**
 * [함수] AI 경로 탐색 요청 (Webhook)
 * 출발역과 도착역을 보내 AI로부터 경유역 리스트를 받아옵니다.
 */
const station_search = (e) => {
  e.preventDefault();
  setTStation(null);
  setComplexData([]);
  setComplexTotalData([]);
  setStationSearchLoad(true);
  const item = { "출발역": start_st, "도착역": finish_st };
  n8n_api
    .post("/webhook/station", item)
    .then((res) => {
      setTStation(messageReform(res.data["result"]));
      setStationSearchLoad(false);
    })
    .catch((err) => {
      console.log(err);
      alert("네트워크 연결을 확인해주세요");
      setStationSearchLoad(false);
    });
};

/**
 * [함수] 구간별 혼잡도 심화 데이터 요청
 * 탐색된 경로와 시간대를 바탕으로 서버에서 상세 통계 데이터를 가져옵니다.
 */
const search_complex = (e) => {
  e.preventDefault();
  setComplexData([]);
  setComplexTotalData([]);
  setSeachComplexLoad(true);

  const item = { start_st: start_st, finish_st: finish_st, stations: tStation, time: timeSelect, year: yearNum };

  api
    .post("/search_complex", item)
    .then((res) => {
      console.log(res);
      setComplexData(res.data.data1);
      setComplexTotalData(res.data.data2);
      setSeachComplexLoad(false);
    })
    .catch((err) => {
      console.log(err);
      alert("네트워크 연결을 확인해주세요");
      setSeachComplexLoad(false);
    });
};


  return (
    <div className="min-vh-100 bg-light py-5 px-3">
      <div className="bg-white shadow-lg rounded-4 overflow-hidden p-0" style={{ maxWidth: '1200px', margin: "0 auto" }}>

        {/* Header Section */}
        <Header />

        <div className="p-4 p-md-5">
          {/* 1. 연도 선택 섹션 */}
          <YearSection
            yearStyles={yearStyles}
            yearSubmit={yearSubmit}
            yearSel={yearSel}
            setYearSel={setYearSel}
            option={option}
          />

          {/* 2. 메뉴 탭 */}
          <MenuTabs
            subWaySel={subWaySel}
            drunkSearch={drunkSearch}
            setDrunkSearch={setDrunkSearch}
            progremOption={progremOption}
          />

          {/* 프로젝트 1: 술집 추천 & 차트 */}
          {/* Jh_data의 return 문 내부 */}
          {drunkSearch === 0 && (
            <DrunkProject
              chartStyles={chartStyles}
              drunkStyles={drunkStyles}
              yearNum={yearNum}
              drunkLoad={drunkLoad}
              DrunkLoad={DrunkLoad}     // 데이터 로드 함수
              drunkList={drunkList}
              Send={Send}               // AI 채팅 전송 함수
              setInput={setInput}       // 입력값 설정 함수
              inputLoad={inputLoad}
              messages={messages}
              msgLoad={msgLoad}
              scrollRef={scrollRef}
              mapRef={mapRef}
              placeList={placeList}
              placeClick={placeClick}
              setPlaceClick={setPlaceClick}
              placeName={placeName}
            />
          )}

          {/* 프로젝트 2: 경로 혼잡도 */}
          {/* 5. 프로젝트 2: 경로 혼잡도 분석 섹션 */}
          {drunkSearch === 1 && (
            <PathCongestionProject
              compStyles={compStyles}
              pathStyles={pathStyles}
              yearNum={yearNum}
              getStation={getStation}
              stationLoad={stationLoad}
              stationList={stationList}
              start_st_input={start_st_input}
              setStart_st_input={setStart_st_input}
              stationList_start={stationList_start}
              start_st={start_st}
              setStart_st={setStart_st}
              start_st_list={start_st_list}
              finish_st_input={finish_st_input}
              setFinish_st_input={setFinish_st_input}
              stationList_finish={stationList_finish}
              finish_st={finish_st}
              setFinish_st={setFinish_st}
              finish_st_list={finish_st_list}
              station_search={station_search}
              stationSearchLoad={stationSearchLoad}
              tStation={tStation}
              search_complex={search_complex}
              timeSelect={timeSelect}
              setTimeSelect={setTimeSelect}
              timeList={timeList}
              searchComplexLoad={searchComplexLoad}
              complexTotalData={complexTotalData}
              complexData={complexData}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Jh_data;
