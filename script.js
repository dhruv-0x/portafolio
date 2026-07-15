const projects = Array.isArray(window.PROJECTS) ? window.PROJECTS : [];
const $ = (selector) => document.querySelector(selector);
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const roles = [
  'interfaces con estructura clara',
  'algoritmos y lógica de programación',
  'portafolios y vitrinas digitales',
  'soluciones web a medida'
];

const state = {
  query: '',
  category: 'Todos'
};

function escapeHtml(text = '') {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function getCategories() {
  return ['Todos', ...new Set(projects.map((project) => project.category).filter(Boolean))];
}

function filteredProjects() {
  const query = state.query.trim().toLowerCase();
  return projects.filter((project) => {
    const haystack = [
      project.title,
      project.category,
      project.description,
      project.type,
      ...(project.tags || [])
    ].join(' ').toLowerCase();
    const matchesQuery = haystack.includes(query);
    const matchesCategory = state.category === 'Todos' || project.category === state.category;
    return matchesQuery && matchesCategory;
  });
}

function renderCategoryFilters() {
  const wrap = $('#categoryFilters');
  wrap.innerHTML = getCategories().map((category) => `
    <button class="filter-btn ${state.category === category ? 'active' : ''}" data-category="${escapeHtml(category)}">${escapeHtml(category)}</button>
  `).join('');

  wrap.querySelectorAll('[data-category]').forEach((button) => {
    button.addEventListener('click', () => {
      state.category = button.dataset.category;
      renderCategoryFilters();
      renderProjects();
    });
  });
}

function renderProjects() {
  const list = filteredProjects();
  const grid = $('#projectsGrid');
  $('#projectsCount').textContent = projects.length;
  $('#featuredCount').textContent = projects.filter((project) => project.featured).length;

  if (!list.length) {
    grid.innerHTML = '<div class="empty-state">No hay proyectos que coincidan con los filtros actuales.</div>';
    return;
  }

  grid.innerHTML = list.map((project) => `
    <article class="project-card visible">
      <div class="project-media">
        ${project.featured ? '<div class="featured-badge">★ Destacado</div>' : ''}
        ${project.image
          ? `<img src="${escapeHtml(project.image)}" alt="${escapeHtml(project.title)}" loading="lazy">`
          : `<div class="project-emoji">${escapeHtml(project.emoji || '◆')}</div>`}
      </div>
      <div class="project-body">
        <div class="tag-row" style="margin-bottom:12px;">
          <span class="type-badge">${escapeHtml(project.category || 'Proyecto')}</span>
          <span class="status-badge">${escapeHtml(project.type || 'Disponible')}</span>
        </div>
        <div class="project-top">
          <div>
            <h3 style="margin:0 0 6px; font-size:1.1rem;">${escapeHtml(project.title)}</h3>
            <div class="mono" style="color:var(--text-dim); font-size:.82rem;">${escapeHtml(project.subtitle || 'Solución digital')}</div>
          </div>
          <div class="price">${escapeHtml(project.price || 'Consultar')}</div>
        </div>
        <p class="small">${escapeHtml(project.description || '')}</p>
        <div class="tag-row" style="margin:14px 0 18px;">
          ${(project.tags || []).map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}
        </div>
        <div class="card-actions">
          <button class="btn" data-open-project="${escapeHtml(project.id)}">Ver más</button>
          <a class="btn btn-primary" href="#contacto" data-contact-project="${escapeHtml(project.title)}">Me interesa</a>
        </div>
      </div>
    </article>
  `).join('');

  grid.querySelectorAll('.project-card').forEach((card, index) => {
    card.style.setProperty('--stagger', index % 6);
  });

  grid.querySelectorAll('[data-open-project]').forEach((button) => {
    button.addEventListener('click', () => openProject(button.dataset.openProject));
  });

  grid.querySelectorAll('[data-contact-project]').forEach((link) => {
    link.addEventListener('click', () => prefillSubject(link.dataset.contactProject));
  });
}

function prefillSubject(title) {
  $('#subjectField').value = `Estoy interesado en: ${title}`;
  setTimeout(() => $('#messageField').focus(), 100);
}

function openProject(id) {
  const project = projects.find((item) => item.id === id);
  if (!project) return;

  $('#modalCategory').textContent = project.category || 'Proyecto';
  $('#modalStatus').textContent = project.type || 'Disponible';
  $('#modalTitle').textContent = project.title || '';
  $('#modalPrice').textContent = project.price || 'Consultar';
  $('#modalDescription').textContent = project.longDescription || project.description || '';
  $('#modalTags').innerHTML = (project.tags || []).map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join('');
  $('#modalMedia').innerHTML = project.image
    ? `<img src="${escapeHtml(project.image)}" alt="${escapeHtml(project.title || '')}">`
    : `<div class="modal-emoji">${escapeHtml(project.emoji || '◆')}</div>`;

  const demo = $('#modalDemo');
  demo.style.display = project.demo ? 'inline-flex' : 'none';
  demo.href = project.demo || '#';

  const repo = $('#modalRepo');
  repo.style.display = project.repo ? 'inline-flex' : 'none';
  repo.href = project.repo || '#';

  $('#modalContact').onclick = () => prefillSubject(project.title || 'Proyecto');
  document.body.style.overflow = 'hidden';
  $('#projectModal').classList.add('active');
}

function closeProject() {
  document.body.style.overflow = '';
  $('#projectModal').classList.remove('active');
}

function startRoleRotator() {
  const el = $('#roleValue');
  if (!el) return;

  el.textContent = roles[0];
  if (reduceMotion || roles.length < 2) return;

  let index = 0;
  setInterval(() => {
    index = (index + 1) % roles.length;
    el.style.opacity = '0';
    el.style.transform = 'translateY(4px)';
    setTimeout(() => {
      el.textContent = roles[index];
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    }, 220);
  }, 2800);
}

function revealOnScroll() {
  const groups = new Map();

  document.querySelectorAll('.reveal').forEach((el) => {
    const parent = el.parentElement;
    const list = groups.get(parent) || [];
    list.push(el);
    groups.set(parent, list);
    el.style.setProperty('--stagger', Math.min(list.length - 1, 6));
  });

  if (reduceMotion) {
    document.querySelectorAll('.reveal').forEach((el) => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
}

function setupMobileNav() {
  const toggle = $('#navToggle');
  const panel = $('#navMobilePanel');
  if (!toggle || !panel) return;

  toggle.addEventListener('click', () => {
    const isOpen = panel.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  panel.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      panel.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

$('#searchInput').addEventListener('input', (e) => {
  state.query = e.target.value;
  renderProjects();
});

$('#clearFilters').addEventListener('click', () => {
  state.query = '';
  state.category = 'Todos';
  $('#searchInput').value = '';
  renderCategoryFilters();
  renderProjects();
});

$('#closeModal').addEventListener('click', closeProject);
$('#projectModal').addEventListener('click', (e) => {
  if (e.target.id === 'projectModal') closeProject();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && $('#projectModal').classList.contains('active')) closeProject();
});

$('#contactForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const name = $('#nameField').value.trim();
  const email = $('#emailField').value.trim();
  const subject = $('#subjectField').value.trim() || 'Consulta desde mi portafolio';
  const message = $('#messageField').value.trim();
  const body = `Nombre: ${name}\nCorreo: ${email}\n\nMensaje:\n${message}`;
  window.location.href = `mailto:jngz0817@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
});

$('#whatsappBtn').addEventListener('click', (e) => {
  e.preventDefault();
  const name = $('#nameField').value.trim() || 'Hola';
  const subject = $('#subjectField').value.trim() || 'Consulta';
  const message = $('#messageField').value.trim() || 'Quiero más información sobre tus proyectos.';
  const text = `${name}\n${subject}\n${message}`;
  window.open(`https://wa.me/573106392901?text=${encodeURIComponent(text)}`, '_blank');
});

$('#year').textContent = new Date().getFullYear();
renderCategoryFilters();
renderProjects();
revealOnScroll();
startRoleRotator();
setupMobileNav();
