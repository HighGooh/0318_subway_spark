import { useState } from 'react';
import { api } from '@utils/network.js';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// 연도 배열
const YEARS = ['%', ...Array.from({ length: 15 }, (_, i) => (2022 - i).toString())];

// 로딩 화면
const LoadingView = ({ message }) => (
  <div className="text-center py-5 h-100 d-flex flex-column align-items-center justify-content-center">
    <div className="spinner-border text-primary mb-3" role="status"></div>
    <p className="fs-4">{message}</p>
  </div>
);

// 데이터 테이블
const StationTable = ({ stations }) => (
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
        {stations.map((s) => (
          <tr key={`${s.날짜}-${s.역명}`} style={{ borderBottom: '1px solid #eee' }}>
            <td className={`text-center py-3 ${s.순위 === 1 ? 'text-primary' : 'text-secondary'}`}>{s.순위}</td>
            <td className="text-center py-3">{s.역명}</td>
            <td className="text-center py-3">{s.합계.toLocaleString()}명</td>
            <td className="text-center py-3">{s.날짜.substring(0, 4)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// 차트
const MetroChart = ({ data }) => (
  <div className="d-flex flex-column align-items-center justify-content-center w-100" style={{ height: '500px' }}>
    <h3 className="text-center mb-4">역별 하차 인원 비교</h3>
    <ResponsiveContainer width="99%" height={350} aspect={1.5} debounce={50}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" interval={0} angle={-30} textAnchor="end" height={80} fontSize={14} stroke="#666" />
        <YAxis stroke="#666" />
        <Tooltip cursor={{ fill: '#f8f9fa' }} />
        <Bar dataKey="value" fill="#007bff" radius={[10, 10, 0, 0]} barSize={50} isAnimationActive={false} />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

// 메인 컴포넌트
const Gy_data = () => {
  const [selectedYear, setSelectedYear] = useState('');
  const [stations, setStations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  // 차트용 데이터
  const chartData = stations.map(item => ({ name: item.역명, value: item.합계 }));
  // 연도를 선택하면 실행 될 함수
  const Select = (e) => {
    const year = e.target.value;
    setSelectedYear(year);
    setIsLoading(true);
    
    api.get('/kidsDay', { params: { year } })
      .then(res => setStations(res.data.data))
      .catch(err => console.error(err))
      .finally(() => setIsLoading(false));
  };

  return (
    <div className="min-vh-100 bg-light p-3 p-md-5" style={{ fontFamily: "'Gaegu', cursive" }}>
      <div className="card shadow-sm mx-auto border-3" style={{ borderRadius: '40px', borderColor: '#333', maxWidth: '1400px' }}>
        <div className="card-body p-4 p-md-5">

          <header className="text-center mb-5">
            <h1 className="display-4 fw-bold">🦕 어린이날 🧸</h1>
            <h1 className="display-4 fw-bold">지하철 혼잡도</h1>
            <h5 className="fs-4 text-secondary">년도별 10~13시 하차 인원 분석</h5>
          </header>

          <div className="row g-5">
            {/* 왼쪽 섹션 */}
            <div className="col-12 col-lg-5">
              <select className="form-select form-select-lg text-center mb-4 border-3" 
                      style={{ borderRadius: '15px', fontWeight: 'bold' }} 
                      value={selectedYear} onChange={Select}>
                <option value="" disabled>년도를 선택하세요.</option>
                {YEARS.map(y => <option key={y} value={y}> {y === '%' ? '전체' : `${y}년`}</option>)}
              </select>

              {isLoading ? <LoadingView message="데이터를 찾는 중... 🎈" /> : 
               stations.length > 0 && <StationTable stations={stations} />}
            </div>

            {/* 오른쪽 섹션 */}
            <div className="col-12 col-lg-7">
              {isLoading ? <LoadingView message="그래프를 그리는 중... 📊" /> : 
               stations.length > 0 ? <MetroChart data={chartData} /> : 
               <div className="h-100 d-flex align-items-center justify-content-center text-muted fs-4">
                 년도를 선택하면 그래프가 나와요!
               </div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Gy_data;
