import { useState, useMemo } from 'react'; 
import { api } from '@utils/network.js';

export const useStationHistory = () => {
  const [station, setStation] = useState("");
  const [data, setData] = useState({ history: [], targetName: "", loaded: false });

  const fetchHistory = async () => {
    if (!station) return alert("역 이름을 입력하세요");
    try {
      const res = await api.get(`/station_history?station_name=${station}`);
      if (res.data.status) {
        setData({
          history: res.data.data,
          targetName: res.data.station_name,
          loaded: true
        });
      }
    } catch (err) { console.error(err); }
  };

  const changeRate = useMemo(() => {
    if (data.history.length < 2) return 0;
    const first = data.history[0].출근_하차비율;
    const last = data.history[data.history.length - 1].출근_하차비율;
    return (((last - first) / first) * 100).toFixed(1);
  }, [data.history]);

  return { station, setStation, data, fetchHistory, changeRate };
};