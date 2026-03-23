import { useEffect, useRef, useState } from "react";
import { useLayoutEffect } from "react";
import "@styles/App.css";
import axios from "axios";
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github.css'; // 테마 선택
import { Map, MapMarker, useKakaoLoader } from "react-kakao-maps-sdk";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, ResponsiveContainer, Cell } from 'recharts'

const DrunkChart = ({ drunkList }) => {
  // 이미지의 데이터를 기반으로 구성한 리스트
  if (!drunkList) return
  // 상위 3개 역에 강조 색상을 주기 위한 설정
  const colors = ['#8884d8', '#82ca9d', '#ffc658'];

  return (
    <div style={{ width: '100%', height: 400, padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '10px' }}>
      <h3 style={{ textAlign: 'center' }}>역별 야간 평균 이용객 순위</h3>
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

const ComplexComparisonChart = ({ complexData, complexTotalData }) => {
  // 전체 평균값 추출 (데이터가 없을 경우를 대비해 0으로 기본값 설정)
  const totalAvg = complexTotalData[0]?.["전체 평균 승객"] || 0;

  return (
    <div style={{ width: '100%', height: 400, marginTop: '20px' }}>
      <h4 className="text-center mb-4">지정역 vs 전체 평균 승객 비교</h4>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={complexData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="역명" />
          <YAxis />
          <Tooltip />
          <Legend />

          {/* 각 막대 그래프 */}
          <Bar dataKey="지정 평균 승객" fill="#8884d8" name="평균">
            {complexData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry["지정 평균 승객"] > totalAvg ? "#00a2ff96" : "#87d884"}
              />
            ))}
          </Bar>

          {/* 전체 평균 기준선 (빨간색 점선) */}
          <ReferenceLine
            y={totalAvg}
            label={{ position: 'top', value: `전체 평균: ${totalAvg}`, fill: '#ff580a' }}
            stroke="#ff580a"
            strokeDasharray="3 3"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const Jh_data = () => {

  // 프로젝트1
  const [messages, setMessages] = useState([
    { role: "bot", content: "어느 역의 맛집을 추천해드릴까요?" },
  ]);
  const [input, setInput] = useState("");
  const [startBool, setStartBool] = useState(true);
  const scrollRef = useRef(null);
  const [msgLoad, setMsgLoad] = useState(false);
  const [inputLoad, setInputLoad] = useState(false);

  const [yearSel, setYearSel] = useState(2008);
  const [yearNum, setYearNum] = useState(null);
  const [yearLoad, setYearLoad] = useState(false);

  const [subWaySel, setSubWaySel] = useState(false);

  const [drunkSearch, setDrunkSearch] = useState(null);
  const [drunkList, setDrunkList] = useState(null);
  const [drunkLoad, setDrunkLoad] = useState(false);
  const [drunkResult, setDrunkResult] = useState("");

  const [placeList, setPlaceList] = useState(null)
  const [placeClick, setPlaceClick] = useState(null)
  const [placeName, setPlaceName] = useState([])

  const option = [];

  const progremOption = [
    { id: 1, content: "맛있는 술집 추천" },
    { id: 2, content: "도착지" },
  ]

  for (let i = 2008; i <= 2024; i++) {
    option.push(i)
  }

  const yearSubmit = (e) => {
    e.preventDefault()
    setDrunkList(null)
    setDrunkSearch(null)
    setYearNum(yearSel)
    setSubWaySel(true)
    // axios.get('http://localhost:8002/year_select', { params: { year: yearSel } }).then(
    //   res => {
    //     if (res.data.status) {
    //       alert('데이터 수집 완료')
    //     }
    //     else {
    //       alert('오류가 발생했습니다.')
    //       setYearLoad(false)
    //     }
    //   }
    // ).catch()
  }

  const searchDrunkList = () => {
    axios.get('http://localhost:8002/drunk_info').then(
      res => {
        if (res.data.status) {
          alert('데이터 수집 완료')
          setDrunkList(res.data.data)
          setDrunkLoad(false)
        }
        else alert('오류가 발생했습니다.')
      }
    ).catch(
      err => {
        console.log(err)
        alert('오류가 발생했습니다.')
        setDrunkLoad(false)
        // setDrunkList([{ "역명": "모란역", "night_avg": 1665 }, { "역명": "삼성역", "night_avg": 1965 }, { "역명": "역삼역", "night_avg": 1065 }, { "역명": "수진역", "night_avg": 2800 }])
      }
    )

  }

  const DrunkLoad = () => {
    setDrunkLoad(true)
    setDrunkList(null)
    searchDrunkList()

  }

  const Send = (e) => {
    e.preventDefault()
    if (!input.trim()) return;
    setPlaceClick(null)
    setMsgLoad(false)
    setInputLoad(true)

    setPlaceList(null)

    if (input) {
      setStartBool(true);
    }

    const item = { input, yearNum };

    axios
      .post("http://aiedu.tplinkdns.com:7240/webhook/drunk", item)
      .then((res) => {
        const { info, where, name } = messageReform(res.data["result"]);
        setPlaceList([...where])
        setPlaceName([...name])
        setMessages((prev) => [
          ...prev,
          {
            role: "bot",
            content: info,
            example: "..."
          },
        ]);
        setMsgLoad(true)
        setInputLoad(false)
      })
      .catch((err) => {
        console.log(err)
        setMsgLoad(true)
        setInputLoad(false)
        alert("네트워크 연결을 확인해주세요");
      });

    setMessages((prev) => [...prev, { role: "user", content: input }]);
    setInput("");
  }

  const messageReform = (data) => {
    const res = data.replace(/```json|```/g, '').trim(); // 정규식 활용
    try {
      return JSON.parse(res);
    } catch (e) {
      console.error("JSON 파싱 에러:", e);
      return null;
    }
    // const res = data.replace('```', '').replace('json', '').replace('```', '')
    // const parsedData = JSON.parse(res)
    // return parsedData
  }

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const mapRef = useRef(null);

  useEffect(() => {
    if (startBool && mapRef.current) {
      // 지도가 화면에 표시될 때 크기를 다시 계산하도록 명령
      mapRef.current.relayout();

      // 추가로, 첫 번째 식당 위치로 중심을 다시 잡아주면 더 정확합니다.
      if (placeList && placeList.length > 0) {
        const { kakao } = window;
        const center = new kakao.maps.LatLng(placeList[0].lat, placeList[0].lng);
        mapRef.current.setCenter(center);
      }
    }
  }, [startBool, placeList]);


  // 프로젝트2

  const [stationList, setStationList] = useState(null)
  const [stationLoad, setStationLoad] = useState(false)

  const [start_st_input, setStart_st_input] = useState("")
  const [start_st_list, setStart_st_list] = useState(null)
  const [start_st, setStart_st] = useState("")

  const [finish_st_input, setFinish_st_input] = useState("")
  const [finish_st_list, setFinish_st_list] = useState(null)
  const [finish_st, setFinish_st] = useState("")

  const [tStation, setTStation] = useState(null)

  const timeList = Array.from({ length: 20 }, (_, i) => String(i + 5).padStart(2, '0'));
  const [timeSelect, setTimeSelect] = useState("05")

  const [complexData, setComplexData] = useState([])
  const [complexTotalData, setComplexTotalData] = useState([])

  const getStation = () => {
    setStationLoad(true)
    setStart_st_input(null)
    setFinish_st_input(null)
    setTStation(null)
    setComplexData([])
    setComplexTotalData([])
    axios.get('http://localhost:8002/get_station', { params: { year: yearNum } }).then(
      res => {
        if (res.data.status) {
          alert('데이터 수집 완료')
          setStationList(res.data.data)
          setStationLoad(false)
          setStart_st(res.data.data[0])
          setFinish_st(res.data.data[0])
        }
        else {
          alert('오류가 발생했습니다.')
          setStationLoad(false)
          setDrunkSearch(null)
        }
      }
    ).catch(err => {
      console.log(err)
      alert('오류가 발생했습니다.')
      setStationLoad(false)
      setDrunkSearch(null)
    })
  }

  const stationList_start = (e) => {

    if (e) {
      setStart_st_list(stationList.filter((v) => v.includes(e)))
    } else {
      setStart_st_list([...stationList])
    }

  }

  const stationList_finish = (e) => {
    if (e) {
      setFinish_st_list(stationList.filter((v) => v.includes(e)))
    } else {
      setFinish_st_list([...stationList])
    }

  }

  useEffect(() => {
    if (start_st_list) setStart_st(start_st_list[0])
    if (finish_st_list) setFinish_st(finish_st_list[0])
  }, [start_st_list, finish_st_list])

  console.log(start_st, finish_st)

  const station_search = (e) => {
    e.preventDefault()
    setTStation(null)
    setComplexData([])
    setComplexTotalData([])
    const item = { "출발역": start_st, "도착역": finish_st }
    axios
      .post("http://aiedu.tplinkdns.com:7240/webhook/station", item)
      .then((res) => {
        setTStation(messageReform(res.data["result"]));
      })
      .catch((err) => {
        console.log(err);
        alert("네트워크 연결을 확인해주세요");
      });

  }

  const search_complex = (e) => {
    e.preventDefault()
    setComplexData([])
    setComplexTotalData([])
    const item = { start_st: start_st, finish_st: finish_st, stations: tStation, time: timeSelect }

    axios
      .post("http://localhost:8002/search_complex", item)
      .then((res) => {
        console.log(res)
        setComplexData(res.data.data1)
        setComplexTotalData(res.data.data2)
      })
      .catch((err) => {
        console.log(err);
        alert("네트워크 연결을 확인해주세요");
      });
  }


  return (
    <div className="min-vh-100 bg-light py-5 px-3">
      <div className="bg-white shadow-lg rounded-4 overflow-hidden p-0" style={{ maxWidth: '1200px', margin: "0 auto" }}>

        {/* Header Section */}
        <div className="bg-primary p-5 text-white text-center">
          <h2 className="fw-bold mb-2">지하철 데이터 시각화 프로젝트</h2>
          <p className="opacity-75">서울교통공사 데이터를 활용한 혼잡도 및 맛집 분석</p>
        </div>

        <div className="p-4 p-md-5">
          {/* 1. 연도 선택 섹션 */}
          <section className="mb-5 border-bottom pb-5">
            <form onSubmit={yearSubmit} className="text-center">
              <h5 className="fw-bold mb-4 text-secondary">📅 분석 연도 설정</h5>
              <div className="d-flex justify-content-center align-items-center gap-3" style={{ maxWidth: "500px", margin: "0 auto" }}>
                <select
                  className="form-select form-select-lg border-2"
                  onChange={(e) => setYearSel(e.target.value)}
                  value={yearSel}
                >
                  {option.map((v, i) => (
                    <option key={i} value={v}>{v}년도 데이터</option>
                  ))}
                </select>
                <button type='submit' className="btn btn-primary btn-lg px-4 fw-bold" style={{ width: "150px" }}>적용</button>
              </div>
            </form>
          </section>

          {/* 2. 메뉴 탭 */}
          <div className={`${subWaySel ? "d-flex" : "d-none"} justify-content-center gap-2 mb-5`}>
            {progremOption.map((v, i) => (
              <button
                key={i}
                className={`btn px-4 py-2 rounded-pill fw-bold transition-all ${drunkSearch === i ? "btn-dark shadow" : "btn-outline-secondary"}`}
                onClick={() => { setDrunkSearch(i); i === 1 && getStation() }}
              >
                {i === 0 ? "🍺 맛있는 술집 추천" : "🚉 경로 혼잡도 비교"}
              </button>
            ))}
          </div>

          {/* 프로젝트 1: 술집 추천 & 차트 */}
          {drunkSearch === 0 && (
            <div className="animate__animated animate__fadeIn">
              <div className="card border-0 bg-light p-4 mb-4 rounded-4">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 text-center text-md-start">
                  <div>
                    <h5 className="fw-bold mb-1">야간 번화가 데이터 검색</h5>
                    <p className="text-muted small mb-0 text-truncate">선택하신 {yearNum}년도의 유동인구 데이터를 기반으로 분석합니다.</p>
                  </div>
                  <button className="btn btn-info text-white fw-bold px-4" onClick={DrunkLoad}>데이터 수집 시작</button>
                </div>
                {drunkLoad && <p className="text-center mt-3 text-primary animate-pulse">데이터를 불러오는 중입니다...</p>}
              </div>

              {drunkList && (
                <div className="row g-4 mb-5">
                  <div className="col-12">
                    <form onSubmit={Send} className="d-flex flex-wrap gap-2 justify-content-center p-3 bg-white border rounded-4 shadow-sm">
                      {drunkList.map((v, i) => (
                        <button
                          key={i}
                          type="submit"
                          className="btn btn-sm btn-outline-primary rounded-pill px-3"
                          onClick={() => { setInput(v['역명']); /* Send 로직 트리거 필요 시 추가 */ }}
                          disabled={inputLoad}
                        >
                          #{v['역명']}
                        </button>
                      ))}
                    </form>
                  </div>

                  {/* 채팅창 & 지도 섹션 */}
                  <div className="col-lg-5">
                    <div className="iphone-frame shadow-lg rounded-5 bg-dark p-3" style={{ border: '8px solid #333', height: '600px' }}>
                      <div className="bg-white h-100 rounded-4 overflow-hidden d-flex flex-column">
                        <div className="p-3 bg-light border-bottom text-center fw-bold">Gemma AI 추천</div>
                        <div className="flex-grow-1 p-3 overflow-auto hide-scrollbar">
                          {messages.map((msg, idx) => (
                            <div key={idx} className={`d-flex mb-3 ${msg.role === "user" ? "justify-content-end" : "justify-content-start"}`}>
                              <div className={`p-3 rounded-4 shadow-sm ${msg.role === "user" ? "bg-primary text-white" : "bg-light border text-dark"}`} style={{ maxWidth: "85%" }}>
                                <ReactMarkdown>{msg.content}</ReactMarkdown>
                              </div>
                            </div>
                          ))}
                          <div ref={scrollRef} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-7">
                    <div className="card border-0 shadow-sm rounded-4 h-100 p-4">
                      <h5 className="fw-bold mb-3 border-start border-primary border-4 ps-2">📍 주변 추천 장소 지도</h5>
                      <div className="rounded-4 overflow-hidden border">
                        <Map
                          ref={mapRef}
                          center={placeList && placeList.length > 0 ? placeList[0] : { lat: 37.499, lng: 127.029 }}
                          style={{ width: "100%", height: "450px" }}
                          level={4}
                        >
                          {placeList && placeList.map((loc, idx) => (
                            <MapMarker
                              key={idx}
                              position={loc}
                              onClick={() => placeClick === idx ? setPlaceClick(null) : setPlaceClick(idx)} >
                              {placeClick === idx && (
                                <div
                                  style={{
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
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation(); // 지도 클릭 이벤트 전파 방지
                                    setPlaceClick(null);
                                  }}
                                >
                                  {/* 장소 카테고리나 아이콘 (예시) */}
                                  <span style={{ fontSize: "10px", color: "#007bff", fontWeight: "bold", textTransform: "uppercase" }}>
                                    추천 장소
                                  </span>

                                  {/* 장소 이름 */}
                                  <div style={{
                                    color: "#222",
                                    fontSize: "14px",
                                    fontWeight: "700",
                                    textAlign: "center",
                                    wordBreak: "keep-all"
                                  }}>
                                    {placeName[idx]}
                                  </div>

                                  {/* 하단 화살표 모양 (CSS 가상 요소 대신 인라인으로 구현) */}
                                  <div style={{
                                    position: "absolute",
                                    bottom: "-8px",
                                    left: "50%",
                                    transform: "translateX(-50%)",
                                    width: "0",
                                    height: "0",
                                    borderLeft: "8px solid transparent",
                                    borderRight: "8px solid transparent",
                                    borderTop: "8px solid #fff"
                                  }}></div>
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

              {drunkList && (
                <div className="card border-0 shadow-sm rounded-4 p-4 mt-4 bg-white">
                  <DrunkChart drunkList={drunkList} />
                </div>
              )}
            </div>
          )}

          {/* 프로젝트 2: 경로 혼잡도 */}
          {drunkSearch === 1 && (
            <div className="animate__animated animate__fadeIn">
              <div className="card border-0 shadow-sm rounded-4 p-4 border">
                <h5 className="fw-bold mb-4 text-center">🚉 환승역 및 혼잡도 분석</h5>

                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <div className="p-3 bg-light rounded-3">
                      <label className="fw-bold mb-2">출발역 검색</label>
                      <input className="form-control mb-2" value={start_st_input} onChange={(e) => { setStart_st_input(e.target.value); stationList_start(e.target.value) }} placeholder="역명을 입력하세요..." />
                      <select className="form-select border-primary" value={start_st} onChange={(e) => setStart_st(e.target.value)}>
                        {(start_st_list || stationList || []).map((v, i) => <option key={i} value={v}>{v}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="p-3 bg-light rounded-3">
                      <label className="fw-bold mb-2">도착역 검색</label>
                      <input className="form-control mb-2" value={finish_st_input} onChange={(e) => { setFinish_st_input(e.target.value); stationList_finish(e.target.value) }} placeholder="역명을 입력하세요..." />
                      <select className="form-select border-success" value={finish_st} onChange={(e) => setFinish_st(e.target.value)}>
                        {(finish_st_list || stationList || []).map((v, i) => <option key={i} value={v}>{v}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="text-center mb-5">
                  <button onClick={station_search} className="btn btn-dark btn-lg px-5 rounded-pill shadow">환승 경로 탐색</button>
                </div>

                {tStation && (
                  <div className="bg-light rounded-4 p-4 mb-4">
                    <div className="d-flex flex-column flex-md-row align-items-center gap-4">
                      <div className="bg-white p-3 rounded-3 shadow-sm text-center" style={{ minWidth: "150px" }}>
                        <span className="text-muted small d-block">전체 경로</span>
                        <strong className="text-primary">{tStation.length}개 지점</strong>
                      </div>
                      <div className="flex-grow-1">
                        <div className="d-flex flex-wrap gap-2">
                          {tStation.map((v, i) => (
                            <span key={i} className="badge bg-white text-dark border p-2 fw-normal shadow-sm" style={{ fontSize: "16px" }}>{v}</span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 border-top pt-4">
                      <form onSubmit={search_complex} className="row g-3 align-items-center justify-content-center">
                        <div className="col-auto">
                          <label className="fw-bold">⏰ 출발 시간대 선택:</label>
                        </div>
                        <div className="col-auto">
                          <select className="form-select w-auto" onChange={(e) => setTimeSelect(e.target.value)} value={timeSelect}>
                            {timeList.map((v, i) => <option key={i} value={v}>{v}:00</option>)}
                          </select>
                        </div>
                        <div className="col-auto">
                          <button type='submit' className="btn btn-primary px-4">비율 분석하기</button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {complexTotalData[0] && (
                  <div className="mt-4 p-3 bg-white rounded-4 border shadow-sm">
                    <ComplexComparisonChart complexData={complexData} complexTotalData={complexTotalData} />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Jh_data;