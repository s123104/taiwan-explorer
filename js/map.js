/**
 * 台灣互動地圖專案 - 使用 D3.js 的地圖互動功能
 * 版本: 2.0.0
 * 開發者: UI/UX 設計團隊
 * 日期: 2025-05-12
 */

// 全域變數
let mapSvg;
let mapContainer;
let mapWrapper;
let currentScale = 1;
let translateX = 0, translateY = 0;
let isDragging = false;
let activeCounty = null;
let taiwanMap;
let projection;
let path;
let zoom;

// 等待 DOM 完全載入後執行
document.addEventListener('DOMContentLoaded', function() {
  // 初始化地圖
  initTaiwanMap();
});

/**
 * 初始化台灣地圖
 */
async function initTaiwanMap() {
  mapContainer = document.getElementById('map-container');
  mapWrapper = document.getElementById('taiwan-map-wrapper');
  
  if (!mapContainer || !mapWrapper) return;
  
  // 載入縣市資料
  await loadCountyData();
  
  // 顯示載入中動畫
  const mapLoader = document.querySelector('.map-loader');
  
  // 建立 D3 地圖
  createD3TaiwanMap();
  
  // 註冊地圖控制事件
  initMapControls();
  
  // 隱藏載入中動畫
  setTimeout(() => {
    if (mapLoader) {
      mapLoader.classList.add('hidden');
      setTimeout(() => {
        mapLoader.remove();
      }, 500);
    }
  }, 1000);
}

/**
 * 載入縣市資料
 */
