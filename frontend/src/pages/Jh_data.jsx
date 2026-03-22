import { useEffect, useRef, useState } from "react";
import { useLayoutEffect } from "react";
import "@styles/App.css";
import axios from "axios";
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github.css'; // 테마 선택
import { Map, MapMarker, useKakaoLoader } from "react-kakao-maps-sdk";
import {BarChart,Bar,XAxis,YAxis,CartesianGrid,Tooltip,Legend,ReferenceLine,ResponsiveContainer,Cell} from 'recharts'

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
  const [startBool, setStartBool] = useState(false);
  const scrollRef = useRef(null);
  const [msgLoad, setMsgLoad] = useState(false);
  const [inputLoad, setInputLoad] = useState(false);

  const [yearSel, setYearSel] = useState(2008);
  const [yearNum, setYearNum] = useState(null);
  const [yearLoad, setYearLoad] = useState(false);

  const [subWaySel, setSubWaySel] = useState(true);

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

  for (let i = 2008; i <= 2021; i++) {
    option.push(i)
  }

  const yearSubmit = (e) => {
    e.preventDefault()
    setDrunkList(null)
    setDrunkSearch(null)
    setYearNum(yearSel)
    axios.get('http://localhost:8002/year_select', { params: { year: yearSel } }).then(
      res => {
        if (res.data.status) {
          alert('데이터 수집 완료')
          setYearLoad(false)
          setSubWaySel(true)
        }
        else {
          alert('오류가 발생했습니다.')
          setYearLoad(false)
        }
      }
    ).catch()
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
    ).catch()

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

    const item = { input, yearSel };

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
        console.log(err);
        setMsgLoad(true)
        setInputLoad(false)
        alert("네트워크 연결을 확인해주세요");
      });

    setMessages((prev) => [...prev, { role: "user", content: input }]);
    setInput("");
  }

  const messageReform = (data) => {
    const res = data.replace('```', '').replace('json', '').replace('```', '')
    const parsedData = JSON.parse(res)
    return parsedData

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

  const timeList = ["05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24"]
  const [timeSelect, setTimeSelect] = useState("05")

  const [complexData, setComplexData] = useState([])
  const [complexTotalData, setComplexTotalData] = useState([])

  const getStation = () => {
    setStationLoad(true)
    axios.get('http://localhost:8002/get_station').then(
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
        }
      }
    ).catch()
  }

  const stationList_start = (e) => {
    e.preventDefault()
    if (start_st_input) {
      setStart_st_list(stationList.filter((v) => v.includes(start_st_input)))
    } else {
      setStart_st_list([...stationList])
    }

  }

  const stationList_finish = (e) => {
    e.preventDefault()
    if (finish_st_input) {
      setFinish_st_list(stationList.filter((v) => v.includes(finish_st_input)))
    } else {
      setFinish_st_list([...stationList])
    }

  }

  const station_search = (e) => {
    e.preventDefault()
    const station_start = e.target.station_list_st.value
    const station_finish = e.target.station_list_fn.value

    const item = { "출발역": station_start, "도착역": station_finish }
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

    const item = {start_st:start_st, finish_st:finish_st, stations:tStation, time:timeSelect}

    axios
      .post("http://localhost:8002/search_complex",  item)
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

  console.log(complexData, complexTotalData)
  return (
    <>
      <div className="bg-light py-5">
        <div className="bg-white shadow-sm p-4 p-md-5 rounded-4" style={{ maxWidth: '1140px', margin: "0 auto" }}>
          <form onSubmit={(e) => { yearSubmit(e); setYearLoad(true); setSubWaySel(false) }}>
            <h3 className="text-center mt-5 mb-3">활용하고 싶은 연도를 선택해주세요</h3>
            <div style={{ maxWidth: "700px", margin: "0 auto" }} className="d-flex">
              <select name="year" className="form-select" aria-label="팀원 선택" onChange={(e) => setYearSel(e.target.value)} value={yearSel} disabled={yearLoad}>
                {
                  option.map((v, i) => (
                    <option key={i} value={v}>{v}년도</option>
                  ))
                }
              </select>
              <button type='submit' className="btn btn-primary text-white fw-bold text-decoration-none" style={{ width: "100px", margin: "0 0 0 20px" }} disabled={yearLoad}>선택</button>
            </div>
            <p className={`loading_chat  ${yearLoad ? "" : "d-none"} text-center mt-3`}>데이터를 수집 중 <span>•</span><span>•</span><span>•</span></p>
          </form>
          <div className={`${subWaySel ? "d-flex" : "d-none"} gap-3`} style={{ maxWidth: "700px", margin: "50px auto" }}>
            {

              progremOption.map((v, i) => <button key={i} style={{ background: "#f5f5f5" }} className={`btn text-black text-decoration-none ${drunkSearch === i ? "active" : ""}`} onClick={() => { setDrunkSearch(i); i === 1 && getStation() }}>{v.content}</button>)
            }
          </div>

          {/* 프로젝트1 */}
          {
            drunkSearch === 0 &&
            <div className="p-5" style={{ maxWidth: "1200px", margin: "50px auto", border: "1px solid #d1d1d1" }}>
              <div className="d-flex justify-content-center align-items-center">
                <p className="mb-0">서울교통공사 데이터를 기반으로 한 주말/저녁시간 번화가 데이터 수집</p>
                <button className="btn btn-primary text-white fw-bold text-decoration-none ms-3" onClick={() => { DrunkLoad() }}>데이터 수집</button>
              </div>
              <p className={`loading_chat  ${drunkLoad ? "" : "d-none"} text-center mt-3`}>데이터를 수집 중 <span>•</span><span>•</span><span>•</span></p>
              <form className={`d-flex gap-2 justify-content-evenly mt-5 mb-5 flex-wrap border-bottom border-light-subtle pb-5 ${drunkList ? "" : "d-none"}`} onSubmit={Send}>
                {

                  drunkList &&
                  drunkList?.map((v, i) => (
                    <button style={{ background: "#f5f5f5" }} type="submit" className="btn text-black text-decoration-none station_btn" key={i} onClick={(e) => { setInput(e.target.innerText) }} disabled={inputLoad}>{String(v['역명'])}</button>
                  ))
                }
              </form>
              <div className={`${startBool && drunkList ? "d-flex" : "d-none"} qresult_box justify-content-evenly content_box mb-4`}>
                {/* ai-agent */}
                <div style={{ maxWidth: "358px", padding: "20px", border: "1px solid #000", background: "#000", borderRadius: "50px" }} className={`position-relative`}>
                  <div style={{ background: "#000", width: "70px", height: '20px', position: "absolute", zIndex: "1", left: "50%", top: "30px", transform: "translateX(-50%)", borderRadius: "50px" }} ></div>
                  <div style={{ height: '500px', overflowY: 'scroll', maxWidth: "500px", padding: "20px", borderRadius: "40px" }} className={`hide-scrollbar container-fluid d-flex flex-column bg-white`}>

                    {/* 채팅 내역 (말풍선 영역) */}
                    <div className={`p-4`}>
                      <div style={{}}>
                        {messages.map((msg, idx) => (
                          <div
                            key={idx}
                            className={`d-flex mb-4 chat_box ${msg.role === "user" ? "justify-content-end" : "justify-content-start"} `}>
                            {/* AI 아이콘 (왼쪽 답변일 때만 표시) */}
                            {msg.role === "bot" && (
                              <div className="me-2 mt-1">
                                <div
                                  className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                                  style={{ width: "30px", height: "30px", fontSize: "12px" }}>
                                  AI
                                </div>
                              </div>
                            )}

                            {/* 말풍선 본체 */}
                            <div
                              className={`p-3 shadow-sm ${msg.role === "user"
                                ? "bg-primary text-white rounded-start-4 rounded-top-4" // 사용자
                                : "bg-white text-dark border rounded-end-4 rounded-top-4" // AI
                                }`}
                              style={{ maxWidth: "230px", fontSize: "0.95rem" }}
                            >
                              <div className="fw-bold mb-1 small" style={{ opacity: 0.8 }}>
                                {msg.role === "user" ? "나" : "gemma"}
                              </div>
                              <div style={{ whiteSpace: "pre-wrap" }}>
                                <ReactMarkdown rehypePlugins={[rehypeHighlight]}>{msg.content}</ReactMarkdown>
                              </div>
                            </div>
                          </div>
                        ))}
                        <div className={`loading_box mb-4 chat_box justify-content-start ${msgLoad ? "d-none" : "d-flex"}`}>
                          <div className="me-2 mt-1">
                            <div
                              className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                              style={{ width: "30px", height: "30px", fontSize: "12px" }}>
                              AI
                            </div>
                          </div>
                          <div className={`p-3 shadow-sm "bg-white text-dark border rounded-end-4 rounded-top-4`}
                            style={{ maxWidth: "75%", fontSize: "0.95rem" }}>
                            <div className="fw-bold mb-1 small" style={{ opacity: 0.8 }}>
                              gemma
                            </div>
                            <div className="loading_chat" style={{ whiteSpace: "pre-wrap" }}>
                              <span>•</span>
                              <span>•</span>
                              <span>•</span>
                            </div>
                          </div>
                        </div>
                        <div ref={scrollRef} />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="center_bar" style={{ height: "542px", width: '1px', background: "#d1d1d1" }}></div>
                {/* 지도 */}
                <div className={`chart_wrap`} style={{ width: "800px", maxWidth: "400px" }}>
                  <h5 className="text-black text-decoration-none text-center mb-4">지도로 보기</h5>
                  <p className={`loading_chat  ${!placeList ? "" : "d-none"} text-center mt-3`}>지도 만드는 중 <span>•</span><span>•</span><span>•</span></p>
                  <Map
                    ref={mapRef} // 이 부분이 핵심입니다!
                    center={placeList && placeList.length > 0 ? placeList[0] : { lat: 37.49995471867853, lng: 127.0292590942947 }}
                    style={{ width: "100%", height: "360px" }}
                    level={4}
                  >
                    {placeList && placeList.map((loc, idx) => (
                      <MapMarker key={idx} position={loc} onClick={() => placeClick === idx ? setPlaceClick(null) : setPlaceClick(idx)}>
                        {
                          placeClick === idx &&
                          <p style={{ color: "#000", padding: "5px", cursor: "pointer", width: "max-content" }} onClick={() => placeClick === idx ? setPlaceClick(null) : setPlaceClick(idx)}>{placeName[idx]}</p>
                        }
                      </MapMarker>
                    ))}
                  </Map>
                </div>
              </div>
              <DrunkChart drunkList={drunkList} />
            </div>
          }

          {/* 프로젝트2 */}
          {
            drunkSearch === 1 &&
            <div className={`p-5`} style={{ maxWidth: "1200px", margin: "50px auto", border: "1px solid #d1d1d1" }}>
              <p className={`loading_chat  ${stationLoad ? "" : "d-none"} text-center mt-3`}>{yearNum}역 목록 수집 중 <span>•</span><span>•</span><span>•</span></p>
              {
                stationList &&
                <div className="station_wrap">
                  <div className="d-flex mb-3">
                    <form onSubmit={stationList_start} style={{ width: "50%" }}>
                      <label htmlFor="start_st" className="me-3">출발역 : </label>
                      <input id="start_st" value={start_st_input} onChange={(e) => { setStart_st_input(e.target.value) }} placeholder="전체" style={{ width: "50%" }} />

                    </form>
                    <form onSubmit={stationList_finish} style={{ width: "50%" }}>
                      <label htmlFor="start_fn" className="me-3">도착역 : </label>
                      <input id="start_fn" value={finish_st_input} onChange={(e) => { setFinish_st_input(e.target.value) }} placeholder="전체" style={{ width: "50%" }} />
                    </form>
                  </div>
                  <form onSubmit={station_search} className="mb-3">
                    <div style={{ display: "flex", gap: "10%", marginBottom: "20px" }}>
                      <select name="station_list_st" className="form-select" aria-label="역 선택" value={start_st} onChange={(e) => setStart_st(e.target.value)} style={{ width: "40%" }}>
                        {
                          (start_st_list ? start_st_list : stationList).map((v, i) => (
                            <option key={i} value={v}>{v}</option>
                          ))
                        }
                      </select>
                      <select name="station_list_fn" className="form-select" aria-label="역 선택" value={finish_st} onChange={(e) => setFinish_st(e.target.value)} style={{ width: "40%" }}>
                        {
                          (finish_st_list ? finish_st_list : stationList).map((v, i) => (
                            <option key={i} value={v}>{v}</option>
                          ))
                        }
                      </select>
                    </div>
                    {/* <div className="d-flex gap-3">
                  
                  </div> */}
                    <button type='submit' className="btn btn-primary text-white fw-bold text-decoration-none text-center" style={{ width: "130px", margin: "0 auto" }}> 환승역 검색 </button>
                  </form>
                  <div className="d-flex align-items-center border p-3 mb-3">
                    <p style={{ width: "30%", textAlign: "center", marginBottom: "0", borderRight: "#d1d1d1 1px solid" }}>환승역 목록</p>
                    <ul style={{ width: "70%", textAlign: "center", marginBottom: "0" }}>
                      {
                        tStation && tStation[0] ? tStation.map((v, i) => <li key={i} style={{ width: "fit-content", margin: "0 auto" }}>{v}</li>) : <li style={{ width: "fit-content", margin: "0 auto" }}>환승역 목록 없음</li>
                      }
                    </ul>
                  </div>
                  {
                    tStation &&
                    <div>
                    <form onSubmit={search_complex} className="d-flex gap-3 align-items-center w-100">
                      <div className="d-flex gap-3 align-items-center me-5">
                        <label htmlFor="start_time" style={{ width: "250px" }}>출발 시간을 선택해주세요</label>
                        <select name="timeSelect" className="form-select" id="start_time" aria-label="역 선택" onChange={(e) => setTimeSelect(e.target.value)} value={timeSelect} style={{ width: "40%" }}>
                          {

                            timeList.map((v, i) => (
                              <option key={i} value={v}>{v}</option>
                            ))
                          }
                        </select>
                      </div>
                      <button type='submit' className="btn btn-primary text-white fw-bold text-decoration-none text-center" style={{ padding: "6px 20px" }}> 혼잡도 비율 검색 </button>
                    </form>
                    <ComplexComparisonChart complexData={complexData} complexTotalData={complexTotalData}/>
                    </div>
                  }
                </div>
              }
            </div>
          }
        </div>
      </div>

    </>
  );
};

export default Jh_data;