import { useEffect, useRef, useState } from "react";
import { useLayoutEffect } from "react";
import "@styles/App.css";
import axios from "axios";
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github.css'; // 테마 선택
import { Map, MapMarker, useKakaoLoader } from "react-kakao-maps-sdk";


const Jh_data = () => {

  // const [isOpen, setIsOpen] = useState(false);

  // const toggleSideBar = () => {
  //   setIsOpen(!isOpen);
  // };

  const [messages, setMessages] = useState([
    { role: "bot", content: "어느 역의 맛집을 추천해드릴까요?" },
  ]);
  const [input, setInput] = useState("");
  const [startBool, setStartBool] = useState(false);
  const scrollRef = useRef(null);
  const [msgLoad, setMsgLoad] = useState(false);
  const [inputLoad, setInputLoad] = useState(false);

  const [yearSel, setYearSel] = useState(2008);
  const [yearLoad, setYearLoad] = useState(false);

  const [subWaySel, setSubWaySel] = useState(true);

  const [drunkSearch, setDrunkSearch] = useState(0);
  const [drunkList, setDrunkList] = useState(null);
  const [drunkLoad, setDrunkLoad] = useState(false);
  const [drunkResult, setDrunkResult] = useState("");

  const [placeList, setPlaceList] = useState(null)
  const [placeClick, setPlaceClick] = useState(null)
  const [placeName, setPlaceName] = useState([])

  const option = [];

  for (let i = 2008; i <= 2021; i++) {
    option.push(i)
  }

  const yearSubmit = (e) => {
    e.preventDefault()
    setDrunkList(null)
    axios.get('http://127.0.0.1:8000/year_select', { params: { year: yearSel } }).then(
      res => {
        if (res.data.status) {
          alert('데이터 수집 완료')
          setYearLoad(false)
          setSubWaySel(true)
        }
        else alert('오류가 발생했습니다.')
      }
    ).catch()
  }

  const searchDrunkList = () => {
    axios.get('http://127.0.0.1:8000/drunk_info').then(
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
        messageReform(res.data["result"]);

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
    const { info, where, name } = parsedData
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
  }

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const mapRef = useRef(null);

  // 2. startBool이 바뀔 때 지도를 새로고침하는 로직 추가
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
  console.log(placeName)
  return (
    <>
      <div className="bg-light py-5">
        <div className="bg-white shadow-sm p-4 p-md-5 rounded-4" style={{ maxWidth: '1140px', margin: "0 auto" }}>
          <form onSubmit={(e) => { yearSubmit(e); setYearLoad(true); setSubWaySel(false) }}>
            <h3 className="text-center mt-5 mb-3">활용하고 싶은 연도를 선택해주세요</h3>
            <div style={{ maxWidth: "700px", margin: "0 auto" }} className="d-flex">
              <select name="year" className="form-select" aria-label="팀원 선택" onChange={(e) => setYearSel(e.target.value)} disabled={yearLoad}>
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
          <div className={`${subWaySel ? "" : "d-none"}`} style={{ maxWidth: "700px", margin: "50px auto" }}>
            <button style={{ background: "#f5f5f5" }} className="btn text-black text-decoration-none " onClick={() => setDrunkSearch(1)}>맛있는 술집 추천</button>
          </div>
          <div className={`${drunkSearch === 1 ? "" : "d-none"} p-5`} style={{ maxWidth: "1200px", margin: "50px auto", border: "1px solid #d1d1d1" }}>
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
            <div className={`${startBool && drunkList ? "" : "d-none"} qresult_box justify-content-between content_box`}>
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
              <div className={`chart_wrap`} style={{ width: "800px", maxWidth: "400px" }}>
                <h5 className="text-black text-decoration-none text-center mb-4">지도로 보기</h5>
                <p className={`loading_chat  ${!placeList ? "" : "d-none"} text-center mt-3`}>지도 만드는 중 <span>•</span><span>•</span><span>•</span></p>
                  <Map
                    ref={mapRef} // 이 부분이 핵심입니다!
                    center={placeList && placeList.length > 0 ? placeList[0] : { lat: 37.49995471867853, lng: 127.0292590942947 }}
                    style={{ width: "100%", height: "360px"}}
                    level={4}
                    className={`map_wrap${placeList ? "" : "d-none"}`}
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
          </div>
        </div>
      </div>

    </>
  );
};

export default Jh_data;