const StationSearch = ({ station, setStation, onSearch }) => (
  <div className="row mb-4 justify-content-center">
    <div className="col-md-8 text-center">
      <h1 className="fw-bold text-primary mb-3">지하철 성격 연대기</h1>
      <div className="input-group input-group-lg shadow-sm p-3">
        <span className="input-group-text bg-white border-end-0"><i className="bi bi-search"></i></span>
        <input 
          type="text" 
          className="form-control border-start-0" 
          value={station} 
          onChange={e => setStation(e.target.value)} 
          onKeyPress={e => e.key === 'Enter' && onSearch()} 
          placeholder="역 이름을 입력하세요" 
        />
        <button className="btn btn-primary px-4" type="button" onClick={onSearch}>분석하기</button>
      </div>
    </div>
  </div>
);

export default StationSearch;