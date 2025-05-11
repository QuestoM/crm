let supabaseClient;
let isConnected = false;
let availableProducts = [];
let availablePackages = [];
let currentOrderItems = [];
let currentOrderCustomerId = null;
let currentOrderCustomerName = null;
let autoSaveTimeout = null;
let currentPackageItems = []; // For storing items while editing a package
let originalPackageItems = []; // To compare for changes
let availableProductsForSelection = []; // Cache for product dropdowns

let currentModal = {
  id: null, overlayElement: null, contentElement: null, bodyElement: null,
  footerActionsElement: null, relatedData: null, originalData: null, entityId: null, onCloseCallback: null
};

function getMockData(table) {
  switch (table) {
    case "leads": return [{id: "mock-l0", first_name: "יעל", last_name: "לוי", name: "יעל לוי", phone: "050-1234567", email: "yael@example.com", lead_source: "website", created_at: "2023-03-04", status: "new", custom_fields: { notes: "מעוניינת בפרטים נוספים" } }, {id: "mock-l1", first_name: "יוסי", last_name: "כהן", name: "יוסי כהן", phone: "052-7654321", email: "yossi@example.com", lead_source: "facebook", created_at: "2023-03-03", status: "contacted", custom_fields: { notes: "" } }, {id: "mock-l2", first_name: "דני", last_name: "אבני", name: "דני אבני", phone: "053-9876543", email: "dani@example.com", lead_source: "referral", created_at: "2023-03-02", status: "qualified", custom_fields: { notes: "חבר של דוד" } }];
    case "customers": return [{id: "mock-c0", first_name: "דוד", last_name: "כהן", name: "דוד כהן", phone_number: "050-1234567", email: "david@example.com", address: "רחוב הרצל 15", city: "תל אביב", created_at: "2023-02-15", status: "active"}, {id: "mock-c1", first_name: "שרה", last_name: "לוי", name: "שרה לוי", phone_number: "052-7654321", email: "sarah@example.com", address: "רחוב בן יהודה 42", city: "ירושלים", created_at: "2023-01-20", status: "active"}];
    case "products": return [{id: "mock-p0", name: "מערכת סינון מים פרימיום", sku: "FIL-PREM-1", category: "מסנני מים", price: 1299, cost: 800, description: "מוצר הדגמה פרימיום", active: true, inventory: { quantity: 15, min_threshold: 5 }, manufacturer: "WaterCo", model_number: "PREM-1000", barcode: "1234567890123", color: "כסוף", weight: 5, weight_unit: "kg", dimensions: { length: 30, width: 20, height: 40, unit: "cm" }, image_url: "", is_featured: true, warranty_months: 24}, {id: "mock-p1", name: "מסנן מים בסיסי", sku: "FIL-BAS-1", category: "מסנני מים", price: 499, cost: 250, description: "מוצר הדגמה בסיסי", active: true, inventory: { quantity: 0, min_threshold: 10 }, manufacturer: "FilterInc", model_number: "BASIC-500", barcode: "9876543210987", color: "לבן", weight: 3, weight_unit: "kg", dimensions: { length: 25, width: 15, height: 35, unit: "cm" }, image_url: "", is_featured: false, warranty_months: 12}, {id: "mock-p2", name: "מחסנית החלפה למסנן", sku: "CART-B", category: "מחסניות החלפה", price: 69, cost: 30, description: "מוצר הדגמה - מחסנית", active: true, inventory: { quantity: 100, min_threshold: 20 }, manufacturer: "FilterInc", model_number: "CART-B", barcode: "5432109876543", color: "", weight: 0.5, weight_unit: "kg", dimensions: { length: 10, width: 5, height: 5, unit: "cm" }, image_url: "", is_featured: false, warranty_months: null}, {id: "mock-p3", name: "ברז מים מעוצב", sku: "TAP-SS", category: "אביזרים", price: 250, cost: 150, description: "ברז נירוסטה", active: false, inventory: { quantity: 10, min_threshold: 3 }, manufacturer: "TapStyle", model_number: "TAP-SS", barcode: "1122334455667", color: "נירוסטה", weight: 1.2, weight_unit: "kg", dimensions: { length: 15, width: 5, height: 25, unit: "cm" }, image_url: "", is_featured: false, warranty_months: 6}];
    case "packages": return [{id: "mock-pkg1", name: "חבילת מטבח בסיסית", description: "תנור ומדיח כלים", base_price: 5500.0}, {id: "mock-pkg2", name: "חבילת כביסה מלאה", description: "מכונת כביסה ומייבש", base_price: 3699.99}];
    case "activities": return [{id: 1, type: "customer", display_type: "לקוח", description: "לקוח חדש נרשם - דוד כהן", created_at: new Date(Date.now() - 3600000).toISOString()}, {id: 2, type: "order", display_type: "הזמנה", description: "הזמנה #1234 הושלמה", created_at: new Date(Date.now() - 10800000).toISOString()}, {id: 3, type: "lead", display_type: "ליד", description: "ליד חדש דרך האתר", created_at: new Date(Date.now() - 18000000).toISOString()}];
    case "orders": return [{id: "mock-o1", customer_id: "mock-c0", status: "completed", total: 1299, created_at: "2023-03-01", order_items: [{ count: 1 }]}, {id: "mock-o2", customer_id: "mock-c1", status: "processing", total: 499, created_at: "2023-03-05", order_items: [{ count: 1 }]}];
    default: return [];
  }
}
function createMockClient() {
    console.warn("Creating mock Supabase client. Data will not be saved.");
    const mockClient = {
        from: function (table) {
  return {
                queryModifiers: [],
                select: function (selectStr = '*') { this.queryModifiers.push({ type: 'select', selectStr }); return this; },
                eq: function (col, val) { this.queryModifiers.push({ type: 'eq', col, val }); return this; },
                neq: function (col, val) { this.queryModifiers.push({ type: 'neq', col, val }); return this; },
                gt: function (col, val) { this.queryModifiers.push({ type: 'gt', col, val }); return this; },
                gte: function (col, val) { this.queryModifiers.push({ type: 'gte', col, val }); return this; },
                lt: function (col, val) { this.queryModifiers.push({ type: 'lt', col, val }); return this; },
                lte: function (col, val) { this.queryModifiers.push({ type: 'lte', col, val }); return this; },
                like: function (col, pattern) { this.queryModifiers.push({ type: 'like', col, pattern }); return this; },
                ilike: function (col, pattern) { this.queryModifiers.push({ type: 'ilike', col, pattern }); return this; },
                in: function (col, values) { this.queryModifiers.push({ type: 'in', col, values }); return this; },
                is: function (col, value) { this.queryModifiers.push({ type: 'is', col, value }); return this; },
                or: function (filters) { this.queryModifiers.push({ type: 'or', filters }); return this; },
                order: function (column, options = {}) { this.queryModifiers.push({ type: 'order', column, options }); return this; },
                limit: function (count) { this.queryModifiers.push({ type: 'limit', count }); return this; },
                range: function (from, to) { this.queryModifiers.push({ type: 'range', from, to }); return this; },
                single: function () { this.queryModifiers.push({ type: 'limit', count: 1 }); this.queryModifiers.push({ type: 'single' }); return this; },

                then: function (onFulfilled, onRejected) {
                    return this._resolveMockQuery(table).then(onFulfilled, onRejected);
                },
                _resolveMockQuery: async function (tableName) {
                    let mockData = getMockData(tableName);
                    let filteredData = [...mockData];
                    let limit = null;
                    let rangeFrom = 0;
                    let rangeTo = Infinity;
                    let singleResult = false;
                    let sortParams = [];

                    (this.queryModifiers || []).forEach(mod => {
                        try {
                            if (mod.type === 'eq') filteredData = filteredData.filter(item => item[mod.col] == mod.val);
                            else if (mod.type === 'neq') filteredData = filteredData.filter(item => item[mod.col] != mod.val);
                            else if (mod.type === 'gt') filteredData = filteredData.filter(item => item[mod.col] > mod.val);
                            else if (mod.type === 'gte') filteredData = filteredData.filter(item => item[mod.col] >= mod.val);
                            else if (mod.type === 'lt') filteredData = filteredData.filter(item => item[mod.col] < mod.val);
                            else if (mod.type === 'lte') filteredData = filteredData.filter(item => item[mod.col] <= mod.val);
                            else if (mod.type === 'like' || mod.type === 'ilike') {
                                const pattern = mod.pattern.replace(/%/g, '.*');
                                const regex = new RegExp(`^${pattern}$`, mod.type === 'ilike' ? 'i' : '');
                                filteredData = filteredData.filter(item => item[mod.col] && regex.test(item[mod.col]));
                            }
                            else if (mod.type === 'in') filteredData = filteredData.filter(item => mod.values.includes(item[mod.col]));
                            else if (mod.type === 'is') filteredData = filteredData.filter(item => item[mod.col] === mod.value);
                            else if (mod.type === 'or') {
                                const orConditions = mod.filters.split(',');
                                filteredData = filteredData.filter(item => {
                                    return orConditions.some(condition => {
                                        const parts = condition.match(/([^.]+)\.(.+)\.(.+)/);
                                        if (!parts) return false;
                                        const [, col, op, valStr] = parts;
                                        const val = valStr.replace(/^%|%$/g, ''); // basic un-quoting/wildcard removal
                                        if (op === 'ilike') return item[col]?.toLowerCase().includes(val.toLowerCase());
                                        // Add more OR operators if needed
                                        return false;
                                    });
                                });
                            }
                            else if (mod.type === 'order') sortParams.push({ column: mod.column, ascending: mod.options.ascending !== false });
                            else if (mod.type === 'limit') limit = mod.count;
                            else if (mod.type === 'range') { rangeFrom = mod.from; rangeTo = mod.to; }
                            else if (mod.type === 'single') singleResult = true;
                        } catch (e) { console.error(`Mock filter error (${mod.type}):`, e); }
                    });

                    if (sortParams.length > 0) {
                        filteredData.sort((a, b) => {
                            for (const sort of sortParams) { const valA = a[sort.column]; const valB = b[sort.column]; const comparison = (valA < valB) ? -1 : (valA > valB) ? 1 : 0; if (comparison !== 0) { return sort.ascending ? comparison : -comparison; } } return 0;
                        });
                    }

                    filteredData = filteredData.slice(rangeFrom, rangeTo + 1);
                    if (limit !== null) { filteredData = filteredData.slice(0, limit); }
                    this.queryModifiers = [];
                    const finalData = singleResult ? (filteredData[0] || null) : filteredData;
                    return Promise.resolve({ data: finalData, error: null, count: mockData.length });
                }
            };
        },
        insert: async function (data) {
            const itemsToInsert = Array.isArray(data) ? data : [data];
            const insertedItems = itemsToInsert.map(item => ({ ...item, id: `mock-${this.tableName.slice(0, 1)}${Date.now()}${Math.random().toString(16).slice(2, 8)}`, created_at: new Date().toISOString() }));
            console.log(`Mock Insert into ${this.tableName}:`, insertedItems);
            return Promise.resolve({ data: insertedItems, error: null });
        }.bind({ tableName: 'unknown' }),
        update: function (data) {
         this._updateData = data;
        return {
                eq: async function (col, val) {
                    const mockData = getMockData(this.tableName); const itemIndex = mockData.findIndex(item => item[col] == val); let updatedItem = null; if (itemIndex > -1) { updatedItem = { ...mockData[itemIndex], ...this._updateData, updated_at: new Date().toISOString() }; }
                    console.log(`Mock Update in ${this.tableName} WHERE ${col}=${val}:`, updatedItem ? [updatedItem] : []);
                    return Promise.resolve({ data: updatedItem ? [updatedItem] : [], error: null });
                }.bind(this)
            };
        }.bind({ tableName: 'unknown' }),
        upsert: async function (data, options = {}) {
            const conflictTarget = options.onConflict || 'id'; const itemsToUpsert = Array.isArray(data) ? data : [data]; const results = []; const mockData = getMockData(this.tableName);
            for (const item of itemsToUpsert) { const existingIndex = mockData.findIndex(existing => existing[conflictTarget] === item[conflictTarget]); if (existingIndex > -1 && !options.ignoreDuplicates) { results.push({ ...mockData[existingIndex], ...item, updated_at: new Date().toISOString() }); } else if (existingIndex === -1) { results.push({ ...item, id: item.id || `mock-${this.tableName.slice(0, 1)}${Date.now()}${Math.random().toString(16).slice(2, 8)}`, created_at: new Date().toISOString() }); } }
            console.log(`Mock Upsert into ${this.tableName}:`, results);
            return Promise.resolve({ data: results, error: null });
        }.bind({ tableName: 'unknown' }),
        delete: function () {
            return {
                eq: async function (col, val) {
                    const mockData = getMockData(this.tableName); const itemIndex = mockData.findIndex(item => item[col] == val); let deletedItem = null; if (itemIndex > -1) { deletedItem = { ...mockData[itemIndex] }; }
                    console.log(`Mock Delete from ${this.tableName} WHERE ${col}=${val}:`, deletedItem ? [deletedItem] : []);
                    return Promise.resolve({ data: deletedItem ? [deletedItem] : [], error: null });
                }.bind(this)
            };
        }.bind({ tableName: 'unknown' }),
        rpc: async function (name, params) {
            console.log(`Mock RPC call '${name}' with params:`, params); if (name === 'decrement_inventory') { console.log(` -> Simulating decrement for product ${params?.p_product_id} by ${params?.p_quantity_change}`); return Promise.resolve({ data: null, error: null }); } return Promise.resolve({ data: null, error: { message: `Mock RPC function '${name}' not implemented` } });
        },
        auth: { getUser: async () => ({ data: { user: { id: 'mock-user-id', email: 'mock@example.com', user_metadata: { full_name: 'Mock User' } } }, error: null }) } // Mock auth
    };
    const originalFrom = mockClient.from;
    mockClient.from = function (table) {
        const chain = originalFrom.call(this, table);
        ['insert', 'update', 'upsert', 'delete'].forEach(method => { if (typeof mockClient[method] === 'function') { mockClient[method] = mockClient[method].bind({ tableName: table }); } });
        return chain;
    };
    return mockClient;
}

function createSpinnerHTML() { return '<div class="spinner"></div>'; }

function showToast(message, type = "success") {
  const toast = document.getElementById("toast"); const toastMessage = document.getElementById("toast-message"); if (!toast || !toastMessage) return;
  toast.className = "toast"; let backgroundColor = "#3b82f6"; if (type === "success") backgroundColor = "#10b981"; else if (type === "error") backgroundColor = "#ef4444"; else if (type === "warning") backgroundColor = "#f59e0b";
  toast.style.backgroundColor = backgroundColor; toastMessage.textContent = message; toast.classList.add('show'); toast.style.display = 'block';
  setTimeout(() => { toast.classList.remove('show'); setTimeout(() => { if (!toast.classList.contains('show')) { toast.style.display = 'none'; } }, 550); }, 3000);
}

function getDerivedProductStatus(active, quantity) {
  const isActive = active === true; const currentQuantity = typeof quantity === 'number' ? quantity : 0; if (!isActive) return { text: "לא פעיל", color: "red" }; if (currentQuantity > 0) return { text: "פעיל", color: "green" }; return { text: "אזל מהמלאי", color: "yellow" };
}

function getStatusColor(status) {
  if (!status) return "yellow"; status = status.toLowerCase(); if (["active", "פעיל", "new", "חדש", "converted", "הומר ללקוח", "completed", "delivered"].includes(status)) return "green"; if (["contacted", "נוצר קשר", "qualified", "מוכשר", "nurturing", "בטיפול", "processing"].includes(status)) return "blue"; if (["inactive", "לא פעיל", "closed", "סגור", "not_interested", "לא מעוניין", "cancelled"].includes(status)) return "red"; if (status === "אזל מהמלאי") return "yellow"; if (status === "pending" || status === "partially_paid") return "yellow"; if (status === "paid") return "green"; if (status === "refunded") return "red"; return "yellow";
}

function getOrderStatusColor(status) { if (!status) return "yellow"; status = status.toLowerCase(); if (["completed", "delivered"].includes(status)) return "green"; if (["processing"].includes(status)) return "blue"; if (["cancelled"].includes(status)) return "red"; return "yellow"; }
function getOrderPaymentStatusColor(status) { if (!status) return "yellow"; status = status.toLowerCase(); if (status === "paid") return "green"; if (status === "refunded") return "red"; return "yellow"; }