async function loadCountyData() {
  try {
    // 同時載入 countyData 和 GeoJSON 資料
    const [countyResponse] = await Promise.all([
      fetch('assets/data/counties.json')
    ]);
    
    window.countyData = await countyResponse.json();
    console.log('縣市資料載入完成');
    
  } catch (error) {
    console.error('載入縣市資料失敗:', error);
    // 如果無法從 API 獲取，使用靜態資料作為備用
    window.countyData = {
      'taipei': {
        name: '台北市',
        english: 'Taipei City',
        region: '北部',
        description: '台灣的首都與最大都會區，匯集了現代摩天大樓與傳統廟宇，是政治、經濟、文化中心。以台北101、故宮博物院等景點聞名，美食種類繁多，夜市文化豐富。',
        population: '257萬人',
        area: '272平方公里',
        image: 'https://images.unsplash.com/photo-1470004914212-05527e49370b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
        slogan: '好好玩、好好吃，盡在台北市',
        dialect: '台北腔閩南語較受國語影響，許多字詞和發音相對標準化，語速較快，也融合了較多新詞彙。',
        phrases: [
          { phrase: '哩賀', meaning: '你好' },
          { phrase: '呷飽未', meaning: '吃飽了嗎' },
          { phrase: '袂䆀', meaning: '不錯' }
        ],
        funFact: '台北捷運系統是全球最精準的地鐵系統之一，平均延誤時間少於30秒。',
        attractions: [
          {
            name: '台北101',
            image: 'https://images.unsplash.com/photo-1470004914212-05527e49370b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
            description: '曾為世界最高建築，象徵台灣的國際地標'
          },
          {
            name: '故宮博物院',
            image: 'https://images.unsplash.com/photo-1543951616-ad8c3f150167?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
            description: '收藏中華文化藝術瑰寶的世界級博物館'
          },
          {
            name: '士林夜市',
            image: 'https://images.unsplash.com/photo-1573591980153-2ff96d7fc475?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
            description: '台北最大夜市，集結各式台灣小吃'
          }
        ],
        food: [
          {
            name: '牛肉麵',
            image: 'https://images.unsplash.com/photo-1566112823-dd7f0831a344?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
            description: '台灣國民美食，紅燒或清燉湯頭配上軟嫩牛肉與麵條'
          },
          {
            name: '小籠包',
            image: 'https://images.unsplash.com/photo-1536510233921-8e5043fce771?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
            description: '鼎泰豐等知名餐廳的招牌，皮薄餡多，湯汁豐富'
          },
          {
            name: '臭豆腐',
            image: 'https://plus.unsplash.com/premium_photo-1661687679866-49c7c49303f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
            description: '台灣特色小吃，外酥內嫩，搭配酸甜泡菜'
          }
        ]
      },
      'new-taipei': {
        name: '新北市',
        english: 'New Taipei City',
        region: '北部',
        description: '台灣最大的行政區，環繞台北市，擁有多元的地理環境與觀光資源，從山林到海岸，景色豐富多變。知名景點包括九份、淡水老街和野柳地質公園等。',
        population: '398萬人',
        area: '2,053平方公里',
        image: 'https://images.unsplash.com/photo-1530216320892-87a04fdac84d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
        slogan: '新北 好好玩！',
        dialect: '新北市由於地域廣大，有著多樣的語言腔調，部分地區受客家語影響，沿海地區則有獨特的漁村用語。',
        phrases: [
          { phrase: '蓋厲害', meaning: '很厲害' },
          { phrase: '阿母', meaning: '媽媽' },
          { phrase: '誠好', meaning: '很好' }
        ],
        funFact: '新北市的野柳地質公園中，有著世界聞名的「女王頭」岩石，經過長年海水侵蝕形成。',
        attractions: [
          {
            name: '九份老街',
            image: 'https://images.unsplash.com/photo-1530216320892-87a04fdac84d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
            description: '保留著昔日採金礦的繁華，充滿懷舊氛圍'
          },
          {
            name: '淡水老街',
            image: 'https://images.unsplash.com/photo-1554181544-327915269fe0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
            description: '古色古香的河畔老街，可欣賞淡水河美景'
          },
          {
            name: '野柳地質公園',
            image: 'https://images.unsplash.com/photo-1614247216865-6f10dee6d11a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
            description: '奇特的海蝕地形景觀，著名的女王頭岩石'
          }
        ],
        food: [
          {
            name: '金山鴨肉',
            image: 'https://images.unsplash.com/photo-1598601296625-33cdb6242560?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
            description: '金山名產，皮脆肉嫩，香氣四溢'
          },
          {
            name: '淡水魚丸',
            image: 'https://plus.unsplash.com/premium_photo-1666288720097-5cc3c279922e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
            description: '淡水老街名產，彈牙Q彈，湯頭鮮美'
          },
          {
            name: '三峽碳烤麻糬',
            image: 'https://images.unsplash.com/photo-1593829111886-a40a5f66c4a0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
            description: '三峽老街特色點心，外酥內軟，香甜可口'
          }
        ]
      },
      'taichung': {
        name: '台中市',
        english: 'Taichung City',
        region: '中部',
        description: '台灣中部最大城市，氣候宜人，兼具都市繁華與自然景觀的魅力。以台中國家歌劇院、彩虹眷村、高美濕地等景點聞名，美食文化豐富多元。',
        population: '282萬人',
        area: '2,215平方公里',
        image: 'https://images.unsplash.com/photo-1614247246192-1efa78ce3ee9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
        slogan: '台中，好好玩！',
        dialect: '台中的閩南語被稱為「台語京片子」，有著較為標準的台語發音，也有獨特的中部腔調用語。',
        phrases: [
          { phrase: '食飽未', meaning: '吃飽了嗎' },
          { phrase: '屋卡好', meaning: '家裡好' },
          { phrase: '騎奧多拜', meaning: '騎機車' }
        ],
        funFact: '台中人發明了珍珠奶茶，這項風靡全球的飲品最早起源於台中市的春水堂。',
        attractions: [
          {
            name: '台中國家歌劇院',
            image: 'https://images.unsplash.com/photo-1614247246192-1efa78ce3ee9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
            description: '由日本建築大師伊東豊雄設計的世界級建築'
          },
          {
            name: '高美濕地',
            image: 'https://images.unsplash.com/photo-1614247225073-0b7e20ee1213?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
            description: '特殊的濕地生態系統，以落日美景聞名'
          },
          {
            name: '彩虹眷村',
            image: 'https://images.unsplash.com/photo-1550192952-076b387e8284?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
            description: '七彩繽紛的彩繪村落，充滿藝術氣息'
          }
        ],
        food: [
          {
            name: '太陽餅',
            image: 'https://images.unsplash.com/photo-1505253616051-aa8ba8c694ff?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
            description: '台中名產，酥脆外皮包裹麥芽內餡'
          },
          {
            name: '珍珠奶茶',
            image: 'https://images.unsplash.com/photo-1558857563-b371033873b8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
            description: '源自台中的世界級飲品，Q彈珍珠配上濃郁奶茶'
          },
          {
            name: '逢甲夜市小吃',
            image: 'https://images.unsplash.com/photo-1619144921798-8eb598b3d313?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
            description: '台中最大夜市，集結各式特色美食'
          }
        ]
      },
      'tainan': {
        name: '台南市',
        english: 'Tainan City',
        region: '南部',
        description: '台灣最古老的城市，有「文化古都」之稱，擁有豐富的歷史遺跡與美食。以赤崁樓、安平古堡等古蹟聞名，小吃種類繁多，是台灣美食重鎮。',
        population: '187萬人',
        area: '2,192平方公里',
        image: 'https://images.unsplash.com/photo-1610975127176-d29b976a8241?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
        slogan: '台南，府城，食在安平。',
        dialect: '台南腔調是最傳統道地的閩南語，保留許多古早用語，語調較為緩慢拉長，有著獨特的「台南音」。',
        phrases: [
          { phrase: '古錐', meaning: '可愛' },
          { phrase: '呷甲飽', meaning: '吃得飽' },
          { phrase: '誠好', meaning: '很好' }
        ],
        funFact: '台南有「小吃王國」之稱，據說在台南「從早吃到晚都不會重複同一種小吃」，擁有超過1,000種不同的傳統美食。',
        attractions: [
          {
            name: '安平古堡',
            image: 'https://images.unsplash.com/photo-1610975127176-d29b976a8241?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
            description: '荷蘭人在台灣建立的第一座城堡'
          },
          {
            name: '赤崁樓',
            image: 'https://images.unsplash.com/photo-1533291915038-c52885582a21?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
            description: '荷蘭時期的建築，台南重要古蹟'
          },
          {
            name: '奇美博物館',
            image: 'https://images.unsplash.com/photo-1544031018-ed295b908a41?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
            description: '歐式建築風格的私人博物館，收藏豐富'
          }
        ],
        food: [
          {
            name: '擔仔麵',
            image: 'https://images.unsplash.com/photo-1503764654157-72d979d9af2f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
            description: '源自台南的傳統小吃，小碗麵配上肉燥與蝦仁'
          },
          {
            name: '棺材板',
            image: 'https://plus.unsplash.com/premium_photo-1664201890375-f8fa405cdb7d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
            description: '厚片吐司挖空填入濃湯，造型像棺材而得名'
          },
          {
            name: '碗粿',
            image: 'https://images.unsplash.com/photo-1656368032592-aac5387d1429?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
            description: '米漿蒸煮而成，配上肉燥與香菇'
          }
        ]
      },
      'kaohsiung': {
        name: '高雄市',
        english: 'Kaohsiung City',
        region: '南部',
        description: '台灣南部最大都市，擁有重要港口與工業中心，近年轉型為宜居城市。以蓮池潭、旗津海岸和駁二藝術特區等景點聞名，海鮮美食豐富。',
        population: '276萬人',
        area: '2,952平方公里',
        image: 'https://images.unsplash.com/photo-1582456698045-9ff1f3ffef78?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
        slogan: '高雄，港都之美！',
        dialect: '高雄的閩南語帶有明顯的南部腔調，有些字詞發音與北部不同，也有獨特的港都用語。',
        phrases: [
          { phrase: '乞食', meaning: '窮人' },
          { phrase: '誠好耍', meaning: '很好玩' },
          { phrase: '芳額', meaning: '香氣/聲音' }
        ],
        funFact: '高雄港是台灣最大的國際商港，也是全球第14大貨櫃港，每年處理超過1千萬個貨櫃。',
        attractions: [
          {
            name: '蓮池潭',
            image: 'https://images.unsplash.com/photo-1592319227311-ff3e39bb9fa0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
            description: '風景優美的湖泊，有龍虎塔等景點'
          },
          {
            name: '駁二藝術特區',
            image: 'https://images.unsplash.com/photo-1582456698045-9ff1f3ffef78?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
            description: '由舊倉庫改建的文創園區，藝文活動豐富'
          },
          {
            name: '旗津海岸',
            image: 'https://images.unsplash.com/photo-1627841993258-e8cf98fc7469?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
            description: '美麗的海岸風光，海鮮美食聚集地'
          }
        ],
        food: [
          {
            name: '鹽蒸蝦',
            image: 'https://images.unsplash.com/photo-1623689091232-eb343ea24393?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
            description: '高雄特色海鮮，用粗鹽蒸煮，鮮甜可口'
          },
          {
            name: '小卷米粉',
            image: 'https://images.unsplash.com/photo-1540138067194-ac7e6ffa3542?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
            description: '鮮甜小卷配上軟嫩米粉，湯頭鮮美'
          },
          {
            name: '旗魚黑輪',
            image: 'https://images.unsplash.com/photo-1569050939364-537f93e5c245?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
            description: '旗津名產，旗魚漿製成，外酥內嫩'
          }
        ]
      },
      'hualien': {
        name: '花蓮縣',
        english: 'Hualien County',
        region: '東部',
        description: '台灣東部的美麗縣份，擁有太魯閣國家公園等壯麗自然景觀。以峽谷、海岸線和原住民文化聞名，自然環境保持純淨，是戶外活動的天堂。',
        population: '33萬人',
        area: '4,629平方公里',
        image: 'https://images.unsplash.com/photo-1536436384154-f02506f792d6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
        slogan: '花蓮，台灣最美的後花園！',
        dialect: '花蓮的語言多元，有閩南語、客家話，也有阿美族、太魯閣族等原住民語言，發展出獨特的語言混合現象。',
        phrases: [
          { phrase: '布洛灣', meaning: '太魯閣語，意為陡峭的山崖' },
          { phrase: '阿勒', meaning: '阿美族語，表示招呼或驚訝' },
          { phrase: '奇萊山', meaning: '太魯閣族傳說中的神靈居所' }
        ],
        funFact: '花蓮的七星潭其實不是潭，而是一個新月形的海灣，因為地形如北斗七星而得名。',
        attractions: [
          {
            name: '太魯閣國家公園',
            image: 'https://images.unsplash.com/photo-1536436384154-f02506f792d6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
            description: '驚嘆的峽谷地形與雄偉大理石斷崖'
          },
          {
            name: '七星潭',
            image: 'https://images.unsplash.com/photo-1611061932019-7c41ad213e43?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
            description: '新月形的海灣，有美麗的礫石灘'
          },
          {
            name: '清水斷崖',
            image: 'https://images.unsplash.com/photo-1507579080918-39a730ec6823?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
            description: '雄偉壯觀的海岸斷崖，高度達千公尺'
          }
        ],
        food: [
          {
            name: '麻糬',
            image: 'https://images.unsplash.com/photo-1593829111886-a40a5f66c4a0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
            description: '花蓮著名伴手禮，Q彈軟糯，餡料多樣'
          },
          {
            name: '洄瀾薯',
            image: 'https://images.unsplash.com/photo-1577906096749-a577d6b6d902?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
            description: '花蓮特產，口感鬆軟，香甜可口'
          },
          {
            name: '瑞穗鮮乳',
            image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
            description: '來自花蓮瑞穗地區的鮮乳，香醇濃郁'
          }
        ]
      }
    };
  }
}  

