// 연도 선택 컴포넌트 스타일
export const yearStyles = {
    section: {
        marginBottom: '3rem', // mb-5
        borderBottom: '1px solid #dee2e6', // border-bottom
        paddingBottom: '3rem', // pb-5
        marginTop: '3rem', // mt-5
    },
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '1rem', // gap-3
        maxWidth: '500px',
        margin: '0 auto'
    },
    select: {
        borderWidth: '2px', // border-2
    },
    button: {
        width: '150px',
        fontWeight: '700' // fw-bold
    }
};

// 프로젝트1 컴포넌트 스타일
export const drunkStyles = {
    // 전체 컨테이너 및 섹션 카드
    sectionCard: {
        border: 'none',
        backgroundColor: '#f8f9fa', // bg-light
        padding: '1.5rem',
        marginBottom: '1.5rem',
        borderRadius: '1rem',
    },

    // 역 선택 버튼 폼 컨테이너
    buttonForm: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5rem',
        justifyContent: 'center',
        padding: '1rem',
        backgroundColor: '#fff',
        border: '1px solid #dee2e6',
        borderRadius: '1rem',
    },

    // 아이폰 프레임 (채팅창 외곽)
    iphoneFrame: {
        border: '8px solid #333',
        height: '600px',
        backgroundColor: '#212529', // bg-dark
        padding: '1rem',
        borderRadius: '3rem', // rounded-5
        boxShadow: '0 1rem 3rem rgba(0,0,0,0.175)',
    },

    // 채팅 내부 윈도우
    chatWindow: {
        backgroundColor: '#fff',
        height: '100%',
        borderRadius: '1.5rem',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
    },

    // 지도 카드 컨테이너
    mapCard: {
        border: 'none',
        borderRadius: '1rem',
        height: '100%',
        padding: '1.5rem',
        backgroundColor: '#fff',
        boxShadow: '0 .125rem .25rem rgba(0,0,0,0.075)',
    },

    // 지도 실제 영역
    mapBox: {
        border: "none",
        borderRadius: '1rem',
        overflow: 'hidden',
        border: '1px solid #dee2e6',
    },

    // 마커 정보창 커스텀 스타일
    infoWindow: {
        border: "none",
        minWidth: "180px",
        padding: "10px",
        backgroundColor: "#fff",
        borderRadius: "0",
        boxShadow: "0 4px 15px rgba(0,0,0,0.15)",
        border: "1px solid #eee",
        cursor: "pointer",
        position: "relative",
        top: "-2px",
        right: "0px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "4px"
    }
};

// 프로젝트1 차트 컴포넌트 스타일
export const chartStyles = {
    container: {
        width: '100%',
        height: 400,
        padding: '20px',
        backgroundColor: '#f9f9f9',
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)' // 살짝 그림자 추가
    },
    title: {
        textAlign: 'center',
        marginBottom: '20px',
        fontWeight: '700', // fw-bold 느낌
        fontSize: '1.25rem', // fs-5 느낌
        color: '#333'
    },
    xAxisTick: {
        fontSize: 12,
        fontWeight: 500 // fw-medium 느낌
    }
};

// 프로젝트2 컴포넌트 스타일
export const pathStyles = {
    // 메인 카드 컨테이너
    card: {
        border: 'none',
        boxShadow: '0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)',
        borderRadius: '1rem',
        padding: '1.5rem',
    },

    // 출발/도착역 입력 박스
    stationBox: {
        padding: '1rem',
        backgroundColor: '#f8f9fa', // bg-light
        borderRadius: '1rem',
        border: '1px solid #dee2e6'
    },

    // 경로 결과 섹션 (tStation 결과창)
    resultBanner: {
        backgroundColor: '#fff',
        border: '1px solid #dee2e6',
        borderRadius: '1rem',
        padding: '1.5rem',
        marginBottom: '1.5rem'
    },

    // 경로 역 이름 뱃지 커스텀
    stationBadge: {
        backgroundColor: '#f8f9fa',
        color: '#212529',
        fontWeight: '500',
        border: '1px solid #dee2e6',
        padding: '0.5rem 0.75rem',
        fontSize: '0.9rem'
    },

    // 하단 차트 영역 컨테이너
    chartSection: {
        marginTop: '1.5rem',
        padding: '1.5rem',
        backgroundColor: '#f8f9fa',
        borderRadius: '1rem',
        border: '1px solid #dee2e6'
    }
};

// 프로젝트2 차트 컴포넌트 스타일
export const compStyles = {
    container: {
        width: '100%',
        height: 400,
        marginTop: '20px',
        padding: '15px',
        backgroundColor: '#fff',
        borderRadius: '12px'
    },
    title: {
        textAlign: 'center',
        marginBottom: '1.5rem',
        fontWeight: '700',
        color: '#2d3436'
    },
    // 기준선(ReferenceLine) 관련 설정
    refLine: {
        stroke: '#ff580a',
        strokeDasharray: '3 3',
        label: {
            position: 'top',
            fill: '#ff580a',
            fontSize: 13,
            fontWeight: 'bold'
        }
    },
    // 막대 색상 정의
    colors: {
        above: "#00a2ff96", // 평균 이상 (파란색 계열)
        below: "#87d884",   // 평균 이하 (초록색 계열)
        default: "#ff580a"
    }
};