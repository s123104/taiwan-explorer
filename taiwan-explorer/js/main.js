/**
 * 台灣互動地圖專案 - 主要腳本
 * 版本: 1.0.0
 * 開發者: UI/UX 設計團隊
 * 日期: 2025-05-12
 */

// 等待 DOM 完全載入後執行
document.addEventListener('DOMContentLoaded', function() {
  // 初始化網站功能
  initSite();
});

/**
 * 網站初始化
 */
function initSite() {
  // 顯示載入畫面
  const loadingOverlay = document.getElementById('loading-overlay');
  
  // 當頁面載入完成後，延遲移除載入畫面
  window.addEventListener('load', function() {
    setTimeout(function() {
      if (loadingOverlay) {
        loadingOverlay.classList.add('hidden');
        setTimeout(() => {
          loadingOverlay.style.display = 'none';
        }, 600);
      }
    }, 1000);
  });
  
  // 初始化導航欄
  initNavigation();
  
  // 初始化滾動動畫
  initScrollAnimations();
  
  // 初始化導航指示器
  initSectionIndicator();
  
  // 初始化選項卡
  initTabs();
  
  // 初始化彩蛋功能
  initEasterEgg();
  
  // 初始化回到頂部按鈕
  initBackToTop();
}

/**
 * 初始化導航欄功能
 */
function initNavigation() {
  const mainNav = document.getElementById('main-nav');
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  
  // 滾動時改變導航欄樣式
  window.addEventListener('scroll', function() {
    if (window.scrollY > 50) {
      mainNav.classList.add('scrolled');
    } else {
      mainNav.classList.remove('scrolled');
    }
  });
  
  // 觸發初始檢查
  window.dispatchEvent(new Event('scroll'));
  
  // 行動版選單切換
  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', function() {
      mobileMenu.classList.toggle('hidden');
    });
    
    // 點擊行動版選單項目後關閉選單
    const mobileMenuItems = mobileMenu.querySelectorAll('a');
    mobileMenuItems.forEach(item => {
      item.addEventListener('click', function() {
        mobileMenu.classList.add('hidden');
      });
    });
  }
  
  // 點擊頁面其他地方關閉行動版選單
  document.addEventListener('click', function(e) {
    if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
      if (!mobileMenu.contains(e.target) && e.target !== mobileMenuBtn) {
        mobileMenu.classList.add('hidden');
      }
    }
  });
  
  // 平滑捲動
  const scrollLinks = document.querySelectorAll('a[href^="#"]');
  scrollLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      e.preventDefault();
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        const topOffset = mainNav.offsetHeight;
        const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - topOffset;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

/**
 * 初始化滾動動畫
 */
function initScrollAnimations() {
  // 使用 Intersection Observer API 監測元素進入視窗
  const fadeElements = document.querySelectorAll('.fade-in-section');
  
  if (fadeElements.length === 0) return;
  
  const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        fadeObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -100px 0px'
  });
  
  fadeElements.forEach(element => {
    fadeObserver.observe(element);
  });
  
  // 添加 fade-in-section 類別到所有需要動畫的元素
  const sections = document.querySelectorAll('section > div > div');
  sections.forEach(section => {
    if (!section.classList.contains('fade-in-section')) {
      section.classList.add('fade-in-section');
      fadeObserver.observe(section);
    }
  });
}

/**
 * 初始化導航指示器
 */
