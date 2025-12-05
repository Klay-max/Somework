document.addEventListener("DOMContentLoaded", function() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  const projectsData = [
    {
      id: 'khanmigo-details',
      title: 'Khanmigo 深度剖析',
      category: '教育产品分析',
      description: '基于原创评估框架，系统化剖析 Khanmigo 的教学法与产品价值。',
      image: 'pictures/cover1.jpeg',
      tags: ['分析框架','苏格拉底教学','教育科技'],
      detailsHtml: '<div class="detail-header"><h2>Khanmigo 深度剖析</h2><div class="project-category">教育产品分析</div></div><div class="project-detail"><div class="detail-section"><h4>综述</h4><p>从对话策略、提示工程与学习路径三维度评估产品的教学有效性与可扩展性。</p><div class="detail-list"><div>对话策略：渐进式提问与反思</div><div>提示工程：结构化模板与安全防护</div><div>学习路径：任务分层与反馈闭环</div></div><div class="detail-actions"><a class="btn btn-primary" href="thought/khanmigo_review.html">进入项目</a></div></div><div class="detail-section detail-media"><img src="pictures/cover1.jpeg" alt="Khanmigo"/></div></div>'
    },
    {
      id: 'socrates-details',
      title: '苏格拉底机器人',
      category: '交互式机器人',
      description: '与“苏格拉底”进行思维对话，严格遵循不直接给答案的引导式交互。',
      image: 'pictures/cover2.jpeg',
      tags: ['LLM','交互设计','教学引导'],
      detailsHtml: '<div class="detail-header"><h2>苏格拉底机器人</h2><div class="project-category">交互式机器人</div></div><div class="project-detail"><div class="detail-section"><h4>交互原则</h4><div class="detail-list"><div>不直接给答案</div><div>递进式提问</div><div>反思与总结</div></div><div class="detail-actions"><a class="btn btn-primary" href="practice/index.html">进入项目</a></div></div><div class="detail-section detail-media"><img src="pictures/cover2.jpeg" alt="Socrates"/></div></div>'
    },
    {
      id: 'course-gen-details',
      title: '智能课程架构师',
      category: '课程工具',
      description: '输入主题自动生成课程大纲的前端工具，支持响应式与可读性优化。',
      image: 'pictures/cover3.jpeg',
      tags: ['课程设计','前端工具','教育产品'],
      detailsHtml: '<div class="detail-header"><h2>智能课程架构师</h2><div class="project-category">课程工具</div></div><div class="project-detail"><div class="detail-section"><h4>能力点</h4><div class="detail-list"><div>主题解析</div><div>章节生成</div><div>导出优化</div></div><p>围绕课程目标自动组织层级结构与评价点，支持导出与复用。</p><div class="detail-actions"><a class="btn btn-primary" href="vision/portfolio/projects/course-gen/index.html">进入项目</a></div></div><div class="detail-section detail-media"><img src="pictures/cover3.jpeg" alt="Course Generator"/></div></div>'
    }
  ];

  function setupActiveNav() {
    const links = Array.from(document.querySelectorAll('.nav-links a'));
    const sections = links.map(a => {
      const id = a.getAttribute('href').replace('#','');
      return document.getElementById(id);
    }).filter(Boolean);
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const id = entry.target.id;
        const link = document.querySelector('.nav-links a[href="#' + id + '"]');
        if (!link) return;
        if (entry.isIntersecting) {
          links.forEach(l => { l.classList.remove('active'); l.removeAttribute('aria-current'); });
          link.classList.add('active');
          link.setAttribute('aria-current','page');
        }
      });
    }, { rootMargin: '-40% 0px -50% 0px', threshold: 0 });
    sections.forEach(sec => observer.observe(sec));
  }

  function prefetchOnHover() {
    const head = document.head;
    const added = new Set();
    document.querySelectorAll('.project-card[data-project-id]').forEach(card => {
      card.addEventListener('mouseenter', () => {
        const id = card.getAttribute('data-project-id');
        const p = projectsData.find(x => x.id === id);
        if (!p) return;
        try {
          const doc = new DOMParser().parseFromString(p.detailsHtml, 'text/html');
          const a = doc.querySelector('a[href]');
          const href = a && a.getAttribute('href');
          if (href && !added.has(href)) {
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.href = href;
            head.appendChild(link);
            added.add(href);
          }
        } catch (_) {}
      }, { once: true });
    });
  }

  function renderProjects() {
    const grid = document.querySelector('.project-grid');
    if (!grid) return;
    grid.innerHTML = projectsData.map(p => (
      '<div class="project-card gsap-reveal-scale" data-project-id="' + p.id + '" role="button" tabindex="0">' +
        '<div class="project-image">' +
          '<img src="' + p.image + '" alt="' + p.title + '" loading="lazy" decoding="async" width="300" height="225" />' +
        '</div>' +
        '<div class="project-content">' +
          '<div class="project-category">' + p.category + '</div>' +
          '<h3 class="project-title">' + p.title + '</h3>' +
          '<p class="project-description">' + p.description + '</p>' +
          '<div class="project-tags">' + p.tags.map(t => '<span class="project-tag">' + t + '</span>').join('') + '</div>' +
        '</div>' +
      '</div>'
    )).join('');
  }

  if (!prefersReducedMotion) {
    gsap.registerPlugin(ScrollTrigger);

    function startHero() {
      const tagEl = document.querySelector('.tagline');
      if (tagEl) {
        const words = tagEl.textContent.trim().split(' ');
        tagEl.innerHTML = words.map(w => '<span class="tag-word">' + w + '&nbsp;</span>').join('');
      }
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      gsap.set([".main-title"], { y: 60, opacity: 0 });
      gsap.set([".tag-word"], { y: '100%', opacity: 0 });
      gsap.set(".highlight-item", { y: 30, opacity: 0 });
      const d1 = isMobile ? 0.8 : 1;
      const d2 = isMobile ? 0.5 : 0.6;
      const d3 = isMobile ? 0.6 : 0.8;
      tl.to(".main-title", { opacity: 1, y: 0, duration: d1 })
        .fromTo(".tag-word", { y: '100%', opacity: 0 }, { y: '0%', opacity: 1, duration: d2, stagger: 0.05 }, "-=0.4")
        .to(".highlight-item", { opacity: 1, y: 0, stagger: 0.12, duration: d3 }, "-=0.2");
    }

    const loaderEl = document.querySelector('.page-loader');
    const loaderLines = document.querySelectorAll('.loader-line');
    if (loaderEl && loaderLines.length) {
      loaderLines.forEach(line => {
        const words = line.textContent.trim().split(' ');
        line.innerHTML = words.map(w => '<span class="loader-word">' + w + '&nbsp;</span>').join('');
      });
      const ltl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      ltl.fromTo('.loader-word', { y: '100%', opacity: 0 }, { y: '0%', opacity: 1, stagger: 0.08, duration: 0.8 })
         .to('.loader-lines', { y: -10, duration: 0.6, ease: 'power2.out' })
         .to('.loader-word', { y: '-120%', opacity: 0, stagger: -0.06, duration: 0.6, ease: 'power2.in' })
         .to('.page-loader', { y: '-100%', duration: 1, ease: 'power4.inOut' })
         .set('.page-loader', { display: 'none' })
         .add(startHero);
    } else {
      startHero();
    }

    gsap.utils.toArray('.gsap-reveal-from-bottom').forEach(elem => {
      gsap.fromTo(elem, { opacity: 0, y: 40 }, {
        opacity: 1,
        y: 0,
        duration: isMobile ? 0.8 : 1,
        ease: "power3.out",
        scrollTrigger: { trigger: elem, start: isMobile ? "top 90%" : "top 85%", toggleActions: "play none none none" }
      });
    });

    gsap.utils.toArray('.gsap-reveal-scale').forEach(elem => {
      gsap.fromTo(elem, { opacity: 0, scale: 0.94 }, {
        opacity: 1,
        scale: 1,
        duration: isMobile ? 0.9 : 1.2,
        ease: "power3.out",
        scrollTrigger: { trigger: elem, start: isMobile ? "top 90%" : "top 85%", toggleActions: "play none none none" }
      });
    });

    const stickyNav = document.querySelector('.sticky-nav');
    ScrollTrigger.create({
      start: 0,
      end: 99999,
      onUpdate: self => {
        if (self.scroll() > 100) {
          stickyNav.classList.add('is-sticky');
        } else {
          stickyNav.classList.remove('is-sticky');
        }
      }
    });
  }

  const modalOverlay = document.getElementById('details-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalBody = document.getElementById('modal-body-content');
  const bodyEl = document.body;
  const focusableSelector = 'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, [tabindex]:not([tabindex="-1"]), [contenteditable="true"]';

  window.showModal = function(targetId) {
    const p = projectsData.find(x => x.id === targetId);
    if (!p) return;
    modalBody.innerHTML = p.detailsHtml;
    const titleEl = modalBody.querySelector('h2');
    if (titleEl) { titleEl.id = 'details-title'; modalOverlay.setAttribute('aria-labelledby', 'details-title'); }
    modalOverlay.classList.add('is-active');
    bodyEl.classList.add('modal-open');
    modalCloseBtn.focus();
    if (!prefersReducedMotion) {
      const tl = gsap.timeline();
      tl.fromTo('.modal-overlay', { opacity: 0 }, { opacity: 1, duration: 0.2, ease: 'power1.out' })
        .fromTo('.modal-content', { y: 60, scale: 0.9, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: isMobile ? 0.4 : 0.5, ease: 'back.out(1.4)' }, '<');
    }
    const focusable = modalOverlay.querySelectorAll(focusableSelector);
    const firstFocusable = focusable[0];
    const lastFocusable = focusable[focusable.length - 1];
    function handleTabTrap(e) {
      if (e.key !== 'Tab') return;
      if (e.shiftKey && document.activeElement === firstFocusable) { e.preventDefault(); lastFocusable.focus(); }
      else if (!e.shiftKey && document.activeElement === lastFocusable) { e.preventDefault(); firstFocusable.focus(); }
    }
    modalOverlay.addEventListener('keydown', handleTabTrap);
  };

  function hideModal() {
    if (!prefersReducedMotion) {
      gsap.to('.modal-content', { y: 40, scale: 0.95, opacity: 0, duration: isMobile ? 0.2 : 0.25, ease: 'back.in(1.2)', onComplete: () => { modalOverlay.classList.remove('is-active'); bodyEl.classList.remove('modal-open'); } });
    } else {
      modalOverlay.classList.remove('is-active');
      bodyEl.classList.remove('modal-open');
    }
  }

  modalCloseBtn.addEventListener('click', hideModal);
  modalOverlay.addEventListener('click', (event) => { if (event.target === modalOverlay) { hideModal(); } });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && modalOverlay.classList.contains('is-active')) { hideModal(); } });
  let touchStartY = 0;
  let dragging = false;
  modalOverlay.addEventListener('touchstart', (e) => { touchStartY = e.touches[0].clientY; dragging = true; });
  modalOverlay.addEventListener('touchmove', (e) => {
    if (!dragging) return;
    const dy = e.touches[0].clientY - touchStartY;
    if (dy > 0) { gsap.set('.modal-content', { y: dy * 0.4 }); }
  });
  modalOverlay.addEventListener('touchend', (e) => {
    dragging = false;
    const endY = e.changedTouches[0].clientY;
    const dy = endY - touchStartY;
    if (dy > 100) { hideModal(); }
    else { gsap.to('.modal-content', { y: 0, duration: 0.25, ease: 'power3.out' }); }
  });

  renderProjects();
  setupActiveNav();
  prefetchOnHover();
  const cards = document.querySelectorAll('.project-card[data-project-id]');
  cards.forEach(card => {
    const id = card.getAttribute('data-project-id');
    const open = () => window.showModal(id);
    card.addEventListener('click', open);
    card.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
  });

  const isFinePointer = window.matchMedia('(pointer: fine)').matches;
  if (isFinePointer) {
    const cursorEl = document.createElement('div');
    cursorEl.className = 'cursor';
    document.body.appendChild(cursorEl);
    document.addEventListener('mousemove', (e) => { gsap.to(cursorEl, { x: e.clientX, y: e.clientY, duration: 0.2, ease: 'power3.out' }); });
    const cursorTargets = document.querySelectorAll('a, button, .work-card');
    cursorTargets.forEach(t => {
      t.addEventListener('mouseenter', () => cursorEl.classList.add('is-active'));
      t.addEventListener('mouseleave', () => cursorEl.classList.remove('is-active'));
    });
    const magnetEls = document.querySelectorAll('[data-magnetic]');
    magnetEls.forEach(el => {
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - (r.left + r.width / 2);
        const y = e.clientY - (r.top + r.height / 2);
        gsap.to(el, { x: x * 0.3, y: y * 0.3, duration: 0.3, ease: 'power3.out' });
      });
      el.addEventListener('mouseleave', () => gsap.to(el, { x: 0, y: 0, duration: 0.4, ease: 'power3.out' }));
    });
  }
  const workCards = document.querySelectorAll('.work-card');
  workCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      const rx = (py - 0.5) * 6;
      const ry = (px - 0.5) * -6;
      gsap.to(card, { rotateX: rx, rotateY: ry, duration: 0.3, transformPerspective: 800, ease: 'power3.out' });
    });
    card.addEventListener('mouseleave', () => gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.5, ease: 'power3.out' }));
  });
  const visualPane = document.querySelector('.visual-pane');
  if (visualPane) {
    visualPane.addEventListener('mousemove', (e) => {
      const r = visualPane.getBoundingClientRect();
      const x = (e.clientX - (r.left + r.width / 2)) / r.width;
      const y = (e.clientY - (r.top + r.height / 2)) / r.height;
      const tx = x * 20;
      const ty = y * 20;
      visualPane.style.setProperty('--bg-tx', tx + 'px');
      visualPane.style.setProperty('--bg-ty', ty + 'px');
    });
    visualPane.addEventListener('mouseleave', () => {
      visualPane.style.setProperty('--bg-tx', '0px');
      visualPane.style.setProperty('--bg-ty', '0px');
    });
  }
});

window.addEventListener('load', () => {
  const loader = document.querySelector('.page-loader');
  if (loader) {
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.to(loader, { opacity: 0, duration: 0.4, ease: 'power1.out', onComplete: () => loader.remove() });
    } else {
      loader.remove();
    }
  }
});
