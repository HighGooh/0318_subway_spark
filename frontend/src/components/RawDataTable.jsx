const RawDataTable = ({ history }) => (
    
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


)

export default RawDataTable;