/**
 * AnahiBot - Módulo: Inventario y Abastecimiento
 * Gestión de catálogo de productos, unidades de medida, proveedores y compras
 */

const Sprint1 = {
  // Render Productos e Inventario (US-001)
  renderProductosView() {
    const data = window.appStore.data;
    const medidasMap = Object.fromEntries(data.medidas.map(m => [m.id, m.simbolo]));

    const totalInversion = data.productos.reduce((acc, p) => acc + (p.stock * p.precioCompra), 0);
    const totalComercial = data.productos.reduce((acc, p) => acc + (p.stock * p.precioVenta), 0);
    const lowStockCount = data.productos.filter(p => p.stock <= p.stockMinimo).length;

    return `
      <!-- Inventario KPI Ribbon -->
      <div class="kpi-grid" style="margin-bottom: 1.5rem;">
        <div class="kpi-card">
          <div class="kpi-icon wood"><i class="fa-solid fa-boxes-packing"></i></div>
          <div class="kpi-data">
            <span>Inversión en Bodega</span>
            <h2>$${totalInversion.toFixed(2)}</h2>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon green"><i class="fa-solid fa-tags"></i></div>
          <div class="kpi-data">
            <span>Valorización Comercial</span>
            <h2>$${totalComercial.toFixed(2)}</h2>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon ${lowStockCount > 0 ? 'purple' : 'green'}"><i class="fa-solid fa-triangle-exclamation"></i></div>
          <div class="kpi-data">
            <span>Estado de Stock</span>
            <h2 style="color: ${lowStockCount > 0 ? 'var(--status-danger)' : 'var(--status-success)'};">
              ${lowStockCount > 0 ? `${lowStockCount} Bajo Mínimo` : '100% Abastecido'}
            </h2>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3><i class="fa-solid fa-boxes-stacked"></i> Catálogo de Productos e Inventario Físico</h3>
          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
            <button class="btn btn-outline" onclick="Sprint1.showNewPurchaseModal()">
              <i class="fa-solid fa-cart-shopping"></i> Reabastecer Stock
            </button>
            <button class="btn btn-primary" onclick="Sprint1.showNewProductModal()">
              <i class="fa-solid fa-plus"></i> Nuevo Producto
            </button>
          </div>
        </div>

        <div class="form-row" style="margin-bottom: 1.25rem;">
          <div class="form-group" style="flex: 2;">
            <input type="text" id="filter-productos" class="form-control" placeholder="Buscar por código, nombre, ubicación o categoría..." oninput="Sprint1.filterProductos()">
          </div>
          <div class="form-group">
            <select id="filter-categoria" class="form-control" onchange="Sprint1.filterProductos()">
              <option value="">Todas las Categorías</option>
              <option value="Insumos / Planchas">Insumos / Planchas</option>
              <option value="Madera Maciza">Madera Maciza</option>
              <option value="Muebles Terminados">Muebles Terminados</option>
              <option value="Acabados & Químicos">Acabados & Químicos</option>
              <option value="Herrajes">Herrajes</option>
            </select>
          </div>
        </div>

        <div class="table-responsive">
          <table class="table" id="table-productos">
            <thead>
              <tr>
                <th class="nowrap">Código</th>
                <th>Producto & Ubicación</th>
                <th>Categoría</th>
                <th>Unidad</th>
                <th class="nowrap">Stock / Ajuste Rápido</th>
                <th>Stock Mín.</th>
                <th>P. Compra</th>
                <th>P. Venta</th>
                <th>Estado Stock</th>
                <th class="nowrap">Acciones</th>
              </tr>
            </thead>
            <tbody>
              ${data.productos.map(p => {
                const isLowStock = p.stock <= p.stockMinimo;
                const statusBadge = isLowStock 
                  ? `<span class="badge badge-danger"><i class="fa-solid fa-triangle-exclamation"></i> Reabastecer (${p.stock})</span>`
                  : `<span class="badge badge-success"><i class="fa-solid fa-circle-check"></i> Óptimo (${p.stock})</span>`;

                return `
                  <tr data-prod-id="${p.id}">
                    <td class="nowrap"><span class="code-id">${p.id}</span></td>
                    <td>
                      <div><strong>${p.nombre}</strong></div>
                      <small class="text-muted"><i class="fa-solid fa-location-dot"></i> ${p.ubicacion || 'Taller Central'}</small>
                    </td>
                    <td><span class="badge badge-accent">${p.categoria}</span></td>
                    <td>${medidasMap[p.unidadMedidaId] || p.unidadMedidaId}</td>
                    <td class="nowrap">
                      <div style="display: flex; align-items: center; gap: 0.4rem;">
                        <button class="btn-row-action" onclick="Sprint1.quickStockChange('${p.id}', -1)" title="Disminuir stock en 1 und">
                          <i class="fa-solid fa-minus"></i>
                        </button>
                        <strong style="min-width: 28px; text-align: center; font-size: 0.95rem;">${p.stock}</strong>
                        <button class="btn-row-action" onclick="Sprint1.quickStockChange('${p.id}', 1)" title="Aumentar stock en 1 und">
                          <i class="fa-solid fa-plus"></i>
                        </button>
                      </div>
                    </td>
                    <td>${p.stockMinimo}</td>
                    <td class="nowrap">$${p.precioCompra.toFixed(2)}</td>
                    <td class="nowrap"><strong>$${p.precioVenta.toFixed(2)}</strong></td>
                    <td class="nowrap">${statusBadge}</td>
                    <td class="nowrap">
                      <div class="table-row-actions">
                        <button class="btn-row-action danger" onclick="Sprint1.handleDeleteProduct('${p.id}', '${p.nombre}')" title="Eliminar producto">
                          <i class="fa-regular fa-trash-can"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
          <div id="productos-empty" style="display: none; padding: 2rem; text-align: center; color: var(--text-muted);">
            <i class="fa-solid fa-magnifying-glass" style="font-size: 1.8rem; margin-bottom: 0.5rem; display: block;"></i>
            No se encontraron productos coincidentes con los filtros aplicados.
          </div>
        </div>
      </div>
    `;
  },

  quickStockChange(productId, delta) {
    window.appStore.updateProductStock(productId, delta);
    const prod = window.appStore.getProduct(productId);
    if (prod) {
      window.showToast(`Stock de "${prod.nombre}" actualizado a ${prod.stock} und.`, 'info', 'Inventario Modificado');
    }
  },

  handleDeleteProduct(productId, name) {
    if (confirm(`¿Estás seguro de eliminar "${name}" del catálogo?`)) {
      window.appStore.deleteProduct(productId);
      window.showToast(`Producto ${name} eliminado satisfactoriamente.`, 'warning', 'Producto Eliminado');
    }
  },

  filterProductos() {
    const query = (document.getElementById('filter-productos')?.value || '').toLowerCase();
    const cat = document.getElementById('filter-categoria')?.value || '';
    const rows = document.querySelectorAll('#table-productos tbody tr');
    let visibleCount = 0;

    rows.forEach(row => {
      const text = row.textContent.toLowerCase();
      const matchQuery = text.includes(query);
      const matchCat = !cat || text.includes(cat.toLowerCase());
      if (matchQuery && matchCat) {
        row.style.display = '';
        visibleCount++;
      } else {
        row.style.display = 'none';
      }
    });

    const emptyBox = document.getElementById('productos-empty');
    if (emptyBox) {
      emptyBox.style.display = visibleCount === 0 ? 'block' : 'none';
    }
  },

  showNewProductModal() {
    Sprint1.closeModal();
    const medidas = window.appStore.data.medidas;
    const modalHtml = `
      <div class="modal-backdrop" id="modal-container" onclick="if(event.target === this) Sprint1.closeModal()">
        <div class="card" style="width: 520px; max-width: 90vw;">
          <div class="card-header">
            <h3><i class="fa-solid fa-box"></i> Registrar Nuevo Producto o Material</h3>
            <button class="btn-icon" onclick="Sprint1.closeModal()"><i class="fa-solid fa-xmark"></i></button>
          </div>
          <form onsubmit="Sprint1.handleCreateProduct(event)">
            <div class="form-group">
              <label>Nombre del Producto / Insumo</label>
              <input type="text" id="new-prod-nombre" class="form-control" required placeholder="Ej. Tablero Cedro 2x10x3m">
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Categoría</label>
                <select id="new-prod-categoria" class="form-control" required>
                  <option value="Madera Maciza">Madera Maciza</option>
                  <option value="Insumos / Planchas">Insumos / Planchas</option>
                  <option value="Muebles Terminados">Muebles Terminados</option>
                  <option value="Acabados & Químicos">Acabados & Químicos</option>
                  <option value="Herrajes">Herrajes</option>
                </select>
              </div>
              <div class="form-group">
                <label>Unidad de Medida</label>
                <select id="new-prod-medida" class="form-control" required>
                  ${medidas.map(m => `<option value="${m.id}">${m.nombre} (${m.simbolo})</option>`).join('')}
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Stock Inicial</label>
                <input type="number" id="new-prod-stock" class="form-control" min="0" value="10" required>
              </div>
              <div class="form-group">
                <label>Stock Mínimo (Alerta Crítica)</label>
                <input type="number" id="new-prod-stockmin" class="form-control" min="1" value="5" required>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Precio de Compra ($)</label>
                <input type="number" step="0.01" id="new-prod-pcompra" class="form-control" required placeholder="0.00">
              </div>
              <div class="form-group">
                <label>Precio de Venta ($)</label>
                <input type="number" step="0.01" id="new-prod-pventa" class="form-control" required placeholder="0.00">
              </div>
            </div>
            <div class="form-group">
              <label>Ubicación en Taller o Bodega</label>
              <input type="text" id="new-prod-ubicacion" class="form-control" placeholder="Ej. Estante A2, Bodega Maderas" value="Taller Central">
            </div>
            <div style="text-align: right; margin-top: 1.5rem; gap: 0.5rem; display: flex; justify-content: flex-end;">
              <button type="button" class="btn btn-outline" onclick="Sprint1.closeModal()">Cancelar</button>
              <button type="submit" class="btn btn-primary">Guardar Producto</button>
            </div>
          </form>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
  },

  handleCreateProduct(e) {
    e.preventDefault();
    const newProd = {
      nombre: document.getElementById('new-prod-nombre').value,
      categoria: document.getElementById('new-prod-categoria').value,
      unidadMedidaId: document.getElementById('new-prod-medida').value,
      stock: parseInt(document.getElementById('new-prod-stock').value, 10),
      stockMinimo: parseInt(document.getElementById('new-prod-stockmin').value, 10),
      precioCompra: parseFloat(document.getElementById('new-prod-pcompra').value),
      precioVenta: parseFloat(document.getElementById('new-prod-pventa').value),
      ubicacion: document.getElementById('new-prod-ubicacion').value || 'Taller Central'
    };

    window.appStore.addProduct(newProd);
    Sprint1.closeModal();
    window.showToast(`Producto "${newProd.nombre}" registrado exitosamente en el catálogo.`, 'success');
  },

  currentMedidaFile: null,

  // Render Registro de Medidas (US-002)
  renderMedidasView() {
    const medidas = window.appStore.data.medidas;

    return `
      <div class="card">
        <div class="card-header">
          <h3><i class="fa-solid fa-ruler-combined"></i> Unidades de Medida, Planos y Especificaciones</h3>
          <button class="btn btn-primary" onclick="Sprint1.showNewMeasureModal()">
            <i class="fa-solid fa-plus"></i> Nueva Medida
          </button>
        </div>

        <div class="form-group" style="margin-bottom: 1.25rem;">
          <input type="text" id="filter-medidas" class="form-control" placeholder="Buscar unidad o símbolo de medida..." oninput="Sprint1.filterMedidas()">
        </div>

        <div class="table-responsive">
          <table class="table" id="table-medidas">
            <thead>
              <tr>
                <th class="nowrap">ID</th>
                <th>Nombre de la Medida</th>
                <th>Símbolo / Abreviatura</th>
                <th>Tipo de Magnitud</th>
                <th>Plano / Foto Adjunta</th>
                <th class="nowrap">Acciones</th>
              </tr>
            </thead>
            <tbody>
              ${medidas.map(m => {
                let adjuntoHtml = '<span class="text-muted" style="font-size: 0.8rem;">Sin adjunto</span>';
                if (m.adjunto) {
                  if (m.adjunto.tipo === 'foto') {
                    adjuntoHtml = `
                      <div style="display:flex; align-items:center; gap:0.6rem;">
                        <img src="${m.adjunto.url}" style="width:42px; height:42px; object-fit:cover; border-radius:6px; border:1px solid var(--border-color); cursor:pointer;" onclick="window.openLightbox('${m.adjunto.url}', '${m.adjunto.nombre}')" title="Clic para ampliar plano en Lightbox">
                        <small class="text-muted">${m.adjunto.nombre}</small>
                      </div>
                    `;
                  } else {
                    adjuntoHtml = `<a href="${m.adjunto.url}" target="_blank" class="badge badge-accent" style="text-decoration:none;"><i class="fa-solid fa-file-pdf"></i> ${m.adjunto.nombre}</a>`;
                  }
                }

                return `
                  <tr>
                    <td class="nowrap"><span class="code-id">${m.id}</span></td>
                    <td><strong>${m.nombre}</strong></td>
                    <td><span class="badge badge-accent">${m.simbolo}</span></td>
                    <td>${m.tipo}</td>
                    <td>${adjuntoHtml}</td>
                    <td class="nowrap">
                      <div class="table-row-actions">
                        <button class="btn-row-action danger" onclick="Sprint1.handleDeleteMeasure('${m.id}', '${m.nombre}')" title="Eliminar medida">
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

  filterMedidas() {
    const q = (document.getElementById('filter-medidas')?.value || '').toLowerCase();
    document.querySelectorAll('#table-medidas tbody tr').forEach(row => {
      row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
  },

  handleDeleteMeasure(id, name) {
    if (confirm(`¿Deseas eliminar la unidad de medida "${name}"?`)) {
      window.appStore.deleteMeasure(id);
      window.showToast(`Medida "${name}" eliminada.`, 'info');
    }
  },

  handleMedidaFileChange(input) {
    const file = input.files[0];
    if (!file) {
      Sprint1.currentMedidaFile = null;
      return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
      const isImage = file.type.startsWith('image/');
      Sprint1.currentMedidaFile = {
        tipo: isImage ? 'foto' : 'documento',
        url: e.target.result,
        nombre: file.name
      };

      const previewContainer = document.getElementById('new-med-file-preview');
      if (previewContainer) {
        if (isImage) {
          previewContainer.innerHTML = `<img src="${e.target.result}" style="max-height: 90px; border-radius: 6px; border: 1px solid var(--border-color); margin-top: 0.5rem; display: block;">`;
        } else {
          previewContainer.innerHTML = `<div class="badge badge-accent" style="margin-top: 0.5rem;"><i class="fa-solid fa-file-lines"></i> ${file.name}</div>`;
        }
      }
    };
    reader.readAsDataURL(file);
  },

  showNewMeasureModal() {
    Sprint1.closeModal();
    Sprint1.currentMedidaFile = null;
    const modalHtml = `
      <div class="modal-backdrop" id="modal-container" onclick="if(event.target === this) Sprint1.closeModal()">
        <div class="card" style="width: 500px; max-width: 90vw;">
          <div class="card-header">
            <h3><i class="fa-solid fa-ruler"></i> Nueva Unidad de Medida o Plano</h3>
            <button class="btn-icon" onclick="Sprint1.closeModal()"><i class="fa-solid fa-xmark"></i></button>
          </div>
          <form onsubmit="Sprint1.handleCreateMeasure(event)">
            <div class="form-group">
              <label>Nombre de la Medida</label>
              <input type="text" id="new-med-nombre" class="form-control" placeholder="Ej. Pie de Tabla" required>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Símbolo / Abreviatura</label>
                <input type="text" id="new-med-simbolo" class="form-control" placeholder="Ej. pt / ft²" required>
              </div>
              <div class="form-group">
                <label>Tipo de Medición</label>
                <input type="text" id="new-med-tipo" class="form-control" placeholder="Ej. Volumen Madera Aserrada" required>
              </div>
            </div>
            <div class="form-group">
              <label><i class="fa-solid fa-paperclip"></i> Adjuntar Foto o Plano Técnico (Opcional)</label>
              <input type="file" id="new-med-file" class="form-control" accept="image/*,.pdf,.doc,.docx" onchange="Sprint1.handleMedidaFileChange(this)">
              <div id="new-med-file-preview"></div>
            </div>
            <div style="text-align: right; margin-top: 1.5rem; gap: 0.5rem; display: flex; justify-content: flex-end;">
              <button type="button" class="btn btn-outline" onclick="Sprint1.closeModal()">Cancelar</button>
              <button type="submit" class="btn btn-primary">Guardar Medida</button>
            </div>
          </form>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
  },

  handleCreateMeasure(e) {
    e.preventDefault();
    const newMed = {
      nombre: document.getElementById('new-med-nombre').value,
      simbolo: document.getElementById('new-med-simbolo').value,
      tipo: document.getElementById('new-med-tipo').value,
      adjunto: Sprint1.currentMedidaFile || null
    };

    window.appStore.addMeasure(newMed);
    Sprint1.currentMedidaFile = null;
    Sprint1.closeModal();
    window.showToast(`Medida "${newMed.nombre}" agregada satisfactoriamente.`, 'success');
  },

  // Render Gestión de Proveedores (US-003)
  renderProveedoresView() {
    const provs = window.appStore.data.proveedores;

    return `
      <div class="card">
        <div class="card-header">
          <h3><i class="fa-solid fa-truck-field"></i> Directorio de Proveedores Homologados</h3>
          <button class="btn btn-primary" onclick="Sprint1.showNewSupplierModal()">
            <i class="fa-solid fa-plus"></i> Nuevo Proveedor
          </button>
        </div>

        <div class="form-group" style="margin-bottom: 1.25rem;">
          <input type="text" id="filter-proveedores" class="form-control" placeholder="Buscar por empresa, contacto, ciudad o RUC..." oninput="Sprint1.filterProveedores()">
        </div>

        <div class="table-responsive">
          <table class="table" id="table-proveedores">
            <thead>
              <tr>
                <th class="nowrap">ID</th>
                <th>Razón Social / Empresa</th>
                <th>RUC / NIT</th>
                <th>Contacto</th>
                <th>Teléfono & Email</th>
                <th>Ciudad</th>
                <th>Tiempo Entrega</th>
                <th class="nowrap">Acciones</th>
              </tr>
            </thead>
            <tbody>
              ${provs.map(p => `
                <tr>
                  <td class="nowrap"><span class="code-id">${p.id}</span></td>
                  <td><strong>${p.razonSocial}</strong></td>
                  <td>${p.ruc}</td>
                  <td>${p.contacto}</td>
                  <td>
                    <div><i class="fa-solid fa-phone" style="font-size:0.75rem;"></i> ${p.telefono}</div>
                    <small class="text-muted">${p.email}</small>
                  </td>
                  <td><i class="fa-solid fa-location-dot"></i> ${p.ciudad}</td>
                  <td class="nowrap"><span class="badge badge-info"><i class="fa-solid fa-clock"></i> ${p.tiempoEntrega}</span></td>
                  <td class="nowrap">
                    <div class="table-row-actions">
                      <button class="btn-row-action danger" onclick="Sprint1.handleDeleteSupplier('${p.id}', '${p.razonSocial}')" title="Eliminar proveedor">
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

  filterProveedores() {
    const q = (document.getElementById('filter-proveedores')?.value || '').toLowerCase();
    document.querySelectorAll('#table-proveedores tbody tr').forEach(row => {
      row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
  },

  handleDeleteSupplier(id, name) {
    if (confirm(`¿Deseas eliminar al proveedor "${name}"?`)) {
      window.appStore.deleteSupplier(id);
      window.showToast(`Proveedor "${name}" eliminado.`, 'info');
    }
  },

  showNewSupplierModal() {
    Sprint1.closeModal();
    const modalHtml = `
      <div class="modal-backdrop" id="modal-container" onclick="if(event.target === this) Sprint1.closeModal()">
        <div class="card" style="width: 520px; max-width: 90vw;">
          <div class="card-header">
            <h3><i class="fa-solid fa-truck"></i> Registrar Nuevo Proveedor</h3>
            <button class="btn-icon" onclick="Sprint1.closeModal()"><i class="fa-solid fa-xmark"></i></button>
          </div>
          <form onsubmit="Sprint1.handleCreateSupplier(event)">
            <div class="form-group">
              <label>Razón Social / Empresa Proveedora</label>
              <input type="text" id="new-prov-razon" class="form-control" required placeholder="Ej. Maderas y Herrajes del Pacífico">
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>RUC / NIT</label>
                <input type="text" id="new-prov-ruc" class="form-control" required placeholder="1790000000001">
              </div>
              <div class="form-group">
                <label>Nombre de Contacto</label>
                <input type="text" id="new-prov-contacto" class="form-control" required placeholder="Ing. Fernando Ramos">
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Teléfono Celular</label>
                <input type="text" id="new-prov-telefono" class="form-control" required placeholder="0991234567">
              </div>
              <div class="form-group">
                <label>Correo Electrónico</label>
                <input type="email" id="new-prov-email" class="form-control" required placeholder="ventas@proveedor.com">
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Ciudad Base</label>
                <input type="text" id="new-prov-ciudad" class="form-control" required placeholder="Guayaquil / Quito / Cuenca">
              </div>
              <div class="form-group">
                <label>Tiempo Promedio Entrega</label>
                <input type="text" id="new-prov-entrega" class="form-control" required placeholder="Ej. 24 a 48 horas">
              </div>
            </div>
            <div style="text-align: right; margin-top: 1.5rem; gap: 0.5rem; display: flex; justify-content: flex-end;">
              <button type="button" class="btn btn-outline" onclick="Sprint1.closeModal()">Cancelar</button>
              <button type="submit" class="btn btn-primary">Guardar Proveedor</button>
            </div>
          </form>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
  },

  handleCreateSupplier(e) {
    e.preventDefault();
    const newProv = {
      razonSocial: document.getElementById('new-prov-razon').value,
      ruc: document.getElementById('new-prov-ruc').value,
      contacto: document.getElementById('new-prov-contacto').value,
      telefono: document.getElementById('new-prov-telefono').value,
      email: document.getElementById('new-prov-email').value,
      ciudad: document.getElementById('new-prov-ciudad').value,
      tiempoEntrega: document.getElementById('new-prov-entrega').value
    };

    window.appStore.addSupplier(newProv);
    Sprint1.closeModal();
    window.showToast(`Proveedor "${newProv.razonSocial}" guardado con éxito.`, 'success');
  },

  // Render Registro de Compras (US-004)
  renderComprasView() {
    const data = window.appStore.data;
    const provsMap = Object.fromEntries(data.proveedores.map(p => [p.id, p.razonSocial]));
    const prodsMap = Object.fromEntries(data.productos.map(p => [p.id, p.nombre]));
    const totalCompras = data.compras.reduce((acc, c) => acc + c.total, 0);

    return `
      <div class="kpi-grid" style="margin-bottom: 1.5rem;">
        <div class="kpi-card">
          <div class="kpi-icon wood"><i class="fa-solid fa-cart-flatbed"></i></div>
          <div class="kpi-data">
            <span>Total Invertido en Compras</span>
            <h2>$${totalCompras.toFixed(2)}</h2>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon green"><i class="fa-solid fa-truck-ramp-box"></i></div>
          <div class="kpi-data">
            <span>Órdenes Procesadas</span>
            <h2>${data.compras.length} órdenes</h2>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3><i class="fa-solid fa-cart-flatbed"></i> Registro de Compras e Incremento Automático en Inventario</h3>
          <button class="btn btn-primary" onclick="Sprint1.showNewPurchaseModal()">
            <i class="fa-solid fa-plus"></i> Registrar Nueva Compra
          </button>
        </div>

        <div class="form-group" style="margin-bottom: 1.25rem;">
          <input type="text" id="filter-compras" class="form-control" placeholder="Buscar compra por ID, proveedor o producto..." oninput="Sprint1.filterCompras()">
        </div>

        <div class="table-responsive">
          <table class="table" id="table-compras">
            <thead>
              <tr>
                <th class="nowrap">Nº Órden</th>
                <th>Fecha</th>
                <th>Proveedor</th>
                <th>Material Comprado</th>
                <th>Cantidad</th>
                <th>Costo Unit.</th>
                <th>Total Compra</th>
                <th class="nowrap">Impacto Inventario</th>
              </tr>
            </thead>
            <tbody>
              ${data.compras.map(c => `
                <tr>
                  <td class="nowrap"><span class="code-id">${c.id}</span></td>
                  <td class="nowrap"><i class="fa-regular fa-calendar"></i> ${c.fecha}</td>
                  <td><strong>${provsMap[c.proveedorId] || c.proveedorId}</strong></td>
                  <td><strong>${prodsMap[c.productoId] || c.productoId}</strong></td>
                  <td><strong style="color: var(--status-success);">+${c.cantidad}</strong></td>
                  <td class="nowrap">$${c.costoUnitario.toFixed(2)}</td>
                  <td class="nowrap"><strong style="color: var(--primary-wood);">$${c.total.toFixed(2)}</strong></td>
                  <td class="nowrap"><span class="badge badge-success"><i class="fa-solid fa-check"></i> Stock Actualizado (+${c.cantidad})</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  filterCompras() {
    const q = (document.getElementById('filter-compras')?.value || '').toLowerCase();
    document.querySelectorAll('#table-compras tbody tr').forEach(row => {
      row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
  },

  showNewPurchaseModal() {
    Sprint1.closeModal();
    const { proveedores, productos } = window.appStore.data;
    const modalHtml = `
      <div class="modal-backdrop" id="modal-container" onclick="if(event.target === this) Sprint1.closeModal()">
        <div class="card" style="width: 520px; max-width: 90vw;">
          <div class="card-header">
            <h3><i class="fa-solid fa-cart-shopping"></i> Orden de Compra de Materiales (Ingreso de Stock)</h3>
            <button class="btn-icon" onclick="Sprint1.closeModal()"><i class="fa-solid fa-xmark"></i></button>
          </div>
          <form onsubmit="Sprint1.handleCreatePurchase(event)">
            <div class="form-group">
              <label>Fecha de Compra</label>
              <input type="date" id="new-comp-fecha" class="form-control" value="${new Date().toISOString().split('T')[0]}" required>
            </div>
            <div class="form-group">
              <label>Proveedor Seleccionado</label>
              <select id="new-comp-prov" class="form-control" required>
                ${proveedores.map(p => `<option value="${p.id}">${p.razonSocial} (${p.ciudad}) - Entrega: ${p.tiempoEntrega}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>Producto o Insumo a Reabastecer</label>
              <select id="new-comp-prod" class="form-control" required onchange="Sprint1.updateDefaultCost()">
                ${productos.map(p => `<option value="${p.id}" data-cost="${p.precioCompra}">${p.nombre} (Stock actual: ${p.stock})</option>`).join('')}
              </select>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Cantidad a Ingresar</label>
                <input type="number" id="new-comp-cant" class="form-control" min="1" value="10" required oninput="Sprint1.calcPurchaseTotal()">
              </div>
              <div class="form-group">
                <label>Costo Unitario ($)</label>
                <input type="number" step="0.01" id="new-comp-costo" class="form-control" required value="${productos[0] ? productos[0].precioCompra : 0}" oninput="Sprint1.calcPurchaseTotal()">
              </div>
            </div>
            <div class="form-group">
              <label>Total de la Compra Estimado</label>
              <input type="text" id="new-comp-total-preview" class="form-control" readonly style="font-weight: 700; color: var(--primary-wood);" value="$0.00">
            </div>
            <div style="text-align: right; margin-top: 1.5rem; gap: 0.5rem; display: flex; justify-content: flex-end;">
              <button type="button" class="btn btn-outline" onclick="Sprint1.closeModal()">Cancelar</button>
              <button type="submit" class="btn btn-primary">Confirmar e Ingresar a Inventario</button>
            </div>
          </form>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    Sprint1.calcPurchaseTotal();
  },

  calcPurchaseTotal() {
    const cant = parseFloat(document.getElementById('new-comp-cant')?.value) || 0;
    const costo = parseFloat(document.getElementById('new-comp-costo')?.value) || 0;
    const preview = document.getElementById('new-comp-total-preview');
    if (preview) {
      preview.value = `$${(cant * costo).toFixed(2)} USD`;
    }
  },

  updateDefaultCost() {
    const select = document.getElementById('new-comp-prod');
    if (!select) return;
    const selectedOption = select.options[select.selectedIndex];
    const cost = selectedOption.getAttribute('data-cost');
    if (cost) {
      document.getElementById('new-comp-costo').value = cost;
    }
    Sprint1.calcPurchaseTotal();
  },

  handleCreatePurchase(e) {
    e.preventDefault();
    const purchase = {
      fecha: document.getElementById('new-comp-fecha').value,
      proveedorId: document.getElementById('new-comp-prov').value,
      productoId: document.getElementById('new-comp-prod').value,
      cantidad: parseInt(document.getElementById('new-comp-cant').value, 10),
      costoUnitario: parseFloat(document.getElementById('new-comp-costo').value)
    };

    window.appStore.addPurchase(purchase);
    Sprint1.closeModal();

    const prod = window.appStore.getProduct(purchase.productoId);
    window.showToast(`Compra registrada: +${purchase.cantidad} unidades ingresadas a stock de "${prod ? prod.nombre : ''}".`, 'success', 'Inventario Actualizado');
  },

  closeModal() {
    const modal = document.getElementById('modal-container');
    if (modal) modal.remove();
  }
};
