import React, { useState, useEffect } from 'react';
import { api } from '@utils/network.js';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Gy_data = () => {
  const [selectedYear, setSelectedYear] = useState('');
  const [stations, setStations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const select = (e) => {
    const year = e.target.value;
    setSelectedYear(year);
    setIsLoading(true);
    api.get('/kidsDay', { params: { year: year } })
      .then(res => {
        setStations(res.data.data);
      })
      .catch(err => console.log(err))
      .finally(() => setIsLoading(false));
  };
  const chartData = stations.map(item => ({
    name: item.역명,
    value: item.합계
  }));


  return (
    <div className="min-vh-100 bg-light p-3 p-md-5" style={{ fontFamily: "'Gaegu', cursive", overflowY: 'auto' }}>
      <div className="card shadow-sm mx-auto" style={{
        borderRadius: '40px',
        border: '3px solid #333',
        maxWidth: '1400px',
        minHeight: '90vh'
      }}>
        <div className="card-body p-4 p-md-5">

          {/* 상단 제목 영역 */}
          <div className="text-center mb-5">
            <h1 className="display-4 fw-bold">🦕 어린이날 🧸</h1>
            <h2 className="fw-bold">지하철 혼잡도</h2>
            <h5 className="fs-4 text-secondary">년도별 10~13시 하차 인원 분석</h5>
          </div>
          <div className="row g-5">

            {/* 왼쪽 영역: 연도 선택 + 표 */}
            <div className="col-12 col-lg-5">
              <div className="mb-4">
                <select
                  className="form-select form-select-lg text-center"
                  style={{ border: '3px solid #333', borderRadius: '15px', fontSize: '1.2rem', fontWeight: 'bold' }}
                  value={selectedYear}
                  onChange={select}
                >
                  <option value="" disabled>년도를 선택하세요.</option>
                {['%', '2022', '2021', '2020', '2019', '2018', '2017', '2016', '2015', '2014', '2013', '2012', '2011', '2010', '2009', '2008'].map(y => (
                  <option key={y} value={y}>{y === '%' ? '전체' : `${y}년`}</option>))}
                </select>
              </div>

              {isLoading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status"></div>
                  <p className="fs-4 mt-3">데이터를 찾는 중... 🎈</p>
                </div>
              ) : (
                stations.length > 0 && (
                  <div className="table-responsive">
                    <table className="table table-borderless fw-bold">
                      <thead style={{ borderBottom: '2px solid #333' }}>
                        <tr>
                          <th className="text-center">순위</th>
                          <th className="text-center">역명</th>
                          <th className="text-center">하차 인원</th>
                          <th className="text-center">년도</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stations.map((station) => (
                          <tr key={station.순위} style={{ borderBottom: '1px solid #eee' }}>
                            <td className={`text-center py-3 ${station.순위 === 1 ? 'text-primary' : 'text-secondary'}`}>{station.순위}</td>
                            <td className="text-center py-3">{station.역명}</td>
                            <td className="text-center py-3">{station.합계.toLocaleString()}명</td>
                            <td className="text-center py-3">{station.날짜.substring(0, 4)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              )}
            </div>

            {/* 오른쪽 영역: 그래프 */}
            <div className="col-12 col-lg-7">
              {isLoading ? (
                /* 로딩 중일 때 표시할 화면 */
                <div className="h-100 d-flex flex-column align-items-center justify-content-center text-center py-5" style={{ height: '500px' }}>
                  <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }} role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="fs-4 mt-3">그래프를 그리는 중... 📊</p>
                </div>
              ) : stations.length > 0 ? (
                /* 로딩 완료 후 데이터가 있을 때 (차트 표시) */
                <div className="d-flex flex-column align-items-center justify-content-center w-100"
                 style={{ width: '100%', minWidth: '300px', height: '500px', overflow: 'hidden'}}>
                  <h3 className="text-center mb-4">역별 하차 인원 비교</h3>
                  <ResponsiveContainer width="99%" height={350} aspect={1.5} key={stations.length} debounce={50}>
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" interval={0} angle={-30} textAnchor="end" height={80} fontSize={14} stroke="#666" />
                      <YAxis stroke="#666" />
                      <Tooltip cursor={{ fill: '#f8f9fa' }} />
                      <Bar dataKey="value" fill="#007bff" radius={[10, 10, 0, 0]} barSize={50} isAnimationActive={false} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                /* 데이터도 없고 로딩 중도 아닐 때 (초기 화면) */
                <div className="h-100 d-flex align-items-center justify-content-center text-muted fs-4">
                  {/* 년도를 선택하면 그래프가 나와요! */}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Gy_data;


{/* 
  트러블 슈팅 기록
  1. 대용량 데이터 처리 및 시스템 부하 문제
    Problem: 서울시 지하철 이용 데이터 약 1,100만 행을 일반적인 DB 쿼리로만 처리할 때 속도가 저하되고 시스템 부하가 발생함.

    Solution: MariaDB에서 필요한 날짜(5/5)와 시간대(10~13시)만 1차 필터링한 후, **Apache Spark(PySpark)**의 분산 처리 엔진을 활용하여 메모리 내 연산으로 속도를 최적화함.

    Result: 전체 데이터 전수 조사 대비 분석 속도를 획기적으로 단축하고, 복잡한 랭킹 로직(ROW_NUMBER)을 안정적으로 수행함.

2. 리액트 차트 렌더링 동기화 오류
    Problem: 연도를 변경할 때 API 통신 속도와 차트 애니메이션 주기가 맞지 않아, 이전 데이터가 차트에 남거나 로딩 중 차트가 깨져 보이는 현상 발생.

    Solution: isLoading 상태값에 따라 조건부 렌더링을 적용하고, Recharts의 ResponsiveContainer에 고유 key 값을 부여하여 데이터 업데이트 시 차트가 정확하게 재렌더링되도록 로직 수정.

    Result: 사용자 경험(UX) 측면에서 매끄러운 화면 전환과 정확한 데이터 시각화 구현.
  */}