function initSectionIndicator() {
  // 檢查是否需要建立導航指示器
  if (window.innerWidth < 1024) return;
  
  // 獲取所有主要章節
  const sections = [
    { id: 'hero', label: '首頁' },
    { id: 'map-section', label: '互動地圖' },
    { id: 'regions-section', label: '區域特色' },
    { id: 'culture-section', label: '文化體驗' },
    { id: 'travel-section', label: '旅遊規劃' },
    { id: 'about-taiwan', label: '關於台灣' }
  ];
  
  // 建立導航指示器容器
  const indicatorContainer = document.createElement('div');
  indicatorContainer.className = 'section-indicator';
  
  // 為每個章節建立指示點
  sections.forEach(section => {
    const dot = document.createElement('div');
    dot.className = 'section-indicator-dot';
    dot.setAttribute('data-section', section.id);
    dot.setAttribute('title', section.label);
    
    // 點擊時滾動至對應章節
    dot.addEventListener('click', () => {
      const targetSection = document.getElementById(section.id);
      if (targetSection) {
        const topOffset = document.getElementById('main-nav').offsetHeight;
        const targetPosition = targetSection.getBoundingClientRect().top + window.pageYOffset - topOffset;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
    
    indicatorContainer.appendChild(dot);
  });
  
  // 添加至文檔
  document.body.appendChild(indicatorContainer);
  
  // 監測滾動位置，更新當前指示點
  window.addEventListener('scroll', updateSectionIndicator);
  
  // 初始更新
  updateSectionIndicator();
  
  // 更新指示點高亮
  function updateSectionIndicator() {
    const scrollPosition = window.scrollY + window.innerHeight / 2;
    
    sections.forEach(section => {
      const element = document.getElementById(section.id);
      if (!element) return;
      
      const dot = document.querySelector(`.section-indicator-dot[data-section="${section.id}"]`);
      if (!dot) return;
      
      const elementTop = element.offsetTop;
      const elementBottom = elementTop + element.offsetHeight;
      
      if (scrollPosition >= elementTop && scrollPosition < elementBottom) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
  }
}

/**
 * 初始化選項卡切換
 */
function initTabs() {
  // 縣市資訊選項卡
  const countyTabs = document.querySelectorAll('.county-tab');
  const countyPanels = document.querySelectorAll('.tab-panel');
  
  countyTabs.forEach(tab => {
    tab.addEventListener('click', function() {
      const tabId = this.getAttribute('data-tab');
      
      // 移除所有選項卡的活躍狀態
      countyTabs.forEach(tab => tab.classList.remove('active'));
      countyPanels.forEach(panel => panel.classList.add('hidden'));
      
      // 添加當前選項卡的活躍狀態
      this.classList.add('active');
      document.getElementById(`tab-${tabId}`).classList.remove('hidden');
    });
  });
  
  // 旅遊路線選項卡
  const routeTabs = document.querySelectorAll('.route-tab');
  const routePanels = document.querySelectorAll('.route-panel');
  
  routeTabs.forEach(tab => {
    tab.addEventListener('click', function() {
      const routeId = this.getAttribute('data-route');
      
      // 移除所有選項卡的活躍狀態
      routeTabs.forEach(tab => tab.classList.remove('active'));
      routePanels.forEach(panel => panel.classList.add('hidden'));
      
      // 添加當前選項卡的活躍狀態
      this.classList.add('active');
      document.getElementById(`route-${routeId}`).classList.remove('hidden');
    });
  });
}

/**
 * 初始化彩蛋功能
 */
function initEasterEgg() {
  const easterEggButton = document.getElementById('easter-egg-button');
  const easterEggModal = document.getElementById('easter-egg-modal');
  const closeEasterEggButton = document.getElementById('close-easter-egg');
  const easterEggImage = document.getElementById('easter-egg-image');
  const easterEggText = document.getElementById('easter-egg-text');
  
  if (!easterEggButton || !easterEggModal) return;
  
  // 彩蛋內容
  const easterEggContent = [
    {
      image: 'https://images.unsplash.com/photo-1470004914212-05527e49370b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
      text: '台灣有全世界最高密度的便利商店分布，平均每1.5平方公里就有一家，讓人們的生活非常便利！'
    },
    {
      image: 'https://images.unsplash.com/photo-1583116938968-2eb570ecbf18?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
      text: '台灣的日月潭是台灣最大的天然湖泊，有「高山上的藍寶石」之稱，四季景色各異，是台灣最著名的景點之一。'
    },
    {
      image: 'https://images.unsplash.com/photo-1552958497-1a3ea775a0c6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
      text: '台灣是世界上唯一可以在同一天內完成「在雪地堆雪人、在平地踏青、在海邊玩水」這三件事的地方，從雪山到海洋只需幾小時。'
    },
    {
      image: 'https://images.unsplash.com/photo-1536436384154-f02506f792d6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
      text: '台灣的太魯閣峽谷是亞洲最深的峽谷之一，以其大理石峭壁和壯麗的地質景觀聞名。'
    },
    {
      image: 'https://images.unsplash.com/photo-1504231044540-40b30461df1a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
      text: '台灣夜市文化享譽全球，全台有超過70個知名夜市，是體驗台灣美食與文化的最佳場所。'
    }
  ];
  
  let clickCount = 0;
  let lastClickTime = 0;
  
  // 點擊彩蛋按鈕
  easterEggButton.addEventListener('click', function() {
    const now = Date.now();
    
    // 檢測快速連續點擊
    if (now - lastClickTime < 500) {
      clickCount++;
    } else {
      clickCount = 1;
    }
    
    lastClickTime = now;
    
    // 連續點擊三次顯示彩蛋
    if (clickCount >= 3) {
      clickCount = 0;
      showRandomEasterEgg();
    }
  });
  
  // 關閉彩蛋
  closeEasterEggButton.addEventListener('click', function() {
    easterEggModal.classList.add('hidden');
  });
  
  // 點擊遮罩關閉彩蛋
  easterEggModal.addEventListener('click', function(e) {
    if (e.target === easterEggModal) {
      easterEggModal.classList.add('hidden');
    }
  });
  
  // 顯示隨機彩蛋
  function showRandomEasterEgg() {
    // 隨機選擇一個彩蛋內容
    const randomContent = easterEggContent[Math.floor(Math.random() * easterEggContent.length)];
    
    // 更新彩蛋內容
    easterEggImage.src = randomContent.image;
    easterEggText.textContent = randomContent.text;
    
    // 顯示彩蛋
    easterEggModal.classList.remove('hidden');
    easterEggModal.classList.add('flex');
  }
}

/**
 * 初始化回到頂部按鈕
 */
function initBackToTop() {
  const backToTopButton = document.getElementById('back-to-top');
  
  if (!backToTopButton) return;
  
  // 滾動時顯示/隱藏按鈕
  window.addEventListener('scroll', function() {
    if (window.scrollY > 500) {
      backToTopButton.classList.add('visible');
    } else {
      backToTopButton.classList.remove('visible');
    }
  });
  
  // 點擊回到頂部
  backToTopButton.addEventListener('click', function() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

// 導出供其他模組使用的功能
window.mainApp = {
  showAlert: function(message) {
    alert(message);
  },
  
  showLoading: function() {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
      loadingOverlay.classList.remove('hidden');
      loadingOverlay.style.display = 'flex';
    }
  },
  
  hideLoading: function() {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
      loadingOverlay.classList.add('hidden');
      setTimeout(() => {
        loadingOverlay.style.display = 'none';
      }, 600);
    }
  }
};
