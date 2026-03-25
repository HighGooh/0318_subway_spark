
const SummarySection = ({ history, changeRate }) => {
    const lastData = history[history.length - 1];
    return (
    <div className="row g-4">
        <div className="col-12">
            <div className="card p-3 border-start border-primary border-5">
                <small className="text-muted fw-bold">최근 하차 비율</small>
                <h3 className="fw-bold mt-1 text-primary">{lastData?.출근_하차비율}</h3>
            </div>
        </div>

        {/* 변화량 카드 */}
        <div className="col-12">
            <div className="card p-3 border-start border-danger border-5 shadow-sm">
                <small className="text-muted fw-bold">17년 지수 변화율</small>
                <h3 className="fw-bold mt-1 text-danger">
                    {changeRate > 0 ? `+${changeRate}` : changeRate}%
                </h3>
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
    )
}

export default SummarySection;