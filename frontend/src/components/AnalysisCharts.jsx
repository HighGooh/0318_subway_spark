import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

const AnalysisCharts = ({ history, targetName }) => (
    <div className="d-flex flex-column gap-4">
        {/* 1. LineChart 카드 */}
        <div className="card p-4 shadow-sm border-0">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold mb-0">{targetName}역 17년 트렌드</h4>
                <span className={`badge fs-6 ${history[history.length - 1]?.역성격 === '오피스' ? 'bg-primary' : 'bg-danger'}`}>
                    {history[history.length - 1]?.역성격}
                </span>
            </div>
            <div style={{ width: '100%', height: 350 }}>
                <ResponsiveContainer>
                    <LineChart data={history}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                        <XAxis dataKey="연도" />
                        <YAxis />
                        <Tooltip />
                        <Legend verticalAlign="top" height={36} />
                        <Line type="monotone" dataKey="출근_하차비율" name="오피스 지수" stroke="#0d6efd" strokeWidth={3} />
                        <Line type="monotone" dataKey="출근_승차비율" name="주거 지수" stroke="#dc3545" strokeWidth={2} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* 2. BarChart 카드: 인원수 규모 */}
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

        {/* 3. 분석 기준 가이드 */}
        <div className="card border-0 bg-light p-4 rounded-4">
            <h5 className="fw-bold mb-3"><i className="bi bi-info-circle-fill text-primary me-2"></i>분석 지수 및 판정 기준</h5>
            <div className="row g-3 small">
                <div className="col-md-6">
                    <div className="bg-white p-3 rounded-3 shadow-sm h-100">
                        <p className="fw-bold text-primary mb-1">📈 오피스 지수 (출근 하차 비율)</p>
                        <code className="d-block mb-2 text-dark bg-light p-2 rounded">06~09시 하차 / 06~09시 승차</code>
                        <span className="text-muted">값이 클수록 아침에 사람들이 많이 내리는 업무 중심지입니다.</span>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="bg-white p-3 rounded-3 shadow-sm h-100">
                        <p className="fw-bold text-danger mb-1">🏠 주거 지수 (출근 승차 비율)</p>
                        <code className="d-block mb-2 text-dark bg-light p-2 rounded">06~09시 승차 / 06~09시 하차</code>
                        <span className="text-muted">값이 클수록 아침에 사람들이 많이 떠나는 주거지입니다.</span>
                    </div>
                </div>
                <div className="col-12">
                    <div className="bg-white p-3 rounded-3 shadow-sm">
                        <p className="fw-bold mb-1">⚖️ 역 성격 판정 로직</p>
                        <ul className="mb-0 text-muted">
                            <li><strong>오피스:</strong> 하차비율 2↑ & 퇴근승차 1.3↑ 또는 하차비율 4↑</li>
                            <li><strong>주거단지:</strong> 승차비율 2↑ & 퇴근하차 1.3↑ 또는 승차비율 4↑</li>
                            <li><strong>상업/복합:</strong> 그 외</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>

    </div>
);

export default AnalysisCharts;