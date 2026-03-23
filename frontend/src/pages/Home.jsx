import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@styles/App.css'; // 커스텀 스타일 유지용

const App = () => {
  const [activeTab, setActiveTab] = useState('전체');
  const [searchTerm, setSearchTerm] = useState('');

  const portfolioItems = [
    { id: 1, title: 'Ji hwan', type: 'UX/UI', date: '2026-03-20', desc: 'Spark와 ai-agent(n8n)를 통한 데이터 활용(번화가 도출 및 맛집 추천)', icon: 'fa-heart', link: '/jh' },
    { id: 2, title: 'Yun Woo', type: 'AI Agent', date: '2026-03-20', desc: 'Spark를 활용한 데이터 적재 및 분석(승하차 비율을 통한 역 성격 규명 및 혼잡도 추정)', icon: 'fa-robot', link: '/yw' },
    { id: 3, title: 'Ga young', type: 'Video', date: '2026-03-20', desc: 'Spark를 활용한 데이터 적재 및 분석(어린이날 관광지 혼잡도 추정)', icon: 'fa-video', link: '/gy' },
  ];

  const tabs = ['전체', 'UX/UI', 'AI Agent', 'Video', 'Study'];

  const filteredItems = portfolioItems.filter(item => {
    const matchesTab = activeTab === '전체' || item.type === activeTab;
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="bg-light py-5">
      <div className="container bg-white shadow-sm p-4 p-md-5 rounded-4" style={{ maxWidth: '1140px' }}>
        
        {/* Header Section */}
        <header className="mb-5">
          <div className="d-flex align-items-center mb-2">
            <i className="fas fa-folder fa-2x text-primary"></i>
            <h1 className="fw-bold m-0">Team4's <span className="text-primary">Spark 활용 </span>Project</h1>
          </div>
          <p className="text-secondary small mb-4">팀 프로젝트 결과물을 확인해보실 수 있습니다.</p>
          
          {/* Search Bar */}
          <div className="input-group mb-4 bg-light rounded-3 p-2">
            <span className="input-group-text bg-transparent border-0">
              <i className="fas fa-search text-muted"></i>
            </span>
            <input 
              type="text" 
              className="form-control bg-transparent border-0 shadow-none" 
              placeholder="자료 검색..." 
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filter Tabs */}
          <nav className="nav nav-pills bg-light p-1 rounded-3">
            {tabs.map(tab => (
              <button 
                key={tab}
                className={`nav-link flex-fill border-0 fw-medium ${activeTab === tab ? 'bg-white text-dark shadow-sm active' : 'text-secondary'}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </nav>
        </header>

        {/* Grid Layout (Bootstrap Grid) */}
        <main className="row g-4">
          {filteredItems.map(item => (
            <div key={item.id} className="col-12 col-md-6 col-lg-4">
              <a href={item.link} className="card h-100 border-light-subtle text-decoration-none p-4 custom-card">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="text-secondary small d-flex align-items-center gap-2">
                    <i className={`fas ${item.icon}`}></i> {item.type}
                  </span>
                  <span className="text-body-tertiary small">{item.date}</span>
                </div>
                <div className="card-body p-0">
                  <h3 className="h5 fw-bold text-dark mb-2">{item.title}</h3>
                  <p className="text-secondary small mb-4">{item.desc}</p>
                </div>
                <div className="mt-auto">
                  <span className="text-primary fw-semibold small d-flex align-items-center gap-1">
                    <i className="fas fa-link"></i> 자료 열기
                  </span>
                </div>
              </a>
            </div>
          ))}
        </main>
      </div>
    </div>
  );
};

export default App;