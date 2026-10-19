/**
 * AnahiBot - Main Application Router & Event Controller
 * Integrates Inventario, Comercial, Finanzas & Floating Chatbot Engine
 * Global Toast System, Lightbox Viewer, Notification Center & Rich Dashboard
 */

// Global Chart Instance Registry
window.chartInstances = window.chartInstances || {};

// Global Toast Notification Helper
window.showToast = function(message, type = 'success', title = '') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const defaultTitles = {
    success: 'Operación Exitosa',
    error: 'Error en la Operación',
    warning: 'Atención / Advertencia',
    info: 'Notificación'
  };

  const icons = {
    success: 'fa-circle-check',
    error: 'fa-circle-xmark',
    warning: 'fa-triangle-exclamation',
    info: 'fa-circle-info'
  };

  const toast = document.createElement('div');
  toast.className = `toast-card ${type}`;
  toast.innerHTML = `
    <i class="fa-solid ${icons[type] || icons.info} toast-icon"></i>
    <div class="toast-content">
      <strong>${title || defaultTitles[type] || 'Notificación'}</strong>
      <span>${message}</span>
    </div>
    <button class="toast-close" onclick="this.parentElement.remove()"><i class="fa-solid fa-xmark"></i></button>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
};

// Global Lightbox Viewer for Blueprint / Photo Attachments
window.openLightbox = function(url, title = 'Adjunto de Carpintería') {
  window.closeLightbox();
  const lightbox = document.createElement('div');
  lightbox.className = 'lightbox-backdrop';
  lightbox.id = 'app-lightbox';
  lightbox.onclick = (e) => {
    if (e.target === lightbox || e.target.classList.contains('lightbox-close-btn') || e.target.closest('.lightbox-close-btn')) {
      window.closeLightbox();
    }
  };

  lightbox.innerHTML = `
    <button class="lightbox-close-btn" title="Cerrar (Esc)"><i class="fa-solid fa-xmark"></i></button>
    <img src="${url}" class="lightbox-img" alt="${title}">
    <div class="lightbox-caption">
      <i class="fa-solid fa-image"></i> ${title}
    </div>
  `;

  document.body.appendChild(lightbox);
};

window.closeLightbox = function() {
  const existing = document.getElementById('app-lightbox');
  if (existing) existing.remove();
};

class AppRouter {
  constructor() {
    this.currentView = 'dashboard';
    this.container = document.getElementById('view-container');
    this.initListeners();
    this.initChatbotWidget();
    this.initNotificationCenter();
    this.initMobileNav();
  }

  initListeners() {
    // Navigation items click handler
    document.querySelectorAll('.nav-item').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const view = link.getAttribute('data-view');
        this.navigateTo(view);

        // Auto close mobile drawer if open
        const sidebar = document.getElementById('sidebar');
        if (sidebar && sidebar.classList.contains('mobile-open')) {
          sidebar.classList.remove('mobile-open');
        }
      });
    });

    // Handle back/forward browser navigation
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.replace('#', '') || 'dashboard';
      this.navigateTo(hash, false);
    });

    // Close active modal or lightbox on Escape key
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const modal = document.getElementById('modal-container');
        if (modal) modal.remove();
        window.closeLightbox();
      }
    });

    // Demo Data Reset Button
    const resetBtn = document.getElementById('btn-quick-reset');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm('¿Deseas restablecer los datos de demostración a su estado inicial?')) {
          window.appStore.resetDemoData();
          window.showToast('Los datos demo han sido restablecidos con éxito.', 'info', 'Datos Reiniciados');
        }
      });
    }

    // Subscribe router to store changes
    window.appStore.subscribe(() => {
      this.updateNotifications();
      this.renderCurrentView();
    });

    // Initial View Load
    const initialHash = window.location.hash.replace('#', '') || 'dashboard';
    this.navigateTo(initialHash, false);
    this.updateNotifications();
  }

  initMobileNav() {
    const mobileBtn = document.getElementById('mobile-toggle');
    const sidebar = document.getElementById('sidebar');
    if (mobileBtn && sidebar) {
      mobileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        sidebar.classList.toggle('mobile-open');
      });

      document.addEventListener('click', (e) => {
        if (!sidebar.contains(e.target) && !mobileBtn.contains(e.target)) {
          sidebar.classList.remove('mobile-open');
        }
      });
    }
  }

  initNotificationCenter() {
    const notifBtn = document.getElementById('notif-btn');
    const notifDropdown = document.getElementById('notif-dropdown');

    if (notifBtn && notifDropdown) {
      notifBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        notifDropdown.classList.toggle('open');
      });

      document.addEventListener('click', (e) => {
        if (!notifDropdown.contains(e.target) && !notifBtn.contains(e.target)) {
          notifDropdown.classList.remove('open');
        }
      });
    }
  }

  updateNotifications() {
    const data = window.appStore.data;
    const notifBadge = document.getElementById('notif-badge');
    const notifCountBadge = document.getElementById('notif-count-badge');
    const notifList = document.getElementById('notif-list');

    if (!notifBadge || !notifList) return;

    const lowStockProds = data.productos.filter(p => p.stock <= p.stockMinimo);
    const pendingOrders = data.pedidos.filter(o => o.estado === 'En Producción' || o.estado === 'Diseño');
    const totalCount = lowStockProds.length + pendingOrders.length;

    notifBadge.textContent = totalCount;
    notifBadge.style.display = totalCount > 0 ? 'flex' : 'none';
    if (notifCountBadge) notifCountBadge.textContent = `${totalCount} Notificaciones`;

    if (totalCount === 0) {
      notifList.innerHTML = `
        <div style="padding: 1.5rem; text-align: center; color: var(--text-muted); font-size: 0.85rem;">
          <i class="fa-solid fa-check-circle" style="color: var(--status-success); font-size: 1.5rem; margin-bottom: 0.5rem; display: block;"></i>
          Todo está al día. No hay alertas pendientes.
        </div>
      `;
      return;
    }

    let itemsHtml = '';

    lowStockProds.forEach(p => {
      itemsHtml += `
        <div class="notif-item" onclick="window.appRouter.navigateTo('productos')">
          <i class="fa-solid fa-triangle-exclamation" style="color: var(--status-danger); margin-top: 2px;"></i>
          <div>
            <strong>Stock Crítico: ${p.nombre}</strong>
            <p style="margin: 0; color: var(--text-muted);">Quedan ${p.stock} und (Mínimo: ${p.stockMinimo})</p>
          </div>
        </div>
      `;
    });

    pendingOrders.forEach(o => {
      itemsHtml += `
        <div class="notif-item" onclick="window.appRouter.navigateTo('pedidos')">
          <i class="fa-solid fa-hammer" style="color: var(--accent-warm-orange); margin-top: 2px;"></i>
          <div>
            <strong>Taller: ${o.titulo}</strong>
            <p style="margin: 0; color: var(--text-muted);">Fase: ${o.estado} • Entrega: ${o.fechaEntrega}</p>
          </div>
        </div>
      `;
    });

    notifList.innerHTML = itemsHtml;
  }

  navigateTo(viewName, updateHash = true) {
    this.currentView = viewName;
    
    // Update active UI nav link
    document.querySelectorAll('.nav-item').forEach(el => {
      if (el.getAttribute('data-view') === viewName) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });

    if (updateHash) {
      window.location.hash = viewName;
    }

    this.renderCurrentView();
  }

  renderCurrentView() {
    const pageTitle = document.getElementById('page-title');
    const pageSubtitle = document.getElementById('page-subtitle');

    switch (this.currentView) {
      case 'dashboard':
        pageTitle.textContent = 'Dashboard de Gestión General';
        pageSubtitle.textContent = 'Resumen consolidado de operaciones, inventario, ventas y taller';
        this.container.innerHTML = this.renderDashboardView();
        setTimeout(() => this.initDashboardCharts(), 80);
        break;

      // ABASTECIMIENTO E INVENTARIO
      case 'productos':
        pageTitle.textContent = 'Gestión de Productos e Inventario';
        pageSubtitle.textContent = 'Control de stock, precios y alertas de reabastecimiento';
        this.container.innerHTML = Sprint1.renderProductosView();
        break;

      case 'medidas':
        pageTitle.textContent = 'Unidades y Especificaciones de Medida';
        pageSubtitle.textContent = 'Definición de métricas, planos y fotos adjuntas para madera y acabados';
        this.container.innerHTML = Sprint1.renderMedidasView();
        break;

      case 'proveedores':
        pageTitle.textContent = 'Directorio de Proveedores';
        pageSubtitle.textContent = 'Proveedores de materias primas, insumos y químicos';
        this.container.innerHTML = Sprint1.renderProveedoresView();
        break;

      case 'compras':
        pageTitle.textContent = 'Registro de Compras de Materiales';
        pageSubtitle.textContent = 'Órdenes de compra e incremento automático en inventario';
        this.container.innerHTML = Sprint1.renderComprasView();
        break;

      // VENTAS Y BOT
      case 'clientes':
        pageTitle.textContent = 'Gestión de Clientes';
        pageSubtitle.textContent = 'Clientes residenciales, arquitectos y clientes corporativos';
        this.container.innerHTML = Sprint2.renderClientesView();
        break;

      case 'ventas':
        pageTitle.textContent = 'Punto de Venta (POS) Comercial';
        pageSubtitle.textContent = 'Registro de ventas, deducción de stock y emisión de recibos oficiales';
        this.container.innerHTML = Sprint2.renderVentasView();
        break;

      case 'chatbot-view':
        pageTitle.textContent = 'Chatbot Inteligente AnahiBot';
        pageSubtitle.textContent = 'Asistente virtual en lenguaje natural con consultas en vivo';
        this.container.innerHTML = Sprint2.renderChatbotView();
        break;

      // FINANZAS Y REPORTES
      case 'finanzas':
        pageTitle.textContent = 'Control Financiero de Caja';
        pageSubtitle.textContent = 'Registro de ingresos, egresos y cálculo de utilidad neta';
        this.container.innerHTML = Sprint3.renderFinanzasView();
        break;

      case 'pedidos':
        pageTitle.textContent = 'Pedidos Personalizados a la Medida';
        pageSubtitle.textContent = 'Tablero Kanban de fabricación en taller de carpintería con fichas técnicas';
        this.container.innerHTML = Sprint3.renderPedidosView();
        break;

      case 'reportes':
        pageTitle.textContent = 'Reportes de Gestión y Analítica Operativa';
        pageSubtitle.textContent = 'Dashboards analíticos, balance financiero y resúmenes ejecutivos de gestión';
        this.container.innerHTML = Sprint3.renderReportesView();
        break;

      default:
        this.navigateTo('dashboard');
        break;
    }
  }

  // Dashboard Overview Aggregator View
  renderDashboardView() {
    const data = window.appStore.data;

    const lowStockList = data.productos.filter(p => p.stock <= p.stockMinimo);
    const lowStockCount = lowStockList.length;
    const totalVentas = data.ventas.reduce((acc, v) => acc + v.total, 0);
    const totalIngresos = data.finanzas.filter(f => f.tipo === 'Ingreso').reduce((a, b) => a + b.monto, 0);
    const totalEgresos = data.finanzas.filter(f => f.tipo === 'Egreso').reduce((a, b) => a + b.monto, 0);
    const balance = totalIngresos - totalEgresos;

    const clientesMap = Object.fromEntries(data.clientes.map(c => [c.id, c.nombre]));
    const prodsMap = Object.fromEntries(data.productos.map(p => [p.id, p.nombre]));

    // Stock alert banner markup
    let stockAlertBanner = '';
    if (lowStockCount > 0) {
      stockAlertBanner = `
        <div class="stock-alert-banner">
          <div class="stock-alert-content">
            <i class="fa-solid fa-triangle-exclamation stock-alert-icon"></i>
            <div class="stock-alert-text">
              <strong>Atención de Abastecimiento: ${lowStockCount} material(es) bajo nivel mínimo</strong>
              <p>
                Materiales en riesgo: ${lowStockList.map(p => `<strong>${p.nombre}</strong> (${p.stock} und)`).join(', ')}.
                Genera una orden de compra para reabastecer el taller.
              </p>
            </div>
          </div>
          <button class="btn btn-accent btn-sm" onclick="Sprint1.showNewPurchaseModal()">
            <i class="fa-solid fa-cart-shopping"></i> Reabastecer Ahora
          </button>
        </div>
      `;
    }

    return `
      ${stockAlertBanner}

      <!-- KPI Cards Header -->
      <div class="kpi-grid">
        <div class="kpi-card" onclick="window.appRouter.navigateTo('productos')" style="cursor:pointer;" title="Ver Catálogo de Productos">
          <div class="kpi-icon wood"><i class="fa-solid fa-boxes-stacked"></i></div>
          <div class="kpi-data">
            <span>Catálogo Productos</span>
            <h2>${data.productos.length} items</h2>
          </div>
        </div>

        <div class="kpi-card" onclick="window.appRouter.navigateTo('productos')" style="cursor:pointer;" title="Ver Alertas de Stock">
          <div class="kpi-icon ${lowStockCount > 0 ? 'purple' : 'green'}"><i class="fa-solid fa-triangle-exclamation"></i></div>
          <div class="kpi-data">
            <span>Bajo Stock Mínimo</span>
            <h2 style="color: ${lowStockCount > 0 ? 'var(--status-danger)' : 'var(--status-success)'};">${lowStockCount} alertas</h2>
          </div>
        </div>

        <div class="kpi-card" onclick="window.appRouter.navigateTo('ventas')" style="cursor:pointer;" title="Ver Ventas Realizadas">
          <div class="kpi-icon green"><i class="fa-solid fa-cash-register"></i></div>
          <div class="kpi-data">
            <span>Ventas Totales</span>
            <h2>$${totalVentas.toFixed(2)}</h2>
          </div>
        </div>

        <div class="kpi-card" onclick="window.appRouter.navigateTo('pedidos')" style="cursor:pointer;" title="Ver Pedidos en Taller">
          <div class="kpi-icon amber"><i class="fa-solid fa-hammer"></i></div>
          <div class="kpi-data">
            <span>Pedidos en Taller</span>
            <h2>${data.pedidos.length} muebles</h2>
          </div>
        </div>

        <div class="kpi-card" onclick="window.appRouter.navigateTo('finanzas')" style="cursor:pointer;" title="Ver Control Financiero">
          <div class="kpi-icon blue"><i class="fa-solid fa-wallet"></i></div>
          <div class="kpi-data">
            <span>Balance Neto</span>
            <h2 style="color: ${balance >= 0 ? 'var(--status-success)' : 'var(--status-danger)'};">$${balance.toFixed(2)}</h2>
          </div>
        </div>
      </div>

      <!-- Quick Action Modules Row -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.5rem; margin-bottom: 1.5rem;">
        
        <!-- Abastecimiento Preview -->
        <div class="card" style="margin-bottom: 0;">
          <div class="card-header">
            <h3><i class="fa-solid fa-cubes"></i> Abastecimiento e Inventario</h3>
            <button class="btn btn-outline btn-sm" onclick="window.appRouter.navigateTo('productos')">Ver Todo →</button>
          </div>
          <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1rem;">
            Productos: ${data.productos.length} | Proveedores: ${data.proveedores.length} | Compras: ${data.compras.length}
          </p>
          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
            <button class="btn btn-accent btn-sm" onclick="Sprint1.showNewProductModal()"><i class="fa-solid fa-plus"></i> Producto</button>
            <button class="btn btn-outline btn-sm" onclick="Sprint1.showNewPurchaseModal()"><i class="fa-solid fa-cart-shopping"></i> Compra</button>
          </div>
        </div>

        <!-- Ventas & Bot Preview -->
        <div class="card" style="margin-bottom: 0;">
          <div class="card-header">
            <h3><i class="fa-solid fa-users-gear"></i> Ventas & Asistente Bot</h3>
            <button class="btn btn-outline btn-sm" onclick="window.appRouter.navigateTo('ventas')">Ver POS →</button>
          </div>
          <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1rem;">
            Clientes: ${data.clientes.length} | Ventas: ${data.ventas.length} | AnahiBot: <span class="badge badge-success">En línea</span>
          </p>
          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
            <button class="btn btn-primary btn-sm" onclick="Sprint2.showNewSaleModal()"><i class="fa-solid fa-plus"></i> Nueva Venta</button>
            <button class="btn btn-accent btn-sm" onclick="window.appRouter.navigateTo('chatbot-view')"><i class="fa-solid fa-robot"></i> Consultar Bot</button>
          </div>
        </div>

        <!-- Finanzas & Taller Preview -->
        <div class="card" style="margin-bottom: 0;">
          <div class="card-header">
            <h3><i class="fa-solid fa-chart-line"></i> Finanzas & Taller Carpintería</h3>
            <button class="btn btn-outline btn-sm" onclick="window.appRouter.navigateTo('pedidos')">Ver Kanban →</button>
          </div>
          <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1rem;">
            Ingresos: $${totalIngresos.toFixed(2)} | Egresos: $${totalEgresos.toFixed(2)} | Pedidos: ${data.pedidos.length}
          </p>
          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
            <button class="btn btn-primary btn-sm" onclick="Sprint3.showNewCustomOrderModal()"><i class="fa-solid fa-plus"></i> Pedido a Medida</button>
            <button class="btn btn-outline btn-sm" onclick="window.appRouter.navigateTo('reportes')"><i class="fa-solid fa-file-invoice-dollar"></i> Reportes</button>
          </div>
        </div>

      </div>

      <!-- Dashboard Interactive Charts Row -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 1.5rem; margin-bottom: 1.5rem;">
        <div class="card" style="margin-bottom: 0;">
          <div class="card-header">
            <h3><i class="fa-solid fa-chart-simple"></i> Balance Financiero Consolidado</h3>
            <span class="badge badge-accent">Caja General</span>
          </div>
          <div style="height: 240px; position: relative;">
            <canvas id="dashboard-finance-chart"></canvas>
          </div>
        </div>

        <div class="card" style="margin-bottom: 0;">
          <div class="card-header">
            <h3><i class="fa-solid fa-cubes-stacked"></i> Estado de Pedidos en Taller (Kanban)</h3>
            <span class="badge badge-info">Fases Producción</span>
          </div>
          <div style="height: 240px; position: relative;">
            <canvas id="dashboard-orders-chart"></canvas>
          </div>
        </div>
      </div>

      <!-- Live Operations & Recent Activity Feeds -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 1.5rem;">
        
        <!-- Recent Sales Feed -->
        <div class="card" style="margin-bottom: 0;">
          <div class="card-header">
            <h3><i class="fa-solid fa-receipt"></i> Últimas Ventas Realizadas (POS)</h3>
            <button class="btn btn-outline btn-sm" onclick="window.appRouter.navigateTo('ventas')">Ver Todas →</button>
          </div>
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>Venta</th>
                  <th>Cliente</th>
                  <th>Total</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                ${data.ventas.slice(-4).reverse().map(v => `
                  <tr>
                    <td><span class="code-id">${v.id}</span></td>
                    <td><strong>${clientesMap[v.clienteId] || v.clienteId}</strong></td>
                    <td><strong style="color: var(--status-success);">$${v.total.toFixed(2)}</strong></td>
                    <td>
                      <button class="btn btn-outline btn-sm" onclick="Sprint2.showReceiptModal('${v.id}')" title="Ver e imprimir recibo oficial">
                        <i class="fa-solid fa-print"></i> Recibo
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Active Workshop Orders Feed -->
        <div class="card" style="margin-bottom: 0;">
          <div class="card-header">
            <h3><i class="fa-solid fa-hammer"></i> Pedidos Activos en Carpintería</h3>
            <button class="btn btn-outline btn-sm" onclick="window.appRouter.navigateTo('pedidos')">Ver Tablero →</button>
          </div>
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>Pedido</th>
                  <th>Mueble</th>
                  <th>Fase</th>
                  <th>Entrega</th>
                </tr>
              </thead>
              <tbody>
                ${data.pedidos.slice(0, 4).map(o => `
                  <tr style="cursor: pointer;" onclick="Sprint3.showOrderTechSheet('${o.id}')" title="Ver Ficha Técnica de Taller">
                    <td><span class="code-id">${o.id}</span></td>
                    <td><strong>${o.titulo}</strong></td>
                    <td><span class="badge ${o.estado === 'Listo para Entrega' ? 'badge-success' : (o.estado === 'En Producción' ? 'badge-warning' : 'badge-accent')}">${o.estado}</span></td>
                    <td class="nowrap"><i class="fa-regular fa-calendar"></i> ${o.fechaEntrega}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    `;
  }

  initDashboardCharts() {
    const data = window.appStore.data;

    // Destroy previous dashboard chart instances safely
    if (window.chartInstances['dashboard-finance']) {
      window.chartInstances['dashboard-finance'].destroy();
    }
    if (window.chartInstances['dashboard-orders']) {
      window.chartInstances['dashboard-orders'].destroy();
    }

    // 1. Finance comparison chart
    const totalIngresos = data.finanzas.filter(f => f.tipo === 'Ingreso').reduce((a, b) => a + b.monto, 0);
    const totalEgresos = data.finanzas.filter(f => f.tipo === 'Egreso').reduce((a, b) => a + b.monto, 0);
    const ctxFin = document.getElementById('dashboard-finance-chart');

    if (ctxFin && typeof Chart !== 'undefined') {
      window.chartInstances['dashboard-finance'] = new Chart(ctxFin, {
        type: 'bar',
        data: {
          labels: ['Total Ingresos', 'Total Egresos'],
          datasets: [{
            data: [totalIngresos, totalEgresos],
            backgroundColor: ['#10B981', '#EF4444'],
            borderRadius: 8
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (ctx) => `Monto: $${ctx.raw.toFixed(2)} USD`
              }
            }
          },
          scales: {
            y: { beginAtZero: true }
          }
        }
      });
    }

    // 2. Orders status doughnut chart
    const statusCounts = { 'Diseño': 0, 'En Producción': 0, 'Listo para Entrega': 0, 'Entregado': 0 };
    data.pedidos.forEach(o => {
      statusCounts[o.estado] = (statusCounts[o.estado] || 0) + 1;
    });

    const ctxOrders = document.getElementById('dashboard-orders-chart');
    if (ctxOrders && typeof Chart !== 'undefined') {
      window.chartInstances['dashboard-orders'] = new Chart(ctxOrders, {
        type: 'doughnut',
        data: {
          labels: Object.keys(statusCounts),
          datasets: [{
            data: Object.values(statusCounts),
            backgroundColor: ['#D4A373', '#F4A261', '#10B981', '#2C1810']
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { boxWidth: 12, font: { size: 11 } }
            }
          }
        }
      });
    }
  }

  // Floating Chatbot Drawer Widget Handlers
  initChatbotWidget() {
    const trigger = document.getElementById('chatbot-trigger');
    const windowEl = document.getElementById('chatbot-window');
    const widget = document.getElementById('chatbot-widget');
    const closeBtn = document.getElementById('chatbot-close');
    const form = document.getElementById('chatbot-form');
    const input = document.getElementById('chatbot-input');
    const messages = document.getElementById('chatbot-messages');

    if (trigger && windowEl) {
      trigger.addEventListener('click', () => {
        windowEl.classList.toggle('open');
        if (widget) widget.classList.toggle('is-open', windowEl.classList.contains('open'));
        if (windowEl.classList.contains('open') && input) {
          setTimeout(() => input.focus(), 150);
        }
      });
    }

    if (closeBtn && windowEl) {
      closeBtn.addEventListener('click', () => {
        windowEl.classList.remove('open');
        if (widget) widget.classList.remove('is-open');
      });
    }

    // Quick chip buttons inside floating widget
    document.querySelectorAll('.chatbot-quick-questions .chip-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const query = btn.getAttribute('data-query');
        if (query && input) {
          input.value = query;
          form.dispatchEvent(new Event('submit'));
        }
      });
    });

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = input.value.trim();
        if (!text) return;

        // Append User Message
        messages.insertAdjacentHTML('beforeend', `
          <div class="chat-message user">
            <div class="message-content">${text}</div>
          </div>
        `);

        input.value = '';
        messages.scrollTop = messages.scrollHeight;

        // Append Typing Indicator
        const typingId = 'typing-' + Date.now();
        messages.insertAdjacentHTML('beforeend', `
          <div class="chat-message bot" id="${typingId}">
            <div class="typing-indicator">
              <span></span><span></span><span></span>
            </div>
          </div>
        `);
        messages.scrollTop = messages.scrollHeight;

        // Process Bot Answer
        setTimeout(() => {
          const typingEl = document.getElementById(typingId);
          if (typingEl) typingEl.remove();

          const reply = Sprint2.processBotQuery(text);
          messages.insertAdjacentHTML('beforeend', `
            <div class="chat-message bot">
              <div class="message-content">${reply}</div>
            </div>
          `);
          messages.scrollTop = messages.scrollHeight;
        }, 350);
      });
    }
  }
}

// Global App Initializer
document.addEventListener('DOMContentLoaded', () => {
  window.appRouter = new AppRouter();
});