/**
 * 使用 D3.js 建立台灣互動地圖
 */
async function createD3TaiwanMap() {
  // 設定地圖尺寸
  const width = mapWrapper.clientWidth;
  const height = mapWrapper.clientHeight;
  
  // 取得台灣的 GeoJSON 資料
  try {
    // 載入 GeoJSON 資料
    const response = await fetch('assets/data/taiwan.geojson');
    const taiwanGeoJson = await response.json();
    
    // 創建 svg 元素
    mapSvg = d3.select('#taiwan-map-wrapper')
      .append('svg')
      .attr('id', 'taiwan-map')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', [0, 0, width, height])
      .attr('style', 'max-width: 100%; height: auto;');
      
    // 建立地圖投影
    projection = d3.geoMercator()
      .center([121, 23.5]) // 台灣中心經緯度
      .scale(6000)
      .translate([width / 2, height / 2]);
    
    // 建立地理路徑產生器
    path = d3.geoPath().projection(projection);
    
    // 建立縮放行為
    zoom = d3.zoom()
      .scaleExtent([0.8, 5])
      .on('zoom', zoomed);
    
    // 將縮放行為應用在 SVG 上
    mapSvg.call(zoom);
    
    // 創建一個用於群組的 g 元素
    const g = mapSvg.append('g');
    
    // 新增海洋背景
    g.append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', '#e0f2fe');
      
    // 繪製縣市區域
    taiwanMap = g.selectAll('path')
      .data(taiwanGeoJson.features)
      .join('path')
      .attr('d', path)
      .attr('id', d => d.properties.id)
      .attr('class', 'county')
      .attr('data-name', d => d.properties.name)
      .attr('data-region', d => d.properties.region)
      .attr('stroke', 'white')
      .attr('stroke-width', 1)
      .style('fill', d => getRegionColor(d.properties.region))
      .on('click', handleCountyClick)
      .on('mouseenter', handleCountyMouseEnter)
      .on('mouseleave', handleCountyMouseLeave);
    
    // 新增縣市名稱標籤
    g.selectAll('text')
      .data(taiwanGeoJson.features)
      .join('text')
      .attr('x', d => path.centroid(d)[0])
      .attr('y', d => path.centroid(d)[1])
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .attr('fill', '#333')
      .attr('pointer-events', 'none')
      .text(d => d.properties.name)
      .attr('class', 'county-label');

    // 添加指南針
    const compass = g.append('g')
      .attr('class', 'compass')
      .attr('transform', `translate(${width - 50}, 50)`);
      
    compass.append('circle')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', 20)
      .attr('fill', 'white')
      .attr('stroke', '#1a82ff')
      .attr('stroke-width', 2);
      
    compass.append('line')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', 0)
      .attr('y2', -15)
      .attr('stroke', '#1a82ff')
      .attr('stroke-width', 2);
      
    compass.append('polygon')
      .attr('points', '-5,-15 0,-20 5,-15')
      .attr('fill', '#1a82ff');
      
    compass.append('line')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', 15)
      .attr('y2', 0)
      .attr('stroke', '#f97707')
      .attr('stroke-width', 2);
      
    compass.append('polygon')
      .attr('points', '15,-5 20,0 15,5')
      .attr('fill', '#f97707');
      
    compass.append('text')
      .attr('x', 0)
      .attr('y', -25)
      .attr('text-anchor', 'middle')
      .attr('font-size', 10)
      .attr('fill', '#1a82ff')
      .text('N');
      
    compass.append('text')
      .attr('x', 25)
      .attr('y', 0)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', 10)
      .attr('fill', '#f97707')
      .text('E');
    
  } catch (error) {
    console.error('載入地圖資料失敗:', error);
    // 如果無法載入 GeoJSON，則退回到原始方法
    fallbackToSVGMethod();
  }
}

