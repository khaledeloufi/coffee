let token = localStorage.getItem('maladh_admin_token') || '';

const $ = id => document.getElementById(id);

function showToast(msg, isErr) {
  const t = $('toast');
  t.textContent = msg;
  t.className = 'toast show' + (isErr ? ' err' : '');
  clearTimeout(window.__toastT);
  window.__toastT = setTimeout(() => t.className = 'toast', 2600);
}

const apiBase = (function () {
  if (location.hostname && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
    return location.protocol + '//' + location.hostname + ':3000';
  }
  return 'http://localhost:3000';
})();

async function api(path, opts = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['X-Admin-Token'] = token;
  const res = await fetch(apiBase + path, { ...opts, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.errors ? data.errors.map(e => e.msg || e).join('، ') : (data.error || 'خطأ غير معروف'));
  return data;
}

function checkLogin() {
  const logged = !!token;
  $('loginCard').classList.toggle('hidden', logged);
  $('formCard').classList.toggle('hidden', !logged);
  $('listCard').classList.toggle('hidden', !logged);
  $('authStatus').innerHTML = logged
    ? '<span class="chip">✔️ مسجل دخول — المدير</span>'
    : '<span class="chip">🔒 غير مسجل دخول</span>';
  if (logged) loadProducts();
}

async function login() {
  const t = $('adminToken').value.trim();
  if (!t) return showToast('اكتب التوكن أولاً', true);
  token = t;
  try {
    await api('/api/products/verify');
    localStorage.setItem('maladh_admin_token', t);
    showToast('تم تسجيل الدخول 🎉');
    checkLogin();
  } catch (e) {
    token = '';
    localStorage.removeItem('maladh_admin_token');
    const msg = String(e && e.message || e);
    const isNetwork = msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('Network request failed');
    showToast(isNetwork ? '⚠️ السيرفر مش شغال أو محجوب — شغل السيرفر بـ (npm start) ثم جرّب Ctrl+F5' + ' [سبب: ' + msg + ']' : 'التوكن غير صحيح', true);
  }
}

async function loadProducts() {
  try {
    const { products, total } = await api('/api/products');
    $('count').textContent = total + ' منتج';
    const tbody = $('tbody');
    tbody.innerHTML = '';
    $('emptyMsg').classList.toggle('hidden', total > 0);
    products.forEach(p => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="name-cell"><b>${esc(p.name)}</b><span>${esc(p.description || '')}</span></td>
        <td><span class="cat-chip">${esc(p.category)}</span></td>
        <td>${p.available ? '<span class="badge on">متوفر</span>' : '<span class="badge off">غير متوفر</span>'}</td>
        <td class="actions">
          <button class="small" data-act="edit" data-id="${p.id}">تعديل</button>
          <button class="danger" data-act="del" data-id="${p.id}">حذف</button>
        </td>`;
      tbody.appendChild(tr);
    });
  } catch (e) {
    showToast(e.message, true);
  }
}

function openAdd() {
  $('formTitle').textContent = '＋ إضافة منتج جديد';
  $('formTitle').classList.remove('pending');
  resetForm();
  $('formCard').classList.remove('hidden');
  $('formCard').scrollIntoView({ behavior: 'smooth' });
}

async function editProduct(id) {
  try {
    const p = await api('/api/products/' + id);
    $('formTitle').textContent = '✏️ تعديل المنتج';
    $('formTitle').classList.add('pending');
    $('pName').value = p.name || '';
    $('pCategory').value = p.category || 'brewed';
    $('pImage').value = p.image || '';
    $('pDescription').value = p.description || '';
    $('pIngredients').value = Array.isArray(p.ingredients) ? p.ingredients.join('\n') : (p.ingredients || '');
    $('pAvailable').checked = p.available !== false;
    $('formCard').classList.remove('hidden');
    $('formCard').scrollIntoView({ behavior: 'smooth' });
    window.__editId = id;
  } catch (e) {
    showToast(e.message, true);
  }
}

function resetForm() {
  window.__editId = null;
  $('pName').value = '';
  $('pCategory').value = 'brewed';
  $('pImage').value = '';
  $('pDescription').value = '';
  $('pIngredients').value = '';
  $('pAvailable').checked = true;
  if (!$('formCard').classList.contains('hidden')) $('formCard').classList.add('hidden');
}

async function saveProduct() {
  const body = {
    name:        $('pName').value.trim(),
    category:    $('pCategory').value,
    image:       $('pImage').value.trim(),
    description: $('pDescription').value.trim(),
    ingredients: String($('pIngredients').value).split(/[\n,،]+/).map(s => s.trim()).filter(Boolean),
    available:   $('pAvailable').checked,
  };
  try {
    if (window.__editId) {
      await api('/api/products/' + window.__editId, { method: 'PUT', body: JSON.stringify(body) });
      showToast('تم تحديث المنتج ✔️');
    } else {
      await api('/api/products', { method: 'POST', body: JSON.stringify(body) });
      showToast('تمت إضافة المنتج 🎉');
    }
    resetForm();
    loadProducts();
  } catch (e) {
    showToast(e.message, true);
  }
}

async function deleteProduct(id) {
  if (!confirm('متأكد إنك عاوز تحذف المنتج ده؟')) return;
  try {
    await api('/api/products/' + id, { method: 'DELETE' });
    showToast('تم الحذف');
    loadProducts();
  } catch (e) {
    showToast(e.message, true);
  }
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

document.addEventListener('click', function (e) {
  const id = e.target.id;
  if (id === 'loginBtn') login();
  else if (id === 'saveBtn') saveProduct();
  else if (id === 'cancelBtn') resetForm();
  else if (id === 'refreshBtn') loadProducts();
  else if (id === 'addBtn') openAdd();
});

document.addEventListener('keydown', function (e) {
  if (e.key === 'Enter' && e.target.id === 'adminToken') login();
});

document.getElementById('tbody').addEventListener('click', function (e) {
  const btn = e.target.closest('button[data-act]');
  if (!btn) return;
  const id = btn.getAttribute('data-id');
  if (btn.getAttribute('data-act') === 'edit') editProduct(id);
  else if (btn.getAttribute('data-act') === 'del') deleteProduct(id);
});

$('pName').addEventListener('keydown', function (e) {
  if (e.key === 'Enter') saveProduct();
});

checkLogin();