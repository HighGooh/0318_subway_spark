import "@styles/App.css";
import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Search, Map, TrendingUp, Award } from 'lucide-react';
import { api } from '@utils/network.js'

const Yw_data = () => {
  const [station, setStation] = useState("")
  const [clickButton, setClickButton] = useState(false)
  const [history, setHistory] = useState([]); // 서버 데이터를 담을 상태
  const [targetName, setTargetName] = useState(""); // 찾은 공식 역명
  // 차트 하단에 추가할 요약 카드 로직 (변화량 계산)
  const getChangeRate = () => {
    if (history.length < 2) return 0;
    const first = history[0].출근_하차비율;
    const last = history[history.length - 1].출근_하차비율;
    return (((last - first) / first) * 100).toFixed(1);
  };

  const buttonEvent = e => {
    e.preventDefault()
    if (!station) return alert("역 이름을 입력하세요");

    api.get(`/station_history?station_name=${station}`)
      .then(res => {
        if (res.data.status) {
          setHistory(res.data.data); // 데이터 저장
          setTargetName(res.data.station_name); // 공식 역명 저장
          setClickButton(true);
          console.log(res.data)
        } else {
          alert("역을 찾을 수 없습니다.");
        }
      })
      .catch(err => console.log(err));
  };

  return (
    <div className="bg-light py-5">
      <div className="bg-white shadow-sm p-4 p-md-5 rounded-4" style={{ maxWidth: '1140px', margin: "0 auto" }}>
        <div className="py-5">
          {/* 검색 섹션 */}
          <div className="row mb-4 justify-content-center">
            <div className="col-md-8 text-center">
              <h1 className="fw-bold text-primary mb-3">지하철 성격 연대기</h1>
              <div className="input-group input-group-lg shadow-sm p-3">
                <span className="input-group-text bg-white border-end-0"><i className="bi bi-search"></i></span>
                <input type="text" id="stationInput" className="form-control border-start-0" name="station" value={station} onChange={e => setStation(e.target.value)} onKeyPress={e => e.key === 'Enter' && buttonEvent(e)} placeholder="역 이름을 입력하세요 (2024년 기준 1~8호선)" required />
                <button className="btn btn-primary px-4" type="button" onClick={buttonEvent} >분석하기</button>
              </div>
            </div>
          </div>
          {
            clickButton &&
            <div className="row g-4">
              {/* 메인 차트 영역 */}
              <div className="col-lg-8">
                <div className="d-flex flex-column gap-4">

                  {/* 1. LineChart 카드 */}
                  <div className="card p-4 shadow-sm border-0">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <h4 className="fw-bold mb-0">
                        <span id="targetStation">{targetName}역</span> 17년 트렌드
                      </h4>
                      <span className={`badge fs-6 ${history[history.length - 1]?.역성격 === '오피스' ? 'bg-primary' : 'bg-danger'}`}>
                        {history[history.length - 1]?.역성격}
                      </span>
                    </div>
                    <div style={{ width: '100%', height: 350 }}>
                      <ResponsiveContainer>
                        <LineChart data={history} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                          <XAxis dataKey="연도" />
                          <YAxis domain={[0, 'auto']} />
                          <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                          <Legend verticalAlign="top" height={36} />
                          <Line type="monotone" dataKey="출근_하차비율" name="오피스 지수" stroke="#0d6efd" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                          <Line type="monotone" dataKey="출근_승차비율" name="주거 지수" stroke="#dc3545" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* 2. BarChart 카드: 인원수 규모 --- mb-4와 고정 height 추가 --- */}
                  <div className="card p-4 shadow-sm border-0">
                    <h5 className="fw-bold mb-4 text-dark">
                      <i className="bi bi-people-fill text-success me-2"></i>
                      연도별 출근 시간대 유동 인구 (규모)
                    </h5>
                    <div style={{ width: '100%', height: 300 }}> {/* 이 높이값이 중요합니다! */}
                      <ResponsiveContainer>
                        <BarChart data={history} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="연도" />
                          <YAxis tickFormatter={(value) => (value / 10000).toFixed(0) + '만'} />
                          <Tooltip formatter={(value) => value.toLocaleString() + ' 명'} cursor={{ fill: '#f8f9fa' }} />
                          <Legend />
                          <Bar dataKey="출근_승차합" name="06시~09시 승차인원" stackId="a" fill="#a5a2e5" />
                          <Bar dataKey="출근_하차합" name="06시~09시 하차인원" stackId="a" fill="#82ca9d" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>


                  {/* 3. 분석 기준 가이드 (새로 추가) */}
                  <div className="card border-0 bg-light p-4 rounded-4">
                    <h5 className="fw-bold mb-3"><i className="bi bi-info-circle-fill text-primary me-2"></i>분석 지수 및 판정 기준</h5>
                    <div className="row g-3 small">
                      <div className="col-md-6">
                        <div className="bg-white p-3 rounded-3 shadow-sm h-100">
                          <p className="fw-bold text-primary mb-1">📈 오피스 지수 (출근 하차 비율)</p>
                          <code className="d-block mb-2 text-dark bg-light p-2 rounded">06~09시 하차 인원 / 06~09시 승차 인원</code>
                          <span className="text-muted">값이 클수록 아침에 사람들이 많이 내리는 업무 중심지임을 의미합니다.</span>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="bg-white p-3 rounded-3 shadow-sm h-100">
                          <p className="fw-bold text-danger mb-1">🏠 주거 지수 (출근 승차 비율)</p>
                          <code className="d-block mb-2 text-dark bg-light p-2 rounded">06~09시 승차 인원 / 06~09시 하차 인원</code>
                          <span className="text-muted">값이 클수록 아침에 사람들이 많이 떠나는 배후 주거지임을 의미합니다.</span>
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="bg-white p-3 rounded-3 shadow-sm">
                          <p className="fw-bold mb-1">⚖️ 역 성격 판정 로직</p>
                          <ul className="mb-0 text-muted">
                            <li><strong>오피스:</strong> - 조건 1: 출근_하차비율 2 이상&퇴근_승차비율 1.3 이상 - 조건 2: 출근_하차비율 4 이상 </li>
                            <li><strong>주거단지:</strong> - 조건 1: 출근_승차비율 2 이상&퇴근_하차비율 1.3 이상 - 조건 2: 출근_승차비율 4 이상 </li>
                            <li><strong>상업/복합:</strong> 그 외</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>



              {/* 우측 요약 정보 (데이터 연동) */}
              <div className="col-lg-4">
                <div className="row g-4">
                  <div className="col-12">
                    <div className="card p-3 border-start border-primary border-5">
                      <small className="text-muted fw-bold">최근 하차 비율</small>
                      <h3 className="fw-bold mt-1 text-primary">
                        {history[history.length - 1]?.출근_하차비율}
                      </h3>
                      <p className="mb-0 text-muted small">2024년 기준</p>
                    </div>
                  </div>

                  {/* 아까 주석 처리했던 변화량 카드 다시 살리기 */}
                  <div className="col-12">
                    <div className="card p-3 border-start border-danger border-5 shadow-sm">
                      <small className="text-muted fw-bold">17년 지수 변화율</small>
                      <h3 className="fw-bold mt-1 text-danger">
                        {getChangeRate() > 0 ? `+${getChangeRate()}` : getChangeRate()}%
                      </h3>
                      <p className="mb-0 text-muted small">
                        {getChangeRate() > 0 ? "업무 지구화 진행 중" : "주거/기타 성격 강화 중"}
                      </p>
                    </div>
                  </div>

                  <div className="col-12">
                    <div className="card p-3">
                      <h6 className="fw-bold mb-3"><i className="bi bi-list-stars"></i> 연도별 판정</h6>
                      <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        <ul className="list-group list-group-flush small">
                          {[...history].reverse().map((item, idx) => (
                            <li key={idx} className="list-group-item d-flex justify-content-between align-items-center px-0">
                              <span className="fw-bold">{item.연도}년</span>
                              <span className={`badge rounded-pill ${item.역성격 === '오피스' ? 'bg-primary' : item.역성격 === '주거단지' ? 'bg-danger' : 'bg-warning text-dark'}`}>
                                {item.역성격}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. 전체 상세 데이터 테이블 (하단 전체 너비) */}
              <div className="col-12 mt-5">
                <div className="card border-0 shadow-sm p-4">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5 className="fw-bold mb-0">
                      <i className="bi bi-table text-secondary me-2"></i>17년간 상세 데이터 Raw Data
                    </h5>
                  </div>
                  <div className="table-responsive" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                    <table className="table table-hover align-middle text-center mb-0">
                      <thead className="table-light sticky-top">
                        <tr className="small">
                          <th>연도</th>
                          <th>역 성격</th>
                          <th className="table-primary">출근 승차비율</th>
                          <th className="table-primary">출근 하차비율</th>
                          <th>출근 승차합</th>
                          <th>출근 하차합</th>
                          <th className="table-warning">퇴근 승차합</th>
                          <th className="table-warning">퇴근 하차합</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...history].reverse().map((item, idx) => (
                          <tr key={idx} className="small">
                            <td className="fw-bold">{item.연도}</td>
                            <td>
                              <span className={`badge rounded-pill ${item.역성격 === '오피스' ? 'bg-primary' : item.역성격 === '주거단지' ? 'bg-danger' : 'bg-warning text-dark'}`}>
                                {item.역성격}
                              </span>
                            </td>
                            <td className="text-primary fw-bold">{Number(item.출근_승차비율).toFixed(2)}</td>
                            <td className="text-primary fw-bold">{Number(item.출근_하차비율).toFixed(2)}</td>
                            <td>{Number(item.출근_승차합).toLocaleString()}</td>
                            <td>{Number(item.출근_하차합).toLocaleString()}</td>
                            <td>{Number(item.퇴근_승차합).toLocaleString()}</td>
                            <td>{Number(item.퇴근_하차합).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  );
}

export default Yw_data;