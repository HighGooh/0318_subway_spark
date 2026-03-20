import React, { useState } from 'react';
import './App.css';

const Home = () => {
  // 1. 상태 관리: 현재 선택된 필터 탭과 검색어
  const [activeTab, setActiveTab] = useState('전체');
  const [searchTerm, setSearchTerm] = useState('');

  // 2. 포트폴리오 데이터 배열
  const portfolioItems = [
    {
      id: 1,
      title: 'Wedding',
      type: 'UX/UI',
      date: '2025-12-18',
      desc: '부트스트랩을 활용한 웨딩 페이지 레이아웃 구현',
      icon: 'fa-heart',
      link: './study/20251218/bootstrap/index.html'
    },
    {
      id: 2,
      title: 'AI Chatbot',
      type: 'AI Agent',
      date: '2026-01-10',
      desc: 'OpenAI API를 연동한 지능형 에이전트 서비스',
      icon: 'fa-robot',
      link: '#'
    },
    {
      id: 3,
      title: 'Portfolio Video',
      type: 'Video',
      date: '2026-02-15',
      desc: '프로젝트 소개를 위한 감각적인 영상 편집 자료',
      icon: 'fa-video',
      link: '#'
    },
    {
      id: 4,
      title: 'React Hooks Study',
      type: 'Study',
      date: '2026-03-05',
      desc: '리액트의 상태 관리와 생명주기 메서드 학습',
      icon: 'fa-book',
      link: '#'
    }
  ];

  const tabs = ['전체', 'UX/UI', 'AI Agent', 'Video', 'Study'];

  // 3. 필터링 및 검색 로직
  const filteredItems = portfolioItems.filter(item => {
    const matchesTab = activeTab === '전체' || item.type === activeTab;
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.desc.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="container">
      <header>
        <div className="title-section">
          <i className="fas fa-folder fa-2x" style={{ color: '#3b82f6' }}></i>
          <h1>JiHwan's <span>Portfolio</span></h1>
        </div>
        <p className="subtitle">모든 학습 과정과 포트폴리오 자료를 한 곳에서 확인하세요</p>
        
        <div className="search-bar">
          <i className="fas fa-search"></i>
          <input 
            type="text" 
            placeholder="자료 검색..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <nav className="filter-tabs">
          {tabs.map(tab => (
            <button 
              key={tab}
              className={activeTab === tab ? 'active' : ''}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </nav>
      </header>

      <main className="grid-container">
        {filteredItems.map(item => (
          <a key={item.id} href={item.link} target="_blank" rel="noopener noreferrer" className="card">
            <div className="card-header">
              <span className="type-tag">
                <i className={`fas ${item.icon}`}></i> {item.type}
              </span>
              <span className="date">{item.date}</span>
            </div>
            <div className="card-content">
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
            <div className="card-footer">
              <p className="link-btn">
                <i className="fas fa-link"></i> 자료 열기
              </p>
            </div>
          </a>
        ))}
      </main>
    </div>
  );
};

export default Home;