/**
 * 如果 D3 方法失敗，退回到原始 SVG 方法
 */
function fallbackToSVGMethod() {
  console.log('使用備用 SVG 方法');
  
  // 建立 SVG 元素
  let svgMap = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svgMap.setAttribute('id', 'taiwan-map');
  svgMap.setAttribute('viewBox', '0 0 800 1000');
  svgMap.setAttribute('width', '100%');
  svgMap.setAttribute('height', '100%');
  
  // 建立台灣本島縣市路徑
  const countyPaths = {
    // 北部地區
    'taipei': 'M423,180 L450,165 L470,180 L460,200 L430,205 L415,195 Z',
    'new-taipei': 'M380,160 L425,145 L470,160 L485,195 L465,225 L430,240 L400,235 L385,210 L370,190 Z',
    'keelung': 'M450,130 L470,140 L465,160 L445,155 Z',
    'taoyuan': 'M350,180 L390,175 L420,195 L425,220 L410,240 L380,245 L355,230 L340,210 Z',
    'hsinchu-city': 'M330,230 L350,225 L360,245 L340,255 Z',
    'hsinchu-county': 'M310,220 L345,215 L370,235 L375,260 L350,280 L320,270 L300,245 Z',
    'yilan': 'M430,220 L460,215 L490,230 L505,255 L495,280 L465,290 L440,275 L425,250 Z',
    
    // 中部地區
    'miaoli': 'M290,255 L320,250 L345,265 L355,290 L340,315 L315,320 L295,305 L280,280 Z',
    'taichung': 'M265,295 L300,285 L335,295 L360,315 L370,345 L350,370 L325,380 L295,370 L270,345 L255,320 Z',
    'changhua': 'M240,330 L270,325 L290,345 L295,370 L275,385 L250,380 L235,360 Z',
    'nantou': 'M300,345 L335,335 L365,350 L380,380 L375,410 L350,435 L320,440 L300,420 L285,390 L290,365 Z',
    'yunlin': 'M220,370 L255,365 L280,375 L295,395 L285,415 L260,425 L235,420 L220,400 Z',
    
    // 南部地區
    'chiayi-city': 'M230,425 L250,420 L245,435 L225,440 Z',
    'chiayi-county': 'M210,410 L240,400 L265,410 L285,430 L280,455 L255,470 L230,465 L210,445 Z',
    'tainan': 'M200,445 L230,440 L255,450 L270,475 L265,500 L240,515 L215,510 L195,490 Z',
    'kaohsiung': 'M190,490 L225,485 L250,495 L270,520 L275,550 L260,575 L235,585 L210,570 L190,540 L180,510 Z',
    'pingtung': 'M220,560 L245,555 L265,570 L280,600 L270,630 L250,655 L235,650 L220,620 L215,590 Z',
    
    // 東部地區
    'hualien': 'M365,310 L395,300 L420,320 L430,350 L425,385 L400,415 L370,425 L350,410 L340,380 L345,345 Z',
    'taitung': 'M320,430 L350,420 L380,435 L395,465 L390,495 L365,520 L340,525 L320,505 L310,475 L315,450 Z'
  };
  
  // 離島
  const islandCircles = {
    'penghu': { cx: 150, cy: 470, r: 15 },
    'kinmen': { cx: 100, cy: 300, r: 15 },
    'lienchiang': { cx: 100, cy: 120, r: 15 }
  };
  
  // 區域顏色
  const regionColors = {
    'north': '#1a82ff', // 北部 - 藍色
    'central': '#f97707', // 中部 - 橙色
    'south': '#17ad65', // 南部 - 綠色
    'east': '#6c757d', // 東部 - 灰色
    'islands': '#9333ea' // 離島 - 紫色
  };
  
  // 區域對應
  const countyRegions = {
    'taipei': 'north',
    'new-taipei': 'north',
    'keelung': 'north',
    'taoyuan': 'north',
    'hsinchu-city': 'north',
    'hsinchu-county': 'north',
    'yilan': 'north',
    'miaoli': 'central',
    'taichung': 'central',
    'changhua': 'central',
    'nantou': 'central',
    'yunlin': 'central',
    'chiayi-city': 'south',
    'chiayi-county': 'south',
    'tainan': 'south',
    'kaohsiung': 'south',
    'pingtung': 'south',
    'hualien': 'east',
    'taitung': 'east',
    'penghu': 'islands',
    'kinmen': 'islands',
    'lienchiang': 'islands'
  };
  
  // 添加海洋背景
  const ocean = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  ocean.setAttribute('x', '0');
  ocean.setAttribute('y', '0');
  ocean.setAttribute('width', '800');
  ocean.setAttribute('height', '1000');
  ocean.setAttribute('fill', '#e0f2fe');
  svgMap.appendChild(ocean);
  
  // 添加本島縣市
  for (const [id, path] of Object.entries(countyPaths)) {
    const countyEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    countyEl.setAttribute('id', id);
    countyEl.setAttribute('d', path);
    countyEl.setAttribute('data-name', window.countyData[id]?.name || id);
    countyEl.setAttribute('data-region', countyRegions[id]);
    countyEl.classList.add('county');
    
    // 設定縣市初始顏色
    countyEl.style.fill = regionColors[countyRegions[id]];
    
    // 添加點擊事件
    countyEl.addEventListener('click', () => handleCountyClick(null, {properties: {id}}));
    
    // 添加懸浮事件
    countyEl.addEventListener('mouseenter', (e) => {
      // 模擬 D3 事件格式
      handleCountyMouseEnter(e, {properties: {id}});
    });
    countyEl.addEventListener('mouseleave', (e) => {
      // 模擬 D3 事件格式
      handleCountyMouseLeave(e, {properties: {id}});
    });
    
    svgMap.appendChild(countyEl);
  }
  
  // 添加離島
  for (const [id, circle] of Object.entries(islandCircles)) {
    const islandEl = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    islandEl.setAttribute('id', id);
    islandEl.setAttribute('cx', circle.cx);
    islandEl.setAttribute('cy', circle.cy);
    islandEl.setAttribute('r', circle.r);
    islandEl.setAttribute('data-name', window.countyData[id]?.name || id);
    islandEl.setAttribute('data-region', 'islands');
    islandEl.classList.add('county');
    
    // 設定離島顏色
    islandEl.style.fill = regionColors['islands'];
    
    // 添加點擊事件
    islandEl.addEventListener('click', () => handleCountyClick(null, {properties: {id}}));
    
    // 添加懸浮事件
    islandEl.addEventListener('mouseenter', (e) => {
      // 模擬 D3 事件格式
      handleCountyMouseEnter(e, {properties: {id}});
    });
    islandEl.addEventListener('mouseleave', (e) => {
      // 模擬 D3 事件格式
      handleCountyMouseLeave(e, {properties: {id}});
    });
    
    svgMap.appendChild(islandEl);
  }
  
  // 添加縣市名稱標籤
  const countyLabels = {
    'taipei': { x: 430, y: 185, text: '台北' },
    'new-taipei': { x: 405, y: 200, text: '新北' },
    'keelung': { x: 455, y: 145, text: '基隆' },
    'taoyuan': { x: 375, y: 210, text: '桃園' },
    'hsinchu-city': { x: 345, y: 240, text: '新竹' },
    'yilan': { x: 465, y: 250, text: '宜蘭' },
    'miaoli': { x: 320, y: 280, text: '苗栗' },
    'taichung': { x: 310, y: 330, text: '台中' },
    'changhua': { x: 260, y: 355, text: '彰化' },
    'nantou': { x: 330, y: 385, text: '南投' },
    'yunlin': { x: 250, y: 390, text: '雲林' },
    'chiayi-city': { x: 235, y: 435, text: '嘉義' },
    'tainan': { x: 230, y: 475, text: '台南' },
    'kaohsiung': { x: 225, y: 535, text: '高雄' },
    'pingtung': { x: 250, y: 605, text: '屏東' },
    'hualien': { x: 395, y: 360, text: '花蓮' },
    'taitung': { x: 350, y: 480, text: '台東' },
    'penghu': { x: 150, y: 475, text: '澎湖' },
    'kinmen': { x: 100, y: 305, text: '金門' },
    'lienchiang': { x: 100, y: 125, text: '馬祖' }
  };
  
  // 添加縣市標籤文字
  for (const [id, label] of Object.entries(countyLabels)) {
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', label.x);
    text.setAttribute('y', label.y);
    text.setAttribute('font-size', '12');
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('fill', '#333');
    text.setAttribute('pointer-events', 'none');
    text.classList.add('county-label');
    text.textContent = label.text;
    
    // 小螢幕隱藏標籤
    if (window.innerWidth < 768) {
      text.style.display = 'none';
    }
    
    svgMap.appendChild(text);
  }
  
  // 將地圖添加到容器
  mapWrapper.appendChild(svgMap);
}

