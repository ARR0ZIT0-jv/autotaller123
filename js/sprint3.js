/**
 * AnahiBot - Módulo: Finanzas, Pedidos Personalizados a la Medida y Reportes Generales
 * Control de ingresos, egresos, tablero Kanban de taller y analítica ejecutiva
 */

const Sprint3 = {
  // Render US-008: Finanzas (Ingresos y Gastos)
  renderFinanzasView() {
    const finanzas = window.appStore.data.finanzas;

    const totalIngresos = finanzas.filter(f => f.tipo === 'Ingreso').reduce((acc, curr) => acc + curr.monto, 0);
    const totalEgresos = finanzas.filter(f => f.tipo === 'Egreso').reduce((acc, curr) => acc + curr.monto, 0);
    const balanceNeto = totalIngresos - totalEgresos;

    return `
      <!-- KPI Row -->
      <div class="kpi-grid" style="margin-bottom: 1.5rem;">
        <div class="kpi-card">
          <div class="kpi-icon green"><i class="fa-solid fa-arrow-trend-up"></i></div>
          <div class="kpi-data">
            <span>Total Ingresos de Caja</span>
            <h2>$${totalIngresos.toFixed(2)}</h2>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon wood"><i class="fa-solid fa-arrow-trend-down"></i></div>
          <div class="kpi-data">
            <span>Total Gastos / Egresos</span>
            <h2>$${totalEgresos.toFixed(2)}</h2>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon ${balanceNeto >= 0 ? 'amber' : 'purple'}"><i class="fa-solid fa-scale-balanced"></i></div>
          <div class="kpi-data">
            <span>Utilidad / Balance Neto</span>
            <h2 style="color: ${balanceNeto >= 0 ? 'var(--status-success)' : 'var(--status-danger)'};">$${balanceNeto.toFixed(2)}</h2>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3><i class="fa-solid fa-wallet"></i> Libro de Movimientos Financieros de Caja</h3>
          <button class="btn btn-primary" onclick="Sprint3.showNewFinanceModal()">
            <i class="fa-solid fa-plus"></i> Registrar Movimiento
          </button>
        </div>

        <div class="form-row" style="margin-bottom: 1.25rem;">
          <div class="form-group" style="flex: 2;">
            <input type="text" id="filter-fin-query" class="form-control" placeholder="Buscar por concepto, categoría o código..." oninput="Sprint3.filterFinanzas()">
          </div>
          <div class="form-group">
            <select id="filter-fin-tipo" class="form-control" onchange="Sprint3.filterFinanzas()">
              <option value="">Todos los Tipos</option>
              <option value="Ingreso">Solo Ingresos (+)</option>
              <option value="Egreso">Solo Egresos (-)</option>
            </select>
          </div>
        </div>

        <div class="table-responsive">
          <table class="table" id="table-finanzas">
            <thead>
              <tr>
                <th class="nowrap">Código</th>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Concepto / Descripción</th>
                <th>Categoría</th>
                <th>Monto ($)</th>
                <th class="nowrap">Acciones</th>
              </tr>
            </thead>
            <tbody>
              ${finanzas.map(f => {
                const isIngreso = f.tipo === 'Ingreso';
                return `
                  <tr>
                    <td class="nowrap"><span class="code-id">${f.id}</span></td>
                    <td class="nowrap"><i class="fa-regular fa-calendar"></i> ${f.fecha}</td>
                    <td class="nowrap">
                      <span class="badge ${isIngreso ? 'badge-success' : 'badge-danger'}">
                        <i class="fa-solid ${isIngreso ? 'fa-circle-arrow-down' : 'fa-circle-arrow-up'}"></i> ${f.tipo}
                      </span>
                    </td>
                    <td><strong>${f.concepto}</strong></td>
                    <td><span class="badge badge-accent">${f.categoria}</span></td>
                    <td class="nowrap"><strong style="color: ${isIngreso ? 'var(--status-success)' : 'var(--status-danger)'}; font-size: 0.95rem;">${isIngreso ? '+' : '-'}$${f.monto.toFixed(2)}</strong></td>
                    <td class="nowrap">
                      <div class="table-row-actions">
                        <button class="btn-row-action danger" onclick="Sprint3.handleDeleteFinance('${f.id}', '${f.concepto}')" title="Eliminar registro">
                          <i class="fa-regular fa-trash-can"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  filterFinanzas() {
    const q = (document.getElementById('filter-fin-query')?.value || '').toLowerCase();
    const tipo = document.getElementById('filter-fin-tipo')?.value || '';
    const rows = document.querySelectorAll('#table-finanzas tbody tr');

    rows.forEach(row => {
      const text = row.textContent.toLowerCase();
      const matchQ = text.includes(q);
      const matchTipo = !tipo || text.includes(tipo.toLowerCase());
      row.style.display = (matchQ && matchTipo) ? '' : 'none';
    });
  },

  handleDeleteFinance(id, concepto) {
    if (confirm(`¿Deseas eliminar el movimiento "${concepto}"?`)) {
      window.appStore.deleteFinanceEntry(id);
      window.showToast(`Movimiento ${id} eliminado.`, 'info');
    }
  },

  showNewFinanceModal() {
    Sprint3.closeModal();
    const modalHtml = `
      <div class="modal-backdrop" id="modal-container" onclick="if(event.target === this) Sprint3.closeModal()">
        <div class="card" style="width: 500px; max-width: 90vw;">
          <div class="card-header">
            <h3><i class="fa-solid fa-file-invoice"></i> Nuevo Movimiento Financiero</h3>
            <button class="btn-icon" onclick="Sprint3.closeModal()"><i class="fa-solid fa-xmark"></i></button>
          </div>
          <form onsubmit="Sprint3.handleCreateFinance(event)">
            <div class="form-row">
              <div class="form-group">
                <label>Tipo de Transacción</label>
                <select id="new-fin-tipo" class="form-control" required>
                  <option value="Ingreso">Ingreso (+)</option>
                  <option value="Egreso">Egreso (-)</option>
                </select>
              </div>
              <div class="form-group">
                <label>Fecha</label>
                <input type="date" id="new-fin-fecha" class="form-control" value="${new Date().toISOString().split('T')[0]}" required>
              </div>
            </div>
            <div class="form-group">
              <label>Concepto / Descripción del Movimiento</label>
              <input type="text" id="new-fin-concepto" class="form-control" required placeholder="Ej. Pago servicios de luz y mantenimiento sierra">
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Categoría</label>
                <select id="new-fin-cat" class="form-control" required>
                  <option value="Sueldos y Servicios">Sueldos y Servicios</option>
                  <option value="Abastecimiento Materiales">Abastecimiento Materiales</option>
                  <option value="Mantenimiento Maquinaria">Mantenimiento Maquinaria</option>
                  <option value="Ventas Comercial">Ventas Comercial</option>
                  <option value="Anticipo Pedido">Anticipo Pedido</option>
                  <option value="Otros Gastos">Otros Gastos</option>
                </select>
              </div>
              <div class="form-group">
                <label>Monto en Dólares ($)</label>
                <input type="number" step="0.01" id="new-fin-monto" class="form-control" required placeholder="0.00">
              </div>
            </div>
            <div style="text-align: right; margin-top: 1.5rem; gap: 0.5rem; display: flex; justify-content: flex-end;">
              <button type="button" class="btn btn-outline" onclick="Sprint3.closeModal()">Cancelar</button>
              <button type="submit" class="btn btn-primary">Registrar Movimiento</button>
            </div>
          </form>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
  },

  handleCreateFinance(e) {
    e.preventDefault();
    const entry = {
      tipo: document.getElementById('new-fin-tipo').value,
      fecha: document.getElementById('new-fin-fecha').value,
      concepto: document.getElementById('new-fin-concepto').value,
      categoria: document.getElementById('new-fin-cat').value,
      monto: parseFloat(document.getElementById('new-fin-monto').value)
    };

    window.appStore.addFinanceEntry(entry);
    Sprint3.closeModal();
    window.showToast(`Movimiento de ${entry.tipo} por $${entry.monto.toFixed(2)} registrado correctamente.`, 'success');
  },

  currentOrderFile: null,

  handleOrderFileChange(input) {
    const file = input.files[0];
    if (!file) {
      Sprint3.currentOrderFile = null;
      return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
      const isImage = file.type.startsWith('image/');
      Sprint3.currentOrderFile = {
        tipo: isImage ? 'foto' : 'documento',
        url: e.target.result,
        nombre: file.name
      };

      const previewContainer = document.getElementById('new-ped-file-preview');
      if (previewContainer) {
        if (isImage) {
          previewContainer.innerHTML = `<img src="${e.target.result}" style="max-height: 100px; border-radius: 6px; border: 1px solid var(--border-color); margin-top: 0.5rem; display: block;">`;
        } else {
          previewContainer.innerHTML = `<div class="badge badge-accent" style="margin-top: 0.5rem;"><i class="fa-solid fa-file-pdf"></i> ${file.name}</div>`;
        }
      }
    };
    reader.readAsDataURL(file);
  },

  // Render Pedidos Personalizados - Kanban Taller (US-009)
  renderPedidosView() {
    const data = window.appStore.data;
    const clientesMap = Object.fromEntries(data.clientes.map(c => [c.id, c.nombre]));
    const estados = ['Diseño', 'En Producción', 'Listo para Entrega', 'Entregado'];

    return `
      <div class="card">
        <div class="card-header">
          <h3><i class="fa-solid fa-hammer"></i> Tablero Kanban de Taller Carpintería & Pedidos a la Medida</h3>
          <button class="btn btn-primary" onclick="Sprint3.showNewCustomOrderModal()">
            <i class="fa-solid fa-plus"></i> Nuevo Pedido a la Medida
          </button>
        </div>

        <p class="text-muted" style="margin-bottom: 1.25rem; font-size: 0.88rem;">
          Control visual de fabricación en taller: haz clic en <strong>Ficha Técnica</strong> para ver la orden de trabajo con planos y medidas, o mueve los pedidos entre etapas.
        </p>

        <div class="kanban-board">
          ${estados.map(estado => {
            const ordersInStatus = data.pedidos.filter(o => o.estado === estado);

            return `
              <div class="kanban-column">
                <div class="kanban-header">
                  <div style="display: flex; align-items: center; gap: 0.4rem;">
                    <span class="status-indicator" style="width: 8px; height: 8px; border-radius: 50%; background: ${estado === 'Listo para Entrega' ? 'var(--status-success)' : (estado === 'En Producción' ? 'var(--accent-warm-orange)' : (estado === 'Diseño' ? 'var(--accent-amber)' : 'var(--primary-wood)'))};"></span>
                    <span>${estado}</span>
                  </div>
                  <span class="badge badge-accent">${ordersInStatus.length}</span>
                </div>

                ${ordersInStatus.map(o => {
                  let adjuntoMarkup = '';
                  if (o.adjunto) {
                    if (o.adjunto.tipo === 'foto') {
                      adjuntoMarkup = `
                        <div style="margin: 0.5rem 0;">
                          <img src="${o.adjunto.url}" style="width: 100%; max-height: 110px; object-fit: cover; border-radius: 6px; border: 1px solid var(--border-color); cursor: pointer;" onclick="window.openLightbox('${o.adjunto.url}', '${o.titulo}')" title="Clic para ampliar en Lightbox">
                        </div>
                      `;
                    } else {
                      adjuntoMarkup = `
                        <div style="margin: 0.5rem 0;">
                          <a href="${o.adjunto.url}" target="_blank" class="badge badge-accent" style="text-decoration:none;"><i class="fa-solid fa-file-pdf"></i> ${o.adjunto.nombre}</a>
                        </div>
                      `;
                    }
                  }

                  const saldo = o.presupuesto - o.anticipo;

                  return `
                    <div class="order-card">
                      <div class="order-card-header">
                        <span class="code-id">${o.id}</span>
                        <span><i class="fa-regular fa-calendar"></i> ${o.fechaEntrega}</span>
                      </div>
                      <h4>${o.titulo}</h4>
                      <div class="order-card-meta">
                        <div><strong>Cliente:</strong> ${clientesMap[o.clienteId] || o.clienteId}</div>
                        <div><i class="fa-solid fa-ruler"></i> <strong>Medidas:</strong> ${o.especificacionesMedidas}</div>
                        <div><strong>Presupuesto:</strong> $${o.presupuesto.toFixed(2)} (Abono: $${o.anticipo.toFixed(2)})</div>
                        ${saldo > 0 ? `<div style="color: var(--accent-warm-orange); font-size: 0.75rem;"><strong>Saldo Pendiente:</strong> $${saldo.toFixed(2)}</div>` : '<div style="color: var(--status-success); font-size: 0.75rem;"><strong>Pagado al 100%</strong></div>'}
                      </div>

                      ${adjuntoMarkup}

                      <div style="display: flex; gap: 0.4rem; margin-top: 0.75rem; flex-wrap: wrap;">
                        <button class="btn btn-outline btn-sm" onclick="Sprint3.showOrderTechSheet('${o.id}')" title="Ver hoja de trabajo y ficha técnica">
                          <i class="fa-solid fa-file-lines"></i> Ficha Técnica
                        </button>
                        
                        <select class="form-control" style="width: auto; padding: 0.3rem 0.5rem; font-size: 0.75rem; flex: 1;" onchange="window.appStore.updateOrderStatus('${o.id}', this.value); window.showToast('Pedido ${o.id} movido a ' + this.value, 'info');">
                          ${estados.map(st => `<option value="${st}" ${st === estado ? 'selected' : ''}>→ ${st}</option>`).join('')}
                        </select>

                        <button class="btn-row-action danger" onclick="Sprint3.handleDeleteOrder('${o.id}', '${o.titulo}')" title="Eliminar pedido">
                          <i class="fa-regular fa-trash-can"></i>
                        </button>
                      </div>
                    </div>
                  `;
                }).join('')}

                ${ordersInStatus.length === 0 ? '<div style="font-size:0.8rem; color:#A0AEC0; text-align:center; padding:1.5rem 0.5rem;">Sin pedidos en esta fase</div>' : ''}
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  },

  handleDeleteOrder(orderId, titulo) {
    if (confirm(`¿Estás seguro de eliminar el pedido "${titulo}"?`)) {
      window.appStore.deleteCustomOrder(orderId);
      window.showToast(`Pedido ${orderId} eliminado.`, 'info');
    }
  },

  // Official Carpentry Work Order / Hoja de Taller
  showOrderTechSheet(orderId) {
    Sprint3.closeModal();
    const data = window.appStore.data;
    const order = data.pedidos.find(o => o.id === orderId);
    if (!order) return;

    const cliente = data.clientes.find(c => c.id === order.clienteId) || { nombre: 'Cliente Particular', telefono: 'N/A', email: 'N/A', direccion: 'Cuenca' };
    const saldo = order.presupuesto - order.anticipo;

    const modalHtml = `
      <div class="modal-backdrop" id="modal-container" onclick="if(event.target === this) Sprint3.closeModal()">
        <div class="card" style="width: 700px; max-width: 92vw; padding: 0;">
          <div style="padding: 1rem 1.5rem; background: var(--bg-main); border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;" class="no-print">
            <h4 style="margin: 0; color: var(--primary-wood);"><i class="fa-solid fa-file-waveform"></i> Ficha Técnica y Hoja de Taller</h4>
            <div style="display: flex; gap: 0.5rem;">
              <button class="btn btn-primary btn-sm" onclick="window.print()"><i class="fa-solid fa-print"></i> Imprimir Hoja de Taller</button>
              <button class="btn-icon" onclick="Sprint3.closeModal()"><i class="fa-solid fa-xmark"></i></button>
            </div>
          </div>

          <div class="printable-sheet">
            <div class="receipt-header">
              <div class="receipt-brand">
                <h2>Carpintería & Mueblería Anahí</h2>
                <p>Orden de Trabajo y Ficha Técnica de Fabricación</p>
                <small class="text-muted">Área: Taller de Ebanistería y Acabados • Tel: (07) 283-4920</small>
              </div>
              <div class="receipt-meta">
                <h3>ORDEN DE TALLER</h3>
                <span class="code-id" style="font-size: 1rem;">${order.id}</span>
                <p style="margin-top: 0.35rem; color: var(--text-muted);">Entrega: <strong>${order.fechaEntrega}</strong></p>
              </div>
            </div>

            <div class="receipt-client-box">
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.6rem;">
                <div><strong>Cliente:</strong> ${cliente.nombre}</div>
                <div><strong>Contacto:</strong> ${cliente.telefono}</div>
                <div><strong>Fecha Ingreso:</strong> ${order.fecha}</div>
                <div><strong>Fase Actual:</strong> <span class="badge badge-accent">${order.estado}</span></div>
              </div>
            </div>

            <div style="border: 2px dashed var(--accent-amber); border-radius: 8px; padding: 1.25rem; background: rgba(212, 163, 115, 0.06); margin-bottom: 1.5rem;">
              <h3 style="color: var(--primary-wood); margin-bottom: 0.5rem; font-size: 1.15rem;">
                <i class="fa-solid fa-chair"></i> ${order.titulo}
              </h3>
              
              <div style="margin-bottom: 0.75rem;">
                <strong><i class="fa-solid fa-ruler-combined"></i> Especificaciones Técnicas de Medidas:</strong>
                <div style="font-size: 1.05rem; font-weight: 700; color: var(--primary-wood); background: #FFF; padding: 0.5rem 0.8rem; border-radius: 4px; border: 1px solid var(--border-color); margin-top: 0.25rem;">
                  ${order.especificacionesMedidas}
                </div>
              </div>

              <div>
                <strong><i class="fa-solid fa-clipboard-list"></i> Descripción y Materiales Requeridos:</strong>
                <p style="margin-top: 0.25rem; font-size: 0.9rem; line-height: 1.4;">${order.descripcion}</p>
              </div>
            </div>

            ${order.adjunto ? `
              <div style="margin-bottom: 1.5rem;">
                <strong>Plano o Boceto Adjunto:</strong>
                <div style="margin-top: 0.5rem;">
                  ${order.adjunto.tipo === 'foto' 
                    ? `<img src="${order.adjunto.url}" style="max-height: 180px; width: 100%; object-fit: contain; background: #000; border-radius: 6px; cursor: pointer;" onclick="window.openLightbox('${order.adjunto.url}', '${order.titulo}')" title="Clic para ampliar en Lightbox">`
                    : `<a href="${order.adjunto.url}" target="_blank" class="badge badge-accent" style="font-size: 0.85rem;"><i class="fa-solid fa-file-pdf"></i> ${order.adjunto.nombre}</a>`}
                </div>
              </div>
            ` : ''}

            <table class="receipt-summary-table">
              <thead>
                <tr>
                  <th>Concepto Financiero</th>
                  <th style="text-align: right;">Importe en USD ($)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Presupuesto Total Acordado:</td>
                  <td style="text-align: right;"><strong>$${order.presupuesto.toFixed(2)}</strong></td>
                </tr>
                <tr>
                  <td>Anticipo / Abono Inicial Registrado:</td>
                  <td style="text-align: right; color: var(--status-success);"><strong>-$${order.anticipo.toFixed(2)}</strong></td>
                </tr>
                <tr style="font-size: 1rem; font-weight: 800;">
                  <td>Saldo Pendiente Contra Entrega:</td>
                  <td style="text-align: right; color: ${saldo > 0 ? 'var(--status-danger)' : 'var(--status-success)'};">
                    $${saldo.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>

            <div style="margin-top: 1.5rem; border-top: 1px dashed var(--border-color); padding-top: 1.25rem; display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; text-align: center; font-size: 0.8rem;">
              <div>
                <div style="border-bottom: 1px solid #000; height: 35px; margin-bottom: 0.4rem;"></div>
                <span>Firma Maestro Carpintero Responsable</span>
              </div>
              <div>
                <div style="border-bottom: 1px solid #000; height: 35px; margin-bottom: 0.4rem;"></div>
                <span>Firma de Recepción del Cliente</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
  },

  showNewCustomOrderModal() {
    Sprint3.closeModal();
    Sprint3.currentOrderFile = null;
    const { clientes } = window.appStore.data;
    const modalHtml = `
      <div class="modal-backdrop" id="modal-container" onclick="if(event.target === this) Sprint3.closeModal()">
        <div class="card" style="width: 540px; max-width: 90vw;">
          <div class="card-header">
            <h3><i class="fa-solid fa-pen-ruler"></i> Solicitar Mueble / Pedido Personalizado</h3>
            <button class="btn-icon" onclick="Sprint3.closeModal()"><i class="fa-solid fa-xmark"></i></button>
          </div>
          <form onsubmit="Sprint3.handleCreateOrder(event)">
            <div class="form-row">
              <div class="form-group">
                <label>Cliente Solicitante</label>
                <select id="new-ped-cli" class="form-control" required>
                  ${clientes.map(c => `<option value="${c.id}">${c.nombre} (${c.tipo})</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label>Fecha Compromiso de Entrega</label>
                <input type="date" id="new-ped-entrega" class="form-control" required value="${new Date(Date.now() + 14*86400000).toISOString().split('T')[0]}">
              </div>
            </div>
            <div class="form-group">
              <label>Título del Pedido / Mueble</label>
              <input type="text" id="new-ped-titulo" class="form-control" required placeholder="Ej. Juego de Comedor Moderno Roble 8 Sillas">
            </div>
            <div class="form-group">
              <label>Especificaciones Técnicas de Medidas</label>
              <input type="text" id="new-ped-medidas" class="form-control" required placeholder="Ej. 2.40m Largo x 1.10m Ancho x 0.78m Alto">
            </div>
            <div class="form-group">
              <label>Descripción y Materiales Requeridos</label>
              <textarea id="new-ped-desc" class="form-control" rows="2" placeholder="Detalles de ensamble, tipo de madera, tintes, lacas o herrajes..." required></textarea>
            </div>
            <div class="form-group">
              <label><i class="fa-solid fa-paperclip"></i> Adjuntar Foto, Boceto o Documento (Opcional)</label>
              <input type="file" id="new-ped-file" class="form-control" accept="image/*,.pdf,.doc,.docx" onchange="Sprint3.handleOrderFileChange(this)">
              <div id="new-ped-file-preview"></div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Presupuesto Total ($)</label>
                <input type="number" step="0.01" id="new-ped-presupuesto" class="form-control" required placeholder="1500.00" oninput="Sprint3.calcDefaultAdvance()">
              </div>
              <div class="form-group">
                <label>Anticipo 50% ($)</label>
                <input type="number" step="0.01" id="new-ped-anticipo" class="form-control" required placeholder="750.00">
              </div>
            </div>
            <div style="text-align: right; margin-top: 1.5rem; gap: 0.5rem; display: flex; justify-content: flex-end;">
              <button type="button" class="btn btn-outline" onclick="Sprint3.closeModal()">Cancelar</button>
              <button type="submit" class="btn btn-primary">Registrar en Taller</button>
            </div>
          </form>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
  },

  calcDefaultAdvance() {
    const pres = parseFloat(document.getElementById('new-ped-presupuesto')?.value) || 0;
    const anticipoInput = document.getElementById('new-ped-anticipo');
    if (anticipoInput) {
      anticipoInput.value = (pres * 0.5).toFixed(2);
    }
  },

  handleCreateOrder(e) {
    e.preventDefault();
    const newOrder = {
      fecha: new Date().toISOString().split('T')[0],
      clienteId: document.getElementById('new-ped-cli').value,
      fechaEntrega: document.getElementById('new-ped-entrega').value,
      titulo: document.getElementById('new-ped-titulo').value,
      especificacionesMedidas: document.getElementById('new-ped-medidas').value,
      descripcion: document.getElementById('new-ped-desc').value,
      presupuesto: parseFloat(document.getElementById('new-ped-presupuesto').value),
      anticipo: parseFloat(document.getElementById('new-ped-anticipo').value),
      estado: 'Diseño',
      adjunto: Sprint3.currentOrderFile || null
    };

    window.appStore.addCustomOrder(newOrder);
    Sprint3.currentOrderFile = null;
    Sprint3.closeModal();
    window.showToast(`Pedido "${newOrder.titulo}" ingresado a la fase de Diseño en taller.`, 'success');
  },

  // Render US-010: Generación de Reportes Visuales y Ejecutivos
  renderReportesView() {
    setTimeout(() => Sprint3.initReportCharts(), 100);

    return `
      <div class="card" style="margin-bottom: 1.5rem;">
        <div class="card-header">
          <h3><i class="fa-solid fa-file-invoice-dollar"></i> Reportes de Gestión y Analítica Operativa</h3>
          <div style="display: flex; gap: 0.5rem;">
            <button class="btn btn-outline" onclick="Sprint3.exportReport('PDF')"><i class="fa-solid fa-print"></i> Imprimir / PDF</button>
            <button class="btn btn-primary" onclick="Sprint3.exportReport('Excel')"><i class="fa-solid fa-file-excel"></i> Descargar Excel / CSV</button>
          </div>
        </div>

        <p style="font-size: 0.9rem; color: var(--text-muted); margin: 0;">
          Resumen analítico en tiempo real de inventario, rendimiento comercial y balance financiero de Mueblería Anahí.
        </p>
      </div>

      <!-- Charts Grid -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 1.5rem; margin-bottom: 1.5rem;">
        <div class="card" style="margin-bottom: 0;">
          <div class="card-header">
            <h3><i class="fa-solid fa-chart-pie"></i> Distribución de Stock por Categoría</h3>
            <span class="badge badge-accent">Unidades</span>
          </div>
          <div style="height: 250px; position: relative;">
            <canvas id="chart-inventory-cat"></canvas>
          </div>
        </div>

        <div class="card" style="margin-bottom: 0;">
          <div class="card-header">
            <h3><i class="fa-solid fa-chart-line"></i> Comparativo de Ingresos vs Egresos ($)</h3>
            <span class="badge badge-success">Flujo Caja</span>
          </div>
          <div style="height: 250px; position: relative;">
            <canvas id="chart-finances-bar"></canvas>
          </div>
        </div>
      </div>

      <!-- Resumen Operativo de Módulos del Sistema -->
      <div class="card">
        <div class="card-header">
          <h3><i class="fa-solid fa-layer-group"></i> Estado Operativo de Módulos de Gestión</h3>
          <span class="badge badge-success"><i class="fa-solid fa-circle-check"></i> Sistema 100% Operativo</span>
        </div>
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th class="nowrap">Módulo</th>
                <th>Área Funcional</th>
                <th>Alcance Operativo</th>
                <th>Capacidades Principales</th>
                <th class="nowrap">Estado del Módulo</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="nowrap"><strong>Abastecimiento e Inventario</strong></td>
                <td>Bodega y Compras</td>
                <td>Control de materias primas, insumos y compras</td>
                <td>Stock en tiempo real, catálogo de proveedores, alertas de stock y medidas</td>
                <td class="nowrap"><span class="badge badge-success"><i class="fa-solid fa-check"></i> Activo en Línea</span></td>
              </tr>
              <tr>
                <td class="nowrap"><strong>Ventas y Asistente Virtual</strong></td>
                <td>Comercial y Showroom</td>
                <td>Punto de venta, clientes y atención asistida</td>
                <td>Facturación POS, emisión de recibos oficiales, directorio y bot de consultas</td>
                <td class="nowrap"><span class="badge badge-success"><i class="fa-solid fa-check"></i> Activo en Línea</span></td>
              </tr>
              <tr>
                <td class="nowrap"><strong>Taller y Finanzas</strong></td>
                <td>Producción y Administración</td>
                <td>Pedidos personalizados, caja y balances</td>
                <td>Tablero Kanban de taller, hojas de fabricación, ingresos/gastos y reportes</td>
                <td class="nowrap"><span class="badge badge-success"><i class="fa-solid fa-check"></i> Activo en Línea</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  initReportCharts() {
    const data = window.appStore.data;

    // Destroy previous instances safely
    if (window.chartInstances['report-cat']) {
      window.chartInstances['report-cat'].destroy();
    }
    if (window.chartInstances['report-finances']) {
      window.chartInstances['report-finances'].destroy();
    }

    // 1. Category stock distribution
    const catMap = {};
    data.productos.forEach(p => {
      catMap[p.categoria] = (catMap[p.categoria] || 0) + p.stock;
    });

    const ctx1 = document.getElementById('chart-inventory-cat');
    if (ctx1 && typeof Chart !== 'undefined') {
      window.chartInstances['report-cat'] = new Chart(ctx1, {
        type: 'doughnut',
        data: {
          labels: Object.keys(catMap),
          datasets: [{
            data: Object.values(catMap),
            backgroundColor: ['#8B5A2B', '#D4A373', '#E9C46A', '#F4A261', '#2C1810']
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

    // 2. Finance comparison bar chart
    const totalIngresos = data.finanzas.filter(f => f.tipo === 'Ingreso').reduce((a, b) => a + b.monto, 0);
    const totalEgresos = data.finanzas.filter(f => f.tipo === 'Egreso').reduce((a, b) => a + b.monto, 0);

    const ctx2 = document.getElementById('chart-finances-bar');
    if (ctx2 && typeof Chart !== 'undefined') {
      window.chartInstances['report-finances'] = new Chart(ctx2, {
        type: 'bar',
        data: {
          labels: ['Total Ingresos', 'Total Egresos'],
          datasets: [{
            label: 'Monto en USD ($)',
            data: [totalIngresos, totalEgresos],
            backgroundColor: ['#10B981', '#EF4444'],
            borderRadius: 8
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } }
        }
      });
    }
  },

  // Real Excel/CSV download & printable report export
  exportReport(type) {
    if (type === 'PDF') {
      window.print();
      return;
    }

    // Generate real CSV with UTF-8 BOM
    const data = window.appStore.data;
    let csv = '\uFEFF'; // UTF-8 BOM for Microsoft Excel compatibility
    csv += 'REPORTE CONSOLIDADO - CARPINTERIA & MUEBLERIA ANAHI\n';
    csv += `Generado: ${new Date().toLocaleString()}\n\n`;

    // 1. Seccion Productos
    csv += 'INVENTARIO DE PRODUCTOS\n';
    csv += 'Codigo;Nombre;Categoria;Stock;StockMinimo;PrecioCompra;PrecioVenta\n';
    data.productos.forEach(p => {
      csv += `"${p.id}";"${p.nombre}";"${p.categoria}";${p.stock};${p.stockMinimo};${p.precioCompra};${p.precioVenta}\n`;
    });
    csv += '\n';

    // 2. Seccion Ventas
    csv += 'REGISTRO DE VENTAS COMERCIALES\n';
    csv += 'Codigo;Fecha;Cliente;Producto;Cantidad;Total;MetodoPago\n';
    data.ventas.forEach(v => {
      csv += `"${v.id}";"${v.fecha}";"${v.clienteId}";"${v.productoId}";${v.cantidad};${v.total};"${v.metodoPago}"\n`;
    });
    csv += '\n';

    // 3. Seccion Finanzas
    csv += 'MOVIMIENTOS FINANCIEROS DE CAJA\n';
    csv += 'Codigo;Fecha;Tipo;Concepto;Categoria;Monto\n';
    data.finanzas.forEach(f => {
      csv += `"${f.id}";"${f.fecha}";"${f.tipo}";"${f.concepto}";"${f.categoria}";${f.monto}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Reporte_AnahiBot_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.showToast('Reporte CSV/Excel generado y descargado con éxito.', 'success', 'Reporte Descargado');
  },

  closeModal() {
    const modal = document.getElementById('modal-container');
    if (modal) modal.remove();
  }
};
