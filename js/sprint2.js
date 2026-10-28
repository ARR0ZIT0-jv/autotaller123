/**
 * AnahiBot - Módulo: Clientes, Ventas POS y Asistente AnahiBot NLP
 * Gestión de cartera de clientes, punto de venta y asistente virtual
 */

const Sprint2 = {
  // Render Gestión de Clientes (US-005)
  renderClientesView() {
    const clientes = window.appStore.data.clientes;
    const comerciales = clientes.filter(c => c.tipo === 'Comercial' || c.tipo === 'Corporativo').length;
    const particulares = clientes.filter(c => c.tipo === 'Particular').length;

    return `
      <!-- Clientes KPI Ribbon -->
      <div class="kpi-grid" style="margin-bottom: 1.5rem;">
        <div class="kpi-card">
          <div class="kpi-icon wood"><i class="fa-solid fa-users"></i></div>
          <div class="kpi-data">
            <span>Directorio Clientes</span>
            <h2>${clientes.length} registrados</h2>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon amber"><i class="fa-solid fa-building"></i></div>
          <div class="kpi-data">
            <span>Comercial / Corporativo</span>
            <h2>${comerciales} cuentas</h2>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon green"><i class="fa-solid fa-user-tag"></i></div>
          <div class="kpi-data">
            <span>Clientes Particulares</span>
            <h2>${particulares} personas</h2>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3><i class="fa-solid fa-users"></i> Directorio de Clientes y Cuentas Comerciales</h3>
          <button class="btn btn-primary" onclick="Sprint2.showNewClientModal()">
            <i class="fa-solid fa-user-plus"></i> Nuevo Cliente
          </button>
        </div>

        <div class="form-group" style="margin-bottom: 1.25rem;">
          <input type="text" id="filter-clientes" class="form-control" placeholder="Buscar por nombre, cédula/RUC, teléfono, email o dirección..." oninput="Sprint2.filterClientes()">
        </div>

        <div class="table-responsive">
          <table class="table" id="table-clientes">
            <thead>
              <tr>
                <th class="nowrap">Código</th>
                <th>Nombre / Razón Social</th>
                <th>Cédula / RUC</th>
                <th>Contacto Telefónico</th>
                <th>Correo Electrónico</th>
                <th>Dirección</th>
                <th>Tipo</th>
                <th class="nowrap">Acciones</th>
              </tr>
            </thead>
            <tbody>
              ${clientes.map(c => `
                <tr>
                  <td class="nowrap"><span class="code-id">${c.id}</span></td>
                  <td><strong>${c.nombre}</strong></td>
                  <td class="nowrap">${c.identificacion}</td>
                  <td class="nowrap"><i class="fa-solid fa-phone" style="font-size:0.75rem;"></i> ${c.telefono}</td>
                  <td>${c.email}</td>
                  <td>${c.direccion}</td>
                  <td>
                    <span class="badge ${c.tipo === 'Comercial' ? 'badge-accent' : (c.tipo === 'Corporativo' ? 'badge-info' : 'badge-success')}">
                      ${c.tipo}
                    </span>
                  </td>
                  <td class="nowrap">
                    <div class="table-row-actions">
                      <button class="btn-row-action danger" onclick="Sprint2.handleDeleteClient('${c.id}', '${c.nombre}')" title="Eliminar cliente">
                        <i class="fa-regular fa-trash-can"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  filterClientes() {
    const q = (document.getElementById('filter-clientes')?.value || '').toLowerCase();
    document.querySelectorAll('#table-clientes tbody tr').forEach(row => {
      row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
  },

  handleDeleteClient(id, name) {
    if (confirm(`¿Estás seguro de eliminar a "${name}" de la base de clientes?`)) {
      window.appStore.deleteClient(id);
      window.showToast(`Cliente "${name}" eliminado.`, 'info');
    }
  },

  showNewClientModal() {
    Sprint2.closeModal();
    const modalHtml = `
      <div class="modal-backdrop" id="modal-container" onclick="if(event.target === this) Sprint2.closeModal()">
        <div class="card" style="width: 520px; max-width: 90vw;">
          <div class="card-header">
            <h3><i class="fa-solid fa-user-plus"></i> Registrar Nuevo Cliente</h3>
            <button class="btn-icon" onclick="Sprint2.closeModal()"><i class="fa-solid fa-xmark"></i></button>
          </div>
          <form onsubmit="Sprint2.handleCreateClient(event)">
            <div class="form-group">
              <label>Nombre Completo / Razón Social</label>
              <input type="text" id="new-cli-nombre" class="form-control" required placeholder="Ej. Arq. Sofía Larrea">
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Cédula / RUC</label>
                <input type="text" id="new-cli-ident" class="form-control" required placeholder="1102938475">
              </div>
              <div class="form-group">
                <label>Tipo de Cliente</label>
                <select id="new-cli-tipo" class="form-control" required>
                  <option value="Particular">Particular</option>
                  <option value="Comercial">Comercial / Arquitecto</option>
                  <option value="Corporativo">Corporativo / Empresa</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Teléfono Móvil</label>
                <input type="text" id="new-cli-tel" class="form-control" required placeholder="0998887766">
              </div>
              <div class="form-group">
                <label>Correo Electrónico</label>
                <input type="email" id="new-cli-email" class="form-control" required placeholder="cliente@correo.com">
              </div>
            </div>
            <div class="form-group">
              <label>Dirección de Entrega / Facturación</label>
              <input type="text" id="new-cli-dir" class="form-control" required placeholder="Av. 12 de Octubre y Cordero">
            </div>
            <div style="text-align: right; margin-top: 1.5rem; gap: 0.5rem; display: flex; justify-content: flex-end;">
              <button type="button" class="btn btn-outline" onclick="Sprint2.closeModal()">Cancelar</button>
              <button type="submit" class="btn btn-primary">Guardar Cliente</button>
            </div>
          </form>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
  },

  handleCreateClient(e) {
    e.preventDefault();
    const newClient = {
      nombre: document.getElementById('new-cli-nombre').value,
      identificacion: document.getElementById('new-cli-ident').value,
      tipo: document.getElementById('new-cli-tipo').value,
      telefono: document.getElementById('new-cli-tel').value,
      email: document.getElementById('new-cli-email').value,
      direccion: document.getElementById('new-cli-dir').value
    };

    window.appStore.addClient(newClient);
    Sprint2.closeModal();
    window.showToast(`Cliente "${newClient.nombre}" registrado exitosamente.`, 'success');
  },

  // Render Registro de Ventas - POS (US-006)
  renderVentasView() {
    const data = window.appStore.data;
    const clientesMap = Object.fromEntries(data.clientes.map(c => [c.id, c.nombre]));
    const prodsMap = Object.fromEntries(data.productos.map(p => [p.id, p.nombre]));
    const totalVentas = data.ventas.reduce((acc, v) => acc + v.total, 0);
    const ticketPromedio = data.ventas.length > 0 ? (totalVentas / data.ventas.length) : 0;

    return `
      <div class="kpi-grid" style="margin-bottom: 1.5rem;">
        <div class="kpi-card">
          <div class="kpi-icon green"><i class="fa-solid fa-cash-register"></i></div>
          <div class="kpi-data">
            <span>Total Ventas Facturadas</span>
            <h2>$${totalVentas.toFixed(2)}</h2>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon amber"><i class="fa-solid fa-receipt"></i></div>
          <div class="kpi-data">
            <span>Transacciones POS</span>
            <h2>${data.ventas.length} emitidas</h2>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon wood"><i class="fa-solid fa-chart-line"></i></div>
          <div class="kpi-data">
            <span>Ticket Promedio</span>
            <h2>$${ticketPromedio.toFixed(2)}</h2>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3><i class="fa-solid fa-cash-register"></i> Punto de Venta (POS) Comercial e Historial</h3>
          <button class="btn btn-primary" onclick="Sprint2.showNewSaleModal()">
            <i class="fa-solid fa-plus"></i> Nueva Venta
          </button>
        </div>

        <div class="form-group" style="margin-bottom: 1.25rem;">
          <input type="text" id="filter-ventas" class="form-control" placeholder="Buscar venta por Nº Factura, cliente o producto..." oninput="Sprint2.filterVentas()">
        </div>

        <div class="table-responsive">
          <table class="table" id="table-ventas">
            <thead>
              <tr>
                <th class="nowrap">Nº Venta</th>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>Producto Vendido</th>
                <th>Cant.</th>
                <th>P. Unitario</th>
                <th>Total Facturado</th>
                <th>Método Pago</th>
                <th>Estado</th>
                <th class="nowrap">Comprobante</th>
              </tr>
            </thead>
            <tbody>
              ${data.ventas.map(v => `
                <tr>
                  <td class="nowrap"><span class="code-id">${v.id}</span></td>
                  <td class="nowrap"><i class="fa-regular fa-calendar"></i> ${v.fecha}</td>
                  <td><strong>${clientesMap[v.clienteId] || v.clienteId}</strong></td>
                  <td><strong>${prodsMap[v.productoId] || v.productoId}</strong></td>
                  <td>${v.cantidad}</td>
                  <td class="nowrap">$${v.precioUnitario.toFixed(2)}</td>
                  <td class="nowrap"><strong style="color: var(--status-success); font-size: 1rem;">$${v.total.toFixed(2)}</strong></td>
                  <td><span class="badge badge-accent">${v.metodoPago}</span></td>
                  <td class="nowrap"><span class="badge badge-success"><i class="fa-solid fa-circle-check"></i> ${v.estado}</span></td>
                  <td class="nowrap">
                    <button class="btn btn-outline btn-sm" onclick="Sprint2.showReceiptModal('${v.id}')" title="Ver e imprimir recibo oficial">
                      <i class="fa-solid fa-receipt"></i> Recibo
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  filterVentas() {
    const q = (document.getElementById('filter-ventas')?.value || '').toLowerCase();
    document.querySelectorAll('#table-ventas tbody tr').forEach(row => {
      row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
  },

  showNewSaleModal() {
    Sprint2.closeModal();
    const { clientes, productos } = window.appStore.data;
    const availableProds = productos.filter(p => p.stock > 0);

    if (availableProds.length === 0) {
      window.showToast('No hay productos con stock disponible en este momento. Reabastece inventario primero.', 'error', 'Sin Stock');
      return;
    }

    const modalHtml = `
      <div class="modal-backdrop" id="modal-container" onclick="if(event.target === this) Sprint2.closeModal()">
        <div class="card" style="width: 530px; max-width: 90vw;">
          <div class="card-header">
            <h3><i class="fa-solid fa-cart-shopping"></i> Punto de Venta (POS) - Registrar Venta</h3>
            <button class="btn-icon" onclick="Sprint2.closeModal()"><i class="fa-solid fa-xmark"></i></button>
          </div>
          <form onsubmit="Sprint2.handleCreateSale(event)">
            <div class="form-group">
              <label>Fecha de Emisión</label>
              <input type="date" id="new-sale-fecha" class="form-control" value="${new Date().toISOString().split('T')[0]}" required>
            </div>
            <div class="form-group">
              <label>Cliente Facturación</label>
              <select id="new-sale-cli" class="form-control" required>
                ${clientes.map(c => `<option value="${c.id}">${c.nombre} (${c.tipo}) - C.I./RUC: ${c.identificacion}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>Producto / Mueble en Stock</label>
              <select id="new-sale-prod" class="form-control" required onchange="Sprint2.updateDefaultPrice()">
                ${availableProds.map(p => `<option value="${p.id}" data-price="${p.precioVenta}" data-stock="${p.stock}">${p.nombre} — Disponible: ${p.stock} und ($${p.precioVenta.toFixed(2)})</option>`).join('')}
              </select>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Cantidad a Vender</label>
                <input type="number" id="new-sale-cant" class="form-control" min="1" value="1" required oninput="Sprint2.calculateSaleTotal()">
              </div>
              <div class="form-group">
                <label>Precio Unitario ($)</label>
                <input type="number" step="0.01" id="new-sale-precio" class="form-control" required value="${availableProds[0] ? availableProds[0].precioVenta : 0}" oninput="Sprint2.calculateSaleTotal()">
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Método de Pago</label>
                <select id="new-sale-metodo" class="form-control" required>
                  <option value="Transferencia">Transferencia Bancaria</option>
                  <option value="Efectivo">Efectivo</option>
                  <option value="Tarjeta">Tarjeta de Débito/Crédito</option>
                  <option value="Crédito 30d">Crédito Comercial (30 días)</option>
                </select>
              </div>
              <div class="form-group">
                <label>Total a Cobrar ($)</label>
                <input type="text" id="new-sale-total" class="form-control" readonly style="font-weight: 800; font-size: 1.1rem; color: var(--status-success);" value="$0.00">
              </div>
            </div>
            <div style="text-align: right; margin-top: 1.5rem; gap: 0.5rem; display: flex; justify-content: flex-end;">
              <button type="button" class="btn btn-outline" onclick="Sprint2.closeModal()">Cancelar</button>
              <button type="submit" class="btn btn-primary">Emitir Venta y Descontar Stock</button>
            </div>
          </form>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    Sprint2.updateDefaultPrice();
  },

  updateDefaultPrice() {
    const select = document.getElementById('new-sale-prod');
    if (!select || select.options.length === 0) return;
    const selectedOption = select.options[select.selectedIndex];
    const price = selectedOption.getAttribute('data-price');
    if (price) {
      document.getElementById('new-sale-precio').value = price;
    }
    Sprint2.calculateSaleTotal();
  },

  calculateSaleTotal() {
    const cant = parseFloat(document.getElementById('new-sale-cant')?.value) || 0;
    const precio = parseFloat(document.getElementById('new-sale-precio')?.value) || 0;
    const totalEl = document.getElementById('new-sale-total');
    if (totalEl) {
      totalEl.value = `$${(cant * precio).toFixed(2)}`;
    }
  },

  handleCreateSale(e) {
    e.preventDefault();
    try {
      const sale = window.appStore.addSale({
        fecha: document.getElementById('new-sale-fecha').value,
        clienteId: document.getElementById('new-sale-cli').value,
        productoId: document.getElementById('new-sale-prod').value,
        cantidad: parseInt(document.getElementById('new-sale-cant').value, 10),
        precioUnitario: parseFloat(document.getElementById('new-sale-precio').value),
        metodoPago: document.getElementById('new-sale-metodo').value
      });

      Sprint2.closeModal();
      window.showToast(`Venta ${sale.id} completada exitosamente. Stock deducido en inventario.`, 'success', 'Venta Registrada');
      
      // Auto open receipt preview for user convenience
      setTimeout(() => Sprint2.showReceiptModal(sale.id), 300);
    } catch (err) {
      window.showToast(err.message, 'error', 'Error en Venta');
    }
  },

  // Official Printable Sales Receipt Modal
  showReceiptModal(saleId) {
    Sprint2.closeModal();
    const data = window.appStore.data;
    const sale = data.ventas.find(v => v.id === saleId);
    if (!sale) return;

    const cliente = data.clientes.find(c => c.id === sale.clienteId) || { nombre: 'Consumidor Final', identificacion: '9999999999', telefono: 'N/A', direccion: 'Cuenca, Ecuador' };
    const prod = data.productos.find(p => p.id === sale.productoId) || { nombre: 'Producto de Carpintería' };

    const modalHtml = `
      <div class="modal-backdrop" id="modal-container" onclick="if(event.target === this) Sprint2.closeModal()">
        <div class="card" style="width: 650px; max-width: 92vw; padding: 0;">
          <div style="padding: 1rem 1.5rem; background: var(--bg-main); border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;" class="no-print">
            <h4 style="margin: 0; color: var(--primary-wood);"><i class="fa-solid fa-receipt"></i> Comprobante de Venta Oficial</h4>
            <div style="display: flex; gap: 0.5rem;">
              <button class="btn btn-primary btn-sm" onclick="window.print()"><i class="fa-solid fa-print"></i> Imprimir Comprobante</button>
              <button class="btn-icon" onclick="Sprint2.closeModal()"><i class="fa-solid fa-xmark"></i></button>
            </div>
          </div>

          <div class="printable-sheet">
            <div class="receipt-header">
              <div class="receipt-brand">
                <h2>Carpintería & Mueblería Anahí</h2>
                <p>Especialistas en Muebles Finos de Madera Maciza y Acabados de Autor</p>
                <small class="text-muted">RUC: 1792345678001 • Matriz: Av. Gran Colombia 4-12, Cuenca • Tel: (07) 283-4920</small>
              </div>
              <div class="receipt-meta">
                <h3>RECIBO DE VENTA</h3>
                <span class="code-id" style="font-size: 1rem;">${sale.id}</span>
                <p style="margin-top: 0.35rem; color: var(--text-muted);">Fecha: ${sale.fecha}</p>
              </div>
            </div>

            <div class="receipt-client-box">
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
                <div><strong>Cliente:</strong> ${cliente.nombre}</div>
                <div><strong>C.I. / RUC:</strong> ${cliente.identificacion}</div>
                <div><strong>Teléfono:</strong> ${cliente.telefono}</div>
                <div><strong>Dirección:</strong> ${cliente.direccion}</div>
              </div>
            </div>

            <table class="receipt-summary-table">
              <thead>
                <tr>
                  <th>Descripción del Producto / Insumo</th>
                  <th style="text-align: center;">Cantidad</th>
                  <th style="text-align: right;">Precio Unit.</th>
                  <th style="text-align: right;">Total Item</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>${prod.nombre}</strong>
                    <div style="font-size: 0.8rem; color: var(--text-muted);">${prod.categoria}</div>
                  </td>
                  <td style="text-align: center;">${sale.cantidad}</td>
                  <td style="text-align: right;">$${sale.precioUnitario.toFixed(2)}</td>
                  <td style="text-align: right;">$${sale.total.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>

            <div class="receipt-totals">
              <table class="receipt-totals-table">
                <tr>
                  <td>Subtotal 0% (Artesanos):</td>
                  <td style="text-align: right;">$${sale.total.toFixed(2)}</td>
                </tr>
                <tr>
                  <td>I.V.A. (0%):</td>
                  <td style="text-align: right;">$0.00</td>
                </tr>
                <tr class="total-row">
                  <td>Total Pagado:</td>
                  <td style="text-align: right;">$${sale.total.toFixed(2)}</td>
                </tr>
              </table>
            </div>

            <div style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.2); padding: 0.75rem 1rem; border-radius: 6px; margin-bottom: 1.5rem; font-size: 0.85rem; display: flex; justify-content: space-between;">
              <span><strong>Forma de Cobro:</strong> ${sale.metodoPago}</span>
              <span><strong>Estado de Pago:</strong> <i class="fa-solid fa-circle-check" style="color:var(--status-success);"></i> Liquidado</span>
            </div>

            <div class="receipt-footer">
              <p>¡Gracias por confiar en el arte y calidad de Mueblería Anahí!</p>
              <small>Garantía de fabricación de 1 año en ensamble y madera contra defectos de fabricación.</small>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
  },

  // Render Chatbot AnahiBot Dedicated View & Interactive Assistant (US-007)
  renderChatbotView() {
    return `
      <div class="card" style="height: calc(100vh - 175px); display: flex; flex-direction: column; margin-bottom: 0;">
        <div class="card-header">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <div class="bot-avatar" style="width: 36px; height: 36px; border-radius: 50%; background: var(--accent-amber); display: flex; align-items: center; justify-content: center;">
              <i class="fa-solid fa-robot"></i>
            </div>
            <div>
              <h3 style="margin: 0;">AnahiBot - Asistente de Operaciones y Carpintería</h3>
              <small style="color: var(--status-success); font-weight: 600;"><i class="fa-solid fa-circle" style="font-size: 0.6rem;"></i> Motor IA Conectado a Datos en Vivo</small>
            </div>
          </div>
          <span class="badge badge-accent">Asistente Virtual IA</span>
        </div>

        <div class="chatbot-messages" id="view-chatbot-messages" style="flex: 1; padding: 1.5rem; background: var(--bg-main); border-radius: var(--radius-md); overflow-y: auto;">
          <div class="chat-message bot">
            <div class="message-content">
              ¡Hola! 👋 Soy <strong>AnahiBot</strong>, la inteligencia asistencial de la <strong>Carpintería & Mueblería Anahí</strong>.
              <br><br>
              Puedo consultar por ti en tiempo real:
              <br>• 🪵 <strong>Stock de maderas e insumos:</strong> Roble, Cedro, MDF, Barniz, etc.
              <br>• ⚠️ <strong>Alertas de inventario crítico</strong>
              <br>• 🔨 <strong>Pedidos en fabricación en taller</strong>
              <br>• 💰 <strong>Ventas y balance financiero</strong>
              <br>• 🚚 <strong>Proveedores y órdenes de compra</strong>
              <br><br>
              <em>Escribe cualquier consulta o pulsa un botón rápido abajo:</em>
            </div>
          </div>
        </div>

        <div class="chatbot-quick-questions" style="padding: 0.75rem 0;">
          <button class="chip-btn" onclick="Sprint2.sendQuickQuery('¿Qué materiales o productos tienen bajo stock?')">⚠️ Alerta Bajo Stock</button>
          <button class="chip-btn" onclick="Sprint2.sendQuickQuery('¿Cuánta madera de Roble tenemos disponible?')">🪵 Stock de Roble</button>
          <button class="chip-btn" onclick="Sprint2.sendQuickQuery('¿Cuánto cuestan los juegos de comedor?')">🪑 Precio Comedor</button>
          <button class="chip-btn" onclick="Sprint2.sendQuickQuery('¿Cuáles son los pedidos en producción en taller?')">🔨 Pedidos en Taller</button>
          <button class="chip-btn" onclick="Sprint2.sendQuickQuery('¿Cuál es el resumen de ventas?')">💰 Resumen de Ventas</button>
          <button class="chip-btn" onclick="Sprint2.sendQuickQuery('¿Cuál es el balance financiero de caja?')">📊 Balance de Caja</button>
          <button class="chip-btn" onclick="Sprint2.sendQuickQuery('¿Quiénes son nuestros proveedores?')">🚚 Proveedores</button>
          <button class="chip-btn" onclick="Sprint2.sendQuickQuery('¿Cuántos clientes tenemos registrados?')">👥 Directorio Clientes</button>
          <button class="chip-btn" onclick="Sprint2.sendQuickQuery('¿Qué materiales necesitan reabastecerse con urgencia?')">📦 Reabastecer</button>
          <button class="chip-btn" onclick="Sprint2.sendQuickQuery('¿Cuántas ventas se han facturado en total?')">🧾 Total Facturado</button>
          <button class="chip-btn" onclick="Sprint2.sendQuickQuery('¿Cuánto stock de Cedro tenemos disponible?')">🪵 Stock de Cedro</button>
          <button class="chip-btn" onclick="Sprint2.sendQuickQuery('¿Cuánto stock de MDF tenemos?')">🪵 Stock de MDF</button>
          <button class="chip-btn" onclick="Sprint2.sendQuickQuery('¿Hay pedidos de muebles a medida en fabricación?')">🏭 En Producción</button>
          <button class="chip-btn" onclick="Sprint2.sendQuickQuery('¿Cuáles son los ingresos totales registrados?')">💵 Ingresos Totales</button>
          <button class="chip-btn" onclick="Sprint2.sendQuickQuery('¿Cuáles son los egresos o gastos totales?')">💸 Egresos Totales</button>
          <button class="chip-btn" onclick="Sprint2.sendQuickQuery('¿Qué muebles a medida están actualmente en fabricación?')">🔧 Muebles a Medida</button>
          <button class="chip-btn" onclick="Sprint2.sendQuickQuery('¿Cuánto cuestan las planchas de madera?')">🪓 Precio Planchas</button>
          <button class="chip-btn" onclick="Sprint2.sendQuickQuery('¿Hay algún producto agotado o en estado crítico?')">🚫 Productos Agotados</button>
          <button class="chip-btn" onclick="Sprint2.sendQuickQuery('¿Qué puedes hacer? ¿En qué me ayudas?')">🤖 Ayuda del Bot</button>
          <button class="chip-btn" onclick="Sprint2.sendQuickQuery('¿Cuáles son los compradores o clientes frecuentes?')">⭐ Compradores Frecuentes</button>
        </div>


        <form onsubmit="Sprint2.handleFullChatSubmit(event)" style="display: flex; gap: 0.5rem; margin-top: 0.5rem;">
          <input type="text" id="view-chatbot-input" class="form-control" placeholder="Pregunta a AnahiBot sobre inventario, ventas, clientes o pedidos..." required autocomplete="off">
          <button type="submit" class="btn btn-primary" style="white-space: nowrap;"><i class="fa-solid fa-paper-plane"></i> Enviar</button>
        </form>
      </div>
    `;
  },

  sendQuickQuery(queryText) {
    const input = document.getElementById('view-chatbot-input');
    if (input) {
      input.value = queryText;
      Sprint2.handleFullChatSubmit(new Event('submit'));
    }
  },

  handleFullChatSubmit(e) {
    e.preventDefault();
    const input = document.getElementById('view-chatbot-input');
    const query = input?.value.trim();
    if (!query) return;

    const container = document.getElementById('view-chatbot-messages');
    
    // Add user message
    container.insertAdjacentHTML('beforeend', `
      <div class="chat-message user">
        <div class="message-content">${query}</div>
      </div>
    `);

    input.value = '';
    container.scrollTop = container.scrollHeight;

    // Show typing indicator
    const typingId = 'typing-view-' + Date.now();
    container.insertAdjacentHTML('beforeend', `
      <div class="chat-message bot" id="${typingId}">
        <div class="typing-indicator">
          <span></span><span></span><span></span>
        </div>
      </div>
    `);
    container.scrollTop = container.scrollHeight;

    // Process Bot Response
    setTimeout(() => {
      const typingEl = document.getElementById(typingId);
      if (typingEl) typingEl.remove();

      const response = Sprint2.processBotQuery(query);
      container.insertAdjacentHTML('beforeend', `
        <div class="chat-message bot">
          <div class="message-content">${response}</div>
        </div>
      `);
      container.scrollTop = container.scrollHeight;
    }, 380);
  },

  // NLP Query Processor Engine for AnahiBot
  processBotQuery(query) {
    const q = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const store = window.appStore.data;

    // 1. Saludos y Cortesía
    if (/^(hola|buenas|buen dia|buenos dias|buenas tardes|buenas noches|que tal|saludos|hey)/i.test(q)) {
      return `¡Hola! 👋 Qué gusto saludarte. Soy <strong>AnahiBot</strong>, tu asistente de gestión para Carpintería Anahí.<br>¿En qué puedo orientarte hoy? Puedes consultarme sobre <strong>stock de materiales</strong>, <strong>pedidos en taller</strong> o <strong>ventas del día</strong>.`;
    }

    if (q.includes('gracias') || q.includes('muchas gracias')) {
      return `¡Con mucho gusto! Estoy aquí para optimizar todas las operaciones de la carpintería. Si necesitas algo más, solo pregúntame. 😊`;
    }

    // 2. Ayuda y Capacidades
    if (q.includes('ayuda') || q.includes('que puedes hacer') || q.includes('que sabes') || q.includes('comandos')) {
      return `🤖 <strong>Puedo ayudarte en las siguientes áreas:</strong><br>` +
        `• <strong>Stock de Materiales:</strong> "¿Cuánto stock de Roble hay?", "¿Qué materiales faltan?"<br>` +
        `• <strong>Precios y Productos:</strong> "¿Cuánto cuesta el comedor?", "¿Qué planchas hay?"<br>` +
        `• <strong>Taller de Carpintería:</strong> "¿Qué pedidos están en taller?", "¿Estado de fabricación?"<br>` +
        `• <strong>Punto de Venta:</strong> "¿Cuánto se ha vendido?", "¿Cuáles son las últimas ventas?"<br>` +
        `• <strong>Proveedores:</strong> "¿Quiénes son los proveedores de herrajes?"<br>` +
        `• <strong>Finanzas:</strong> "¿Cuál es el balance de caja?"`;
    }

    // 3. Bajo Stock / Alertas de Reabastecimiento
    if (q.includes('bajo stock') || q.includes('reabastecer') || q.includes('alerta') || q.includes('falta') || q.includes('agotado') || q.includes('critico')) {
      const lowStockList = store.productos.filter(p => p.stock <= p.stockMinimo);
      if (lowStockList.length === 0) {
        return `✅ <strong>¡Inventario Óptimo!</strong><br>Actualmente no hay ningún producto en nivel crítico. Todos los materiales tienen stock por encima del umbral mínimo asignado.`;
      }
      return `⚠️ <strong>Alertas de Reabastecimiento:</strong><br>Encontré <strong>${lowStockList.length}</strong> material(es) en estado crítico:<br><ul>` +
        lowStockList.map(p => `<li><strong>${p.nombre}</strong>: Quedan <strong>${p.stock} unidades</strong> (Mínimo: ${p.stockMinimo}). Ubicación: ${p.ubicacion || 'Taller Central'}</li>`).join('') +
        `</ul><br>👉 <em>Recomendación:</em> Puedes registrar una Orden de Compra rápida en la pestaña <strong>Registro de Compras</strong>.`;
    }

    // 4. Búsqueda Dinámica en Catálogo de Productos y Precios
    const matchedProds = store.productos.filter(p => {
      const pName = p.nombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const pCat = p.categoria.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return q.split(/\s+/).some(term => term.length >= 4 && (pName.includes(term) || pCat.includes(term)));
    });

    if (matchedProds.length > 0) {
      return `🪵 <strong>Información de Catálogo e Inventario:</strong><br>Encontré ${matchedProds.length} coincidencia(s):<br><ul>` +
        matchedProds.map(p => {
          const isLow = p.stock <= p.stockMinimo;
          const status = isLow ? `<span style="color:var(--status-danger);">⚠️ Reabastecer (${p.stock} und)</span>` : `<span style="color:var(--status-success);">✅ ${p.stock} und disponibles</span>`;
          return `<li><strong>${p.nombre}</strong> (${p.categoria})<br>` +
            `• Stock: ${status}<br>` +
            `• Precio Venta: <strong>$${p.precioVenta.toFixed(2)}</strong> (Costo: $${p.precioCompra.toFixed(2)})<br>` +
            `• Ubicación: ${p.ubicacion || 'Taller Central'}</li>`;
        }).join('') +
        `</ul>`;
    }

    // 5. Ventas y Rendimiento Comercial
    if (q.includes('venta') || q.includes('factur') || q.includes('pos') || q.includes('cuanto vendimos') || q.includes('ingreso comercial')) {
      const totalV = store.ventas.reduce((acc, v) => acc + v.total, 0);
      return `💰 <strong>Resumen del Punto de Venta (POS):</strong><br>` +
        `• <strong>Total de Ventas Facturadas:</strong> $${totalV.toFixed(2)} USD<br>` +
        `• <strong>Transacciones Registradas:</strong> ${store.ventas.length} ventas<br>` +
        `• <strong>Última Transacción:</strong> Venta ${store.ventas[store.ventas.length - 1]?.id || 'N/A'} por $${store.ventas[store.ventas.length - 1]?.total.toFixed(2) || '0.00'}<br>` +
        `Puedes generar o imprimir comprobantes en la sección <strong>Registro de Ventas</strong>.`;
    }

    // 6. Pedidos a Medida y Taller de Carpintería
    if (q.includes('taller') || q.includes('pedido') || q.includes('produccion') || q.includes('medida') || q.includes('mueble a medida') || q.includes('fabricacion')) {
      return `🔨 <strong>Tablero Kanban de Taller Carpintería:</strong><br>Actualmente hay <strong>${store.pedidos.length} pedido(s)</strong> registrados:<br><ul>` +
        store.pedidos.map(p => `<li><strong>${p.id} - ${p.titulo}</strong><br>` +
          `• Estado: <span class="badge badge-accent">${p.estado}</span> • Entrega: <strong>${p.fechaEntrega}</strong><br>` +
          `• Dimensiones: ${p.especificacionesMedidas}<br>` +
          `• Presupuesto: $${p.presupuesto.toFixed(2)} (Anticipo abonado: $${p.anticipo.toFixed(2)})</li>`).join('') +
        `</ul>`;
    }

    // 7. Proveedores y Abastecimiento
    if (q.includes('proveedor') || q.includes('compra') || q.includes('insumo') || q.includes('materia prima')) {
      return `🚚 <strong>Directorio de Proveedores Homologados:</strong><br><ul>` +
        store.proveedores.map(pr => `<li><strong>${pr.razonSocial}</strong> (${pr.ciudad})<br>` +
          `• Contacto: ${pr.contacto} • Tel: ${pr.telefono}<br>` +
          `• Tiempo de Entrega Promedio: <strong>${pr.tiempoEntrega}</strong></li>`).join('') +
        `</ul>`;
    }

    // 8. Finanzas y Balance de Caja
    if (q.includes('finanza') || q.includes('dinero') || q.includes('caja') || q.includes('balance') || q.includes('utilidad') || q.includes('egreso') || q.includes('gasto')) {
      const totalIngresos = store.finanzas.filter(f => f.tipo === 'Ingreso').reduce((sum, item) => sum + item.monto, 0);
      const totalEgresos = store.finanzas.filter(f => f.tipo === 'Egreso').reduce((sum, item) => sum + item.monto, 0);
      const balance = totalIngresos - totalEgresos;

      return `📊 <strong>Control Financiero de Caja:</strong><br>` +
        `• <strong>Total Ingresos:</strong> <span style="color:var(--status-success);">+$${totalIngresos.toFixed(2)}</span><br>` +
        `• <strong>Total Egresos:</strong> <span style="color:var(--status-danger);">-$${totalEgresos.toFixed(2)}</span><br>` +
        `• <strong>Balance Neto:</strong> <strong style="color: ${balance >= 0 ? 'var(--status-success)' : 'var(--status-danger)'};">$${balance.toFixed(2)} USD</strong><br>` +
        `Transacciones contabilizadas: ${store.finanzas.length} movimientos.`;
    }

    // 9. Directorio de Clientes
    if (q.includes('cliente') || q.includes('comprador') || q.includes('directorio')) {
      return `👥 <strong>Directorio de Clientes:</strong> Hay <strong>${store.clientes.length} clientes</strong> en el sistema:<br>` +
        store.clientes.map(c => `• <strong>${c.nombre}</strong> (${c.tipo}) - Tel: ${c.telefono}`).join('<br>');
    }

    // Fallback amigable
    return `🤖 Entendido. He analizado tu pregunta: "<em>${query}</em>".<br>` +
      `No encontré un término exacto, pero puedes probar preguntándome:<br>` +
      `• <em>"¿Qué productos tienen bajo stock?"</em><br>` +
      `• <em>"¿Cuánto stock de Roble tenemos?"</em><br>` +
      `• <em>"¿Qué pedidos están en taller?"</em><br>` +
      `• <em>"¿Cuál es el resumen de ventas?"</em><br>` +
      `• <em>"¿Quiénes son nuestros proveedores?"</em>`;
  },

  closeModal() {
    const modal = document.getElementById('modal-container');
    if (modal) modal.remove();
  }
};