/**
 * 初始化地圖控制元件
 */
function initMapControls() {
  const zoomInBtn = document.getElementById('zoom-in');
  const zoomOutBtn = document.getElementById('zoom-out');
  const resetMapBtn = document.getElementById('reset-map');
  
  if (zoomInBtn) {
    zoomInBtn.addEventListener('click', () => {
      if (zoom && mapSvg) {
        mapSvg.transition().duration(300).call(zoom.scaleBy, 1.2);
      } else {
        zoomMap(0.2);
      }
    });
  }
  
  if (zoomOutBtn) {
    zoomOutBtn.addEventListener('click', () => {
      if (zoom && mapSvg) {
        mapSvg.transition().duration(300).call(zoom.scaleBy, 0.8);
      } else {
        zoomMap(-0.2);
      }
    });
  }
  
  if (resetMapBtn) {
    resetMapBtn.addEventListener('click', () => {
      if (zoom && mapSvg) {
        mapSvg.transition().duration(500).call(
          zoom.transform,
          d3.zoomIdentity
        );
      } else {
        resetMap();
      }
    });
  }
}

/**
 * 處理D3地圖縮放
 */
function zoomed(event) {
  const {transform} = event;
  const g = d3.select('#taiwan-map-wrapper svg g');
  g.attr('transform', transform);
  g.selectAll('path').attr('stroke-width', 1 / transform.k);
  g.selectAll('text').style('font-size', `${10 / transform.k}px`);
}

