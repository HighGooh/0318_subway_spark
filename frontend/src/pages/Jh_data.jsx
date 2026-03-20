import { useEffect, useRef, useState } from "react";
import { useLayoutEffect } from "react";
import "@styles/App.css";
import axios from "axios";
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github.css'; // 테마 선택


const Jh_data = () => {

  const [isOpen, setIsOpen] = useState(false);

  const toggleSideBar = () => {
    setIsOpen(!isOpen);
  };

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

  const [subWaySel, setSubWaySel] = useState(false);

  const [drunkSearch, setDrunkSearch] = useState(0);
  const [drunkList, setDrunkList] = useState([]);
  const [drunkLoad, setDrunkLoad] = useState(false);
  const [drunkResult, setDrunkResult] = useState("");

  const option = [];

  for (let i = 2008; i <= 2021; i++) {
    option.push(i)
  }

  const yearSubmit = (e) => {
    e.preventDefault()
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
    console.log(input)
    if (!input.trim()) return;
    setMsgLoad(false)
    setInputLoad(true)

    if (input) {
      setStartBool(true);
    }

    const item = { input, yearSel };

    axios
      .post("http://aiedu.tplinkdns.com:7240/webhook/drunk", item)
      .then((res) => {
        console.log(typeof res.data["result"]['info']);
        setMessages((prev) => [
          ...prev,
          {
            role: "bot",
            content: res.data["result"],
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

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <>
      <div className="bg-light py-5">
        <div className="container bg-white shadow-sm p-4 p-md-5 rounded-4" style={{ maxWidth: '1140px' }}>
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
            <form className="d-flex justify-content-evenly mt-5 mb-5 flex-wrap" onSubmit={Send}>
              {
                drunkList &&
                drunkList?.map((v, i) => (
                  <button style={{ background: "#f5f5f5" }} className="btn text-black text-decoration-none " key={i} onClick={(e) => { setInput(e.target.innerText) }} disabled={inputLoad}>{String(v['역명'])}</button>
                ))
              }
            </form>

            {/* ai-agent */}
            <div style={{ maxHeight: '500px', overflowY: 'auto' }} className={`container-fluid d-flex flex-column bg-white ${startBool ? "" : "d-none"}`}>

              {/* 채팅 내역 (말풍선 영역) */}
              <div className={`flex-grow-1 overflow-auto p-4 bg-light shadow-sm`}>
                <div className="container" style={{ maxWidth: "700px" }}>

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
                        style={{ maxWidth: "75%", fontSize: "0.95rem" }}
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

          {/* 입력창 */}
          {/* <form className={`${startBool ? "input_box border-top" : "input_box active "}  p-3`} onSubmit={Send}>
            {!startBool && <h3>안녕하세요! 무엇을 도와드릴까요?</h3>}
            <div className="container" style={{ maxWidth: "700px" }}>
              <div className="input-group border rounded-pill px-3 py-1 shadow-sm" style={{ background: `${inputLoad ? '#e9ecef' : '#fff'}` }}>
                <input
                  type="text"
                  className="form-control border-0 shadow-none"
                  placeholder="메시지를 입력하세요..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={inputLoad}
                // onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
                {
                  // !inputLoad?
                  <button className="btn btn-link text-primary fw-bold text-decoration-none" type="submit">
                    전송
                  </button>
                  // : <button className="btn btn-link text-primary fw-bold text-decoration-none" type="button" onClick={()=>handleCancel()}>취소</button> 
                }
              </div>
            </div>
          </form> */}
        </div>
      </div>

    </>
  );
};

export default Jh_data;