import { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@styles/App.css'; // 커스텀 스타일 유지용

const App = () => {
  const [activeTab, setActiveTab] = useState('전체');
  const [searchTerm, setSearchTerm] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // 한 페이지에 보여줄 카드 개수

  const portfolioItems = [
    { id: 1, title: 'Ji hwan', type: 'Spark', date: '2026-03-20', desc: 'Spark와 AI-agent(n8n)를 통한 데이터 분석 및 활용(번화가 도출 및 맛집 추천/경로 혼잡도 비교)', icon: 'fa-robot', link: '/jh_spark' },
    { id: 2, title: 'Yun Woo', type: 'Spark', date: '2026-03-20', desc: 'Spark를 활용한 데이터 적재 및 분석(승하차 비율을 통한 역 성격 규명 및 혼잡도 추정)', icon: 'fa-chart-pie', link: '/yw_spark' },
    { id: 3, title: 'Ga young', type: 'Spark', date: '2026-03-20', desc: 'Spark를 활용한 데이터 적재 및 분석(어린이날 관광지 혼잡도 추정)', icon: 'fa-chart-line', link: '/gy_spark' },

  ];

  const tabs = ['전체', 'Spark'];

  const filteredItems = portfolioItems.filter(item => {
    const matchesTab = activeTab === '전체' || item.type === activeTab;
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  return (
    // 배경에 그라데이션 추가
    <div className="py-5" style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', minHeight: "calc(100vh - 57px)"}}>
      <div className="bg-white shadow-lg p-4 p-md-5 rounded-5" style={{ maxWidth: '1140px', margin: "0 auto"}}> 
        {/* Header Section */}
        <header className="mb-5 text-center">
          <div className="badge bg-primary-subtle text-primary mb-2 px-3 py-2 rounded-pill fw-bold">Team Project Archive</div>
          <h1 className="display-5 fw-bold mb-3">High Go!'s <span className="text-primary">Portfolio🚀</span></h1>
          <p className="text-secondary lead mx-auto" style={{ maxWidth: '800px' }}>
            데이터 분석부터 AI 연동까지, 팀 High Go!가 쌓아온 기술적 여정을 확인해 보세요.
          </p>
          
          {/* Search Bar - 더 깔끔한 디자인 */}
          <div className="mx-auto mt-4" style={{ maxWidth: '500px' }}>
            <div className="input-group input-group-lg shadow-sm rounded-4 overflow-hidden border">
              <span className="input-group-text bg-white border-0 px-3">
                <i className="fas fa-search text-primary"></i>
              </span>
              <input 
                type="text" 
                className="form-control border-0 ps-0 shadow-none" 
                placeholder="어떤 프로젝트를 찾으시나요?" 
                onChange={handleSearch}
              />
            </div>
          </div>
        </header>
        
        {/* Filter Tabs - 글래스모피즘 스타일 */}
        <div className="d-flex justify-content-center mb-5">
          <nav className="nav nav-pills bg-light p-2 rounded-pill shadow-sm">
            {tabs.map(tab => (
              <button key={tab} className={`nav-link px-4 py-2 rounded-pill border-0 fw-bold ${activeTab === tab ? 'bg-primary text-white' : 'text-secondary'}`} onClick={() => handleTabChange(tab)}>
                {tab}
              </button>
            ))}
          </nav>
        </div>
        {/* Grid Layout */}
        <main className="row g-4 mb-5">
          {currentItems.map(item => (
            <div key={item.id} className="col-12 col-md-6 col-lg-4">
              <a href={item.link} className="card h-100 text-decoration-none p-4 custom-card bg-white">
                <div className="d-flex justify-content-between align-items-start mb-4">
                  <div className="icon-box">
                    <i className={`fas ${item.icon} fa-lg`}></i>
                  </div>
                  <span className="badge rounded-pill text-bg-light border text-secondary px-3 py-2">
                    {item.date}
                  </span>
                </div>
                
                <div className="card-body p-0">
                  <div className="text-primary small fw-bold mb-1">{item.type} Project</div>
                  <h3 className="h4 fw-bold text-dark mb-3" style={{ letterSpacing: '-0.5px' }}>{item.title}</h3>
                  <p className="text-secondary mb-4" style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
                    {item.desc}
                  </p>
                </div>
                
                <div className="mt-auto pt-3 border-top d-flex align-items-center justify-content-between">
                  <span className="text-primary fw-bold small">자료 상세보기</span>
                  <i className="fas fa-arrow-right text-primary small"></i>
                </div>
              </a>
            </div>
          ))}
        </main>
        {totalPages > 1 && (
          <nav className="d-flex justify-content-center mt-5">
            <ul className="pagination pagination-md shadow-sm rounded-pill overflow-hidden">
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <button className="page-link border-0 px-3 h-100" onClick={() => setCurrentPage(prev => prev - 1)}>
                  <i className="fas fa-chevron-left"></i>
                </button>
              </li>
              
              {[...Array(totalPages)].map((_, i) => (
                <li key={i + 1} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                  <button className="page-link border-0 px-3 fw-bold" onClick={() => setCurrentPage(i + 1)}>
                    {i + 1}
                  </button>
                </li>
              ))}

              <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                <button className="page-link border-0 px-3" onClick={() => setCurrentPage(prev => prev + 1)}>
                  <i className="fas fa-chevron-right"></i>
                </button>
              </li>
            </ul>
          </nav>
        )}
      </div>
    </div>
  );
};

export default App;