/**
 * 獲取區域顏色
 * @param {string} region - 區域標識
 * @return {string} - 顏色值
 */
function getRegionColor(region) {
  const regionColors = {
    'north': '#1a82ff', // 北部 - 藍色
    'central': '#f97707', // 中部 - 橙色
    'south': '#17ad65', // 南部 - 綠色
    'east': '#6c757d', // 東部 - 灰色
    'islands': '#9333ea' // 離島 - 紫色
  };
  
  return regionColors[region] || '#6c757d';
}

/**
 * 處理縣市滑鼠懸停事件
 * @param {Event} event - 事件對象
 * @param {Object} d - D3 資料對象
 */
function handleCountyMouseEnter(event, d) {
  // 高亮縣市
  d3.select(event.currentTarget)
    .transition()
    .duration(200)
    .attr('stroke-width', 1.5)
    .style('filter', 'drop-shadow(0 2px 3px rgba(0, 0, 0, 0.2))')
    .attr('cursor', 'pointer');
    
  // 創建懸浮提示
  createTooltip(event, d.properties.id);
}

/**
 * 處理縣市滑鼠離開事件
 * @param {Event} event - 事件對象
 * @param {Object} d - D3 資料對象
 */
function handleCountyMouseLeave(event, d) {
  // 如果不是當前選中的縣市，恢復原樣式
  if (activeCounty !== d.properties.id) {
    d3.select(event.currentTarget)
      .transition()
      .duration(200)
      .attr('stroke-width', 1)
      .style('filter', null);
  }
  
  // 移除懸浮提示
  removeTooltip();
}

