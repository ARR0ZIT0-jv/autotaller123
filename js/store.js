/**
 * AnahiBot - Centralized Store & LocalStorage Manager
 * Holds central application state for Inventory, Sales and Workshop
 */

const STORAGE_KEY = 'anahibot_app_data_v1';

// Initial Seed Data
const defaultData = {
  // MODULO 1: INVENTARIO Y ABASTECIMIENTO
  productos: [
    { id: 'PROD-001', nombre: 'Plancha MDF 18mm 2.44x1.22m', categoria: 'Insumos / Planchas', unidadMedidaId: 'MED-001', stock: 45, stockMinimo: 15, precioCompra: 28.50, precioVenta: 38.00, ubicacion: 'Estante A1' },
    { id: 'PROD-002', nombre: 'Tabla de Roble Aserrado (Pie2)', categoria: 'Madera Maciza', unidadMedidaId: 'MED-002', stock: 120, stockMinimo: 30, precioCompra: 4.20, precioVenta: 7.50, ubicacion: 'Bodega Maderas' },
    { id: 'PROD-003', nombre: 'Tablero Cedro 2" x 10" x 3m', categoria: 'Madera Maciza', unidadMedidaId: 'MED-003', stock: 8, stockMinimo: 10, precioCompra: 22.00, precioVenta: 34.00, ubicacion: 'Bodega Maderas' },
    { id: 'PROD-004', nombre: 'Juego Comedor Roble 6 Sillas', categoria: 'Muebles Terminados', unidadMedidaId: 'MED-004', stock: 3, stockMinimo: 2, precioCompra: 480.00, precioVenta: 850.00, ubicacion: 'Showroom' },
    { id: 'PROD-005', nombre: 'Cama King Size Cedro Tallado', categoria: 'Muebles Terminados', unidadMedidaId: 'MED-004', stock: 2, stockMinimo: 1, precioCompra: 650.00, precioVenta: 1200.00, ubicacion: 'Showroom' },
    { id: 'PROD-006', nombre: 'Barniz Marino Transparente 1 Galón', categoria: 'Acabados & Químicos', unidadMedidaId: 'MED-005', stock: 14, stockMinimo: 5, precioCompra: 18.00, precioVenta: 26.50, ubicacion: 'Estante B3' },
    { id: 'PROD-007', nombre: 'Bisagra Cierre Lento 35mm (Par)', categoria: 'Herrajes', unidadMedidaId: 'MED-004', stock: 180, stockMinimo: 50, precioCompra: 1.10, precioVenta: 2.30, ubicacion: 'Cajón Herrajes' }
  ],

  medidas: [
    { id: 'MED-001', nombre: 'Plancha Estándar', simbolo: 'Plancha (2.44x1.22m)', tipo: 'Superficie / Tablero', adjunto: { tipo: 'foto', url: 'https://images.unsplash.com/photo-1546484475-7f7bd55792da?w=300&auto=format&fit=crop&q=80', nombre: 'plano_tablero.jpg' } },
    { id: 'MED-002', nombre: 'Pie de Tabla', simbolo: 'pt / ft²', tipo: 'Volumen Madera', adjunto: null },
    { id: 'MED-003', nombre: 'Metro Lineal', simbolo: 'm', tipo: 'Longitud', adjunto: null },
    { id: 'MED-004', nombre: 'Unidad', simbolo: 'und', tipo: 'Conteo Físico', adjunto: null },
    { id: 'MED-005', nombre: 'Galón', simbolo: 'gal', tipo: 'Volumen Líquido', adjunto: null }
  ],

  proveedores: [
    { id: 'PROV-001', razonSocial: 'Maderas del Pacífico S.A.', ruc: '1792345678001', contacto: 'Ing. Fernando Ramos', telefono: '0998765432', email: 'ventas@maderaspacifico.com', ciudad: 'Guayaquil', tiempoEntrega: '3 días' },
    { id: 'PROV-002', razonSocial: 'Herrajes y Accesorios Quito', ruc: '1791122334001', contacto: 'Sra. Lucia Morales', telefono: '0984561230', email: 'contacto@herrajesquito.com', ciudad: 'Quito', tiempoEntrega: '24 horas' },
    { id: 'PROV-003', razonSocial: 'Químicos y Barnices Cima', ruc: '1799887766001', contacto: 'Lcdo. Roberto Paz', telefono: '0971239874', email: 'pedidos@barnicescima.com', ciudad: 'Cuenca', tiempoEntrega: '2 días' }
  ],

  compras: [
    { id: 'COMP-001', fecha: '2026-06-25', proveedorId: 'PROV-001', productoId: 'PROD-001', cantidad: 30, costoUnitario: 28.50, total: 855.00, estado: 'Recibido' },
    { id: 'COMP-002', fecha: '2026-07-02', proveedorId: 'PROV-002', productoId: 'PROD-007', cantidad: 100, costoUnitario: 1.10, total: 110.00, estado: 'Recibido' }
  ],

  // MODULO 2: CLIENTES, VENTAS Y CHATBOT
  clientes: [
    { id: 'CLI-001', nombre: 'Arq. Esteban Valdivieso', identificacion: '1103456789', telefono: '0991112233', email: 'esteban@estudiodisenio.ec', direccion: 'Av. Gran Colombia 4-12', tipo: 'Comercial' },
    { id: 'CLI-002', nombre: 'Dra. María Elena Cordova', identificacion: '1109876543', telefono: '0983334455', email: 'elena.cordova@gmail.com', direccion: 'Calle Larga y Benigno Malo', tipo: 'Particular' },
    { id: 'CLI-003', nombre: 'Hostal Casona Colonial', identificacion: '1793322110001', telefono: '072834920', email: 'recepcion@casonacolonial.ec', direccion: 'Centro Histórico', tipo: 'Corporativo' }
  ],

  ventas: [
    { id: 'VEN-001', fecha: '2026-07-08', clienteId: 'CLI-001', productoId: 'PROD-004', cantidad: 1, precioUnitario: 850.00, total: 850.00, metodoPago: 'Transferencia', estado: 'Completada' },
    { id: 'VEN-002', fecha: '2026-07-14', clienteId: 'CLI-002', productoId: 'PROD-006', cantidad: 2, precioUnitario: 26.50, total: 53.00, metodoPago: 'Efectivo', estado: 'Completada' }
  ],

  // MODULO 3: FINANZAS, PEDIDOS Y REPORTES
  finanzas: [
    { id: 'FIN-001', fecha: '2026-07-08', tipo: 'Ingreso', concepto: 'Venta Juego Comedor Roble (VEN-001)', monto: 850.00, categoria: 'Ventas Showroom' },
    { id: 'FIN-002', fecha: '2026-07-02', tipo: 'Egreso', concepto: 'Compra de Herrajes (COMP-002)', monto: 110.00, categoria: 'Abastecimiento Materiales' },
    { id: 'FIN-003', fecha: '2026-07-10', tipo: 'Egreso', concepto: 'Pago Nómina Maestros Carpinteros', monto: 600.00, categoria: 'Sueldos y Servicios' },
    { id: 'FIN-004', fecha: '2026-07-14', tipo: 'Ingreso', concepto: 'Venta Barniz (VEN-002)', monto: 53.00, categoria: 'Ventas Minoristas' }
  ],

  pedidos: [
    { id: 'PED-001', fecha: '2026-07-21', clienteId: 'CLI-003', titulo: 'Juego de 8 Mesas de Bar Rústicas', descripcion: 'Mesas en Cedro con patas de hierro forjado 80x80cm', especificacionesMedidas: '80cm x 80cm x 75cm alto', presupuesto: 1400.00, anticipo: 700.00, estado: 'En Producción', fechaEntrega: '2026-08-05', adjunto: { tipo: 'foto', url: 'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?w=400&auto=format&fit=crop&q=80', nombre: 'boceto_mesas_bar.jpg' } },
    { id: 'PED-002', fecha: '2026-07-24', clienteId: 'CLI-001', titulo: 'Mueble de Cocina Integral a Medida', descripcion: 'Melamina blanco y MDF Roble 18mm con cierre lento', especificacionesMedidas: '3.50m largo x 2.20m alto', presupuesto: 2100.00, anticipo: 1050.00, estado: 'Diseño', fechaEntrega: '2026-08-15', adjunto: { tipo: 'documento', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', nombre: 'Plano_Arquitectonico_Cocina.pdf' } },
    { id: 'PED-003', fecha: '2026-07-18', clienteId: 'CLI-002', titulo: 'Estantería de Libros Minimalista', descripcion: 'Estructura en madera de Pino barniz natural', especificacionesMedidas: '1.20m ancho x 2.00m alto', presupuesto: 380.00, anticipo: 380.00, estado: 'Listo para Entrega', fechaEntrega: '2026-07-30', adjunto: null }
  ]
};

class Store {
  constructor() {
    this.data = this.loadData();
    this.listeners = [];
  }

  loadData() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Error reading from LocalStorage:', e);
    }
    // Return default seed data
    this.saveData(defaultData);
    return JSON.parse(JSON.stringify(defaultData));
  }

  saveData(dataToSave) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave || this.data));
    } catch (e) {
      console.error('Error saving to LocalStorage:', e);
    }
  }

  resetDemoData() {
    this.data = JSON.parse(JSON.stringify(defaultData));
    this.saveData();
    this.notify();
  }

  subscribe(listener) {
    this.listeners.push(listener);
  }

  notify() {
    this.saveData();
    this.listeners.forEach(fn => fn(this.data));
  }

  // --- MODULO 1: ABASTECIMIENTO E INVENTARIO ---
  addProduct(product) {
    product.id = 'PROD-' + String(this.data.productos.length + 1).padStart(3, '0');
    this.data.productos.push(product);
    this.notify();
    return product;
  }

  updateProductStock(productId, deltaQuantity) {
    const p = this.data.productos.find(item => item.id === productId);
    if (p) {
      p.stock = Math.max(0, p.stock + deltaQuantity);
      this.notify();
    }
  }

  setProductStock(productId, newStock) {
    const p = this.data.productos.find(item => item.id === productId);
    if (p) {
      p.stock = Math.max(0, parseInt(newStock, 10) || 0);
      this.notify();
    }
  }

  deleteProduct(productId) {
    const idx = this.data.productos.findIndex(p => p.id === productId);
    if (idx !== -1) {
      const removed = this.data.productos.splice(idx, 1)[0];
      this.notify();
      return removed;
    }
    return null;
  }

  addMeasure(medida) {
    medida.id = 'MED-' + String(this.data.medidas.length + 1).padStart(3, '0');
    this.data.medidas.push(medida);
    this.notify();
    return medida;
  }

  deleteMeasure(medidaId) {
    const idx = this.data.medidas.findIndex(m => m.id === medidaId);
    if (idx !== -1) {
      const removed = this.data.medidas.splice(idx, 1)[0];
      this.notify();
      return removed;
    }
    return null;
  }

  addSupplier(supplier) {
    supplier.id = 'PROV-' + String(this.data.proveedores.length + 1).padStart(3, '0');
    this.data.proveedores.push(supplier);
    this.notify();
    return supplier;
  }

  deleteSupplier(supplierId) {
    const idx = this.data.proveedores.findIndex(p => p.id === supplierId);
    if (idx !== -1) {
      const removed = this.data.proveedores.splice(idx, 1)[0];
      this.notify();
      return removed;
    }
    return null;
  }

  addPurchase(purchase) {
    purchase.id = 'COMP-' + String(this.data.compras.length + 1).padStart(3, '0');
    purchase.total = purchase.cantidad * purchase.costoUnitario;
    this.data.compras.push(purchase);
    
    // Automatically update inventory stock (US-004)
    this.updateProductStock(purchase.productoId, purchase.cantidad);

    // Register financial expense automatically (US-008 integration)
    const prod = this.data.productos.find(p => p.id === purchase.productoId);
    this.data.finanzas.push({
      id: 'FIN-' + String(this.data.finanzas.length + 1).padStart(3, '0'),
      fecha: purchase.fecha,
      tipo: 'Egreso',
      concepto: `Compra Material: ${prod ? prod.nombre : purchase.productoId}`,
      monto: purchase.total,
      categoria: 'Abastecimiento Materiales'
    });

    this.notify();
    return purchase;
  }

  // --- MODULO 2: CLIENTES, VENTAS Y CHATBOT ---
  addClient(client) {
    client.id = 'CLI-' + String(this.data.clientes.length + 1).padStart(3, '0');
    this.data.clientes.push(client);
    this.notify();
    return client;
  }

  deleteClient(clientId) {
    const idx = this.data.clientes.findIndex(c => c.id === clientId);
    if (idx !== -1) {
      const removed = this.data.clientes.splice(idx, 1)[0];
      this.notify();
      return removed;
    }
    return null;
  }

  addSale(sale) {
    sale.id = 'VEN-' + String(this.data.ventas.length + 1).padStart(3, '0');
    sale.total = sale.cantidad * sale.precioUnitario;
    sale.estado = 'Completada';

    // Verify stock availability
    const prod = this.data.productos.find(p => p.id === sale.productoId);
    if (prod && prod.stock < sale.cantidad) {
      throw new Error(`Stock insuficiente de "${prod.nombre}". Disponible: ${prod.stock}, Requerido: ${sale.cantidad}`);
    }

    this.data.ventas.push(sale);

    // Automatically deduct inventory stock (US-006)
    this.updateProductStock(sale.productoId, -sale.cantidad);

    // Register financial income automatically (US-008 integration)
    this.data.finanzas.push({
      id: 'FIN-' + String(this.data.finanzas.length + 1).padStart(3, '0'),
      fecha: sale.fecha,
      tipo: 'Ingreso',
      concepto: `Venta: ${prod ? prod.nombre : sale.productoId} (${sale.cantidad} und)`,
      monto: sale.total,
      categoria: 'Ventas Comercial'
    });

    this.notify();
    return sale;
  }

  // --- MODULO 3: FINANZAS, PEDIDOS Y REPORTES ---
  addFinanceEntry(entry) {
    entry.id = 'FIN-' + String(this.data.finanzas.length + 1).padStart(3, '0');
    this.data.finanzas.push(entry);
    this.notify();
    return entry;
  }

  deleteFinanceEntry(finId) {
    const idx = this.data.finanzas.findIndex(f => f.id === finId);
    if (idx !== -1) {
      const removed = this.data.finanzas.splice(idx, 1)[0];
      this.notify();
      return removed;
    }
    return null;
  }

  addCustomOrder(order) {
    order.id = 'PED-' + String(this.data.pedidos.length + 1).padStart(3, '0');
    this.data.pedidos.push(order);

    // If initial advance payment provided, log income
    if (order.anticipo > 0) {
      this.data.finanzas.push({
        id: 'FIN-' + String(this.data.finanzas.length + 1).padStart(3, '0'),
        fecha: order.fecha,
        tipo: 'Ingreso',
        concepto: `Anticipo Pedido Personalizado ${order.id}: ${order.titulo}`,
        monto: parseFloat(order.anticipo),
        categoria: 'Anticipo Pedido'
      });
    }

    this.notify();
    return order;
  }

  updateOrderStatus(orderId, newStatus) {
    const order = this.data.pedidos.find(o => o.id === orderId);
    if (order) {
      order.estado = newStatus;
      this.notify();
    }
  }

  deleteCustomOrder(orderId) {
    const idx = this.data.pedidos.findIndex(o => o.id === orderId);
    if (idx !== -1) {
      const removed = this.data.pedidos.splice(idx, 1)[0];
      this.notify();
      return removed;
    }
    return null;
  }

  // Query Helpers
  getProduct(id) {
    return this.data.productos.find(p => p.id === id);
  }

  getClient(id) {
    return this.data.clientes.find(c => c.id === id);
  }

  getOrder(id) {
    return this.data.pedidos.find(o => o.id === id);
  }

  getSale(id) {
    return this.data.ventas.find(v => v.id === id);
  }
}

// Global Store Instance
window.appStore = new Store();
