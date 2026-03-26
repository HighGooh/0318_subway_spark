import "@styles/App.css";
import StationSearch from '@components/StationSearch';
import AnalysisCharts from '@components/AnalysisCharts';
import SummarySection from "@components/SummarySection";
import RawDataTable from "@components/RawDataTable";
import { useStationHistory } from '@hooks/useStationHistory';

const Yw_data = () => {
  // 훅에서 필요한 변수와 함수들을 가져옵니다.
  const { station, setStation, data, fetchHistory, changeRate } = useStationHistory();
  const { history, targetName, loaded } = data;

  return (
    <div className="bg-light py-5">
      <div className="bg-white shadow-sm p-4 p-md-5 rounded-4" style={{ maxWidth: '1140px', margin: "0 auto" }}>
        <div className="py-5">
          {/* 검색 섹션 */}
          <StationSearch station={station} setStation={setStation} onSearch={fetchHistory} />
          {/* 데이터가 로드되었을 때만 렌더링 */}
          {
            loaded &&
            <div className="row g-4">
              {/* 메인 차트 영역 */}
              <div className="col-lg-8">
                <AnalysisCharts history={history} targetName={targetName} />
              </div>
              {/* 우측 요약 정보 */}
              <div className="col-lg-4">
                <SummarySection history={history} changeRate={changeRate} />
              </div>
              {/* 4. 전체 상세 데이터 테이블 */}
              <RawDataTable history={history} />
            </div>
          }
        </div>
      </div>
    </div>
  );
}

export default Yw_data;