/**
 * 縮放地圖
 * @param {number} delta - 縮放增量
 */
function zoomMap(delta) {
  const newScale = Math.min(Math.max(0.8, currentScale + delta), 2.5);
  
  // 計算縮放前後的比例
  const scaleFactor = newScale / currentScale;
  
  // 調整平移量，使縮放保持在中心
  translateX = translateX * scaleFactor;
  translateY = translateY * scaleFactor;
  
  currentScale = newScale;
  
  updateMapTransform();
}

/**
 * 更新地圖變換
 */
function updateMapTransform() {
  const svgMap = document.getElementById('taiwan-map');
  if (svgMap) {
    svgMap.style.transform = `matrix(${currentScale}, 0, 0, ${currentScale}, ${translateX}, ${translateY})`;
  }
}

/**
 * 重置地圖位置與縮放
 */
function resetMap() {
  currentScale = 1;
  translateX = 0;
  translateY = 0;
  
  updateMapTransform();
}

/**
 * 處理縣市懸浮效果 (用於備用模式)
 * @param {Event} e - 事件對象
 * @param {string} countyId - 縣市ID
 * @param {boolean} isEnter - 是否為滑鼠進入事件
 */
function handleCountyHover(e, countyId, isEnter) {
  const county = document.getElementById(countyId);
  
  if (isEnter) {
    // 創建懸浮提示
    createTooltip(e, countyId);
    
    // 滑鼠游標改為指示
    county.style.cursor = 'pointer';
  } else {
    // 移除懸浮提示
    removeTooltip();
    
    // 如果該縣市不是當前選中的，恢復原本顏色
    if (activeCounty !== countyId) {
      resetCountyStyle(county);
    }
  }
}

/**
 * 創建懸浮提示
 * @param {Event} e - 事件對象
 * @param {string} countyId - 縣市ID
 */
function createTooltip(e, countyId) {
  // 移除現有提示
  removeTooltip();
  
  // 獲取縣市名稱
  const countyName = window.countyData[countyId]?.name || document.getElementById(countyId).getAttribute('data-name');
  
  // 創建提示元素
  const tooltip = document.createElement('div');
  tooltip.className = 'county-tooltip';
  tooltip.textContent = countyName;
  
  // 設置提示位置
  tooltip.style.left = `${e.clientX || e.pageX}px`;
  tooltip.style.top = `${e.clientY || e.pageY}px`;
  
  // 添加到文檔
  document.body.appendChild(tooltip);
  
  // 移動滑鼠時更新提示位置
  document.addEventListener('mousemove', updateTooltipPosition);
}

/**
 * 更新懸浮提示位置
 * @param {Event} e - 事件對象
 */
function updateTooltipPosition(e) {
  const tooltip = document.querySelector('.county-tooltip');
  if (tooltip) {
    tooltip.style.left = `${e.clientX || e.pageX}px`;
    tooltip.style.top = `${e.clientY || e.pageY}px`;
  }
}

/**
 * 移除懸浮提示
 */
function removeTooltip() {
  const tooltip = document.querySelector('.county-tooltip');
  if (tooltip) {
    tooltip.remove();
    document.removeEventListener('mousemove', updateTooltipPosition);
  }
}

/**
 * 處理縣市點擊事件 (D3版本)
 * @param {Event} event - 事件對象
 * @param {Object} d - D3 資料對象
 */
