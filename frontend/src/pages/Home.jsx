import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  const teamMembers = [
    { name: `서울교통공사 데이터와ai-agent의 활용`, path: "/jh", color: "#3b82f6", desc: "프론트엔드 담당" },
    { name: "팀원 B", path: "/member-b", color: "#a855f7", desc: "UI 디자인 담당" },
    { name: "팀원 C", path: "/member-c", color: "#f97316", desc: "백엔드 담당" }
  ];

  // 스타일 객체
  const containerStyle = {
    minHeight: "100vh",
    backgroundColor: "#fff", // 어두운 배경
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "sans-serif",
    padding: "20px"
  };

  const cardContainerStyle = {
    display: "flex",
    gap: "20px",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: "40px"
  };

  const cardStyle = (color) => ({
    backgroundColor: "#2a528a",
    border: `2px solid ${color}`,
    borderRadius: "15px",
    padding: "30px",
    width: "250px",
    textAlign: "center",
    cursor: "pointer",
    transition: "transform 0.2s"
  });

  return (
      <div className={`container-fluid vh-100 d-flex flex-column bg-white `}>
      {/* 헤더 */}
      
    <div style={containerStyle}>
      <h1 style={{ fontSize: "3rem", fontWeight: "bold", marginBottom: "10px", color: '#333'}}>TEAM 4</h1>
      <p style={{ color: "#9ca3af" }}>우리 팀원들의 페이지로 이동하세요</p>

      <div style={cardContainerStyle}>
        {teamMembers.map((member, i) => (
          <div 
            key={i} 
            style={cardStyle(member.color)}
            onClick={() => navigate(member.path)}
            onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.05)"}
            onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
          >
            <h2 style={{ fontSize: "1.5rem", marginBottom: "10px" }}>{member.name}</h2>
            <p style={{ fontSize: "0.9rem", color: "#d1d5db" }}>{member.desc}</p>
            <div style={{ marginTop: "20px", color: member.color, fontWeight: "bold" }}>구경가기 →</div>
          </div>
        ))}
      </div>
    </div>
    </div>
  );
}

export default Home;