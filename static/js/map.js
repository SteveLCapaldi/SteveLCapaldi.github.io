// ======= ECharts 世界地图 + CountAPI 示例 =======
async function initWorldMap() {
  const chart = echarts.init(document.getElementById('world-map'));

  // 获取世界地图数据
  const worldData = await fetch('https://fastly.jsdelivr.net/npm/echarts@5/map/json/world.json')
    .then(res => res.json());
  echarts.registerMap('world', worldData);

  // 从 localStorage 读取国家访问数据
  let countryVisits = JSON.parse(localStorage.getItem('countryVisits') || '{}');

  // 获取用户 IP 来源国家
  try {
    const res = await fetch('https://ipapi.co/json/');
    const data = await res.json();
    const country = data.country_name;
    if (country) {
      countryVisits[country] = (countryVisits[country] || 0) + 1;
      localStorage.setItem('countryVisits', JSON.stringify(countryVisits));
    }
  } catch (err) {
    console.warn('Failed to get IP location:', err);
  }

  // 转换成 ECharts 数据格式
  const mapData = Object.entries(countryVisits).map(([country, value]) => ({
    name: country,
    value
  }));

  // 渲染地图
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}<br/>Visits: {c}'
    },
    visualMap: {
      min: 0,
      max: Math.max(...mapData.map(m => m.value), 10),
      text: ['High', 'Low'],
      left: 'left',
      bottom: 10,
      calculable: true,
      inRange: { color: ['#e0ffff', '#006edd'] }
    },
    series: [
      {
        name: 'Visits by Country',
        type: 'map',
        map: 'world',
        roam: true,
        emphasis: { label: { show: true } },
        data: mapData
      }
    ]
  };

  chart.setOption(option);

  // ======= 总访问次数计数 =======
  const counterURL = 'https://api.countapi.xyz/hit/stevelcapaldi.github.io/visits';
  try {
    const res = await fetch(counterURL);
    const data = await res.json();
    document.getElementById('visit-count').textContent = data.value;
  } catch (err) {
    console.error('Failed to load visit count:', err);
    document.getElementById('visit-count').textContent = 'Error';
  }
}

initWorldMap();