function handleCountyClick(event, d) {
  const countyId = d.properties.id;
  
  // 如果已有活躍縣市，移除其高亮
  if (activeCounty && activeCounty !== countyId) {
    d3.select(`#${activeCounty}`)
      .transition()
      .duration(300)
      .style('fill', d => getRegionColor(d3.select(`#${activeCounty}`).attr('data-region')))
      .attr('stroke-width', 1)
      .style('filter', null);
  }
  
  // 更新活躍縣市
  activeCounty = countyId;
  
  // 高亮當前縣市
  d3.select(event.currentTarget)
    .transition()
    .duration(300)
    .style('fill', '#f97707')
    .attr('stroke-width', 1.5)
    .style('filter', 'drop-shadow(0 4px 4px rgba(0, 0, 0, 0.25))');
  
  // 顯示縣市信息
  showCountyInfo(countyId);
  
  // 移除懸浮提示
  removeTooltip();
}

/**
 * 顯示縣市詳細資訊
 * @param {string} countyId - 縣市ID
 */
function showCountyInfo(countyId) {
  // 獲取縣市資料
  const countyData = window.countyData[countyId];
  
  if (!countyData) {
    console.error(`未找到縣市資料: ${countyId}`);
    return;
  }
  
  // 獲取DOM元素
  const mapInstructions = document.getElementById('map-instructions');
  const countyDetails = document.getElementById('county-details');
  
  // 隱藏指引，顯示縣市詳情
  if (mapInstructions && countyDetails) {
    mapInstructions.style.display = 'none';
    countyDetails.style.display = 'flex';
  }
  
  // 更新縣市基本資訊
  document.getElementById('county-name').textContent = countyData.name;
  document.getElementById('county-english').textContent = countyData.english;
  document.getElementById('county-region').textContent = countyData.region + '地區';
  document.getElementById('county-description').textContent = countyData.description;
  document.getElementById('county-population').textContent = countyData.population;
  document.getElementById('county-area').textContent = countyData.area;
  
  // 更新縣市圖片
  document.getElementById('county-image').src = countyData.image;
  document.getElementById('county-slogan').textContent = countyData.slogan;
  
  // 更新景點資訊
  const attractionsContainer = document.getElementById('county-attractions');
  attractionsContainer.innerHTML = '';
  
  countyData.attractions.forEach(attraction => {
    const attractionCard = document.createElement('div');
    attractionCard.className = 'bg-white rounded-xl shadow-sm overflow-hidden flex hover:shadow-md transition-shadow';
    
    attractionCard.innerHTML = `
      <div class="w-1/3">
        <img src="${attraction.image}" alt="${attraction.name}" class="w-full h-full object-cover">
      </div>
      <div class="w-2/3 p-3">
        <h4 class="font-medium text-neutral-800">${attraction.name}</h4>
        <p class="text-sm text-neutral-600 mt-1">${attraction.description}</p>
      </div>
    `;
    
    attractionsContainer.appendChild(attractionCard);
  });
  
  // 更新美食資訊
  const foodContainer = document.getElementById('county-food');
  foodContainer.innerHTML = '';
  
  countyData.food.forEach(food => {
    const foodCard = document.createElement('div');
    foodCard.className = 'bg-white rounded-xl shadow-sm overflow-hidden flex hover:shadow-md transition-shadow';
    
    foodCard.innerHTML = `
      <div class="w-1/3">
        <img src="${food.image}" alt="${food.name}" class="w-full h-full object-cover">
      </div>
      <div class="w-2/3 p-3">
        <h4 class="font-medium text-neutral-800">${food.name}</h4>
        <p class="text-sm text-neutral-600 mt-1">${food.description}</p>
      </div>
    `;
    
    foodContainer.appendChild(foodCard);
  });
  
  // 更新方言文化資訊
  document.getElementById('county-dialect').textContent = countyData.dialect;
  
  const phrasesContainer = document.getElementById('county-phrases');
  phrasesContainer.innerHTML = '';
  
  countyData.phrases.forEach(phrase => {
    const phraseItem = document.createElement('div');
    phraseItem.className = 'dialect-bubble';
    phraseItem.innerHTML = `
      <p class="font-medium">${phrase.phrase}</p>
      <p class="text-sm text-neutral-500">${phrase.meaning}</p>
    `;
    
    phrasesContainer.appendChild(phraseItem);
  });
  
  document.getElementById('county-fun-fact').textContent = countyData.funFact;
  
  // 添加淡入效果
  const elements = [
    document.getElementById('county-name'),
    document.getElementById('county-english'),
    document.getElementById('county-region'),
    document.getElementById('county-image-container'),
    document.getElementById('county-description'),
    ...document.querySelectorAll('.county-tab-content > div > *')
  ];
  
  elements.forEach((element, index) => {
    if (element) {
      element.style.opacity = '0';
      element.style.transform = 'translateY(10px)';
      
      setTimeout(() => {
        element.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
      }, 50 * index);
    }
  });
}

// 導出公共函數，供其他模組使用
window.taiwanMap = {
  zoomMap,
  resetMap,
  showCountyInfo,
  getCountyFromLatLng(lat, lng) {
    if (!projection) return null;
    
    const point = projection([lng, lat]);
    const countiesData = d3.selectAll('.county').data();
    
    for (const county of countiesData) {
      if (d3.geoContains(county, [lng, lat])) {
        return county.properties.id;
      }
    }
    
    return null;
  }
};
