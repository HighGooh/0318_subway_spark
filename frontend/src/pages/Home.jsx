import { useEffect, useRef, useState } from "react";
import { useLayoutEffect } from "react";
import { api } from "@utils/network.js";

const Home = () => {
  const [messages, setMessages] = useState([
    { role: "bot", content: "안녕하세요! 무엇을 도와드릴까요?" },
  ]);
  const [input, setInput] = useState("");
  const [startBool, setStartBoll] = useState(false);
  const scrollRef = useRef(null);
  const [msgLoad, setMsgLoad] = useState(false);
  const [inputLoad, setInputLoad] = useState(false);

  const Send = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMsgLoad(false)
    setInputLoad(true)

    if (input) {
      setStartBoll(true);
    }

    const item = { input };

    console.log(item);

    api
      .post("/webhook/app", item)
      .then((res) => {
        console.log(res);
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

    setMessages((prev)=>[...prev, { role: "user", content: input }]);
    setInput("");

    // 응답 시뮬레이션
  };
  // AbortController를 담을 ref 생성
  // const abortControllerRef = useRef(null);

  // const handleCancel = () => {
  //   // 3. 취소 버튼 클릭 시 abort 호출
  //   if (abortControllerRef.current) {
  //     abortControllerRef.current.abort();
  //     abortControllerRef.current = null;
  //   }
  // };


  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className={`container-fluid vh-100 d-flex flex-column bg-white `}>
      {/* 헤더 */}
      <header className="p-3 border-bottom bg-white sticky-top">
        <h5 className="mb-0 fw-bold text-primary">Jihwan Chat</h5>
      </header>

      {/* 채팅 내역 (말풍선 영역) */}
      <div
        className={`flex-grow-1 overflow-auto p-4 bg-light ${startBool ? "" : "d-none"}`}>
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
                className={`p-3 shadow-sm ${
                  msg.role === "user"
                    ? "bg-primary text-white rounded-start-4 rounded-top-4" // 사용자
                    : "bg-white text-dark border rounded-end-4 rounded-top-4" // AI
                }`}
                style={{ maxWidth: "75%", fontSize: "0.95rem" }}
              >
                <div className="fw-bold mb-1 small" style={{ opacity: 0.8 }}>
                  {msg.role === "user" ? "나" : "gemma"}
                </div>
                <div style={{ whiteSpace: "pre-wrap" }}>
                  {msg.content}
                </div>
              </div>
            </div>
          ))}
          <div className={`loading_box mb-4 chat_box justify-content-start ${msgLoad ? "d-none": "d-flex"}`}>
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

      {/* 입력창 */}
      <form
        className={`${startBool ? "input_box border-top" : "input_box active "}  p-3`} onSubmit={Send}>
        {!startBool && <h3>안녕하세요! 무엇을 도와드릴까요?</h3>}
        <div className="container" style={{ maxWidth: "700px" }}>
          <div className="input-group border rounded-pill px-3 py-1 shadow-sm" style={{background: `${inputLoad? '#e9ecef':'#fff'}`}}>
            <input
              type="text"
              className="form-control border-0 shadow-none"
              placeholder="메시지를 입력하세요..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled = {inputLoad}
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
      </form>
    </div>
  );
};

export default Home;

// import { useState, useEffect } from 'react'
// import { api } from '@utils/network.js'

// const Home = () => {
//   const [email, setEmail] = useState("")
//   const [content, setContent] = useState("")
//   const [list, setList] = useState([])
//   const eventSubmit = e => {
//     const item = {email,content}
//     console.log(item)
//     e.preventDefault()
//     // api.get("/webhook/app", {params: item})
//     api.post("/webhook/app", item)
//     .then(res=>{
//       // console.log(res.data.result)
//       if(res.status == 200){
//         setEmail("")
//         setContent("")
//         setList(res.data["result"])
//       }
//     })
//     .catch(err=>{
//       console.log(err)
//     })

//     // setItem("")

//   }
//   useEffect(() => {

//   }, [])
//   return (
//     <div className="container mt-3">
// 			<h1 className="display-1 text-center">n8n</h1>
//       <form onSubmit={eventSubmit}>
//         <div className="mb-3">
//           <select className="form-select" aria-label="Default select example">
//             <option value="get">get</option>
//             <option value="post">post</option>
//             <option value="put">put</option>
//             <option value="delete">delete</option>
//           </select>

//         </div>
//         <div className="mb-3">
//           <label htmlFor="email" className="form-label">Email</label>
//           <input type="email"  className="form-control" value={email} required id="email" placeholder="name@example.com" onChange={e=> setEmail(e.target.value)}/>
//         </div>
//         <div className="mb-3">
//           <label htmlFor="content" className="form-label">Content</label>
//           <textarea className="form-control" name="content" value={content} id="content" rows="3" onChange={(e)=>setContent(e.target.value)}></textarea>
//         </div>
//         <div className="btn-group w-100">
//           <button type="submit" className="btn btn-primary">추가</button>
//           <button type="button" className="btn btn-primary">삭제</button>
//         </div>
//       </form>
//       <div className="list-group mt-3">
//         {
//           list?
//           list.map((v,i)=>(
//             <button type="button" className="list-group-item list-group-item-action" key={i}>{v.content}</button>
//           ))
//           : <button type="button" className="list-group-item list-group-item-action">목록</button>
//         }
//       </div>
// 		</div>
//   )
// }

// export default Home