function formatSource(source) { if (window.formatLeadSource) return window.formatLeadSource(source); const map = { website: "אתר אינטרנט", facebook: "פייסבוק", referral: "הפניה", phone: "שיחת טלפון", instagram: "אינסטגרם", trade_show: "תערוכה", newspaper: "עיתון", other: "אחר" }; return map[source] || source || ""; }
function formatStatus(status) { if (window.translateStatus) return window.translateStatus(status); const map = { new: "חדש", contacted: "נוצר קשר", qualified: "מוכשר", nurturing: "בטיפול", converted: "הומר ללקוח", closed: "סגור", not_interested: "לא מעוניין", active: "פעיל", inactive: "לא פעיל", processing: "בטיפול", completed: "הושלם", delivered: "נמסר", cancelled: "בוטל", pending: "ממתין", paid: "שולם", partially_paid: "שולם חלקית", refunded: "הוחזר" }; return map[status] || status || ""; }
function formatDateDisplay(dateString) { if (!dateString) return "-"; if (window.formatDate) return window.formatDate(dateString); try { const date = new Date(dateString); if (isNaN(date.getTime())) return dateString; if (typeof Intl !== 'undefined' && Intl.DateTimeFormat) { return new Intl.DateTimeFormat('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date); } else { const day = String(date.getDate()).padStart(2, "0"); const month = String(date.getMonth() + 1).padStart(2, "0"); const year = date.getFullYear(); return `${day}.${month}.${year}`; } } catch (e) { console.warn("Error formatting date:", dateString, e); return dateString; } }
function formatCurrency(amount) { if (amount == null || isNaN(amount)) return "0.00 ₪"; if (typeof Intl !== 'undefined' && Intl.NumberFormat) { return new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS' }).format(amount); } else { return amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,') + ' ₪'; } }
function getTimeAgo(timestamp) { if (!timestamp) return ""; if (window.formatTimeAgo) return window.formatTimeAgo(timestamp); const now = new Date(); const date = new Date(timestamp); const diffMs = now - date; const diffSec = Math.floor(diffMs / 1000); const diffMin = Math.floor(diffSec / 60); const diffHour = Math.floor(diffMin / 60); const diffDay = Math.floor(diffHour / 24); if (diffDay > 1) return `לפני ${diffDay} ימים`; if (diffDay === 1) return "אתמול"; if (diffHour > 0) return `לפני ${diffHour} שעות`; if (diffMin > 0) return `לפני ${diffMin} דקות`; return "עכשיו"; }
function getActivityIcon(type) { switch (type) { case "ליד": case "lead": return '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>'; case "לקוח": case "customer": return '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>'; case "הזמנה": case "order": return '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>'; case "שירות": case "service": return '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>'; case "מוצר": case "product": return '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clip-rule="evenodd" /></svg>'; default: return '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>'; } }
function formatTaskTime(timeString) { if (!timeString) return ""; try { const date = new Date(timeString); return date.getHours().toString().padStart(2, "0") + ":" + date.getMinutes().toString().padStart(2, "0"); } catch (error) { return ""; } }

function openModal(config) {
    if (currentModal.id) { closeCurrentModal(); }

    currentModal.id = config.modalId;
    currentModal.overlayElement = document.getElementById('generic-modal-overlay');
    currentModal.contentElement = document.getElementById('generic-modal-content-wrapper');
    currentModal.bodyElement = document.getElementById('generic-modal-body');
    currentModal.footerActionsElement = document.getElementById('generic-modal-footer-actions');
    currentModal.relatedData = config.relatedData || null;
    currentModal.originalData = config.relatedData ? JSON.parse(JSON.stringify(config.relatedData)) : null;
    currentModal.entityId = config.entityId || null;
    currentModal.onCloseCallback = config.onCloseCallback || null;

    if (!currentModal.overlayElement || !currentModal.contentElement || !currentModal.bodyElement || !currentModal.footerActionsElement) {
        console.error("Generic modal elements not found!");
        currentModal.id = null;
        return;
    }

    document.getElementById('generic-modal-title').textContent = config.title;
    currentModal.contentElement.className = 'modal-content-wrapper'; // Reset classes
    if (config.sizeClass) {
        currentModal.contentElement.classList.add(config.sizeClass);
    }

    // --- Handle content: Element first, then Template ID ---
    if (config.contentElement && config.contentElement instanceof HTMLElement) {
        currentModal.bodyElement.innerHTML = ''; // Clear previous content
        currentModal.bodyElement.appendChild(config.contentElement);
    } else if (config.contentTemplateId) {
        const template = document.getElementById(config.contentTemplateId);
        if (template && template.content) {
            currentModal.bodyElement.innerHTML = '';
            currentModal.bodyElement.appendChild(template.content.cloneNode(true));
        } else {
            currentModal.bodyElement.innerHTML = '<p style="color: red;">Error: Content template not found.</p>';
            console.error(`Modal content template "${config.contentTemplateId}" not found.`);
        }
    } else {
        currentModal.bodyElement.innerHTML = '<p style="color: orange;">Warning: No content provided for modal.</p>';
        console.warn("Modal opened without contentElement or contentTemplateId.", config.modalId);
    }
    // --- End content handling ---

    currentModal.footerActionsElement.innerHTML = config.footerActionsHTML || '';
    document.getElementById('generic-modal-autosave-indicator').style.display = 'none';
    currentModal.overlayElement.style.display = 'block';

    // --- Pass modalRef to onLoad ---
    const modalRef = {
        overlayElement: currentModal.overlayElement,
        contentElement: currentModal.contentElement,
        bodyElement: currentModal.bodyElement,
        footerActionsElement: currentModal.footerActionsElement
    };
    if (config.onLoad && typeof config.onLoad === 'function') {
        // Pass body element, related data, and the modalRef object
        config.onLoad(currentModal.bodyElement, currentModal.relatedData, modalRef);
    }
    // --- End onLoad call ---

    currentModal.overlayElement.onclick = function(event) {
        if (event.target === currentModal.overlayElement) {
            closeCurrentModal();
        }
    };
}

function closeCurrentModal() {
    if (!currentModal.id || !currentModal.overlayElement) return;
    if (currentModal.onCloseCallback && typeof currentModal.onCloseCallback === 'function') { currentModal.onCloseCallback(); }
    currentModal.overlayElement.style.display = 'none';
    currentModal.bodyElement.innerHTML = createSpinnerHTML();
    currentModal.footerActionsElement.innerHTML = '';
    currentModal = { id: null, overlayElement: null, contentElement: null, bodyElement: null, footerActionsElement: null, relatedData: null, originalData: null, entityId: null, onCloseCallback: null };
    resetOrderModal();
    if (autoSaveTimeout) { clearTimeout(autoSaveTimeout); autoSaveTimeout = null; }
}

function showAutoSaveIndicator() { const indicator = document.getElementById('generic-modal-autosave-indicator'); if (indicator) { indicator.style.display = 'flex'; setTimeout(() => { indicator.style.display = 'none'; }, 3000); } }

async function loadAndRenderTable(config) {
    const loadingElement = document.getElementById(config.loadingElementId);
    const tableElement = document.getElementById(config.tableElementId);
    const tableBody = document.getElementById(config.tableBodyId);
    const searchInput = config.searchInputId ? document.getElementById(config.searchInputId) : null;

    if (!loadingElement || !tableElement || !tableBody) { console.error("Table/Loading elements not found for:", config); return; }

    loadingElement.style.display = 'flex'; loadingElement.innerHTML = createSpinnerHTML(); tableElement.style.display = 'none'; tableBody.innerHTML = '';

    try {
        let query = supabaseClient.from(config.supabaseView).select(config.selectFields || '*');
        if (config.filter) {
            if (config.filter.operator === 'eq') query = query.eq(config.filter.column, config.filter.value);
            if (config.filter.operator === 'neq') query = query.neq(config.filter.column, config.filter.value);
            if (config.filter.operator === 'in') query = query.in(config.filter.column, config.filter.value);
            if (config.filter.operator === 'ilike') query = query.ilike(config.filter.column, `%${config.filter.value}%`);
        }
        if (searchInput && searchInput.value) {
            const searchTerm = searchInput.value;
            const searchColumn = config.searchColumn || 'name';
            if (searchColumn.includes(',')) {
                const orFilters = searchColumn.split(',').map(col => `${col.trim()}.ilike.%${searchTerm}%`).join(',');
                query = query.or(orFilters);
  } else {
                query = query.ilike(searchColumn, `%${searchTerm}%`);
            }
        }
        if (config.orderBy) { query = query.order(config.orderBy.column, { ascending: config.orderBy.ascending }); }
        if (config.limit) { query = query.limit(config.limit); }

        const { data, error } = await query;
    if (error && isConnected) throw error;
        const displayData = isConnected ? data : getMockData(config.mockDataKey);

        loadingElement.style.display = 'none'; tableElement.style.display = 'table';

        const thead = tableElement.querySelector('thead tr');
        if (thead) { thead.innerHTML = config.columns.map(col => `<th style="${col.headerStyle || ''}">${col.header}</th>`).join(''); }

        if (displayData && displayData.length > 0) {
            tableBody.innerHTML = displayData.map((item) => {
                const rowAttrs = config.rowAttributes ? config.rowAttributes(item, config.entityType) : { 'data-id': item.id, 'data-type': config.entityType };
                const attrsString = Object.entries(rowAttrs).map(([key, value]) => `${key}="${value}"`).join(' ');
                const cells = config.columns.map(col => { const value = col.key ? item[col.key] : item; const renderedValue = col.render ? col.render(value, item) : value; return `<td class="${col.cellClass || ''}" style="${col.cellStyle || ''}">${renderedValue ?? '-'}</td>`; }).join('');
                return `<tr ${attrsString} style="${config.rowStyle || ''}">${cells}</tr>`;
            }).join('');
        } else { tableBody.innerHTML = `<tr><td colspan="${config.columns.length}" style="text-align: center; padding: 1.5rem;">לא נמצאו נתונים</td></tr>`; }
        if (config.onLoadComplete) { config.onLoadComplete(displayData); }
    } catch (error) { console.error(`Error loading table ${config.tableElementId}:`, error); loadingElement.style.display = 'none'; tableElement.style.display = 'table'; tableBody.innerHTML = `<tr><td colspan="${config.columns.length}" style="text-align: center; color: red; padding: 1.5rem;">שגיאה בטעינת נתונים</td></tr>`; }
}

function debounce(func, wait) { let timeout; return function executedFunction(...args) { const later = () => { clearTimeout(timeout); func(...args); }; clearTimeout(timeout); timeout = setTimeout(later, wait); }; };

function setupSearchListeners() {
    const searchInputs = [
        { id: 'leads-search', loadFunc: loadLeads }, 
        { id: 'customers-search', loadFunc: loadCustomers }, 
        { id: 'orders-search', loadFunc: loadOrders },
        { id: 'products-search', loadFunc: loadProducts },
        { id: 'packages-search', loadFunc: loadPackages } // Add package search
    ];
    searchInputs.forEach(inputConfig => { const inputElement = document.getElementById(inputConfig.id); if (inputElement) { inputElement.addEventListener('input', debounce(() => { const pageId = inputConfig.id.split('-')[0]; if (document.getElementById(pageId)?.classList.contains('active')) { inputConfig.loadFunc(); } }, 500)); } });
}

const leadsTableConfig = {
    supabaseView: 'lead_view', loadingElementId: 'leads-full-loading', tableElementId: 'leads-full-table', tableBodyId: 'leads-full-table-body',
    selectFields: '*', orderBy: { column: 'created_at', ascending: false }, mockDataKey: 'leads', entityType: 'lead', searchInputId: 'leads-search', searchColumn: 'name,phone,email',
    columns: [
        { header: 'שם', key: 'name', render: (name, item) => `<a href="javascript:void(0)" onclick="showLeadDetails('${item.id}')" style="text-decoration: none; color: #1e40af; font-weight: 500;">${name || ''}</a>` },
        { header: 'טלפון', key: 'phone' },
        { header: 'אימייל', key: 'email', render: (email) => email ? `<a href="mailto:${email}" style="text-decoration: none; color: #1e40af;">${email}</a>` : '-' },
        { header: 'מקור', key: 'source', render: (source) => formatSource(source) },
        { header: 'תאריך', key: 'created_at', render: (date) => formatDateDisplay(date) },
        { header: 'סטטוס', key: 'status', render: (status, item) => `<span class="badge badge-${item.status_color || getStatusColor(status)}">${item.status_text || formatStatus(status)}</span>` },
        { header: 'פעולות', key: 'id', render: (id) => `<button class="button button-primary" onclick="showLeadDetails('${id}')" style="font-size: 0.75rem; padding: 0.25rem 0.5rem;">צפה</button>`, cellStyle: 'text-align: center;' }
    ]
};
const customersTableConfig = {
    supabaseView: 'customer_view', loadingElementId: 'customers-loading', tableElementId: 'customers-table', tableBodyId: 'customers-table-body',
    selectFields: '*', orderBy: { column: 'created_at', ascending: false }, mockDataKey: 'customers', entityType: 'customer', searchInputId: 'customers-search', searchColumn: 'name,phone_number,email,address,city', // Changed 'phone' to 'phone_number'
    columns: [
        { header: 'שם', key: 'name', render: (name, item) => `<a href="javascript:void(0)" onclick="showCustomerDetails('${item.id}')" style="text-decoration: none; color: #1e40af; font-weight: 500;">${name || ''}</a>` },
        { header: 'טלפון', key: 'phone' },
        { header: 'אימייל', key: 'email', render: (email) => email ? `<a href="mailto:${email}" style="text-decoration: none; color: #1e40af;">${email}</a>` : '-' },
        { header: 'כתובת', key: 'address', cellClass: 'wrap' },
        { header: 'הצטרף בתאריך', key: 'created_at', render: (date) => formatDateDisplay(date) },
        { header: 'סטטוס', key: 'status', render: (status, item) => `<span class="badge badge-${item.status_color || getStatusColor(status)}">${item.status_text || formatStatus(status)}</span>` },
        { header: 'הזמנה חדשה', key: 'id', render: (id, item) => { const escapedName = (item.name || '').replace(/"/g, "&quot;").replace(/'/g, "\'"); return `<button class="button button-secondary" onclick="openOrderModal('${id}', '${escapedName}')" style="font-size: 0.75rem; padding: 0.25rem 0.5rem;"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-left: 4px;"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>הזמנה</button>`; }, cellStyle: 'text-align: center;' },
        { header: 'פעולות', key: 'id', render: (id) => `<button class="button button-primary" onclick="showCustomerDetails('${id}')" style="font-size: 0.75rem; padding: 0.25rem 0.5rem;">צפה</button>`, cellStyle: 'text-align: center;' }
    ]
};
const ordersTableConfig = {
    supabaseView: 'orders_view', loadingElementId: 'orders-loading', tableElementId: 'orders-table', tableBodyId: 'orders-table-body',
    selectFields: 'id, customer_id, customer_name, created_at, total, status, payment_status', 
    orderBy: { column: 'created_at', ascending: false }, 
    mockDataKey: 'orders', // Need mock data for orders_view if offline
    entityType: 'order',
    searchInputId: 'orders-search',
    searchColumn: 'customer_name', // Simplified search to just customer name
    columns: [
        { header: '#הזמנה', key: 'id', render: (id) => `<a href="javascript:void(0)" onclick="showOrderDetails('${id}')" style="text-decoration: none; color: #1e40af; font-weight: 500;">${id.substring(0, 8)}...</a>` },
        { header: 'לקוח', key: 'customer_name', render: (name, item) => item.customer_id ? `<a href="javascript:void(0)" onclick="showCustomerDetails('${item.customer_id}')" style="text-decoration: none; color: #1e40af;">${name || '-'}</a>` : (name || '-') },
        { header: 'תאריך', key: 'created_at', render: (date) => formatDateDisplay(date) },
        { header: 'סה"כ', key: 'total', render: (total) => formatCurrency(total) },
        { header: 'סטטוס הזמנה', key: 'status', render: (status) => `<span class="badge badge-${getOrderStatusColor(status)}">${formatStatus(status)}</span>` },
        { header: 'סטטוס תשלום', key: 'payment_status', render: (status) => `<span class="badge badge-${getOrderPaymentStatusColor(status)}">${formatStatus(status)}</span>` },
        { header: 'פעולות', key: 'id', render: (id) => `<button class="button button-primary" onclick="showOrderDetails('${id}')" style="font-size: 0.75rem; padding: 0.25rem 0.5rem;">ערוך</button>`, cellStyle: 'text-align: center;' }
    ]
};
const productsTableConfig = {
    supabaseView: 'products', loadingElementId: 'products-loading', tableElementId: 'products-table', tableBodyId: 'products-table-body',
    selectFields: '*, active, inventory(quantity)', orderBy: { column: 'name', ascending: true }, mockDataKey: 'products', entityType: 'product', searchInputId: 'products-search', searchColumn: 'name,sku,category,description',
    columns: [
        { header: 'שם המוצר', key: 'name' }, { header: 'קטגוריה', key: 'category' }, { header: 'מחיר', key: 'price', render: (price) => formatCurrency(price) },
        { header: 'מלאי', key: 'inventory', render: (inv) => inv ? (Array.isArray(inv) ? (inv[0]?.quantity ?? 0) : inv.quantity) : 0 },
        { header: 'סטטוס', key: 'active', render: (active, item) => { const quantity = item.inventory ? (Array.isArray(item.inventory) ? (item.inventory[0]?.quantity ?? 0) : item.inventory.quantity) : 0; const statusInfo = getDerivedProductStatus(active, quantity); return `<span class="badge badge-${statusInfo.color}">${statusInfo.text}</span>`; } },
        { header: 'פעולות', key: 'id', render: (id) => `<button class="button button-primary" onclick="showProductDetails('${id}')" style="font-size: 0.75rem; padding: 0.25rem 0.5rem;">צפה</button>`, cellStyle: 'text-align: center;' }
    ]
};
const packagesTableConfig = {
    supabaseView: 'packages_view', loadingElementId: 'packages-loading', tableElementId: 'packages-table', tableBodyId: 'packages-table-body',
    selectFields: '*', // Fetches all columns from packages_view including item_count
    orderBy: { column: 'name', ascending: true },
    mockDataKey: 'packages', // Need mock data for packages_view if offline
    entityType: 'package',
    searchInputId: 'packages-search',
    searchColumn: 'name,description',
    columns: [
        { header: 'שם החבילה', key: 'name', render: (name, item) => `<a href="javascript:void(0)" onclick="showPackageDetails('${item.id}')" style="text-decoration: none; color: #1e40af; font-weight: 500;">${name || ''}</a>` },
        { header: 'תיאור', key: 'description', cellClass: 'wrap' },
        { header: 'מחיר בסיס', key: 'base_price', render: (price) => formatCurrency(price) },
        { header: 'מספר פריטים', key: 'item_count' },
        { header: 'סטטוס', key: 'active', render: (active) => active ? '<span class="badge badge-green">פעיל</span>' : '<span class="badge badge-red">לא פעיל</span>' },
        { header: 'פעולות', key: 'id', render: (id) => `<button class="button button-primary" onclick="showPackageDetails('${id}')" style="font-size: 0.75rem; padding: 0.25rem 0.5rem;">ערוך</button>`, cellStyle: 'text-align: center;' }
    ]
};
const dashboardLeadsConfig = {
    supabaseView: 'recent_leads_view', loadingElementId: 'leads-table-loading', tableElementId: 'leads-table', tableBodyId: 'leads-table-body',
    selectFields: '*', limit: 5, mockDataKey: 'leads', entityType: 'lead',
    columns: [
         { header: 'שם', key: 'name', render: (name, item) => `<a href="javascript:void(0)" onclick="showLeadDetails('${item.id}')" style="text-decoration: none; color: #1e40af; font-weight: 500;">${name || ''}</a>`, headerStyle: 'padding: 0.75rem 1rem; text-align: right; border-bottom: 1px solid #e5e7eb; background-color: #f9fafb; font-weight: 600; font-size: 0.875rem; color: #4b5563;' },
         { header: 'טלפון', key: 'phone', headerStyle: 'padding: 0.75rem 1rem; text-align: right; border-bottom: 1px solid #e5e7eb; background-color: #f9fafb; font-weight: 600; font-size: 0.875rem; color: #4b5563;' },
         { header: 'מקור', key: 'source', render: (source) => formatSource(source), headerStyle: 'padding: 0.75rem 1rem; text-align: right; border-bottom: 1px solid #e5e7eb; background-color: #f9fafb; font-weight: 600; font-size: 0.875rem; color: #4b5563;' },
         { header: 'תאריך', key: 'created_date', render: (date, item) => date || formatDateDisplay(item.created_at), headerStyle: 'padding: 0.75rem 1rem; text-align: right; border-bottom: 1px solid #e5e7eb; background-color: #f9fafb; font-weight: 600; font-size: 0.875rem; color: #4b5563;' },
         { header: 'סטטוס', key: 'status', render: (status, item) => `<span class="badge badge-${item.status_color || getStatusColor(status)}">${item.status_text || formatStatus(status)}</span>`, headerStyle: 'padding: 0.75rem 1rem; text-align: right; border-bottom: 1px solid #e5e7eb; background-color: #f9fafb; font-weight: 600; font-size: 0.875rem; color: #4b5563;' },
         { header: 'פעולות', key: 'id', render: (id) => `<div style="display: flex; justify-content: center; gap: 0.5rem;"><button class="button" onclick="/* Add contact action */" style="padding: 0.25rem 0.5rem; background-color: #e0f2fe; color: #0369a1; border-radius: 0.375rem;" title="יצירת קשר"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg></button><button class="button" onclick="showLeadDetails('${id}')" style="padding: 0.25rem 0.5rem; background-color: #fef3c7; color: #92400e; border-radius: 0.375rem;" title="צפה בפרטים"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg></button></div>`, cellStyle: 'text-align: center;', headerStyle: 'padding: 0.75rem 1rem; text-align: center; border-bottom: 1px solid #e5e7eb; background-color: #f9fafb; font-weight: 600; font-size: 0.875rem; color: #4b5563;' }
    ]
};

function loadLeads() { loadAndRenderTable(leadsTableConfig); }
function loadCustomers() { loadAndRenderTable(customersTableConfig); }
function loadOrders() { loadAndRenderTable(ordersTableConfig); }
function loadProducts() { loadAndRenderTable(productsTableConfig); }
function loadPackages() { loadAndRenderTable(packagesTableConfig); }
function loadTasks() {
    console.log("[loadTasks] Attempting to load tasks...");
    // בדיקה מיידית
    if (window.tasksModule && typeof window.tasksModule.initializeTasks === 'function') {
        console.log("[loadTasks] tasksModule found immediately. Initializing.");
        try {
            window.tasksModule.initializeTasks();
        } catch (err) {
            console.error("[loadTasks] Error during immediate initialization:", err);
            const tasksContainer = document.getElementById('tasks-container');
            if (tasksContainer) tasksContainer.innerHTML = '<p style="color: red;">Error initializing tasks module.</p>';
        }
    } else {
        // רישום אם לא נמצא
        console.error("[loadTasks] tasksModule NOT found immediately. Current window.tasksModule:", window.tasksModule);
        
        // ננסה שוב אחרי השהייה קצרה (לאבחון בעיות תזמון)
        setTimeout(() => {
            console.log("[loadTasks] Attempting to load tasks after 500ms delay...");
            if (window.tasksModule && typeof window.tasksModule.initializeTasks === 'function') {
                console.log("[loadTasks] tasksModule found after delay. Initializing.");
                try {
                    window.tasksModule.initializeTasks();
                } catch (err) {
                    console.error("[loadTasks] Error during delayed initialization:", err);
                    const tasksContainer = document.getElementById('tasks-container');
                    if (tasksContainer) tasksContainer.innerHTML = '<p style="color: red;">Error initializing tasks module after delay.</p>';
                }
            } else {
                console.error("[loadTasks] tasksModule STILL NOT found after delay. Final check:", window.tasksModule);
                const tasksContainer = document.getElementById('tasks-container');
                if (tasksContainer) {
                    tasksContainer.innerHTML = '<p style="color: red; text-align: center;">שגיאה קריטית: מודול המשימות לא נטען כראוי. ודא שהקובץ build/tasks.js תקין ונטען לפני קריאה זו.</p>';
                }
            }
        }, 500); // השהייה של 500 מילישניות
    }
}
function loadReports() { loadLeadsBySourceReport(); loadMonthlyPerformance(); }

const navigationLinks = [
     { id: 'dashboard', text: 'דף הבית', icon: '<svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/></svg>' },
     { id: 'leads', text: 'לידים', icon: '<svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"/></svg>' },
     { id: 'customers', text: 'לקוחות', icon: '<svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/></svg>' },
     { id: 'orders', text: 'הזמנות', icon: '<svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M16.53 9.78a.75.75 0 00-1.06-1.06L11 13.19l-1.97-1.97a.75.75 0 00-1.06 1.06l2.5 2.5a.75.75 0 001.06 0l4.0-4.0zM4.5 5.25A2.25 2.25 0 016.75 3h10.5A2.25 2.25 0 0119.5 5.25v13.5A2.25 2.25 0 0117.25 21H6.75A2.25 2.25 0 014.5 18.75V5.25z"/></svg>' },
     { id: 'products', text: 'מוצרים', icon: '<svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clip-rule="evenodd"/></svg>' },
     { id: 'packages', text: 'חבילות', icon: '<svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M1.5 6.375c0-1.036.84-1.875 1.875-1.875h17.25c1.035 0 1.875.84 1.875 1.875v3.026a.75.75 0 01-.375.65L18 12.177V17.25a3.75 3.75 0 01-3.75 3.75h-7.5A3.75 3.75 0 013 17.25V12.177a.75.75 0 01-.375-.65V6.375zm19.5 0h-17.25V10.5h17.25V6.375zm-4.5 8.25a.75.75 0 00-.75-.75h-4.5a.75.75 0 00-.75.75v2.25a.75.75 0 00.75.75h4.5a.75.75 0 00.75-.75v-2.25z" clip-rule="evenodd" /></svg>' }, // Add Package icon
     { id: 'tasks', text: 'משימות', icon: '<svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M7.502 6h7.128A3.375 3.375 0 0118 9.375v9.375a3 3 0 003-3V6.108c0-1.505-1.125-2.811-2.664-2.94a48.972 48.972 0 00-.673-.05A3 3 0 0015 1.5h-1.5a3 3 0 00-2.663 1.618c-.225.015-.45.032-.673.05C8.662 3.295 7.554 4.542 7.502 6zM13.5 3A1.5 1.5 0 0012 4.5h4.5A1.5 1.5 0 0015 3h-1.5z" clip-rule="evenodd" /><path fill-rule="evenodd" d="M3 9.375C3 8.339 3.84 7.5 4.875 7.5h9.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-9.75A1.875 1.875 0 013 20.625V9.375zM6 12a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75H6.75a.75.75 0 01-.75-.75V12zm2.25 0a.75.75 0 01.75-.75h3.75a.75.75 0 010 1.5H9a.75.75 0 01-.75-.75zM6 15a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75H6.75a.75.75 0 01-.75-.75V15zm2.25 0a.75.75 0 01.75-.75h3.75a.75.75 0 010 1.5H9a.75.75 0 01-.75-.75z" clip-rule="evenodd" /></svg>' },
     { id: 'reports', text: 'דוחות', icon: '<svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0014.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/></svg>' },
     { id: 'settings', text: 'הגדרות', icon: '<svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"/></svg>' }
 ];

 function setupNavigation() {
     const navContainer = document.getElementById('main-nav');
     navContainer.innerHTML = navigationLinks.map(link => `<a href="#" data-page="${link.id}" class="nav-item ${link.id === 'dashboard' ? 'active' : ''}">${link.icon}${link.text}</a>`).join('');
     navContainer.addEventListener('click', function(e) { const link = e.target.closest('a.nav-item'); if (link && !e.defaultPrevented) { e.preventDefault(); const pageId = link.getAttribute('data-page'); showPage(pageId); } });
 }

 function showPage(pageId) {
     console.log("Showing page:", pageId);
     document.querySelectorAll('.page-content').forEach(page => page.classList.remove('active'));
     const selectedPage = document.getElementById(pageId);
     if (selectedPage) {
         selectedPage.classList.add('active');
         document.querySelectorAll('#main-nav .nav-item').forEach(item => { item.classList.toggle('active', item.getAttribute('data-page') === pageId); });
         try {
             if (pageId === 'dashboard') loadInitialData();
             else if (pageId === 'leads') loadLeads();
             else if (pageId === 'customers') loadCustomers();
             else if (pageId === 'orders') loadOrders();
             else if (pageId === 'products') loadProducts();
             else if (pageId === 'packages') loadPackages();
             else if (pageId === 'tasks') loadTasks();
             else if (pageId === 'reports') loadReports();
             else if (pageId === 'settings') { loadSettings(); testDatabaseConnection(); }
         } catch (err) { console.error(`Error loading data for page ${pageId}:`, err); }
     } else { console.error("Page not found:", pageId); showPage('dashboard'); }
 }

 function renderStatCard(id, title, value, iconSvg, linkPage, bgColor, textColor, linkText = "לפרטים") { return ` <div id="${id}-card" class="stat-card" style="background-color: ${bgColor};"> <div class="stat-card-header"> <h3 class="stat-card-title" style="color: ${textColor};">${title}</h3> ${iconSvg} </div> <p id="${id}-count" class="stat-card-value" style="color: ${textColor};">${value}</p> <div class="stat-card-footer"> <span>צפה בכל ה${title.split(' ')[0]}</span> <a href="#" onclick="showPage('${linkPage}')" class="stat-card-link" style="color: ${textColor};"> <span class="stat-card-link-text">${linkText}</span> <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="12" x2="20" y2="12"></line><polyline points="14 6 20 12 14 18"></polyline></svg> </a> </div> </div>`; }
async function loadDashboardData() {
     const statsContainer = document.getElementById('dashboard-stats-container'); statsContainer.innerHTML = '<div class="loading" style="grid-column: 1 / -1;">' + createSpinnerHTML() + '</div>';
     try {
         const { data: counts, error: countsError } = await supabaseClient.from("dashboard_stats").select("*").single(); if (countsError && isConnected) throw countsError;
    const displayCounts = counts;
         const statsHTML = [ renderStatCard('leads', 'לידים חדשים', displayCounts.new_leads_count || '0', '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>', 'leads', '#eff6ff', '#1e40af'), renderStatCard('customers', 'לקוחות פעילים', displayCounts.active_customers_count || '0', '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>', 'customers', '#f0fdf4', '#166534'), renderStatCard('orders', 'הזמנות החודש', displayCounts.orders_this_month_count || '0', '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d946ef" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>', 'reports', '#fdf4ff', '#86198f', 'לדוחות') ].join('');
         statsContainer.innerHTML = statsHTML + ` <div id="conversion-rate-widget" class="stat-card" style="background-color: #eef2ff;"> <div class="stat-card-header"> <h3 class="stat-card-title" style="color: #4338ca;">שיעור המרה</h3> <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"></path><path d="M12 5v14"></path><path d="M5 5l14 14"></path></svg> </div> <div id="conversion-rate-widget-content"> <div class="loading"><div class="spinner"></div></div> </div> </div>`;
         loadAndRenderTable(dashboardLeadsConfig); loadConversionRateWidget();
     } catch (error) { console.error("Error loading dashboard stats:", error); statsContainer.innerHTML = `<p style="color: red; grid-column: 1 / -1;">שגיאה בטעינת נתוני לוח בקרה</p>`; document.getElementById('leads-table-loading').style.display = 'none'; document.getElementById('leads-table').style.display = 'table'; document.getElementById('leads-table-body').innerHTML = `<tr><td colspan="6" style="text-align: center; color: red;">שגיאה</td></tr>`; }
 }
 async function loadConversionRateWidget() { const widgetContent = document.getElementById("conversion-rate-widget-content"); if (!widgetContent) return; try { widgetContent.innerHTML = `<div style="display: flex; justify-content: center; align-items: center; height: 100px;"><div class="spinner"></div></div>`; const { data, error } = await supabaseClient.from("lead_conversion_analytics").select("*").order("year_num", { ascending: false }).order("month_num", { ascending: false }).limit(1); if (error && isConnected) throw error; const latestData = data && data.length > 0 ? data[0] : null; if (latestData) { const conversionRate = latestData.conversion_rate || 0; const totalLeads = latestData.total_leads || 0; const convertedLeads = latestData.converted_leads || 0; const progressColor = conversionRate > 20 ? "#22c55e" : conversionRate > 10 ? "#f59e0b" : "#ef4444"; widgetContent.innerHTML = ` <div style="display: flex; height: 100%; align-items: center; margin-top: -0.75rem;"> <div style="position: relative; width: 70px; height: 70px; margin-left: 1rem;"> <svg width="70" height="70" viewBox="0 0 70 70"> <circle cx="35" cy="35" r="30" fill="none" stroke="#e5e7eb" stroke-width="8" /> <circle cx="35" cy="35" r="30" fill="none" stroke="${progressColor}" stroke-width="8" stroke-dasharray="${188.4 * (conversionRate / 100)}, 188.4" transform="rotate(-90, 35, 35)" /> </svg> <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center;"> <div style="font-size: 1.1rem; font-weight: 700; color: #111827;">${Math.round(conversionRate)}%</div> </div> </div> <div style="flex-grow: 1;"> <div style="display: flex; align-items: baseline; margin-bottom: 0.25rem;"><span style="font-size: 0.8rem; color: #6b7280; width: 3rem;">לידים:</span><span style="font-size: 0.9rem; font-weight: 600; color: #6b7280;">${totalLeads}</span></div> <div style="display: flex; align-items: baseline;"><span style="font-size: 0.8rem; color: #6b7280; width: 3rem;">הומרו:</span><span style="font-size: 0.9rem; font-weight: 600; color: #1e40af;">${convertedLeads}</span></div> <div style="display: flex; align-items: center; margin-top: 0.5rem;"><span style="font-size: 0.7rem; color: #6b7280;">חודש ${latestData.month_name?.split(" ")[0] || "אחרון"}</span></div> </div> </div>`; } else { widgetContent.innerHTML = '<p style="text-align: center; color: #6b7280; padding: 1rem 0;">אין נתוני המרה</p>'; } } catch (error) { console.error("Error loading conversion rate widget:", error); widgetContent.innerHTML = '<p style="text-align: center; color: #ef4444; padding: 1rem 0;">שגיאה</p>'; } }
 async function loadConversionTrendWidget() { const container = document.getElementById("conversion-trend-container"); const widget = document.getElementById("conversion-trend-widget"); if (!widget || !container) return; try { widget.innerHTML = `<div style="display: flex; justify-content: center; align-items: center; height: 100%;"><div class="spinner"></div></div>`; const { data, error } = await supabaseClient.from("lead_conversion_analytics").select("*").order("year_num", { ascending: true }).order("month_num", { ascending: true }); if (error && isConnected) throw error; const displayData = isConnected ? data : [{ month_name: "Jan 2024", month_num: 1, year_num: 2024, total_leads: 25, converted_leads: 2, conversion_rate: 8.0, lead_growth_rate: 0 }, { month_name: "Feb 2024", month_num: 2, year_num: 2024, total_leads: 35, converted_leads: 4, conversion_rate: 11.4, lead_growth_rate: 40.0 }, { month_name: "Mar 2024", month_num: 3, year_num: 2024, total_leads: 45, converted_leads: 8, conversion_rate: 17.8, lead_growth_rate: 28.6 }, { month_name: "Apr 2024", month_num: 4, year_num: 2024, total_leads: 40, converted_leads: 6, conversion_rate: 15.0, lead_growth_rate: -11.1 }, { month_name: "May 2024", month_num: 5, year_num: 2024, total_leads: 50, converted_leads: 11, conversion_rate: 22.0, lead_growth_rate: 25.0 }, { month_name: "Jun 2024", month_num: 6, year_num: 2024, total_leads: 65, converted_leads: 18, conversion_rate: 27.7, lead_growth_rate: 30.0 },]; if (displayData && displayData.length > 0) { widget.innerHTML = `<canvas id="conversion-trend-chart"></canvas>`; const avgRate = displayData.reduce((sum, month) => sum + (month.conversion_rate || 0), 0) / displayData.length; document.getElementById("avg-conversion-rate").textContent = `${avgRate.toFixed(1)}%`; const firstMonthRate = displayData[0]?.conversion_rate || 0; const lastMonthRate = displayData[displayData.length - 1]?.conversion_rate || 0; const trend = lastMonthRate - firstMonthRate; const trendElement = document.getElementById("trend-indicator"); trendElement.textContent = `${trend >= 0 ? "+" : ""}${trend.toFixed(1)}%`; trendElement.style.color = trend >= 0 ? "#10b981" : "#ef4444"; const months = displayData.map(item => item.month_name?.split(" ")[0] || ""); const conversionRates = displayData.map(item => item.conversion_rate || 0); const totalLeads = displayData.map(item => item.total_leads || 0); const convertedLeads = displayData.map(item => item.converted_leads || 0); const growthRates = displayData.map(item => item.lead_growth_rate || 0); const ctx = document.getElementById("conversion-trend-chart").getContext("2d"); const chart = new Chart(ctx, { type: "bar", data: { labels: months, datasets: [{ type: "line", label: "אחוז המרה", data: conversionRates, borderColor: "#3b82f6", borderWidth: 3, pointBackgroundColor: "#ffffff", pointBorderColor: "#3b82f6", pointBorderWidth: 2, pointRadius: 5, pointHoverRadius: 7, tension: 0.3, yAxisID: "y", order: 0 }, { type: "bar", label: "לידים שהומרו", data: convertedLeads, backgroundColor: "rgb(16 185 129)", borderColor: "rgba(148, 163, 184, 0.7)", borderWidth: 1, borderRadius: 6, yAxisID: "y1", order: 1 }, { type: "bar", label: 'סה"כ לידים', data: totalLeads, backgroundColor: "rgba(203, 213, 225, 0.5)", borderColor: "rgba(148, 163, 184, 0.7)", borderWidth: 1, borderRadius: 6, yAxisID: "y1", order: 2 },] }, options: { responsive: true, maintainAspectRatio: false, interaction: { mode: "index", intersect: false }, plugins: { legend: { display: true, position: "top", align: "end", rtl: true, labels: { usePointStyle: true, padding: 15, font: { family: "'Heebo', sans-serif" } } }, tooltip: { rtl: true, callbacks: { label: function (context) { let label = context.dataset.label || ""; let value = context.parsed.y; return label === "אחוז המרה" ? `${label}: ${value}%` : `${label}: ${value}`; }, afterBody: function (context) { const index = context[0].dataIndex; const growthRate = growthRates[index]; if (typeof growthRate === "number") { const sign = growthRate >= 0 ? "+" : ""; return [`שינוי בכמות הלידים: ${sign}${growthRate}%`]; } return []; } } } }, scales: { x: { grid: { display: false }, ticks: { font: { family: "'Heebo', sans-serif" } } }, y: { type: "linear", display: true, position: "right", title: { display: true, text: "אחוז המרה (%)", font: { family: "'Heebo', sans-serif" } }, grid: { drawOnChartArea: false }, ticks: { callback: function (value) { return value + "%"; }, font: { family: "'Heebo', sans-serif" } } }, y1: { type: "linear", display: true, position: "left", title: { display: true, text: "מספר לידים", font: { family: "'Heebo', sans-serif" } }, grid: { color: "rgba(0, 0, 0, 0.05)" }, ticks: { font: { family: "'Heebo', sans-serif" } } } }, animation: { duration: 1000, easing: "easeOutQuart" } } }); } else { widget.innerHTML = '<p style="text-align: center; color: #6b7280; padding: 2rem 0;">אין נתונים להצגת מגמה</p>'; } } catch (error) { console.error("Error loading conversion trend widget:", error); widget.innerHTML = '<p style="text-align: center; color: #ef4444; padding: 2rem 0;">שגיאה בטעינת נתוני מגמה</p>'; } }
 async function loadActivities() { const activityLoading = document.getElementById("activity-loading"); const activityFeed = document.getElementById("activity-feed"); if (!activityLoading || !activityFeed) return; activityLoading.style.display = "flex"; activityFeed.style.display = "none"; try { const { data: activities, error } = await supabaseClient.from("activity_view").select("*").order("created_at", { ascending: false }).limit(5); if (error && isConnected) throw error; activityLoading.style.display = "none"; activityFeed.style.display = "block"; if (activities && activities.length > 0) { activityFeed.innerHTML = `<div style="display: flex; flex-direction: column; gap: 1rem;">${activities.map(activity => { let iconBg = "#e5e7eb"; let iconColor = "#4b5563"; const type = activity.display_type || activity.type; if (type === "ליד") { iconBg = "#dbeafe"; iconColor = "#3b82f6"; } else if (type === "לקוח") { iconBg = "#d1fae5"; iconColor = "#10b981"; } else if (type === "הזמנה") { iconBg = "#fce7f3"; iconColor = "#ec4899"; } else if (type === "שירות") { iconBg = "#fee2e2"; iconColor = "#ef4444"; } else if (type === "מוצר") { iconBg = "#ede9fe"; iconColor = "#8b5cf6"; } return ` <div style="display: flex; gap: 0.75rem; align-items: flex-start; background-color: #f9fafb; padding: 0.75rem; border-radius: 0.5rem;"> <div style="width: 2.5rem; height: 2.5rem; border-radius: 9999px; background-color: ${iconBg}; display: flex; align-items: center; justify-content: center; color: ${iconColor}; flex-shrink: 0;"> ${getActivityIcon(type)} </div> <div style="flex-grow: 1;"> <div style="display: flex; justify-content: space-between; align-items: flex-start;"> <div style="font-weight: 500; color: #111827; margin-bottom: 0.25rem;">${activity.description}</div> <div style="font-size: 0.75rem; color: #6b7280; white-space: nowrap; margin-left: 1rem;">${getTimeAgo(activity.created_at)}</div> </div> <div style="display: flex; margin-top: 0.5rem;"> <span style="display: inline-flex; align-items: center; padding: 0.25rem 0.5rem; background-color: #f3f4f6; border-radius: 0.375rem; font-size: 0.75rem; color: #374151;">${formatStatus(activity.type)}</span> </div> </div> </div>`; }).join("")}</div>`; } else { activityFeed.innerHTML = '<p style="text-align: center; color: #6b7280; padding: 2rem 0;">אין פעילות אחרונה</p>'; } } catch (error) { console.error("Error loading activities:", error); activityLoading.style.display = "none"; activityFeed.style.display = "block"; activityFeed.innerHTML = `<p style="text-align: center; color: #ef4444; padding: 2rem 0;">לא ניתן לטעון פעילות אחרונה</p>`; } }
 async function loadDashboardTasks() { const taskListContainer = document.querySelector(".task-list"); if (!taskListContainer) return; try { taskListContainer.innerHTML = `<div style="display: flex; justify-content: center; padding: 2rem 0;"><div class="spinner"></div></div>`; const { data: tasks, error } = await supabaseClient.from("dashboard_tasks").select("*").limit(3); if (error && isConnected) throw error; const taskCountBadge = document.getElementById("tasks-count-badge"); if (tasks && tasks.length > 0) { taskListContainer.innerHTML = tasks.map(task => ` <div class="task-item" style="padding: 0.75rem; background-color: #f9fafb; border-radius: 0.375rem; border-right: 3px solid ${task.color || "#3b82f6"};"> <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;"> <span style="font-weight: 500;">${task.title || "משימה"}</span> <span style="font-size: 0.75rem; color: #6b7280;">${formatTaskTime(task.due_time)}</span> </div> <p style="margin: 0; font-size: 0.875rem; color: #4b5563;">${task.contact_name ? task.contact_name + (task.contact_info ? " - " + task.contact_info : "") : ""}</p> </div> `).join(""); if (taskCountBadge) taskCountBadge.textContent = `${tasks.length} משימות`; } else { taskListContainer.innerHTML = `<div style="text-align: center; padding: 1.5rem 0; color: #6b7280;"><p>אין משימות להיום</p></div>`; if (taskCountBadge) taskCountBadge.textContent = `0 משימות`; } } catch (error) { console.error("Error loading dashboard tasks:", error); taskListContainer.innerHTML = `<div style="text-align: center; padding: 1.5rem 0; color: #ef4444;"><p>שגיאה בטעינת משימות</p></div>`; } }
 async function loadCustomersChart() {
     const customersChart = document.getElementById("new-customers-chart"); 
     if (!customersChart) return; 
     try { 
         customersChart.innerHTML = `<div style="display: flex; justify-content: center; align-items: center; height: 100%;"><div class="spinner"></div></div>`; 
         // שינוי: שימוש ב-year ו-month במקום year_num ו-month_num
         const { data: customersByMonth, error } = await supabaseClient
           .from("new_customers_by_month")
           .select("year, month_num, month_name, customer_count") // בקש year, month_num, month_name
           .order("year", { ascending: true }) // מיין לפי year
           .order("month_num", { ascending: true }); // ואז לפי month_num
         
         if (error && isConnected) throw error; 

         if (customersByMonth && customersByMonth.length > 0) { 
             // ... (שאר הקוד לעיבוד הנתונים נשאר זהה, 
             //      פשוט ישתמש ב-month_name שהגיע מהשאילתה) ...
             const totalCustomers = customersByMonth.reduce((sum, item) => sum + (item.customer_count || 0), 0);
             const lastMonth = customersByMonth[customersByMonth.length - 1];
             const previousMonth = customersByMonth.length > 1 ? customersByMonth[customersByMonth.length - 2] : null; 
             let growthRate = 0; 
             if (previousMonth && previousMonth.customer_count > 0) { 
                 growthRate = ((lastMonth.customer_count - previousMonth.customer_count) / previousMonth.customer_count) * 100; 
             } 
             let chartHtml = `<div style="text-align: center; margin-bottom: 1rem;"><div style="display: flex; justify-content: center; align-items: center;"><div style="font-size: 1.5rem; font-weight: 700; color: #1e40af;">${totalCustomers}</div><div style="margin-right: 0.5rem; display: flex; align-items: center; color: ${growthRate >= 0 ? "#16a34a" : "#dc2626"}; font-size: 0.875rem;">${growthRate >= 0 ? '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-left: 2px;"><polyline points="18 15 12 9 6 15"></polyline></svg>' : '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-left: 2px;"><polyline points="6 9 12 15 18 9"></polyline></svg>'} ${Math.abs(Math.round(growthRate))}%</div></div></div><div style="display: flex; justify-content: space-between; align-items: flex-end; height: 140px;">`; 
             const maxCount = Math.max(...customersByMonth.map(month => month.customer_count || 0)); 
             customersByMonth.forEach(month => { 
                 const heightPercent = maxCount > 0 ? Math.max(10, ((month.customer_count || 0) / maxCount) * 100) : 10; 
                 chartHtml += `<div style="flex: 1; display: flex; flex-direction: column; align-items: center;"><div style="position: relative; text-align: center; font-size: 0.75rem; color: #334155; font-weight: 600; margin-bottom: 0.25rem;">${month.customer_count || 0}</div><div style="width: 25px; height: ${heightPercent}%; background-color: #3b82f6; border-radius: 4px 4px 0 0;"></div><div style="margin-top: 0.5rem; font-size: 0.75rem; color: #6b7280;">${month.month_name?.split(" ")[0] || ""}</div></div>`; 
             }); 
             chartHtml += `</div>`; 
             customersChart.innerHTML = chartHtml; 
         } else { 
             customersChart.innerHTML = '<p style="text-align: center; color: #6b7280; padding: 2rem 0;">אין נתוני לקוחות</p>'; 
         } 
     } catch (error) { 
         console.error("Error loading customers chart:", error); 
         customersChart.innerHTML = '<p style="text-align: center; color: #ef4444; padding: 2rem 0;">שגיאה בטעינת גרף לקוחות</p>'; 
     } 
 }
 async function loadLeadsBySource() { const chartContainer = document.getElementById("leads-by-source-chart"); if (!chartContainer) return; try { chartContainer.innerHTML = `<div class="chart-container" style="position: relative; flex-grow: 1; height: 100%;"><canvas id="leads-source-pie-chart"></canvas></div><div class="chart-info" style="display: flex; flex-direction: column; justify-content: center; min-width: 150px;"><div style="text-align: center;"><div style="font-size: 0.875rem; color: #6b7280;">סה"כ לידים</div><div id="total-leads-count" style="font-size: 2rem; font-weight: 700; color: #3b82f6;">-</div></div><div id="chart-legend" style="margin-top: 1.5rem;"></div></div><div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; justify-content: center; align-items: center; background-color: rgba(255, 255, 255, 0.8);"><div class="spinner"></div></div>`; const { data: sourceData, error } = await supabaseClient.from("leads_by_source").select("*").order("count", { ascending: false }); if (error && isConnected) throw error; if (sourceData && sourceData.length > 0) { const spinner = chartContainer.querySelector(".spinner"); if (spinner && spinner.parentElement) spinner.parentElement.remove(); const totalLeads = sourceData.reduce((sum, source) => sum + source.count, 0); document.getElementById("total-leads-count").textContent = totalLeads; const labels = sourceData.map(source => source.source); const data = sourceData.map(source => source.count); const backgroundColor = sourceData.map(source => source.color); const ctx = document.getElementById("leads-source-pie-chart").getContext("2d"); const chart = new Chart(ctx, { type: "doughnut", data: { labels: labels, datasets: [{ data: data, backgroundColor: backgroundColor, borderColor: "white", borderWidth: 2, hoverOffset: 15 }] }, options: { responsive: true, maintainAspectRatio: false, cutout: "60%", plugins: { legend: { display: false }, tooltip: { rtl: true, callbacks: { label: function (context) { const label = context.label || ""; const value = context.formattedValue; const percentage = sourceData[context.dataIndex]?.percentage?.toFixed(1) || 0; return `${label}: ${value} (${percentage}%)`; } } } }, animation: { animateScale: true, animateRotate: true } } }); const legendContainer = document.getElementById("chart-legend"); legendContainer.innerHTML = ""; sourceData.forEach((source, index) => { const legendItem = document.createElement("div"); legendItem.style.cssText = "display: flex; align-items: center; margin-bottom: 0.5rem; cursor: pointer;"; const colorBox = document.createElement("div"); colorBox.style.cssText = `width: 12px; height: 12px; background-color: ${source.color}; border-radius: 2px; margin-left: 8px;`; const textSpan = document.createElement("span"); textSpan.style.cssText = "font-size: 0.75rem; color: #4b5563;"; textSpan.innerHTML = `${source.source} <strong>${source.percentage?.toFixed(1) || 0}%</strong>`; legendItem.appendChild(colorBox); legendItem.appendChild(textSpan); legendContainer.appendChild(legendItem); legendItem.addEventListener("mouseover", () => { chart.setActiveElements([{ datasetIndex: 0, index: index }]); chart.update(); }); legendItem.addEventListener("mouseout", () => { chart.setActiveElements([]); chart.update(); }); }); } else { const message = `<div style="height: 100%; display: flex; justify-content: center; align-items: center;"><p style="color: #6b7280; text-align: center;">לא קיימים נתונים מספיקים להצגת הגרף</p></div>`; chartContainer.innerHTML = message; } } catch (error) { console.error("Error loading leads by source chart:", error); const errorMessage = `<div style="height: 100%; display: flex; justify-content: center; align-items: center;"><p style="color: #ef4444; text-align: center;">שגיאה בטעינת נתוני מקורות לידים</p></div>`; chartContainer.innerHTML = errorMessage; } }
 async function loadLeadsBySourceReport() { const reportContainer = document.getElementById("leads-by-source"); const loading = document.getElementById("leads-by-source-loading"); if (!reportContainer || !loading) return; loading.style.display = 'flex'; reportContainer.style.display = 'none'; try { const { data: sourceData, error } = await supabaseClient.from("leads_by_source").select("*").order("count", { ascending: false }); if (error && isConnected) throw error; loading.style.display = 'none'; reportContainer.style.display = 'block'; if (sourceData && sourceData.length > 0) { const maxCount = Math.max(...sourceData.map(s => s.count)); const barContainer = reportContainer.querySelector('.report-chart-bars'); const labelContainer = reportContainer.querySelector('.report-chart-labels'); barContainer.innerHTML = sourceData.map(source => { const heightPercent = maxCount > 0 ? Math.max(5, (source.count / maxCount) * 100) : 5; return `<div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: flex-end;"> <span style="font-size: 0.8rem; color: #374151; margin-bottom: 2px;">${source.count}</span> <div style="width: 35px; height: ${heightPercent}%; background-color: ${source.color || "#9ca3af"}; border-radius: 3px 3px 0 0;"></div> </div>`; }).join(""); labelContainer.innerHTML = sourceData.map(source => `<div style="flex: 1; text-align: center; font-size: 0.8rem; color: #6b7280;">${source.source}</div>`).join(""); } else { reportContainer.innerHTML = '<p style="text-align: center; color: #6b7280; padding: 2rem 0;">אין נתונים</p>'; } } catch (error) { console.error("Error loading leads by source report:", error); loading.style.display = 'none'; reportContainer.style.display = 'block'; reportContainer.innerHTML = '<p style="text-align: center; color: red; padding: 2rem 0;">שגיאה בטעינת דוח</p>'; } }
 async function loadMonthlyPerformance() { const loading = document.getElementById("monthly-performance-loading"); const table = document.getElementById("monthly-performance"); const tableBody = document.getElementById("monthly-performance-body"); if (!loading || !table || !tableBody) return; loading.style.display = "flex"; table.style.display = "none"; try { const { data: monthlyData, error } = await supabaseClient.from("monthly_performance_view").select("*").order("year_num", { ascending: false }).order("month_num", { ascending: false }).limit(6); if (error && isConnected) throw error; loading.style.display = "none"; table.style.display = "table"; if (monthlyData && monthlyData.length > 0) { tableBody.innerHTML = monthlyData.map(month => ` <tr> <td>${month.month_name}</td> <td>${month.leads_count || 0}</td> <td>${month.customers_count || 0}</td> <td>${month.orders_count || 0}</td> <td>${formatCurrency(month.revenue || 0)}</td> </tr> `).join(""); } else { tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">אין נתונים זמינים</td></tr>'; } } catch (error) { console.error("Error loading monthly performance:", error); loading.style.display = "none"; table.style.display = "table"; tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: red;">שגיאה בטעינת דוח חודשי</td></tr>'; } }

function saveSettings() { const businessName = document.getElementById("business-name").value; const contactEmail = document.getElementById("contact-email").value; const contactPhone = document.getElementById("contact-phone").value; localStorage.setItem("crm-business-name", businessName); localStorage.setItem("crm-contact-email", contactEmail); localStorage.setItem("crm-contact-phone", contactPhone); showToast("הגדרות נשמרו בהצלחה!"); }
function loadSettings() { document.getElementById("business-name").value = localStorage.getItem("crm-business-name") || ''; document.getElementById("contact-email").value = localStorage.getItem("crm-contact-email") || ''; document.getElementById("contact-phone").value = localStorage.getItem("crm-contact-phone") || ''; }
async function testDatabaseConnection() { const statusDot = document.getElementById("db-connection-status"); const statusText = document.getElementById("db-connection-text"); if (!statusDot || !statusText) return; statusDot.style.backgroundColor = "#f59e0b"; statusText.textContent = "בודק חיבור..."; if (!isConnected && supabaseClient && typeof supabaseClient.from !== "function") { statusDot.style.backgroundColor = "#ef4444"; statusText.textContent = "לא מחובר (מוק)"; return; } try { const { error } = await supabaseClient.from("products").select("id", { count: "exact", head: true }).limit(1); if (error) throw error; statusDot.style.backgroundColor = "#22c55e"; statusText.textContent = "מחובר בהצלחה"; if (!isConnected) { isConnected = true; updateConnectionStatus(true); } } catch (error) { console.error("Database connection test failed:", error); statusDot.style.backgroundColor = "#ef4444"; statusText.textContent = "שגיאת התחברות"; if (isConnected) { isConnected = false; updateConnectionStatus(false); } } }

function openAddLeadModal() { openModal({ modalId: 'add-lead', title: 'הוספת ליד חדש', contentTemplateId: 'add-lead-form-template', sizeClass: 'modal-sm', footerActionsHTML: '<button type="button" class="button button-primary" onclick="addNewLead()">שמור</button>', onLoad: (modalBody) => { modalBody.querySelector('#new-lead-form')?.reset(); } }); }
function openAddCustomerModal() { openModal({ modalId: 'add-customer', title: 'הוספת לקוח חדש', contentTemplateId: 'add-customer-form-template', sizeClass: 'modal-sm', footerActionsHTML: '<button type="button" class="button button-primary" onclick="addNewCustomer()">שמור</button>', onLoad: (modalBody) => { modalBody.querySelector('#new-customer-form')?.reset(); } }); }

async function addNewLead() {
    const form = document.getElementById('new-lead-form'); if (!form) return;
    const first_name = form.querySelector("#lead-first-name")?.value || ""; const last_name = form.querySelector("#lead-last-name")?.value || ""; const phone = form.querySelector("#lead-phone").value; const email = form.querySelector("#lead-email").value; const source = form.querySelector("#lead-source").value; const status = form.querySelector("#lead-status").value; const notes = form.querySelector("#lead-notes").value;
    try {
        const { data, error } = await supabaseClient.from("leads").insert([{ first_name, last_name, phone_number: phone, email, lead_source: source, status, custom_fields: { notes } }]).select(); if (error) throw error;
        showToast("ליד חדש נוסף בהצלחה!", "success"); await recordActivity("lead", `ליד חדש נוסף - ${first_name} ${last_name}`); closeCurrentModal();
        if (document.getElementById('dashboard').classList.contains('active')) loadInitialData(); if (document.getElementById('leads').classList.contains('active')) loadLeads();
    } catch (error) { console.error("Error adding lead:", error); showToast("שגיאה בהוספת ליד חדש: " + error.message, "error"); }
}
async function addNewCustomer() {
    const form = document.getElementById('new-customer-form'); if (!form) return;
    const name = form.querySelector("#customer-name").value; const phone = form.querySelector("#customer-phone").value; const email = form.querySelector("#customer-email").value; const address = form.querySelector("#customer-address").value; const city = form.querySelector("#customer-city").value; const status = form.querySelector("#customer-status").value; const notes = form.querySelector("#customer-notes").value;
    if (!name || !phone) { showToast("שם וטלפון הם שדות חובה.", "warning"); return; } const nameParts = name.trim().split(" "); const firstName = nameParts[0]; const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";
    try {
        const { data, error } = await supabaseClient.from("customers").insert([{ first_name: firstName, last_name: lastName, phone_number: phone, email, address, city, status, notes: notes, created_at: new Date().toISOString() }]).select(); if (error) throw error;
        showToast("לקוח חדש נוסף בהצלחה!", "success"); await recordActivity("customer", `לקוח חדש נוסף - ${name}`); closeCurrentModal();
        if (document.getElementById('dashboard').classList.contains('active')) loadInitialData(); if (document.getElementById('customers').classList.contains('active')) loadCustomers();
    } catch (error) { console.error("Error adding customer:", error); showToast("שגיאה בהוספת לקוח חדש: " + error.message, "error"); }
}

async function showLeadDetails(leadId) {
  try {
         const { data: lead, error } = await supabaseClient.from("leads").select("*").eq("id", leadId).single(); if (error && isConnected) throw error;
         const displayLead = isConnected ? lead : getMockData("leads").find(l => l.id === leadId);
    if (displayLead) {
             const leadName = displayLead.name || `${displayLead.first_name || ""} ${displayLead.last_name || ""}`.trim();
             openModal({
                 modalId: 'lead-details', title: `פרטי ליד: ${leadName}`, contentTemplateId: 'lead-details-content-template', sizeClass: 'modal-md', relatedData: displayLead, entityId: leadId,
                 footerActionsHTML: `<button class="button button-primary" id="convert-lead-btn" onclick="convertLeadToCustomer()" style="margin-left: 0.5rem;" ${displayLead.status === 'converted' ? 'disabled title="ליד זה כבר הומר ללקוח"' : ''}>המר ללקוח</button> <button class="button" onclick="saveLead()" style="background-color: #10b981; color: white;">שמור שינויים</button>`,
                 onLoad: (modalBody, data) => { modalBody.querySelector("#detail-lead-first-name").value = data.first_name || ""; modalBody.querySelector("#detail-lead-last-name").value = data.last_name || ""; modalBody.querySelector("#detail-lead-phone").value = data.phone_number || data.phone || ""; modalBody.querySelector("#detail-lead-email").value = data.email || ""; modalBody.querySelector("#detail-lead-notes").value = data.custom_fields?.notes || ""; modalBody.querySelector("#detail-lead-source").value = data.lead_source || data.source || "other"; modalBody.querySelector("#detail-lead-status").value = data.status || "new"; loadLeadActivities(leadId, modalBody.querySelector('#lead-activity-list')); },
                 onCloseCallback: () => { currentModal.relatedData = null; currentModal.originalData = null; currentModal.entityId = null; }
             });
         } else { showToast("ליד לא נמצא", "error"); }
     } catch (error) { console.error("Error loading lead details:", error); showToast("שגיאה בטעינת פרטי הליד", "error"); }
}
async function showCustomerDetails(customerId) {
   try {
          const { data: customer, error } = await supabaseClient.from("customers").select("*").eq("id", customerId).single(); if (error && isConnected) throw error;
          const displayCustomer = isConnected ? customer : getMockData("customers").find(c => c.id === customerId);
    if (displayCustomer) {
              const customerName = displayCustomer.name || `${displayCustomer.first_name || ""} ${displayCustomer.last_name || ""}`.trim();
              openModal({
                  modalId: 'customer-details', title: `פרטי לקוח: ${customerName}`, contentTemplateId: 'customer-details-content-template', sizeClass: 'modal-md', relatedData: displayCustomer, entityId: customerId,
                  footerActionsHTML: `<button class="button" onclick="createOrderFromCustomerModal()" style="background-color: #8b5cf6; color: white; margin-left: 0.5rem;">צור הזמנה חדשה</button> <button class="button" onclick="saveCustomer()" style="background-color: #10b981; color: white;">שמור שינויים</button>`,
                  onLoad: (modalBody, data) => { modalBody.querySelector("#detail-customer-name").value = customerName; modalBody.querySelector("#detail-customer-phone").value = data.phone_number || data.phone || ""; modalBody.querySelector("#detail-customer-email").value = data.email || ""; modalBody.querySelector("#detail-customer-address").value = data.address || ""; modalBody.querySelector("#detail-customer-city").value = data.city || ""; modalBody.querySelector("#detail-customer-status").value = data.status || "active"; loadCustomerOrders(customerId, modalBody.querySelector('#customer-orders-list')); },
                  onCloseCallback: () => { currentModal.relatedData = null; currentModal.originalData = null; currentModal.entityId = null; }
              });
          } else { showToast("לקוח לא נמצא", "error"); }
      } catch (error) { console.error("Error loading customer details:", error); showToast("שגיאה בטעינת פרטי הלקוח", "error"); }
}
async function showProductDetails(productId) {
      const isAdding = productId === null; const modalId = isAdding ? 'add-product' : 'product-details'; const title = isAdding ? 'הוספת מוצר חדש' : 'פרטי מוצר'; const saveButtonText = isAdding ? 'שמור מוצר חדש' : 'שמור שינויים';
      let displayProduct = null; let errorOccurred = false;
      if (!isAdding) {
          try {
              const isConnectedNow = isConnected; if (!isConnectedNow || (typeof productId === 'string' && productId.startsWith('mock-'))) { displayProduct = getMockData("products").find(p => p.id === productId); } else { const { data: product, error } = await supabaseClient.from("products").select("*, inventory(quantity, min_threshold)").eq("id", productId).single(); if (error) throw error; displayProduct = product; } if (!displayProduct) throw new Error("Product not found");
          } catch (error) { console.error("Error loading product details:", error); showToast("שגיאה בטעינת פרטי המוצר: " + (error.message || "Unknown error"), "error"); errorOccurred = true; }
      }
      if (errorOccurred) return;
      openModal({
          modalId: modalId, title: title, contentTemplateId: 'product-details-content-template', sizeClass: 'modal-md', relatedData: displayProduct, entityId: productId,
          footerActionsHTML: `<button id="save-product-button" class="button" onclick="saveProduct()" style="background-color: #10b981; color: white;">${saveButtonText}</button>`,
          onLoad: (modalBody, data) => {
              const imagePreview = modalBody.querySelector("#product-image-preview"); if (imagePreview) imagePreview.style.display = 'none'; const categorySelect = modalBody.querySelector("#detail-product-category");
              if (isAdding) { modalBody.querySelector("#detail-product-inventory").value = "0"; modalBody.querySelector("#detail-product-status").value = "פעיל"; modalBody.querySelector("#detail-product-min-threshold").value = "5"; modalBody.querySelector("#detail-product-featured").checked = false; }
              else if (data) {
                  const inventoryData = data.inventory ? (Array.isArray(data.inventory) ? data.inventory[0] : data.inventory) : null; const quantity = inventoryData?.quantity ?? 0; const minThreshold = inventoryData?.min_threshold ?? 5;
                  modalBody.querySelector("#detail-product-name").value = data.name || ""; modalBody.querySelector("#detail-product-sku").value = data.sku || ""; modalBody.querySelector("#detail-product-price").value = data.price != null ? data.price : ""; modalBody.querySelector("#detail-product-cost").value = data.cost != null ? data.cost : ""; modalBody.querySelector("#detail-product-inventory").value = quantity; modalBody.querySelector("#detail-product-min-threshold").value = minThreshold; modalBody.querySelector("#detail-product-description").value = data.description || ""; modalBody.querySelector("#detail-product-manufacturer").value = data.manufacturer || ""; modalBody.querySelector("#detail-product-model").value = data.model_number || ""; modalBody.querySelector("#detail-product-barcode").value = data.barcode || ""; modalBody.querySelector("#detail-product-color").value = data.color || ""; modalBody.querySelector("#detail-product-warranty").value = data.warranty_months != null ? data.warranty_months : ""; modalBody.querySelector("#detail-product-weight").value = data.weight != null ? data.weight : ""; modalBody.querySelector("#detail-product-weight-unit").value = data.weight_unit || "kg"; modalBody.querySelector("#detail-product-image").value = data.image_url || ""; modalBody.querySelector("#detail-product-featured").checked = data.is_featured || false;
                  if (data.image_url && imagePreview) { const imageElement = modalBody.querySelector("#product-image-element"); if (imageElement) { imageElement.src = data.image_url; imageElement.onload = () => { imagePreview.style.display = "block"; }; imageElement.onerror = () => { imagePreview.style.display = "none"; }; } }
                  const dims = data.dimensions; modalBody.querySelector("#detail-product-length").value = dims?.length != null ? dims.length : ""; modalBody.querySelector("#detail-product-width").value = dims?.width != null ? dims.width : ""; modalBody.querySelector("#detail-product-height").value = dims?.height != null ? dims.height : ""; modalBody.querySelector("#detail-product-dimensions-unit").value = dims?.unit || "cm";
                  categorySelect.value = data.category || ""; if (categorySelect.value !== data.category && data.category) { let categoryExists = Array.from(categorySelect.options).some(opt => opt.value === data.category); if (!categoryExists) { const newOption = new Option(data.category, data.category, false, true); categorySelect.add(newOption); categorySelect.value = data.category; } } else if (!data.category) { categorySelect.value = ""; }
                  const derivedStatus = getDerivedProductStatus(data.active, quantity); modalBody.querySelector("#detail-product-status").value = derivedStatus.text;
              }
          },
          onCloseCallback: () => { currentModal.relatedData = null; currentModal.originalData = null; currentModal.entityId = null; }
      });
 }

async function loadLeadActivities(leadId, targetElement) { if (!targetElement) return; if (!isConnected) { targetElement.innerHTML = '<p style="text-align: center; padding: 1.5rem 0;">פעילות לא זמינה (מוק)</p>'; return; } try { targetElement.innerHTML = `<div class="loading">${createSpinnerHTML()}</div>`; const { data: activities, error } = await supabaseClient.from("activities").select("*").eq("related_entity_id", leadId).order("created_at", { ascending: false }).limit(10); if (error) throw error; if (activities && activities.length > 0) { targetElement.innerHTML = activities.map(activity => { let iconBg = "#e5e7eb"; let iconColor = "#4b5563"; const type = activity.type; if (type === "lead") { iconBg = "#dbeafe"; iconColor = "#3b82f6"; } else if (type === "customer") { iconBg = "#d1fae5"; iconColor = "#10b981"; } else if (type === "order") { iconBg = "#fce7f3"; iconColor = "#ec4899"; } else if (type === "service") { iconBg = "#fee2e2"; iconColor = "#ef4444"; } else if (type === "product") { iconBg = "#ede9fe"; iconColor = "#8b5cf6"; } return `<div style="display: flex; gap: 0.75rem; align-items: flex-start; background-color: #f9fafb; padding: 0.75rem; border-radius: 0.5rem;"><div style="width: 2.5rem; height: 2.5rem; border-radius: 9999px; background-color: ${iconBg}; display: flex; align-items: center; justify-content: center; color: ${iconColor}; flex-shrink: 0;">${getActivityIcon(type)}</div><div style="flex-grow: 1;"><div style="display: flex; justify-content: space-between; align-items: flex-start;"><div style="font-weight: 500; color: #111827; margin-bottom: 0.25rem;">${activity.description}</div><div style="font-size: 0.75rem; color: #6b7280; white-space: nowrap; margin-left: 1rem;">${getTimeAgo(activity.created_at)}</div></div><div style="display: flex; margin-top: 0.5rem;"><span style="display: inline-flex; align-items: center; padding: 0.25rem 0.5rem; background-color: #f3f4f6; border-radius: 0.375rem; font-size: 0.75rem; color: #374151;">${formatStatus(activity.type)}</span></div></div></div>`; }).join(""); } else { targetElement.innerHTML = '<p style="text-align: center; color: #6b7280; padding: 1.5rem 0;">לא נמצאו פעילויות</p>'; } } catch (error) { console.error("Error loading lead activities:", error); if (targetElement) targetElement.innerHTML = '<p style="text-align: center; color: #ef4444; padding: 1.5rem 0;">שגיאה בטעינת פעילויות</p>'; } }
async function loadCustomerOrders(customerId, targetElement) { if (!targetElement) return; if (!isConnected) { targetElement.innerHTML = '<p style="text-align: center; padding: 1rem 0;">הזמנות לא זמינות (מוק)</p>'; return; } try { targetElement.innerHTML = `<div class="loading">${createSpinnerHTML()}</div>`; const { data: orders, error } = await supabaseClient.from("orders").select("id, created_at, total, status, payment_status").eq("customer_id", customerId).order("created_at", { ascending: false }).limit(5); if (error) throw error; if (orders && orders.length > 0) { targetElement.innerHTML = orders.map(order => ` <div style="padding: 0.75rem; border-bottom: 1px solid #e5e7eb; cursor: pointer;" onclick="showOrderDetails('${order.id}')"> <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;"> <span style="font-weight: 500;">הזמנה #${order.id.toString().substring(0, 8)}...</span> <span style="font-size: 0.75rem; color: #6b7280;">${formatDateDisplay(order.created_at)}</span> </div> <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem;"> <span style="font-size: 0.875rem; color: #4b5563;">סה״כ: ${formatCurrency(order.total)}</span> <div> <span class="badge badge-${getOrderStatusColor(order.status)}" style="font-size: 0.7rem; padding: 0.125rem 0.4rem; border-radius: 9999px; margin-left: 0.25rem;">${formatStatus(order.status)}</span> <span class="badge badge-${getOrderPaymentStatusColor(order.payment_status)}" style="font-size: 0.7rem; padding: 0.125rem 0.4rem; border-radius: 9999px;">${formatStatus(order.payment_status)}</span> </div> </div> </div>`).join(''); } else { targetElement.innerHTML = '<p style="text-align: center; color: #6b7280; padding: 1.5rem 0;">לא נמצאו הזמנות</p>'; } } catch (error) { console.error("Error loading customer orders:", error); if (targetElement) targetElement.innerHTML = '<p style="text-align: center; color: #ef4444; padding: 1.5rem 0;">שגיאה בטעינת הזמנות</p>'; } }
function triggerAutoSave(saveFunction, ...args) { if (!isConnected) return; if (autoSaveTimeout) clearTimeout(autoSaveTimeout); autoSaveTimeout = setTimeout(() => { saveFunction(true, ...args); }, 1500); }
function updateLead(field, value) { if (currentModal.id === 'lead-details' && currentModal.relatedData) { currentModal.relatedData[field] = value; triggerAutoSave(saveLead); } }
function updateLeadNotes(value) { if (currentModal.id === 'lead-details' && currentModal.relatedData) { if (!currentModal.relatedData.custom_fields) currentModal.relatedData.custom_fields = {}; currentModal.relatedData.custom_fields.notes = value; triggerAutoSave(saveLead); } }
function updateProduct(field, value) { if ((currentModal.id === 'product-details' || currentModal.id === 'add-product') && currentModal.relatedData !== undefined) { if (!currentModal.relatedData) currentModal.relatedData = {}; if (field === 'status' || field === 'inventory' || field === 'min-threshold') return; if (field === 'price' || field === 'cost' || field === 'weight' || field === 'warranty_months') currentModal.relatedData[field] = Number(value); else if (field === 'is_featured') currentModal.relatedData[field] = Boolean(value); else currentModal.relatedData[field] = value; if (field === 'image_url') { const imgEl = currentModal.bodyElement?.querySelector("#product-image-element"); const prevDiv = currentModal.bodyElement?.querySelector("#product-image-preview"); if (prevDiv && imgEl) { if (value) { imgEl.src = value; imgEl.onload = () => prevDiv.style.display = "block"; imgEl.onerror = () => prevDiv.style.display = "none"; } else { prevDiv.style.display = "none"; } } } triggerAutoSave(saveProduct); } }
function updateProductInventory(value) { if (currentModal.id === 'product-details' || currentModal.id === 'add-product') triggerAutoSave(saveProduct); }
function updateInventoryField(field, value) { if (currentModal.id === 'product-details' || currentModal.id === 'add-product') triggerAutoSave(saveProduct); }
function updateProductDimension(property, value) { if ((currentModal.id === 'product-details' || currentModal.id === 'add-product') && currentModal.relatedData !== undefined) { if (!currentModal.relatedData) currentModal.relatedData = {}; if (!currentModal.relatedData.dimensions) currentModal.relatedData.dimensions = {}; if (property !== "unit") currentModal.relatedData.dimensions[property] = parseFloat(value) || null; else currentModal.relatedData.dimensions[property] = value; triggerAutoSave(saveProduct); } }

async function saveLead(isAutoSave = false) {
    if (currentModal.id !== 'lead-details' || !currentModal.entityId || !currentModal.relatedData || !isConnected) { if (!isAutoSave) showToast("לא ניתן לשמור (אין חיבור או נתונים)", "error"); return; }
    const dataToSave = { ...currentModal.relatedData };
    delete dataToSave.id; delete dataToSave.name; delete dataToSave.status_color; delete dataToSave.status_text; delete dataToSave.source; delete dataToSave.phone; delete dataToSave.created_at; delete dataToSave.updated_at;
    if (!dataToSave.custom_fields) dataToSave.custom_fields = {};
    try {
        const { error } = await supabaseClient.from("leads").update(dataToSave).eq("id", currentModal.entityId); if (error) throw error;
        if (isAutoSave) { showAutoSaveIndicator(); currentModal.originalData = JSON.parse(JSON.stringify(currentModal.relatedData)); }
        else {
            const leadDisplayName = (currentModal.originalData?.name || `${currentModal.originalData?.first_name || ""} ${currentModal.originalData?.last_name || ""}`).trim() || currentModal.entityId;
            let description = `ליד: ${leadDisplayName}`; const changes = [];
            if (currentModal.originalData?.status !== dataToSave.status) changes.push(`סטטוס שונה מ-'${formatStatus(currentModal.originalData?.status || "N/A")}' ל-'${formatStatus(dataToSave.status)}'`);
            if (currentModal.originalData?.lead_source !== dataToSave.lead_source) changes.push(`מקור שונה מ-'${formatSource(currentModal.originalData?.lead_source || "N/A")}' ל-'${formatSource(dataToSave.lead_source)}'`);
            const oldNotes = currentModal.originalData?.custom_fields?.notes || ""; const newNotes = dataToSave.custom_fields?.notes || ""; if (oldNotes !== newNotes) changes.push("הערות עודכנו");
            // Add more detailed checks here if needed...
            if (changes.length > 0) description += ` | ${changes.join(", ")}`; else description += " | פרטים עודכנו"; // Simplified fallback

            await recordActivity("lead", description, currentModal.entityId);
            showToast("פרטי הליד נשמרו", "success"); closeCurrentModal();
            if (document.getElementById('dashboard').classList.contains('active')) loadInitialData(); if (document.getElementById('leads').classList.contains('active')) loadLeads();
        }
    } catch (error) { if (!isAutoSave) { console.error("Error saving lead:", error); showToast("שגיאה בשמירת הליד: " + error.message, "error"); } else console.error("Autosave lead failed:", error); }
}
async function saveCustomer(isAutoSave = false) {
    if (currentModal.id !== 'customer-details' || !currentModal.entityId || !currentModal.relatedData || !isConnected) { if (!isAutoSave) showToast("לא ניתן לשמור (אין חיבור או נתונים)", "error"); return; }
    const modalBody = currentModal.bodyElement; if (!modalBody) return;
    const name = modalBody.querySelector("#detail-customer-name").value; const phone = modalBody.querySelector("#detail-customer-phone").value; const email = modalBody.querySelector("#detail-customer-email").value; const address = modalBody.querySelector("#detail-customer-address").value; const city = modalBody.querySelector("#detail-customer-city").value; const status = modalBody.querySelector("#detail-customer-status").value;
    const nameParts = (name || "").trim().split(" ");
    const dataToSave = { first_name: nameParts[0] || "", last_name: nameParts.length > 1 ? nameParts.slice(1).join(" ") : "", phone_number: phone, email, address, city, status };
    try {
        const { error } = await supabaseClient.from("customers").update(dataToSave).eq("id", currentModal.entityId); if (error) throw error;
        currentModal.relatedData = { ...currentModal.relatedData, ...dataToSave, name: `${dataToSave.first_name} ${dataToSave.last_name}`.trim() };
        if (isAutoSave) { showAutoSaveIndicator(); currentModal.originalData = JSON.parse(JSON.stringify(currentModal.relatedData)); }
        else {
            const currentName = `${dataToSave.first_name} ${dataToSave.last_name}`.trim(); const originalName = `${currentModal.originalData?.first_name || ""} ${currentModal.originalData?.last_name || ""}`.trim();
            let description = `לקוח: ${originalName || currentModal.entityId}`; const changes = [];
            if (originalName !== currentName) changes.push(`שם שונה מ-'${originalName}' ל-'${currentName}'`);
            if (currentModal.originalData?.phone_number !== dataToSave.phone_number) changes.push(`טלפון עודכן`);
            if (currentModal.originalData?.email !== dataToSave.email) changes.push(`אימייל עודכן`);
            if (currentModal.originalData?.address !== dataToSave.address) changes.push(`כתובת עודכנה`);
            if (currentModal.originalData?.city !== dataToSave.city) changes.push(`עיר עודכנה`);
            if (currentModal.originalData?.status !== dataToSave.status) changes.push(`סטטוס שונה מ-'${formatStatus(currentModal.originalData?.status)}' ל-'${formatStatus(dataToSave.status)}'`);
            // Add more detailed checks here if needed...
            if (changes.length > 0) description += ` | ${changes.join(", ")}`; else description += " | פרטים עודכנו";

            await recordActivity("customer", description, currentModal.entityId);
            showToast("פרטי הלקוח נשמרו", "success"); closeCurrentModal();
            if (document.getElementById('dashboard').classList.contains('active')) loadInitialData(); if (document.getElementById('customers').classList.contains('active')) loadCustomers();
        }
    } catch (error) { if (!isAutoSave) { console.error("Error saving customer:", error); showToast("שגיאה בשמירת הלקוח: " + error.message, "error"); } else console.error("Autosave customer failed:", error); }
}
async function saveProduct(isAutoSave = false) {
     const isAdding = currentModal.entityId === null; const modalId = isAdding ? 'add-product' : 'product-details';
     if (currentModal.id !== modalId || !isConnected) { if (!isAutoSave) showToast(`לא ניתן ${isAdding ? 'להוסיף' : 'לשמור'} (אין חיבור)`, "error"); return; }
     const modalBody = currentModal.bodyElement; if (!modalBody) return;
     const selectedStatusText = modalBody.querySelector("#detail-product-status").value; const newInventoryQuantity = parseInt(modalBody.querySelector("#detail-product-inventory").value) || 0; const newMinThreshold = parseInt(modalBody.querySelector("#detail-product-min-threshold").value) || 0; const productName = modalBody.querySelector("#detail-product-name").value; const productSku = modalBody.querySelector("#detail-product-sku").value;
     if (!productName || !productSku) { showToast('שם מוצר ומק"ט הם שדות חובה.', "warning"); return; }
     let targetActive = selectedStatusText !== "לא פעיל"; let targetInventory = newInventoryQuantity; let proceedSave = true;
     let originalInventory = isAdding ? 0 : (currentModal.originalData?.inventory ? (Array.isArray(currentModal.originalData.inventory) ? (currentModal.originalData.inventory[0]?.quantity ?? 0) : currentModal.originalData.inventory.quantity) : 0);
     let originalActive = isAdding ? true : currentModal.originalData?.active; let originalMinThreshold = isAdding ? 5 : (currentModal.originalData?.inventory ? (Array.isArray(currentModal.originalData.inventory) ? (currentModal.originalData.inventory[0]?.min_threshold ?? 5) : currentModal.originalData.inventory.min_threshold) : 5);
     if (!isAdding && selectedStatusText === "אזל מהמלאי") {
         targetActive = true; targetInventory = 0;
         if (originalInventory > 0 && newInventoryQuantity > 0) { if (!confirm(`שינוי הסטטוס ל'אזל מהמלאי' יאפס את המלאי מ-${newInventoryQuantity} ל-0. האם להמשיך?`)) { proceedSave = false; modalBody.querySelector("#detail-product-inventory").value = originalInventory; const originalStatus = getDerivedProductStatus(originalActive, originalInventory); modalBody.querySelector("#detail-product-status").value = originalStatus.text; } else { modalBody.querySelector("#detail-product-inventory").value = "0"; targetInventory = 0; } } else { targetInventory = 0; }
     }
  if (!proceedSave) return;
     try {
         const productData = { name: productName, sku: productSku, price: parseFloat(modalBody.querySelector("#detail-product-price").value) || null, cost: parseFloat(modalBody.querySelector("#detail-product-cost").value) || null, description: modalBody.querySelector("#detail-product-description").value || null, category: modalBody.querySelector("#detail-product-category").value || null, manufacturer: modalBody.querySelector("#detail-product-manufacturer").value || null, model_number: modalBody.querySelector("#detail-product-model").value || null, barcode: modalBody.querySelector("#detail-product-barcode").value || null, color: modalBody.querySelector("#detail-product-color").value || null, warranty_months: parseInt(modalBody.querySelector("#detail-product-warranty").value) || null, weight: parseFloat(modalBody.querySelector("#detail-product-weight").value) || null, weight_unit: modalBody.querySelector("#detail-product-weight-unit").value, dimensions: { length: parseFloat(modalBody.querySelector("#detail-product-length").value) || null, width: parseFloat(modalBody.querySelector("#detail-product-width").value) || null, height: parseFloat(modalBody.querySelector("#detail-product-height").value) || null, unit: modalBody.querySelector("#detail-product-dimensions-unit").value }, image_url: modalBody.querySelector("#detail-product-image").value || null, is_featured: modalBody.querySelector("#detail-product-featured").checked, active: targetActive };
         let savedProduct = null; let productError = null; let activityDescription = "פעילות מוצר לא תוארה";
         let finalInventoryToSave = targetInventory; let finalMinThresholdToSave = newMinThreshold;
         if (isAdding) { const { data, error } = await supabaseClient.from("products").insert(productData).select().single(); savedProduct = data; productError = error; if (!productError && savedProduct) { activityDescription = `מוצר חדש נוסף: ${savedProduct.name} (${savedProduct.sku})`; currentModal.entityId = savedProduct.id; } }
         else { const { data, error } = await supabaseClient.from("products").update(productData).eq("id", currentModal.entityId).select().single(); savedProduct = data; productError = error; if (!productError && savedProduct) { activityDescription = `מוצר: ${currentModal.originalData?.name || currentModal.entityId}`; const changes = []; const originalStatus = getDerivedProductStatus(originalActive, originalInventory); if (currentModal.originalData?.name !== productData.name) changes.push(`שם שונה מ-'${currentModal.originalData?.name}' ל-'${productData.name}'`); if (currentModal.originalData?.sku !== productData.sku) changes.push(`מק"ט שונה`); if (currentModal.originalData?.price != productData.price) changes.push(`מחיר שונה מ-${formatCurrency(currentModal.originalData?.price)} ל-${formatCurrency(productData.price)}`); if (currentModal.originalData?.category !== productData.category) changes.push(`קטגוריה עודכנה`); if (originalInventory !== finalInventoryToSave) changes.push(`מלאי שונה מ-${originalInventory} ל-${finalInventoryToSave}`); if (originalStatus.text !== selectedStatusText) changes.push(`סטטוס שונה מ-'${originalStatus.text}' ל-'${selectedStatusText}'`); /* Add more checks */ if (changes.length > 0) activityDescription += ` | ${changes.join(", ")}`; else activityDescription += " | פרטים עודכנו"; } }
         if (productError) throw productError; if (!savedProduct) throw new Error("Product data not returned after save.");
         const inventoryNeedsUpdate = isAdding || finalInventoryToSave !== originalInventory || finalMinThresholdToSave !== originalMinThreshold;
         if (inventoryNeedsUpdate && isConnected) { const { error: invError } = await supabaseClient.from("inventory").upsert({ product_id: savedProduct.id, quantity: finalInventoryToSave, min_threshold: finalMinThresholdToSave }, { onConflict: "product_id" }); if (invError) { console.warn("Error updating inventory:", invError); await recordActivity("product_error", `שגיאה בעדכון מלאי עבור ${savedProduct.name}: ${invError.message}`, savedProduct.id); showToast("שגיאה בעדכון המלאי, אך פרטי המוצר נשמרו.", "warning"); } else { if (!isAdding) { currentModal.originalData.inventory = [{ quantity: finalInventoryToSave, min_threshold: finalMinThresholdToSave }]; currentModal.originalData.active = targetActive; } } }
         currentModal.relatedData = { ...productData, id: savedProduct.id, inventory: [{ quantity: finalInventoryToSave, min_threshold: finalMinThresholdToSave }] };
         if (isAutoSave) { showAutoSaveIndicator(); currentModal.originalData = JSON.parse(JSON.stringify(currentModal.relatedData)); }
         else {
             await recordActivity("product", activityDescription, savedProduct.id);
             showToast("פרטי המוצר נשמרו", "success"); closeCurrentModal();
             if (document.getElementById('dashboard').classList.contains('active')) loadInitialData(); if (document.getElementById('products').classList.contains('active')) loadProducts();
         }
     } catch (error) { if (!isAutoSave) { console.error("Error saving product:", error); showToast(`שגיאה בשמירת המוצר: ${error.message}`, "error"); } else console.error("Autosave product failed:", error); }
 }

async function convertLeadToCustomer() {
    if (currentModal.id !== 'lead-details' || !currentModal.entityId || !currentModal.relatedData || !isConnected) { showToast("לא ניתן להמיר (אין חיבור או נתונים)", "error"); return; }
    if (currentModal.relatedData.status === "converted") { showToast("ליד זה כבר הומר ללקוח", "warning"); return; }
    try {
        const newCustomer = { first_name: currentModal.relatedData.first_name, last_name: currentModal.relatedData.last_name, phone_number: currentModal.relatedData.phone_number || currentModal.relatedData.phone, email: currentModal.relatedData.email, lead_id: currentModal.entityId, status: "active", created_at: new Date().toISOString() };
        const { data: customer, error: customerError } = await supabaseClient.from("customers").insert(newCustomer).select().single(); if (customerError) throw customerError;
        const { error: leadError } = await supabaseClient.from("leads").update({ status: "converted" }).eq("id", currentModal.entityId); if (leadError) console.error("Error updating lead status:", leadError);
        currentModal.relatedData.status = "converted"; const convertButton = document.getElementById('convert-lead-btn'); if (convertButton) { convertButton.disabled = true; convertButton.title = "ליד זה כבר הומר ללקוח"; }
        await recordActivity("lead", `ליד הומר ללקוח - ${currentModal.relatedData.first_name} ${currentModal.relatedData.last_name}`);
        showToast("ליד הומר ללקוח בהצלחה", "success"); closeCurrentModal();
        if (document.getElementById('dashboard').classList.contains('active')) loadInitialData(); if (document.getElementById('leads').classList.contains('active')) loadLeads(); if (document.getElementById('customers').classList.contains('active')) loadCustomers(); // Refresh customers too
        if (customer) showCustomerDetails(customer.id);
    } catch (error) { console.error("Error converting lead:", error); showToast("שגיאה בהמרת ליד ללקוח: " + error.message, "error"); }
}
function createOrderFromCustomerModal() { if (currentModal.id === 'customer-details' && currentModal.entityId && currentModal.relatedData) { const customerId = currentModal.entityId; const customerName = currentModal.relatedData.name || `${currentModal.relatedData.first_name || ""} ${currentModal.relatedData.last_name || ""}`.trim(); openOrderModal(customerId, customerName); } else { showToast("יש לפתוח פרטי לקוח תחילה", "warning"); } }
function openOrderModal(customerId, customerName) { currentOrderCustomerId = customerId; currentOrderCustomerName = customerName; openModal({ modalId: 'order-create', title: `יצירת הזמנה עבור: ${customerName}`, contentTemplateId: 'order-content-template', sizeClass: 'modal-xl', footerActionsHTML: '<button id="save-order-button" class="button button-primary" onclick="saveOrderToSupabase()">שמור הזמנה</button>', onLoad: (modalBody) => { resetOrderModal(); fetchOrderPrerequisites(); const discountInput = modalBody.querySelector("#order-discount"); if (discountInput) discountInput.addEventListener('input', calculateOrderTotals); }, onCloseCallback: resetOrderModal }); }
function resetOrderModal() { currentOrderItems = []; currentOrderCustomerId = null; currentOrderCustomerName = null; const orderModalBody = document.getElementById('generic-modal-body'); const orderTableBody = orderModalBody?.querySelector("#order-items-table-body"); if (orderTableBody) renderOrderItems(); calculateOrderTotals(); if (currentModal.id === 'order-create' || currentModal.id === 'order-details') { const body = currentModal.bodyElement; if (body) { body.querySelector("#order-date").value = new Date().toISOString().split("T")[0]; body.querySelector("#order-status").value = "new"; body.querySelector("#order-payment-method").value = ""; body.querySelector("#order-payment-status").value = "pending"; body.querySelector("#order-discount").value = ""; body.querySelector("#order-installation").checked = false; body.querySelector("#order-notes").value = ""; body.querySelector("#order-item-select").value = ""; body.querySelector("#order-item-quantity").value = "1"; } } }
async function fetchOrderPrerequisites() { const selectElement = document.getElementById("order-item-select"); if (!selectElement) return; selectElement.innerHTML = '<option value="">טוען פריטים...</option>'; selectElement.disabled = true; try { if (!isConnected) { availableProducts = getMockData("products"); availablePackages = getMockData("packages"); } else { const { data: productsData, error: productsError } = await supabaseClient.from("products").select("id, name, price, active, inventory(quantity)").eq("active", true); if (productsError) throw productsError; availableProducts = productsData || []; const { data: packagesData, error: packagesError } = await supabaseClient.from("packages").select("id, name, base_price"); if (packagesError) throw packagesError; availablePackages = packagesData || []; } selectElement.innerHTML = '<option value="">בחר מוצר או חבילה...</option>'; availableProducts.forEach(p => { const quantity = p.inventory ? (Array.isArray(p.inventory) ? (p.inventory[0]?.quantity ?? 0) : p.inventory.quantity) : 0; if (quantity > 0 || currentOrderItems.some(i => i.type === 'product' && i.id === p.id)) { // Allow products already in order even if stock is 0 now
selectElement.add(new Option(`מוצר: ${p.name} (${formatCurrency(p.price)})`, `product-${p.id}`)); } else { console.log(`Product "${p.name}" skipped (out of stock)`); } }); availablePackages.forEach(pkg => { selectElement.add(new Option(`חבילה: ${pkg.name} (${formatCurrency(pkg.base_price)})`, `package-${pkg.id}`)); }); selectElement.disabled = false; } catch (error) { console.error("Error fetching products/packages for order:", error); selectElement.innerHTML = '<option value="">שגיאה בטעינת פריטים</option>'; showToast("שגיאה בטעינת מוצרים/חבילות", "error"); } }
function addItemToOrder() { const selectElement = document.getElementById("order-item-select"); const quantityInput = document.getElementById("order-item-quantity"); const selectedValue = selectElement.value; const quantity = parseInt(quantityInput.value) || 1; if (!selectedValue) { showToast("יש לבחור מוצר או חבילה", "warning"); return; } if (quantity <= 0) { showToast("כמות חייבת להיות גדולה מאפס", "warning"); return; } const firstHyphenIndex = selectedValue.indexOf("-"); const type = selectedValue.substring(0, firstHyphenIndex); const id = selectedValue.substring(firstHyphenIndex + 1); let itemToAdd = null; if (type === "product") { const product = availableProducts.find(p => p.id === id); if (product) { const stock = product.inventory ? (Array.isArray(product.inventory) ? (product.inventory[0]?.quantity ?? 0) : product.inventory.quantity) : 0; const alreadyInOrderQty = currentOrderItems.filter(item => item.type === "product" && item.id === id).reduce((sum, item) => sum + item.quantity, 0); if (stock < alreadyInOrderQty + quantity) { showToast(`אין מספיק מלאי (${stock} זמינים) עבור ${product.name}`, "error"); return; } itemToAdd = { type: "product", id: product.id, name: product.name, quantity: quantity, unit_price: product.price, total_price: product.price * quantity, warranty_months: product.warranty_months }; } } else if (type === "package") { const pkg = availablePackages.find(p => p.id === id); if (pkg) { if (currentOrderItems.some(item => item.type === "package" && item.id === id)) { showToast(`חבילה "${pkg.name}" כבר קיימת בהזמנה.`, "warning"); return; } itemToAdd = { type: "package", id: pkg.id, name: pkg.name, quantity: quantity, unit_price: pkg.base_price, total_price: pkg.base_price * quantity, warranty_months: null }; } } if (itemToAdd) { currentOrderItems.push(itemToAdd); renderOrderItems(); calculateOrderTotals(); selectElement.value = ""; quantityInput.value = "1"; } else { console.error("Failed to find item for ID:", id, "Type:", type); showToast("פריט לא נמצא", "error"); } }
function renderOrderItems() { const tableBody = document.getElementById("order-items-table-body"); if (!tableBody) return; if (currentOrderItems.length === 0) { tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 2rem; color: #6b7280;">אין פריטים בהזמנה</td></tr>'; return; } tableBody.innerHTML = currentOrderItems.map((item, index) => ` <tr data-index="${index}"> <td>${item.name} <span style="font-size: 0.75rem; color: #6b7280;">(${item.type === "product" ? "מוצר" : "חבילה"})</span></td> <td>${item.quantity}</td> <td>${formatCurrency(item.unit_price)}</td> <td>${formatCurrency(item.total_price)}</td> <td> <button class="button button-danger" onclick="removeOrderItem(${index})" style="padding: 0.2rem 0.4rem; font-size: 0.7rem;"> <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg> </button> </td> </tr> `).join(""); }
function removeOrderItem(index) { if (index >= 0 && index < currentOrderItems.length) { currentOrderItems.splice(index, 1); renderOrderItems(); calculateOrderTotals(); } }
function calculateOrderTotals() { const discountInputEl = document.getElementById("order-discount"); const subtotalEl = document.getElementById("order-subtotal"); const discountAmountEl = document.getElementById("order-discount-amount"); const totalAfterDiscountEl = document.getElementById("order-total-after-discount"); const vatEl = document.getElementById("order-vat"); const grandTotalEl = document.getElementById("order-grand-total"); if (!subtotalEl || !discountAmountEl || !totalAfterDiscountEl || !vatEl || !grandTotalEl) return; const subtotal = currentOrderItems.reduce((sum, item) => sum + item.total_price, 0); const discountInput = discountInputEl ? discountInputEl.value.trim() : ""; let discountAmount = 0; let totalAfterDiscount = subtotal; if (discountInput) { if (discountInput.endsWith("%")) { const percentage = parseFloat(discountInput.replace("%", "")) || 0; discountAmount = (subtotal * percentage) / 100; } else { discountAmount = parseFloat(discountInput) || 0; } totalAfterDiscount = Math.max(0, subtotal - discountAmount); } const vatRate = 0.18; const vatAmount = totalAfterDiscount - totalAfterDiscount / (1 + vatRate); const grandTotal = totalAfterDiscount; subtotalEl.textContent = formatCurrency(subtotal); discountAmountEl.textContent = formatCurrency(discountAmount); totalAfterDiscountEl.textContent = formatCurrency(totalAfterDiscount); vatEl.textContent = formatCurrency(vatAmount); grandTotalEl.textContent = formatCurrency(grandTotal); }
async function saveOrderToSupabase() { if (!currentOrderCustomerId) { showToast("שגיאה: לא ידוע עבור איזה לקוח ההזמנה", "error"); return; } if (currentOrderItems.length === 0) { showToast("יש להוסיף לפחות פריט אחד להזמנה", "warning"); return; } if (!isConnected) { showToast("לא ניתן לשמור הזמנה (אין חיבור)", "error"); return; } const saveButton = document.getElementById("save-order-button"); const modalBody = currentModal.bodyElement; if (!saveButton || !modalBody) return; saveButton.disabled = true; saveButton.textContent = "שומר..."; try { calculateOrderTotals(); const orderData = { customer_id: currentOrderCustomerId, status: modalBody.querySelector("#order-status").value, payment_method: modalBody.querySelector("#order-payment-method").value || null, payment_status: modalBody.querySelector("#order-payment-status").value, discount: parseFloat(modalBody.querySelector("#order-discount-amount").textContent.replace(/[^\d.-]/g, "")) || 0, subtotal: parseFloat(modalBody.querySelector("#order-total-after-discount").textContent.replace(/[^\d.-]/g, "")) || 0, tax: parseFloat(modalBody.querySelector("#order-vat").textContent.replace(/[^\d.-]/g, "")) || 0, total: parseFloat(modalBody.querySelector("#order-grand-total").textContent.replace(/[^\d.-]/g, "")) || 0, notes: modalBody.querySelector("#order-notes").value, installation_included: modalBody.querySelector("#order-installation").checked, created_at: new Date(modalBody.querySelector("#order-date").value).toISOString() || new Date().toISOString() }; const { data: savedOrder, error: orderError } = await supabaseClient.from("orders").insert(orderData).select().single(); if (orderError) throw new Error(`שגיאה בשמירת הזמנה: ${orderError.message}`); if (!savedOrder) throw new Error("לא התקבלה הזמנה שנשמרה מהשרת"); const newOrderId = savedOrder.id; const orderItemsData = currentOrderItems.map(item => ({ order_id: newOrderId, product_id: item.type === "product" ? item.id : null, package_id: item.type === "package" ? item.id : null, quantity: item.quantity, unit_price: item.unit_price, total_price: item.total_price })); const { data: savedItems, error: itemsError } = await supabaseClient.from("order_items").insert(orderItemsData).select(); if (itemsError) throw new Error(`שגיאה בשמירת פריטי הזמנה: ${itemsError.message}`); if (!savedItems) throw new Error("לא התקבלו פריטים שנשמרו מהשרת"); const inventoryUpdates = []; for (const item of currentOrderItems) { if (item.type === "product") { inventoryUpdates.push({ product_id: item.id, quantity_change: -item.quantity }); } } if (inventoryUpdates.length > 0) { const updates = inventoryUpdates.map(upd => supabaseClient.rpc("decrement_inventory", { p_product_id: upd.product_id, p_quantity_change: upd.quantity_change })); const results = await Promise.allSettled(updates); results.forEach((result, index) => { if (result.status === "rejected") { console.error(`Failed inventory update for ${inventoryUpdates[index].product_id}:`, result.reason); showToast(`אזהרה: עדכון מלאי נכשל עבור פריט.`, "warning"); } }); } const warrantyInserts = []; savedItems.forEach((savedItem, index) => { const originalItem = currentOrderItems[index]; if (originalItem.type === "product" && originalItem.warranty_months && originalItem.warranty_months > 0) { const startDate = new Date(); const endDate = new Date(startDate); endDate.setMonth(startDate.getMonth() + originalItem.warranty_months); warrantyInserts.push({ customer_id: currentOrderCustomerId, product_id: originalItem.id, order_item_id: savedItem.id, start_date: startDate.toISOString(), end_date: endDate.toISOString(), status: "active" }); } }); if (warrantyInserts.length > 0) { const { error: warrantyError } = await supabaseClient.from("warranties").insert(warrantyInserts); if (warrantyError) { console.error("Error creating warranties:", warrantyError); showToast("שגיאה ביצירת אחריות", "warning"); } } await recordActivity("order", `הזמנה חדשה נוצרה עבור ${currentOrderCustomerName || currentOrderCustomerId}`); showToast("הזמנה נוצרה בהצלחה!", "success"); closeCurrentModal(); const customerModalOverlay = document.getElementById('generic-modal-overlay'); const customerModalTitle = document.getElementById('generic-modal-title'); if (customerModalOverlay.style.display === 'block' && customerModalTitle?.textContent.includes('פרטי לקוח')) { const ordersListElement = document.getElementById('customer-orders-list'); if (ordersListElement) loadCustomerOrders(currentOrderCustomerId, ordersListElement); } if (document.getElementById('products').classList.contains('active')) { loadProducts(); } } catch (error) { console.error("Error saving order:", error); showToast(`שגיאה בשמירת הזמנה: ${error.message}`, "error"); } finally { saveButton.disabled = false; saveButton.textContent = "שמור הזמנה"; } }

function updateConnectionStatus(connected) { isConnected = connected; const statusDot = document.getElementById("connection-status"); const statusText = document.getElementById("connection-text"); const reconnectBtn = document.getElementById("reconnect-btn"); if (statusDot && statusText) { if (connected) { statusDot.style.backgroundColor = "#22c55e"; statusText.textContent = "מחובר"; statusText.style.color = "#15803d"; if (reconnectBtn) reconnectBtn.style.display = "none"; } else { statusDot.style.backgroundColor = "#ef4444"; statusText.textContent = "לא מחובר"; statusText.style.color = "#b91c1c"; if (reconnectBtn) reconnectBtn.style.display = "flex"; } } testDatabaseConnection(); }
async function reconnectToSupabase() { const reconnectBtn = document.getElementById("reconnect-btn"); try { if (reconnectBtn) { const originalText = reconnectBtn.innerHTML; reconnectBtn.innerHTML = '<span class="spinner" style="width: 12px; height: 12px; border-width: 2px; margin-left: 4px; border-left-color: white;"></span> מתחבר...'; reconnectBtn.disabled = true; } console.log("Attempting to reconnect..."); const supabaseUrl = "https://rhpntgjnzhtxswanibep.supabase.co"; const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJocG50Z2puemh0eHN3YW5pYmVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1MDUwMDEsImV4cCI6MjA1OTA4MTAwMX0.GQ5JrsjWIMrg0atDiMFz6NCWH7lDT-AJd3lTNCVZq7Y"; if (window.supabase && typeof window.supabase.createClient === "function") { supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey); const { error } = await supabaseClient.from("products").select("id", { count: "exact", head: true }).limit(1); if (error) throw error; console.log("Reconnection successful!"); isConnected = true; updateConnectionStatus(true); showToast("החיבור הושלם בהצלחה", "success"); loadInitialData(); } else { throw new Error("Supabase SDK not loaded"); } } catch (error) { console.error("Reconnection failed:", error); isConnected = false; updateConnectionStatus(false); supabaseClient = createMockClient(); showToast("חיבור נכשל. נסה שוב מאוחר יותר.", "error"); loadInitialData(); } finally { if (reconnectBtn) { reconnectBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-left: 4px;"><path d="M3 2v6h6"></path><path d="M21 12A9 9 0 0 0 6 5.3L3 8"></path><path d="M21 22v-6h-6"></path><path d="M3 12a9 9 0 0 0 15 6.7l3-2.7"></path></svg> התחבר מחדש'; reconnectBtn.disabled = false; } } }
async function recordActivity(type, description, relatedId = null) { if (!isConnected) return; let userId = null; let userName = "מערכת"; try { const { data: { user }, error: userError } = await supabaseClient.auth.getUser(); if (userError && userError.message !== "No session found") { console.warn("Error getting user for activity log:", userError); } else if (user) { userId = user.id; userName = user.user_metadata?.full_name || `${user.user_metadata?.first_name || ""} ${user.user_metadata?.last_name || ""}`.trim() || user.email || user.id; } } catch (e) { console.warn("Exception fetching user for activity log:", e); } try { const activityData = { type, description, created_at: new Date().toISOString(), user_id: userId, user_name: userName }; if (relatedId) { activityData.related_entity_id = relatedId; } const { data, error } = await supabaseClient.from("activities").insert([activityData]); if (error) console.error("Error recording activity:", error); else { if (document.getElementById("dashboard").classList.contains("active")) { loadActivities(); } } } catch (error) { console.error("Exception recording activity:", error); } }

function loadInitialData() {
    loadDashboardData(); loadCustomersChart(); loadLeadsBySource(); loadConversionTrendWidget(); loadDashboardTasks(); loadActivities();
}

document.addEventListener("DOMContentLoaded", async function () {
  try {
    console.log("Initializing App...");

    // 1. Ensure Auth Client is ready and get Supabase client
    if (!window.authClient) {
        console.error("Auth client not found. Cannot initialize app.");
        alert("שגיאת טעינה קריטית. נסה לרענן את הדף.");
       return;
   }
    supabaseClient = window.authClient.getSupabaseClient();

    // 2. Check if user is logged in (auth.js handles initial redirect)
    // We add a secondary check here for robustness
    const user = await window.authClient.getCurrentUser();
    if (!user) {
        console.log("No user session found in index.html, redirecting...");
        window.authClient.redirectToLogin();
        return; // Stop further execution
    }

    // 3. Display User Name
    const userNameDisplay = document.getElementById('user-name-display');
    if (userNameDisplay) {
        const userName = user.user_metadata?.full_name || `${user.user_metadata?.first_name || ''} ${user.user_metadata?.last_name || ''}`.trim() || user.email || 'משתמש';
        userNameDisplay.textContent = userName;
    }

    // 4. Initialize connection status and other app parts
    console.log("User authenticated, proceeding with app initialization.");
    isConnected = true; // Assume connected if user is loaded (auth.js handles offline)
    updateConnectionStatus(isConnected);

    // Setup UI elements (Navigation, Search)
    setupNavigation();
    setupSearchListeners();
    loadSettings(); // Load settings from localStorage

    // Load initial data for the default view (dashboard)
    loadInitialData();



  } catch (e) {
    console.error("App Initialization error:", e);
    // Display a user-friendly error message if possible
    // Potentially fallback to mock client or show error state
    isConnected = false;
    updateConnectionStatus(false);
    supabaseClient = createMockClient();
    loadInitialData(); // Attempt to load with mock data
  }
});

async function showOrderDetails(orderId) {
    try {
        // 1. Fetch Order and Customer Info
        const { data: orderData, error: orderError } = await supabaseClient
            .from('orders')
            .select(`*, customer:customers(id, first_name, last_name)`) // Fetch first_name and last_name
            .eq('id', orderId)
            .single();
        if (orderError && isConnected) throw orderError;
        if (!orderData) { showToast("הזמנה לא נמצאה", "error"); return; }

        // 2. Fetch Order Items
        const { data: itemsData, error: itemsError } = await supabaseClient
            .from('order_items')
            .select(`*, product:products(id, name, price), package:packages(id, name, base_price)`)
            .eq('order_id', orderId);
        if (itemsError && isConnected) throw itemsError;

        // Format customer name from fetched first_name and last_name
        const customerFirstName = orderData.customer?.first_name || '';
        const customerLastName = orderData.customer?.last_name || '';
        const customerName = `${customerFirstName} ${customerLastName}`.trim() || 'לקוח לא ידוע';
        currentOrderCustomerId = orderData.customer_id;
        currentOrderCustomerName = customerName;

        // Prepare items for the modal state
        currentOrderItems = (itemsData || []).map(item => {
            if (item.product) {
                return {
                    type: "product",
                    id: item.product.id,
                    name: item.product.name,
                    quantity: item.quantity,
                    unit_price: item.unit_price, // Use price from item in case it was different
                    total_price: item.total_price,
                    // We might need original product data if we allow changing items here
                };
            } else if (item.package) {
                return {
                    type: "package",
                    id: item.package.id,
                    name: item.package.name,
                    quantity: item.quantity,
                    unit_price: item.unit_price,
                    total_price: item.total_price,
                };
            }
            return null; // Should not happen
        }).filter(Boolean); // Remove nulls

        // 3. Open Modal
        openModal({
            modalId: 'order-details', // Use a distinct ID for editing
            title: `פרטי הזמנה #${orderId.substring(0, 8)}... (לקוח: ${customerName})`,
            contentTemplateId: 'order-content-template',
            sizeClass: 'modal-xl',
            relatedData: { order: orderData, items: itemsData }, // Pass full data
            entityId: orderId,
            footerActionsHTML: '<button id="save-order-button" class="button button-primary" onclick="saveOrderChanges()">שמור שינויים</button>',
            onLoad: async (modalBody) => {
                // Populate fields - Reuse parts of resetOrderModal/fetchOrderPrerequisites if possible
                await fetchOrderPrerequisites(); // Ensure product/package list is loaded

                // Set basic order details
                modalBody.querySelector("#order-date").value = orderData.created_at ? new Date(orderData.created_at).toISOString().split("T")[0] : '';
                modalBody.querySelector("#order-status").value = orderData.status || 'new';
                modalBody.querySelector("#order-payment-method").value = orderData.payment_method || '';
                modalBody.querySelector("#order-payment-status").value = orderData.payment_status || 'pending';
                // Discount: Be careful - saved discount is amount, input might be % or amount
                // For simplicity, just display the saved amount for now. Editing needs thought.
                modalBody.querySelector("#order-discount").value = orderData.discount ? orderData.discount.toFixed(2) : ''; // Display saved amount
                modalBody.querySelector("#order-installation").checked = orderData.installation_included || false;
                modalBody.querySelector("#order-notes").value = orderData.notes || '';

                // Render items and calculate totals
                renderOrderItems();
                calculateOrderTotals(); // This will recalculate based on items, might differ slightly if discount logic changes
            },
            onCloseCallback: resetOrderModal
        });

    } catch (error) {
        console.error("Error loading order details:", error);
        showToast("שגיאה בטעינת פרטי ההזמנה: " + error.message, "error");
    }
}

function createOrderFromCustomerModal() { if (currentModal.id === 'customer-details' && currentModal.entityId && currentModal.relatedData) { const customerId = currentModal.entityId; const customerName = currentModal.relatedData.name || `${currentModal.relatedData.first_name || ""} ${currentModal.relatedData.last_name || ""}`.trim(); openOrderModal(customerId, customerName); } else { showToast("יש לפתוח פרטי לקוח תחילה", "warning"); } }
function openOrderModal(customerId, customerName) { currentOrderCustomerId = customerId; currentOrderCustomerName = customerName; openModal({ modalId: 'order-create', title: `יצירת הזמנה עבור: ${customerName}`, contentTemplateId: 'order-content-template', sizeClass: 'modal-xl', footerActionsHTML: '<button id="save-order-button" class="button button-primary" onclick="saveOrderToSupabase()">שמור הזמנה</button>', onLoad: (modalBody) => { resetOrderModal(); fetchOrderPrerequisites(); const discountInput = modalBody.querySelector("#order-discount"); if (discountInput) discountInput.addEventListener('input', calculateOrderTotals); }, onCloseCallback: resetOrderModal }); }
function resetOrderModal() { currentOrderItems = []; currentOrderCustomerId = null; currentOrderCustomerName = null; const orderModalBody = document.getElementById('generic-modal-body'); const orderTableBody = orderModalBody?.querySelector("#order-items-table-body"); if (orderTableBody) renderOrderItems(); calculateOrderTotals(); if (currentModal.id === 'order-create' || currentModal.id === 'order-details') { const body = currentModal.bodyElement; if (body) { body.querySelector("#order-date").value = new Date().toISOString().split("T")[0]; body.querySelector("#order-status").value = "new"; body.querySelector("#order-payment-method").value = ""; body.querySelector("#order-payment-status").value = "pending"; body.querySelector("#order-discount").value = ""; body.querySelector("#order-installation").checked = false; body.querySelector("#order-notes").value = ""; body.querySelector("#order-item-select").value = ""; body.querySelector("#order-item-quantity").value = "1"; } } }
async function fetchOrderPrerequisites() { const selectElement = document.getElementById("order-item-select"); if (!selectElement) return; selectElement.innerHTML = '<option value="">טוען פריטים...</option>'; selectElement.disabled = true; try { if (!isConnected) { availableProducts = getMockData("products"); availablePackages = getMockData("packages"); } else { const { data: productsData, error: productsError } = await supabaseClient.from("products").select("id, name, price, active, inventory(quantity)").eq("active", true); if (productsError) throw productsError; availableProducts = productsData || []; const { data: packagesData, error: packagesError } = await supabaseClient.from("packages").select("id, name, base_price"); if (packagesError) throw packagesError; availablePackages = packagesData || []; } selectElement.innerHTML = '<option value="">בחר מוצר או חבילה...</option>'; availableProducts.forEach(p => { const quantity = p.inventory ? (Array.isArray(p.inventory) ? (p.inventory[0]?.quantity ?? 0) : p.inventory.quantity) : 0; if (quantity > 0 || currentOrderItems.some(i => i.type === 'product' && i.id === p.id)) { // Allow products already in order even if stock is 0 now
selectElement.add(new Option(`מוצר: ${p.name} (${formatCurrency(p.price)})`, `product-${p.id}`)); } else { console.log(`Product "${p.name}" skipped (out of stock)`); } }); availablePackages.forEach(pkg => { selectElement.add(new Option(`חבילה: ${pkg.name} (${formatCurrency(pkg.base_price)})`, `package-${pkg.id}`)); }); selectElement.disabled = false; } catch (error) { console.error("Error fetching products/packages for order:", error); selectElement.innerHTML = '<option value="">שגיאה בטעינת פריטים</option>'; showToast("שגיאה בטעינת מוצרים/חבילות", "error"); } }
async function saveOrderChanges() {
    const saveButton = document.getElementById("save-order-button");
    const modalBody = currentModal.bodyElement;
    if (!saveButton || !modalBody) return;

    saveButton.disabled = true;
    saveButton.textContent = "שומר...";

    try {
        calculateOrderTotals(); // Recalculate totals based on modal state

        // Extract data from modal
        const orderDataToUpdate = {
            status: modalBody.querySelector("#order-status").value,
            payment_method: modalBody.querySelector("#order-payment-method").value || null,
            payment_status: modalBody.querySelector("#order-payment-status").value,
            // Discount needs careful handling: parse input, decide if % or amount, recalculate
            // For now, let's assume the input holds the final desired *amount*
            discount: parseFloat(modalBody.querySelector("#order-discount").value) || 0,
            notes: modalBody.querySelector("#order-notes").value,
            installation_included: modalBody.querySelector("#order-installation").checked,
            // Recalculate totals based on items and the final discount amount
            subtotal: currentOrderItems.reduce((sum, item) => sum + item.total_price, 0), // This is item totals before discount
            tax: 0, // Will be calculated below
            total: 0, // Will be calculated below
            updated_at: new Date().toISOString() // Track update time
        };

        // Calculate final total after discount
        const discountAmount = orderDataToUpdate.discount;
        const totalAfterDiscount = Math.max(0, orderDataToUpdate.subtotal - discountAmount);
        const vatRate = 0.17; // Assuming 17% VAT
        orderDataToUpdate.tax = totalAfterDiscount * vatRate;
        orderDataToUpdate.total = totalAfterDiscount + orderDataToUpdate.tax;
        // Adjust subtotal field if it's meant to be *after* discount
        // orderDataToUpdate.subtotal = totalAfterDiscount;

        // 1. Update the main order details
        const { data: updatedOrder, error: updateError } = await supabaseClient
            .from('orders')
            .update(orderDataToUpdate)
            .eq('id', currentModal.entityId)
            .select()
            .single();

        if (updateError) throw new Error(`שגיאה בעדכון הזמנה: ${updateError.message}`);
        if (!updatedOrder) throw new Error("לא התקבלה הזמנה מעודכנת מהשרת");

        // 2. Handle Order Items (Complex: Need to compare original items vs current items)
        // This part requires fetching original items, comparing with `currentOrderItems`,
        // deleting removed items, updating changed quantities, and inserting new items.
        // It also involves inventory adjustments.
        // For now, skipping item updates for simplicity. Implement later if needed.
        console.warn("Order item updates are not implemented yet in saveOrderChanges.");
        // TODO: Fetch original items, diff, update/insert/delete order_items, adjust inventory.

        await recordActivity("order", `הזמנה #${currentModal.entityId.substring(0, 8)} עודכנה`, currentModal.entityId);
        showToast("שינויים בהזמנה נשמרו!", "success");
        closeCurrentModal();
        if (document.getElementById('orders').classList.contains('active')) {
            loadOrders(); // Refresh the orders table
        }
        // Optionally refresh customer view if order total changed etc.

    } catch (error) {
        console.error("Error saving order changes:", error);
        showToast(`שגיאה בשמירת שינויים: ${error.message}`, "error");
    } finally {
        saveButton.disabled = false;
        saveButton.textContent = "שמור שינויים";
    }
}

async function fetchProductsForSelection() {
    if (availableProductsForSelection.length > 0) return availableProductsForSelection; // Return cached if available

    try {
        if (!isConnected) {
            availableProductsForSelection = getMockData("products").filter(p => p.active);
  } else {
            const { data, error } = await supabaseClient
                .from('products')
                .select('id, name, price')
                .eq('active', true)
                .order('name');
            if (error) throw error;
            availableProductsForSelection = data || [];
        }
        return availableProductsForSelection;
    } catch (error) {
        console.error("Error fetching products for selection:", error);
        showToast("שגיאה בטעינת רשימת מוצרים", "error");
        return [];
    }
}

function openAddPackageModal() {
    openModal({
        modalId: 'add-package',
        title: 'הוספת חבילה חדשה',
        contentTemplateId: 'package-details-content-template',
        sizeClass: 'modal-lg',
        footerActionsHTML: '<button class="button button-primary" onclick="savePackageChanges()">שמור חבילה</button>',
        onLoad: async (modalBody) => {
            currentPackageItems = [];
            originalPackageItems = [];
            renderPackageItems([], 'package-items-list-body'); // Clear item list
            modalBody.querySelector('#detail-package-name').value = '';
            modalBody.querySelector('#detail-package-description').value = '';
            modalBody.querySelector('#detail-package-base-price').value = '';
            modalBody.querySelector('#detail-package-active').checked = true;
            await populateProductSelect('package-item-select');
        }
    });
}

async function showPackageDetails(packageId) {
    try {
        const { data: pkg, error: pkgError } = await supabaseClient
            .from('packages')
            .select('*')
            .eq('id', packageId)
            .single();
        if (pkgError && isConnected) throw pkgError;

        const { data: items, error: itemsError } = await supabaseClient
            .from('package_items')
            .select('*, product:products(id, name, price)') // Fetch product details
            .eq('package_id', packageId);
         if (itemsError && isConnected) throw itemsError;

         if (!pkg) { showToast("חבילה לא נמצאה", "error"); return; }

         currentPackageItems = (items || []).map(item => ({ 
            id: item.id, // package_items id
            product_id: item.product_id,
            name: item.product?.name || 'מוצר לא ידוע',
            quantity: item.quantity,
            default_price: item.product?.price,
            price_override: item.price_override
        }));
        originalPackageItems = JSON.parse(JSON.stringify(currentPackageItems)); // Deep copy for comparison

        openModal({
            modalId: 'edit-package',
            title: `עריכת חבילה: ${pkg.name}`,
            contentTemplateId: 'package-details-content-template',
            sizeClass: 'modal-lg',
            relatedData: pkg, // Store original package data
            entityId: packageId,
            footerActionsHTML: '<button class="button button-primary" onclick="savePackageChanges()">שמור שינויים</button>',
            onLoad: async (modalBody, data) => {
                modalBody.querySelector('#detail-package-name').value = data.name || '';
                modalBody.querySelector('#detail-package-description').value = data.description || '';
                modalBody.querySelector('#detail-package-base-price').value = data.base_price != null ? data.base_price : '';
                modalBody.querySelector('#detail-package-active').checked = data.active;
                renderPackageItems(currentPackageItems, 'package-items-list-body');
                await populateProductSelect('package-item-select');
            },
            onCloseCallback: () => { currentPackageItems = []; originalPackageItems = []; } // Clear temp arrays on close
        });

    } catch (error) {
        console.error("Error loading package details:", error);
        showToast("שגיאה בטעינת פרטי החבילה: " + error.message, "error");
    }
}

async function populateProductSelect(selectElementId) {
    const selectElement = document.getElementById(selectElementId);
    if (!selectElement) return;
    selectElement.innerHTML = '<option value="">טוען מוצרים...</option>';
    selectElement.disabled = true;
    try {
        const products = await fetchProductsForSelection();
        selectElement.innerHTML = '<option value="">בחר מוצר...</option>';
        products.forEach(p => {
            selectElement.add(new Option(`${p.name} (${formatCurrency(p.price)})`, p.id));
        });
         selectElement.disabled = false;
    } catch (error) {
        selectElement.innerHTML = '<option value="">שגיאה בטעינה</option>';
    }
}

 function renderPackageItems(itemsArray, targetElementId) {
    const tableBody = document.getElementById(targetElementId);
    if (!tableBody) return;

    if (!itemsArray || itemsArray.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 2rem; color: #6b7280">אין פריטים בחבילה</td></tr>';
        return;
    }

    tableBody.innerHTML = itemsArray.map((item, index) => `
        <tr data-product-id="${item.product_id}">
            <td>${item.name || 'טוען...'}</td>
            <td>${item.quantity}</td>
            <td>${formatCurrency(item.default_price)}</td>
            <td>${item.price_override != null ? formatCurrency(item.price_override) : '(רגיל)'}</td>
            <td>
                <button class="button button-danger" onclick="removePackageItem(${index})" style="padding: 0.2rem 0.4rem; font-size: 0.7rem;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
            </td>
        </tr>
    `).join('');
}

function addItemToPackageModal() {
    const selectElement = document.getElementById("package-item-select");
    const quantityInput = document.getElementById("package-item-quantity");
    const overrideInput = document.getElementById("package-item-price-override");

    const productId = selectElement.value;
    const quantity = parseInt(quantityInput.value) || 1;
    let priceOverride = overrideInput.value.trim() === '' ? null : parseFloat(overrideInput.value);

    if (!productId) { showToast("יש לבחור מוצר", "warning"); return; }
    if (quantity <= 0) { showToast("כמות חייבת להיות גדולה מאפס", "warning"); return; }
    if (priceOverride !== null && priceOverride < 0) { showToast("מחיר מיוחד לא יכול להיות שלילי", "warning"); return; }
    if (currentPackageItems.some(item => item.product_id === productId)) { showToast("מוצר זה כבר קיים בחבילה", "warning"); return; }
    
    // Find product details from cached list
    const product = availableProductsForSelection.find(p => p.id === productId);
    if (!product) { showToast("שגיאה: פרטי מוצר לא נמצאו", "error"); return; }

    currentPackageItems.push({
        id: null, // Indicates new item, has no package_items id yet
        product_id: productId,
        name: product.name,
        quantity: quantity,
        default_price: product.price,
        price_override: priceOverride
    });

    renderPackageItems(currentPackageItems, 'package-items-list-body');

    // Reset inputs
    selectElement.value = '';
    quantityInput.value = '1';
    overrideInput.value = '';
}

function removePackageItem(index) {
    if (index >= 0 && index < currentPackageItems.length) {
        currentPackageItems.splice(index, 1);
        renderPackageItems(currentPackageItems, 'package-items-list-body');
    }
}

async function savePackageChanges() {
    const isAdding = currentModal.id === 'add-package';
    const packageId = currentModal.entityId;
    const modalBody = currentModal.bodyElement;
    if (!modalBody) { showToast("שגיאה: לא ניתן למצוא את תוכן המודאל", "error"); return; }

    const packageName = modalBody.querySelector('#detail-package-name').value;
    if (!packageName) { showToast("שם חבילה הוא שדה חובה", "warning"); return; }

    const priceInput = modalBody.querySelector('#detail-package-base-price').value;
    const userEnteredPrice = priceInput.trim() === '' ? NaN : parseFloat(priceInput); 
    
    let calculatedPrice = 0; // Initialize calculatedPrice here
    let finalBasePrice;
    
    if (!isNaN(userEnteredPrice)) { 
        // User entered a valid number
        finalBasePrice = userEnteredPrice;
          } else {
        // User input was empty or invalid - calculate from items
        calculatedPrice = currentPackageItems.reduce((total, item) => {
            const itemPrice = (typeof item.price_override === 'number') ? item.price_override : (item.default_price ?? 0); 
            const quantity = item.quantity || 0;
            const itemTotal = (typeof itemPrice === 'number' && typeof quantity === 'number') ? itemPrice * quantity : 0;
            return total + itemTotal;
        }, 0);
        finalBasePrice = calculatedPrice; 
    }
    
    const packageData = {
        name: packageName,
        description: modalBody.querySelector('#detail-package-description').value || '',
        base_price: finalBasePrice, // Always a valid number or 0
        active: modalBody.querySelector('#detail-package-active').checked
    };

    const saveButton = currentModal.footerActionsElement.querySelector('button.button-primary');
    if (saveButton) { saveButton.disabled = true; saveButton.textContent = 'שומר...'; }

    try {
        let savedPackageId = packageId;
        let savedPackageData = null;

        // 1. Upsert Package Info
        if (isAdding) {
            const { data, error } = await supabaseClient.from('packages').insert(packageData).select().single();
            if (error) throw new Error(`שגיאה ביצירת חבילה: ${error.message}`);
            savedPackageId = data.id;
            savedPackageData = data;
            await recordActivity("package", `חבילה חדשה נוצרה: ${data.name}`);
        } else {
            // Update existing package
            if (!packageId) { // Defensive check added here
               console.error("Attempted to update package but packageId is null. Modal ID:", currentModal.modalId);
               throw new Error("שגיאה פנימית: ניסיון לעדכן חבילה ללא מזהה.");
            }
            packageData.updated_at = new Date().toISOString();
            const { data, error } = await supabaseClient.from('packages').update(packageData).eq('id', packageId).select().single();
            if (error) throw new Error(`שגיאה בעדכון חבילה: ${error.message}`);
            savedPackageData = data;
            // TODO: Record more specific activity based on changes
            await recordActivity("package", `חבילה עודכנה: ${data.name}`, packageId);
        }

        if (!savedPackageId) throw new Error("לא התקבל מזהה חבילה לאחר השמירה.");

        // 2. Diff and Update/Insert/Delete Items
        const itemsToInsert = [];
        const itemsToUpdate = [];
        const itemIdsToDelete = [];

        // Find items to delete or update
        originalPackageItems.forEach(origItem => {
            const currentItem = currentPackageItems.find(curr => curr.product_id === origItem.product_id);
            if (!currentItem) {
                // Item was removed
                if (origItem.id) itemIdsToDelete.push(origItem.id); // Only delete if it exists in DB
            } else if (currentItem.quantity !== origItem.quantity || currentItem.price_override !== origItem.price_override) {
                // Item was updated
                itemsToUpdate.push({
                    id: origItem.id, // The package_items id
                    quantity: currentItem.quantity,
                    price_override: currentItem.price_override
                });
            }
        });

        // Find items to insert
        currentPackageItems.forEach(currItem => {
            if (!originalPackageItems.some(orig => orig.product_id === currItem.product_id)) {
                itemsToInsert.push({
                    package_id: savedPackageId,
                    product_id: currItem.product_id,
                    quantity: currItem.quantity,
                    price_override: currItem.price_override
                });
            }
        });

        // Execute DB operations
        if (itemIdsToDelete.length > 0) {
            const { error: deleteError } = await supabaseClient.from('package_items').delete().in('id', itemIdsToDelete);
            if (deleteError) console.warn("Error deleting package items:", deleteError);
        }
        if (itemsToUpdate.length > 0) {
             for (const item of itemsToUpdate) {
                const { error: updateError } = await supabaseClient.from('package_items').update({ quantity: item.quantity, price_override: item.price_override }).eq('id', item.id);
                if (updateError) console.warn(`Error updating package item ${item.id}:`, updateError);
             }
        }
        if (itemsToInsert.length > 0) {
            const { error: insertError } = await supabaseClient.from('package_items').insert(itemsToInsert);
            if (insertError) console.warn("Error inserting package items:", insertError);
        }
        
        showToast("פרטי החבילה נשמרו בהצלחה!", "success");
        closeCurrentModal();
        if (document.getElementById('packages').classList.contains('active')) {
            loadPackages(); // Refresh the packages table
        }

    } catch (error) {
        console.error("Error saving package changes:", error);
        showToast(error.message, "error");
    } finally {
         if (saveButton) { saveButton.disabled = false; saveButton.textContent = isAdding ? 'שמור חבילה' : 'שמור שינויים'; }
    }
}
