class FreshMartApp {
  constructor() {
    this.currentUser = null;
    this.cart = [];
    this.orders = [];
    this.riders = [
      { id: 1, name: 'Sachin Gupta', phone: '9988610375', status: 'available', location: { lat: 28.6139, lng: 77.2090 } }
    ];
    this.shopkeepers = [
      { id: 1, name: 'Ramesh Sharma', phone: '9988776655', address: 'Shop No. 1, Market' },
      { id: 2, name: 'Sunil Patel', phone: '9887766554', address: 'Shop No. 2, Market' }
    ];
    this.products = [
      { id: 1, name: '🍎 Apple', price: 120, unit: 'kg', image: '🍎' },
      { id: 2, name: '🍌 Banana', price: 60, unit: 'dozen', image: '🍌' },
      { id: 3, name: '🍅 Tomato', price: 40, unit: 'kg', image: '🍅' },
      { id: 4, name: '🥕 Carrot', price: 50, unit: 'kg', image: '🥕' },
      { id: 5, name: '🥦 Broccoli', price: 80, unit: 'kg', image: '🥦' },
      { id: 6, name: '🧅 Onion', price: 30, unit: 'kg', image: '🧅' }
    ];
    this.paymentAttempts = {};
    this.riderPayments = {};
    this.deliveryCharges = { baseCharge: 30, perKmCharge: 12 };
    this.init();
  }

  init() {
    this.render();
  }

  render() {
    const app = document.getElementById('app');
    app.innerHTML = `
      <nav class="navbar">
        <div class="nav-content">
          <div class="logo">🥬 Siddhi Fresh Mart</div>
          <div class="nav-buttons">
            ${!this.currentUser ? `
              <button class="btn btn-primary" onclick="app.showLoginModal()">Login</button>
            ` : `
              <span style="margin-right: 10px;">Welcome, ${this.currentUser.name}</span>
              ${this.currentUser.role === 'admin' ? `
                <button class="btn btn-secondary" onclick="app.switchView('admin')">Admin Panel</button>
              ` : ''}
              ${this.currentUser.role === 'customer' ? `
                <button class="btn btn-secondary" onclick="app.updateCartDisplay()">🛒 Cart (${this.cart.length})</button>
              ` : ''}
              <button class="btn btn-secondary" onclick="app.logout()">Logout</button>
            `}
          </div>
        </div>
      </nav>
      <div class="container" id="main-container"></div>
    `;

    if (!this.currentUser) {
      this.renderLoginPage();
    } else if (this.currentUser.role === 'admin') {
      this.renderAdminPanel();
    } else {
      this.renderCustomerPage();
    }
  }

  renderLoginPage() {
    const container = document.getElementById('main-container');
    container.innerHTML = `
      <div style="max-width: 400px; margin: 50px auto;">
        <div class="card">
          <h2 style="text-align: center; margin-bottom: 30px; color: var(--primary);">🥬 Siddhi Fresh Mart</h2>
          <div class="form-group">
            <label>Role</label>
            <select id="roleSelect">
              <option value="customer">👨‍💼 Customer</option>
              <option value="admin">⚙️ Admin (Sachin)</option>
            </select>
          </div>
          <div class="form-group">
            <label>Name</label>
            <input type="text" id="nameInput" placeholder="Enter your name">
          </div>
          <div class="form-group">
            <label>Phone</label>
            <input type="text" id="phoneInput" placeholder="Enter your phone">
          </div>
          <button class="btn btn-primary" style="width: 100%;" onclick="app.login()">Login</button>
        </div>
      </div>
    `;
  }

  login() {
    const role = document.getElementById('roleSelect').value;
    const name = document.getElementById('nameInput').value;
    const phone = document.getElementById('phoneInput').value;

    if (!name || !phone) {
      alert('Please fill all fields');
      return;
    }

    if (role === 'admin' && name !== 'Sachin') {
      alert('Only Sachin can login as Admin');
      return;
    }

    this.currentUser = { role, name, phone, id: Date.now() };
    this.render();
  }

  logout() {
    this.currentUser = null;
    this.cart = [];
    this.render();
  }

