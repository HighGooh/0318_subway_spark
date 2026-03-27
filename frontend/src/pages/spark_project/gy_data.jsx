import { useState } from 'react';
import { api } from '@utils/network.js';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// 연도 배열
const YEARS = ['%', ...Array.from({ length: 17 }, (_, i) => (2024 - i).toString())];

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
        {stations.map((s, index) => {
          const currentRank = s.순위 || index + 1;
          const displayYear = s.년도 || (s.날짜 ? s.날짜.substring(0, 4) : "");
          return (
            <tr key={`${s.역명}-${displayYear}-${currentRank}`} style={{ borderBottom: '1px solid #eee' }}>
              <td className={`text-center py-3 ${currentRank === 1 ? 'text-primary' : 'text-secondary'}`}>
                {currentRank}
              </td>
              <td className="text-center py-3">{s.역명}</td>
              <td className="text-center py-3">{Number(s.합계).toLocaleString()}명</td>
              <td className="text-center py-3">
                {displayYear ? `${displayYear}년` : "-"}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);

// 차트 1 (년도별 비교)
const MetroChart = ({ data }) => (
  <div className="d-flex flex-column align-items-center justify-content-center w-100" style={{ height: '500px' }}>
    <h3 className="text-center mb-4">역별 하차 인원 비교</h3>
    <ResponsiveContainer width="99%" height={350}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" interval={0} angle={-30} textAnchor="end" height={80} fontSize={14} stroke="#666" />
        <YAxis stroke="#666" domain={[0, 'auto']} />
        <Tooltip cursor={{ fill: '#f8f9fa' }} />
        <Bar dataKey="value" fill="#007bff" radius={[10, 10, 0, 0]} barSize={50} isAnimationActive={false} />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

// 차트 2 (역별 개별 차트)
const MetroChart2 = ({ data, stationName }) => (
  <div className="d-flex flex-column align-items-center justify-content-center w-100 mb-5" style={{ height: '500px' }}>
    <h3 className="text-center mb-4 text-primary">[{stationName}] 연도별 추이</h3>
    <ResponsiveContainer width="99%" height={350}>
      {/* 1. LineChart로 변경 */}
      <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" stroke="#666" />
        <YAxis stroke="#666" domain={[0, 'auto']} />
        <Tooltip cursor={{ strokeDasharray: '3 3' }} />
        {/* 2. Line 컴포넌트로 변경 */}
        <Line
          type="monotone"
          dataKey="value"
          stroke="#007bff"
          strokeWidth={3}
          dot={{ r: 6 }}
          activeDot={{ r: 8 }}
          isAnimationActive={true}
        />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

// 메인 컴포넌트
const Gy_data = () => {
  const [selectedYear, setSelectedYear] = useState('');
  const [stations, setStations] = useState([]); // 년도 선택 데이터
  const [searchData, setSearchData] = useState([]); // 역 검색 데이터
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태
  const [activeTab, setActiveTab] = useState(""); // 버튼을 불렀을 때 상태
  const [search, setSearch] = useState(""); // 검색한 역 명 데이터

  // 데이터 그룹화 로직 (렌더링 시점에 계산)
  const groupedStations = searchData.reduce((acc, cur) => {
    const name = cur.역명;
    if (!acc[name]) acc[name] = [];
    acc[name].push({ name: cur.년도, value: Number(cur.합계) });
    return acc;
  }, {});

  // 차트를 그릴 때 표시해 줄 역 명
  const stationNameList = Object.keys(groupedStations);

  // 역 별 하차 수 상위 10개를 추출
  const top10RawData = [...searchData]
    .sort((a, b) => Number(b.합계) - Number(a.합계))
    .slice(0, 10)
    .map((item, index) => ({
      ...item,
      순위: index + 1
    }));

  // 차트용 데이터 변환
  const chartData = stations.map(item => ({ name: item.역명, value: item.합계 }));

  // 년도 선택 함수
  const Select = (e) => {
    const year = e.target.value;
    setSelectedYear(year);
    setIsLoading(true);
    api.get('/kidsDayYear', { params: { year } })
      .then(res => setStations(res.data.data))
      .catch(err => console.error(err))
      .finally(() => setIsLoading(false));
  };

  // 역 검색 함수
  const stationSearch = (e) => {
    e.preventDefault();
    if (!search) return alert("역 이름을 입력하세요");
    setIsLoading(true);
    api.get('/kidsDayStation', { params: { search: search } })
      .then(res => {
        setSearchData(res.data.data);
        const resultData = res.data.data;
        if ( resultData.length === 0) {
        alert(`'${search}'에 대한 검색 결과가 없습니다. 정확한 역명을 입력해주세요! 🦕`);
        setSearchData([]);
        setSearch("");
      } else {
        setSearchData(resultData);
      }})
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
            <h5 className="fs-4 text-secondary">연도별 10~13시 하차 인원 분석</h5>
          </header>

          <div className="row g-5">
            {/* 왼쪽 섹션 */}
            <div className="col-12 col-lg-5">
              <div className="d-flex justify-content-center gap-2 mb-4">
                <button className={`btn ${activeTab === 'year' ? 'btn-dark' : 'btn-outline-dark'} rounded-pill px-4`} onClick={() => setActiveTab('year')}>년도 선택</button>
                <button className={`btn ${activeTab === 'station' ? 'btn-dark' : 'btn-outline-dark'} rounded-pill px-4`} onClick={() => setActiveTab('station')}>역 명 검색</button>
              </div>

              {activeTab === 'year' ? (
                <select className="form-select form-select-lg mb-4 border-3 rounded-4" value={selectedYear} onChange={Select}>
                  <option value="" disabled>년도를 선택하세요.</option>
                  {YEARS.map(y => <option key={y} value={y}>{y === '%' ? '전체' : `${y}년`}</option>)}
                </select>
              ) : activeTab === 'station' ? (
                <form onSubmit={stationSearch} className="mb-4">
                  <div className="input-group">
                    <input type="text" className="form-control form-control-lg border-3 rounded-start-4" placeholder="역 명을 검색하세요." value={search} onChange={e => setSearch(e.target.value)} readOnly={isLoading} />
                    <button className="btn btn-dark px-4 rounded-end-4" type="submit">검색</button>
                  </div>
                </form>
              ) : null}

              {isLoading ? <LoadingView message="데이터를 찾는 중... 🎈" /> :
                (activeTab === 'year' ? stations : searchData).length > 0 &&
                <StationTable stations={activeTab === 'year' ? stations : top10RawData} />
              }
            </div>

            {/* 오른쪽 섹션 */}
            <div className="col-12 col-lg-7" style={{ minHeight: '500px' }}>
              {isLoading ? (
                <LoadingView message="데이터를 분석 중입니다... 📊" />
              ) : (activeTab === 'year' ? stations : searchData).length > 0 ? (
                activeTab === 'year' ? (
                  <MetroChart data={chartData} />
                ) : (
                  <div className="d-flex flex-column">
                    {stationNameList.map((name) => (
                      <MetroChart2
                        key={name}
                        data={groupedStations[name].sort((a, b) => a.name - b.name)}
                        stationName={name}
                      />
                    ))}
                  </div>
                )
              ) : (
                <div className="h-100 d-flex align-items-center justify-content-center text-muted fs-4">
                  {activeTab === 'station' ? "역 명을 검색하면 그래프가 나와요!" :
                    activeTab === 'year' ? "연도를 선택하면 그래프가 나와요!" : "메뉴를 선택해주세요! 🎁"}
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