  renderCustomerPage() {
    const container = document.getElementById('main-container');
    container.innerHTML = `
      <div class="main-content">
        <div>
          <div class="card">
            <h2 class="card-title">🛒 Our Products</h2>
            <div class="products-grid" id="productsGrid"></div>
          </div>
        </div>
        <div>
          <div class="card">
            <h2 class="card-title">🛍️ Your Cart</h2>
            <div id="cartContent"></div>
          </div>
          <div class="card">
            <h2 class="card-title">📍 Delivery Info</h2>
            <div class="form-group">
              <label>Delivery Address</label>
              <textarea id="addressInput" placeholder="Enter your delivery address" rows="3"></textarea>
            </div>
            <button class="btn btn-primary" style="width: 100%;" onclick="app.showMapAndCheckout()">📍 Select Location & Checkout</button>
          </div>
        </div>
      </div>
    `;

    this.renderProducts();
    this.updateCartDisplay();
  }

  renderProducts() {
    const grid = document.getElementById('productsGrid');
    grid.innerHTML = this.products.map(product => `
      <div class="product-card">
        <div style="font-size: 40px;">${product.image}</div>
        <div class="product-name">${product.name}</div>
        <div class="product-price">₹${product.price}/${product.unit}</div>
        <div class="quantity-selector">
          <button onclick="app.updateQuantity(${product.id}, -1)">−</button>
          <input type="number" id="qty-${product.id}" value="0" min="0">
          <button onclick="app.updateQuantity(${product.id}, 1)">+</button>
        </div>
        <button class="btn btn-primary" style="width: 100%; margin-top: 8px;" onclick="app.addToCart(${product.id})">Add Cart</button>
      </div>
    `).join('');
  }

  updateQuantity(productId, change) {
    const input = document.getElementById(`qty-${productId}`);
    let value = parseInt(input.value) || 0;
    value = Math.max(0, value + change);
    input.value = value;
  }

  addToCart(productId) {
    const input = document.getElementById(`qty-${productId}`);
    const quantity = parseInt(input.value) || 0;

    if (quantity === 0) {
      alert('Please select a quantity');
      return;
    }

    const product = this.products.find(p => p.id === productId);
    const cartItem = this.cart.find(item => item.id === productId);

    if (cartItem) {
      cartItem.quantity += quantity;
    } else {
      this.cart.push({ ...product, quantity });
    }

    input.value = 0;
    this.updateCartDisplay();
    alert('✅ Added to cart!');
  }

  updateCartDisplay() {
    const cartContent = document.getElementById('cartContent');
    if (this.cart.length === 0) {
      cartContent.innerHTML = '<p style="color: #999;">Your cart is empty</p>';
      return;
    }

    const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryCharge = this.deliveryCharges.baseCharge;
    const total = subtotal + deliveryCharge;

    cartContent.innerHTML = `
      <div style="margin-bottom: 10px;">
        ${this.cart.map(item => `
          <div class="cart-item">
            <span>${item.name} x${item.quantity}</span>
            <span>₹${item.price * item.quantity}</span>
          </div>
        `).join('')}
      </div>
      <div class="summary-row">Subtotal: ₹${subtotal}</div>
      <div class="summary-row">Delivery: ₹${deliveryCharge}</div>
      <div class="total">Total: ₹${total}</div>
      <button class="btn btn-danger" style="width: 100%; margin-top: 10px;" onclick="app.clearCart()">Clear Cart</button>
    `;
  }

  clearCart() {
    this.cart = [];
    this.updateCartDisplay();
  }

  showMapAndCheckout() {
    const address = document.getElementById('addressInput').value;
    if (!address) {
      alert('Please enter delivery address');
      return;
    }

    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2>📍 Select Delivery Location</h2>
          <button class="close-btn" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
        <div id="map">📍 Location: 28.61, 77.21</div>
        <div class="form-group" style="margin-top: 20px;">
          <label>Payment Method</label>
          <select id="paymentMethod">
            <option value="upi">💳 UPI</option>
            <option value="cod">💰 Cash on Delivery (COD)</option>
          </select>
        </div>
        <button class="btn btn-primary" style="width: 100%;" onclick="app.placeOrder('${address}')">✅ Place Order</button>
      </div>
    `;
    document.body.appendChild(modal);
  }

  placeOrder(address) {
    if (this.cart.length === 0) {
      alert('Cart is empty');
      return;
    }

    const paymentMethod = document.getElementById('paymentMethod').value;
    const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = subtotal + this.deliveryCharges.baseCharge;

    const order = {
      id: 'ORD-' + Date.now(),
      customerId: this.currentUser.id,
      customerName: this.currentUser.name,
      items: [...this.cart],
      address: address,
      subtotal: subtotal,
      deliveryCharge: this.deliveryCharges.baseCharge,
      total: total,
      paymentMethod: paymentMethod,
      paymentStatus: 'pending',
      orderStatus: 'confirmed',
      riderId: 1,
      shopkeeperId: 1,
      createdAt: new Date().toISOString(),
      paymentAttempts: 0
    };

    this.orders.push(order);
    this.paymentAttempts[order.id] = 0;

    console.log('📲 Notification to Sachin Gupta:', order);
    console.log('💬 Message to Shopkeeper:', order.items.map(i => `${i.quantity}${i.unit} ${i.name}`).join(', '));

    this.cart = [];
    document.querySelector('.modal').remove();
    alert(`✅ Order placed! Order ID: ${order.id}\n🚗 Sachin will contact you soon`);
    this.render();
  }

  renderAdminPanel() {
    const container = document.getElementById('main-container');
    container.innerHTML = `
      <div class="card">
        <h2 class="card-title">⚙️ Admin Dashboard</h2>
        <div class="tabs">
          <button class="tab-btn active" onclick="app.switchAdminTab('riders')">🚗 Riders</button>
          <button class="tab-btn" onclick="app.switchAdminTab('shopkeepers')">🏪 Shopkeepers</button>
          <button class="tab-btn" onclick="app.switchAdminTab('orders')">📋 Orders</button>
          <button class="tab-btn" onclick="app.switchAdminTab('payments')">💰 Payments</button>
        </div>

        <div id="ridersTab" class="tab-content active">${this.renderRidersTab()}</div>
        <div id="shopkeepersTab" class="tab-content">${this.renderShopkeepersTab()}</div>
        <div id="ordersTab" class="tab-content">${this.renderOrdersTab()}</div>
        <div id="paymentsTab" class="tab-content">${this.renderPaymentsTab()}</div>
      </div>
    `;
  }

  renderRidersTab() {
    return `
      <h3>🚗 Manage Riders</h3>
      <div style="margin-bottom: 20px;">
        <div class="form-group">
          <label>Rider Name</label>
          <input type="text" id="riderName" placeholder="Enter rider name">
        </div>
        <div class="form-group">
          <label>Phone</label>
          <input type="text" id="riderPhone" placeholder="Enter phone">
        </div>
        <button class="btn btn-primary" onclick="app.addRider()">➕ Add Rider</button>
      </div>
      <table>
        <thead>
          <tr><th>Name</th><th>Phone</th><th>Status</th><th>Action</th></tr>
        </thead>
        <tbody>
          ${this.riders.map(r => `
            <tr>
              <td>${r.name}</td>
              <td>${r.phone}</td>
              <td><span class="badge badge-success">${r.status}</span></td>
              <td>${r.id !== 1 ? `<button class="btn btn-danger" onclick="app.removeRider(${r.id})">Remove</button>` : '<span class="badge badge-info">Main</span>'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  renderShopkeepersTab() {
    return `
      <h3>🏪 Manage Shopkeepers</h3>
      <div style="margin-bottom: 20px;">
        <div class="form-group">
          <label>Name</label>
          <input type="text" id="shopkeeperName" placeholder="Enter name">
        </div>
        <div class="form-group">
          <label>Phone</label>
          <input type="text" id="shopkeeperPhone" placeholder="Enter phone">
        </div>
        <div class="form-group">
          <label>Address</label>
          <input type="text" id="shopkeeperAddress" placeholder="Enter address">
        </div>
        <button class="btn btn-primary" onclick="app.addShopkeeper()">➕ Add Shopkeeper</button>
      </div>
      <table>
        <thead>
          <tr><th>Name</th><th>Phone</th><th>Address</th><th>Action</th></tr>
        </thead>
        <tbody>
          ${this.shopkeepers.map(s => `
            <tr>
              <td>${s.name}</td>
              <td>${s.phone}</td>
              <td>${s.address}</td>
              <td><button class="btn btn-danger" onclick="app.removeShopkeeper(${s.id})">Remove</button></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  renderOrdersTab() {
    if (this.orders.length === 0) return '<p>No orders yet</p>';
    return `
      <h3>📋 All Orders</h3>
      <table>
        <thead>
          <tr><th>Order ID</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Payment</th><th>Action</th></tr>
        </thead>
        <tbody>
          ${this.orders.map(o => `
            <tr>
              <td>${o.id}</td>
              <td>${o.customerName}</td>
              <td>${o.items.length}</td>
              <td>₹${o.total}</td>
              <td><span class="badge badge-info">${o.orderStatus}</span></td>
              <td><span class="badge badge-warning">${o.paymentStatus}</span></td>
              <td><button class="btn btn-secondary" onclick="app.viewOrderDetails('${o.id}')">View</button></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  renderPaymentsTab() {
    const totalEarnings = this.orders.reduce((sum, o) => sum + (o.paymentStatus === 'paid' ? o.total : 0), 0);
    return `
      <h3>💰 Rider Payments</h3>
      <div class="card" style="background: #f0fdf4; border-left: 4px solid var(--primary);">
        <h4>Sachin Gupta - Total Earnings</h4>
        <p style="font-size: 28px; color: var(--primary); font-weight: bold;">₹${totalEarnings}</p>
        <p>Next Payment: Every Monday 📅</p>
      </div>
      <button class="btn btn-primary" onclick="app.processWeeklyPayment()" style="margin-top: 20px;">💳 Process Weekly Payment</button>
    `;
  }

  switchAdminTab(tab) {
    document.querySelectorAll('.tab-content').forEach(e => e.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(e => e.classList.remove('active'));
    document.getElementById(tab + 'Tab').classList.add('active');
    event.target.classList.add('active');
  }

  addRider() {
    const name = document.getElementById('riderName').value;
    const phone = document.getElementById('riderPhone').value;
    if (!name || !phone) { alert('Fill all fields'); return; }
    this.riders.push({ id: Date.now(), name, phone, status: 'available', location: { lat: 28.6139, lng: 77.2090 } });
    this.renderAdminPanel();
    alert('✅ Rider added!');
  }

  removeRider(id) {
    if (id === 1) { alert('Cannot remove Sachin'); return; }
    this.riders = this.riders.filter(r => r.id !== id);
    this.renderAdminPanel();
    alert('✅ Rider removed!');
  }

  addShopkeeper() {
    const name = document.getElementById('shopkeeperName').value;
    const phone = document.getElementById('shopkeeperPhone').value;
    const address = document.getElementById('shopkeeperAddress').value;
    if (!name || !phone || !address) { alert('Fill all fields'); return; }
    this.shopkeepers.push({ id: Date.now(), name, phone, address });
    this.renderAdminPanel();
    alert('✅ Shopkeeper added!');
  }

  removeShopkeeper(id) {
    this.shopkeepers = this.shopkeepers.filter(s => s.id !== id);
    this.renderAdminPanel();
    alert('✅ Shopkeeper removed!');
  }

  viewOrderDetails(orderId) {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) return;
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2>📋 Order Details</h2>
          <button class="close-btn" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
        <p><strong>Order ID:</strong> ${order.id}</p>
        <p><strong>Customer:</strong> ${order.customerName}</p>
        <p><strong>Address:</strong> ${order.address}</p>
        <p><strong>Items:</strong> ${order.items.map(i => `${i.quantity}${i.unit} ${i.name}`).join(', ')}</p>
        <p><strong>Total:</strong> ₹${order.total}</p>
        <p><strong>Status:</strong> ${order.orderStatus}</p>
        <p><strong>Payment:</strong> ${order.paymentStatus}</p>
        <button class="btn btn-primary" onclick="app.attemptPayment('${order.id}')">🔄 Attempt Payment</button>
      </div>
    `;
    document.body.appendChild(modal);
  }

  attemptPayment(orderId) {
    const order = this.orders.find(o => o.id === orderId);
    if (!order) return;
    this.paymentAttempts[orderId] = (this.paymentAttempts[orderId] || 0) + 1;
    if (this.paymentAttempts[orderId] >= 2) {
      order.paymentStatus = 'paid';
      alert(`✅ Auto Payment Done!\n₹${order.total} - ${order.paymentMethod.toUpperCase()}`);
    } else {
      alert(`Attempt ${this.paymentAttempts[orderId]}/2 - Next will auto-pay`);
    }
    document.querySelector('.modal')?.remove();
    this.renderAdminPanel();
  }

  processWeeklyPayment() {
    const earnings = this.orders.filter(o => o.paymentStatus === 'paid').reduce((sum, o) => sum + o.total, 0);
    if (earnings === 0) { alert('No earnings'); return; }
    alert(`💳 Payment Processed\n🚗 Sachin Gupta\n💰 ₹${earnings}\n✅ Done!`);
    this.renderAdminPanel();
  }

  switchView() {
    this.render();
  }
}

const app = new FreshMartApp();
