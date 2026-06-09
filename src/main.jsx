import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createClient } from '@supabase/supabase-js';
import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';
import {
  ArrowRight,
  Bell,
  ChefHat,
  Clock,
  Download,
  Eye,
  LayoutDashboard,
  LogIn,
  Mail,
  Minus,
  Plus,
  QrCode,
  Receipt,
  Save,
  Search,
  ShoppingCart,
  Smartphone,
  Store,
  Trash2,
  Upload,
  Users
} from 'lucide-react';
import './styles.css';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const hasSupabase = Boolean(supabaseUrl && supabaseKey);
const supabase = hasSupabase ? createClient(supabaseUrl, supabaseKey) : null;
const imageKitPublicKey = import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY;
const imageKitUrlEndpoint = import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT;
const imageKitPrivateKey = import.meta.env.VITE_IMAGEKIT_PRIVATE_KEY;
const hasImageKit = Boolean(imageKitPublicKey && imageKitUrlEndpoint && imageKitPrivateKey);
const superadminEmail = import.meta.env.VITE_SUPERADMIN_EMAIL || '';

const restaurantId = '11111111-1111-4111-8111-111111111111';

const seedRestaurant = {
  id: restaurantId,
  name: 'Juniper Table',
  logo_url: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=900&q=80',
  address: '14 Market Street, Downtown',
  currency: 'USD',
  tax_percent: 8,
  total_discount_percent: 5,
  flat_discount: 0
};

const seedMenu = [
  {
    id: 'm1',
    restaurant_id: restaurantId,
    name: 'Crisp Herb Arancini',
    description: 'Golden rice bites with basil aioli and shaved parmesan.',
    price: 10,
    category: 'Appetizers',
    image_url: 'https://images.unsplash.com/photo-1541014741259-de529411b96a?auto=format&fit=crop&w=900&q=80',
    discount_percent: 0,
    is_available: true
  },
  {
    id: 'm2',
    restaurant_id: restaurantId,
    name: 'Charred Paneer Skewers',
    description: 'Smoky paneer, peppers, mint chutney, pickled onion.',
    price: 13,
    category: 'Appetizers',
    image_url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=80',
    discount_percent: 10,
    is_available: true
  },
  {
    id: 'm3',
    restaurant_id: restaurantId,
    name: 'Saffron Risotto',
    description: 'Slow-cooked arborio rice, mushrooms, citrus gremolata.',
    price: 22,
    category: 'Mains',
    image_url: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?auto=format&fit=crop&w=900&q=80',
    discount_percent: 0,
    is_available: true
  },
  {
    id: 'm4',
    restaurant_id: restaurantId,
    name: 'Lemon Thyme Salmon',
    description: 'Pan-seared salmon, warm grains, dill yogurt.',
    price: 27,
    category: 'Mains',
    image_url: 'https://images.unsplash.com/photo-1485921325833-c519f76c4927?auto=format&fit=crop&w=900&q=80',
    discount_percent: 0,
    is_available: true
  },
  {
    id: 'm5',
    restaurant_id: restaurantId,
    name: 'Cucumber Lime Cooler',
    description: 'Fresh cucumber, lime, soda, mint and a little salt.',
    price: 7,
    category: 'Drinks',
    image_url: 'https://images.unsplash.com/photo-1523371683702-21f1ae37a4bc?auto=format&fit=crop&w=900&q=80',
    discount_percent: 0,
    is_available: true
  },
  {
    id: 'm6',
    restaurant_id: restaurantId,
    name: 'Dark Chocolate Tart',
    description: 'Chocolate ganache, toasted almond, vanilla cream.',
    price: 9,
    category: 'Desserts',
    image_url: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=900&q=80',
    discount_percent: 0,
    is_available: false
  }
];

const seedOrders = [
  {
    id: 'o1',
    restaurant_id: restaurantId,
    table_number: '7',
    total_amount: 51.84,
    status: 'preparing',
    special_notes: 'Extra chutney for the skewers.',
    created_at: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    items: [
      { id: 'oi1', order_id: 'o1', menu_item_id: 'm2', item_name: 'Charred Paneer Skewers', quantity: 2, price_at_order: 11.7 },
      { id: 'oi2', order_id: 'o1', menu_item_id: 'm5', item_name: 'Cucumber Lime Cooler', quantity: 2, price_at_order: 7 }
    ]
  },
  {
    id: 'o2',
    restaurant_id: restaurantId,
    table_number: '3',
    total_amount: 32.51,
    status: 'delivered',
    special_notes: '',
    created_at: new Date(Date.now() - 1000 * 60 * 46).toISOString(),
    items: [
      { id: 'oi3', order_id: 'o2', menu_item_id: 'm3', item_name: 'Saffron Risotto', quantity: 1, price_at_order: 22 },
      { id: 'oi4', order_id: 'o2', menu_item_id: 'm6', item_name: 'Dark Chocolate Tart', quantity: 1, price_at_order: 9 }
    ]
  }
];

const currencySymbols = { USD: '$', INR: '₹', EUR: '€', GBP: '£' };

function uid(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function money(value, currency = 'USD') {
  return `${currencySymbols[currency] || currency} ${Number(value || 0).toFixed(2)}`;
}

function getTableFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return {
    restaurant_id: params.get('restaurant_id') || restaurantId,
    table: params.get('table') || '12'
  };
}

function isCustomerRoute() {
  const params = new URLSearchParams(window.location.search);
  return window.location.pathname.startsWith('/menu') && params.has('restaurant_id') && params.has('table');
}

function optimizedImage(url, width = 900) {
  if (!url) return '';
  if (!imageKitUrlEndpoint || !url.startsWith(imageKitUrlEndpoint)) return url;
  const path = url.replace(imageKitUrlEndpoint, '').split('?')[0].replace(/^\/+/, '');
  const baseUrl = `${imageKitUrlEndpoint}/tr:w-${width},q-85,f-auto`;
  return path ? `${baseUrl}/${path}` : url;
}

function toHex(buffer) {
  return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function hmacSha1Hex(message, secret) {
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-1' },
    false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message));
  return toHex(sig);
}

async function uploadToImageKit(file, folder) {
  if (!hasImageKit) {
    throw new Error('ImageKit is not configured. Add the ImageKit environment variables and restart the app.');
  }

  const token = crypto.randomUUID();
  const expire = Math.floor(Date.now() / 1000) + 60 * 10;
  const signature = await hmacSha1Hex(`${token}${expire}`, imageKitPrivateKey);

  const formData = new FormData();
  formData.append('file', file);
  formData.append('fileName', file.name);
  formData.append('publicKey', imageKitPublicKey);
  formData.append('signature', signature);
  formData.append('expire', expire);
  formData.append('token', token);
  formData.append('folder', folder);
  formData.append('useUniqueFileName', 'true');

  const uploadResponse = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
    method: 'POST',
    body: formData
  });
  const result = await uploadResponse.json();
  if (!uploadResponse.ok) {
    throw new Error(result.message || 'ImageKit upload failed.');
  }
  return result.url || `${imageKitUrlEndpoint}${result.filePath}`;
}

function calculateTotals(items, restaurant) {
  const subtotal = items.reduce((sum, item) => {
    const discounted = item.price * (1 - (item.discount_percent || 0) / 100);
    return sum + discounted * item.quantity;
  }, 0);
  const billDiscount = subtotal * ((restaurant.total_discount_percent || 0) / 100) + Number(restaurant.flat_discount || 0);
  const afterDiscount = Math.max(0, subtotal - billDiscount);
  const tax = afterDiscount * ((restaurant.tax_percent || 0) / 100);
  return { subtotal, billDiscount, tax, total: afterDiscount + tax };
}

async function signInWithGoogle() {
  await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } });
}

async function ensureProfile(user) {
  const { data: existing } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
  if (existing) return existing.role;
  const isSuper = superadminEmail && user.email && user.email.toLowerCase() === superadminEmail.toLowerCase();
  const role = isSuper ? 'superadmin' : 'owner';
  await supabase.from('profiles').insert({ id: user.id, role });
  return role;
}

function App() {
  const customerRoute = isCustomerRoute();
  const [view, setView] = useState('dashboard');
  const [restaurant, setRestaurant] = useState({ id: restaurantId, name: '', currency: 'USD' });
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [allRestaurants, setAllRestaurants] = useState([]);
  const [toast, setToast] = useState('');
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    if (!hasSupabase) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      setSession(nextSession);
      if (nextSession?.user) {
        const role = await ensureProfile(nextSession.user);
        setUserRole(role);
      } else {
        setUserRole(null);
      }
    });
    return () => authListener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!hasSupabase) return;
    loadSupabaseData();
  }, [session]);

  useEffect(() => {
    if (!hasSupabase || !restaurant?.id) return;
    const channel = supabase
      .channel('kitchen-orders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders', filter: `restaurant_id=eq.${restaurant.id}` },
        () => loadSupabaseData(true)
      )
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [restaurant?.id]);

  async function loadSupabaseData(silent = false) {
    const params = getTableFromUrl();
    if (customerRoute) {
      const { data: foundRestaurant } = await supabase.from('restaurants').select('*').eq('id', params.restaurant_id).maybeSingle();
      const activeRestaurant = foundRestaurant || restaurant;
      setRestaurant(activeRestaurant);
      const { data: menu } = await supabase.from('menu_items').select('*').eq('restaurant_id', activeRestaurant.id).order('category');
      if (menu) setMenuItems(menu);
      const { data: cats } = await supabase.from('categories').select('*').eq('restaurant_id', activeRestaurant.id).order('sort_order');
      if (cats) setCategories(cats);
      return;
    }
    if (!session) return;
    const role = await ensureProfile(session.user);
    setUserRole(role);
    if (role === 'superadmin') {
      const { data: restaurants } = await supabase.from('restaurants').select('*').order('name');
      setAllRestaurants(restaurants || []);
      if (restaurants?.length && !restaurants.find((r) => r.id === restaurant.id)) {
        setRestaurant(restaurants[0]);
      }
    }
    const activeId = restaurant.id;
    const { data: found } = role === 'superadmin'
      ? await supabase.from('restaurants').select('*').eq('id', activeId).maybeSingle()
      : await supabase.from('restaurants').select('*').eq('owner_id', session.user.id).limit(1).maybeSingle();
    const activeRestaurant = found || restaurant;
    setRestaurant(activeRestaurant);
    const { data: menu } = await supabase.from('menu_items').select('*').eq('restaurant_id', activeRestaurant.id).order('category');
    if (menu) setMenuItems(menu);
    const { data: cats } = await supabase.from('categories').select('*').eq('restaurant_id', activeRestaurant.id).order('sort_order');
    if (cats) setCategories(cats);
    const { data: orderRows } = await supabase
      .from('orders').select('*, order_items(*)').eq('restaurant_id', activeRestaurant.id).order('created_at', { ascending: false });
    if (orderRows) {
      setOrders(orderRows.map((order) => ({ ...order, items: order.order_items || [] })));
      if (!silent) notify('Data loaded');
    }
  }

  function notify(message) {
    setToast(message);
    window.setTimeout(() => setToast(''), 2400);
  }

  function addOrder(order) {
    setOrders((current) => [order, ...current]);
    notify(`New order from table ${order.table_number}`);
  }

  async function updateOrderStatus(orderId, status) {
    if (hasSupabase && session) {
      await supabase.from('orders').update({ status }).eq('id', orderId);
    }
    setOrders((current) => current.map((order) => (order.id === orderId ? { ...order, status } : order)));
  }

  async function selectRestaurant(restaurantId) {
    const { data: found } = await supabase.from('restaurants').select('*').eq('id', restaurantId).single();
    if (found) {
      setRestaurant(found);
      const { data: menu } = await supabase.from('menu_items').select('*').eq('restaurant_id', found.id).order('category');
      if (menu) setMenuItems(menu);
      const { data: cats } = await supabase.from('categories').select('*').eq('restaurant_id', found.id).order('sort_order');
      if (cats) setCategories(cats);
      const { data: orderRows } = await supabase.from('orders').select('*, order_items(*)').eq('restaurant_id', found.id).order('created_at', { ascending: false });
      if (orderRows) setOrders(orderRows.map((order) => ({ ...order, items: order.order_items || [] })));
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    setUserRole(null);
    setAllRestaurants([]);
    setRestaurant({ id: restaurantId, name: '', currency: 'USD' });
    setMenuItems([]);
    setCategories([]);
    setOrders([]);
  }

  const authReady = hasSupabase && !session;

  if (customerRoute) {
    return (
      <div className="app">
        {toast && <div className="toast"><Bell size={16} />{toast}</div>}
        <CustomerMenu
          restaurant={restaurant}
          menuItems={menuItems}
          categories={categories}
          addOrder={addOrder}
          notify={notify}
          session={session}
        />
      </div>
    );
  }

  if (!hasSupabase) {
    return (
      <div className="app">
        <AdminSetupPanel />
      </div>
    );
  }

  if (authReady && !showAuth) {
    return <LandingPage onSignIn={() => setShowAuth(true)} />;
  }

  if (authReady && showAuth) {
    return <AuthPanel onBack={() => setShowAuth(false)} />;
  }

  return (
    <div className="app">
      {toast && <div className="toast"><Bell size={16} />{toast}</div>}
      <>
        <TopNav view={view} setView={setView} restaurant={restaurant} userRole={userRole} onSignOut={handleSignOut} />
        {userRole === 'superadmin' && allRestaurants.length > 0 && (
          <AdminRestaurantPicker restaurants={allRestaurants} selectedId={restaurant.id} onSelect={selectRestaurant} />
        )}
        {view === 'dashboard' && (
          <AdminDashboard
            restaurant={restaurant}
            setRestaurant={setRestaurant}
            menuItems={menuItems}
            setMenuItems={setMenuItems}
            categories={categories}
            setCategories={setCategories}
            orders={orders}
            setView={setView}
            notify={notify}
            session={session}
          />
        )}
        {view === 'menu' && (
          <MenuManager
            restaurant={restaurant}
            menuItems={menuItems}
            setMenuItems={setMenuItems}
            categories={categories}
            setCategories={setCategories}
            notify={notify}
            session={session}
          />
        )}
        {view === 'kitchen' && (
          <KitchenBoard restaurant={restaurant} orders={orders} updateOrderStatus={updateOrderStatus} />
        )}
        {view === 'qr' && <QrManager restaurant={restaurant} />}
      </>
    </div>
  );
}

function TopNav({ view, setView, restaurant, userRole, onSignOut }) {
  const tabs = [
    ['dashboard', LayoutDashboard, 'Dashboard'],
    ['menu', ShoppingCart, 'Menu'],
    ['kitchen', ChefHat, 'Kitchen'],
    ['qr', QrCode, 'QR Codes']
  ];

  return (
    <header className="top-nav">
      <button className="brand" onClick={() => setView('dashboard')}>
        <span className="brand-mark"><Store size={19} /></span>
        <span>{restaurant.name}</span>
      </button>
      <nav>
        {tabs.map(([key, Icon, label]) => (
          <button key={key} className={view === key ? 'active' : ''} onClick={() => setView(key)} title={label}>
            <Icon size={18} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
      <div className="top-nav-right">
        {userRole && <span className="role-badge">{userRole}</span>}
        <button className="sign-out-btn" onClick={onSignOut} title="Sign out">Sign out</button>
      </div>
    </header>
  );
}

function AdminRestaurantPicker({ restaurants, selectedId, onSelect }) {
  return (
    <div className="restaurant-picker">
      {restaurants.map((r) => (
        <button key={r.id} className={r.id === selectedId ? 'active' : ''} onClick={() => onSelect(r.id)}>
          {r.name}
        </button>
      ))}
    </div>
  );
}

function AdminSetupPanel() {
  return (
    <main className="auth-shell">
      <section className="auth-panel">
        <h1>Supabase required</h1>
        <p>Admin screens are protected. Add your Supabase values to `.env` and restart the dev server.</p>
        <code>VITE_SUPABASE_URL</code>
        <code>VITE_SUPABASE_ANON_KEY</code>
      </section>
    </main>
  );
}

function AuthPanel({ onBack }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  async function signIn() {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setMessage(error.message);
  }

  async function signUp() {
    const { error } = await supabase.auth.signUp({ email, password });
    setMessage(error ? error.message : 'Check your email to confirm your account.');
  }

  return (
    <main className="auth-shell">
      <section className="auth-panel">
        <button className="auth-back" onClick={onBack}>&larr; Back</button>
        <h1>Restaurant access</h1>
        <p>Sign in to manage your private menus, orders, and analytics.</p>
        <button className="google-btn" onClick={signInWithGoogle}>
          <LogIn size={18} /> Sign in with Google
        </button>
        <div className="auth-divider"><span>or</span></div>
        <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" type="email" />
        <input value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" type="password" />
        <div className="button-row">
          <button className="primary" onClick={signIn}>Sign in</button>
          <button onClick={signUp}>Create account</button>
        </div>
        {message && <p className="hint">{message}</p>}
      </section>
    </main>
  );
}

function AdminDashboard({ restaurant, setRestaurant, menuItems, setMenuItems, categories, setCategories, orders, setView, notify, session }) {
  const [draftRestaurant, setDraftRestaurant] = useState(restaurant);
  const [draftItem, setDraftItem] = useState(emptyMenuItem(restaurant.id));
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState('');

  async function addCategory(name) {
    if (!hasSupabase) return;
    const { data, error } = await supabase.from('categories').insert({ restaurant_id: restaurant.id, name }).select().single();
    if (error) { notify(error.message); return; }
    setCategories((current) => [...current, data]);
  }

  const stats = useMemo(() => buildStats(orders), [orders]);

  useEffect(() => {
    setDraftRestaurant(restaurant);
    setDraftItem((current) => ({ ...current, restaurant_id: restaurant.id }));
  }, [restaurant]);

  async function saveRestaurant() {
    const ownedRestaurant = {
      ...draftRestaurant,
      owner_id: session?.user?.id || draftRestaurant.owner_id
    };
    if (hasSupabase) {
      const isNewRestaurant = !draftRestaurant.owner_id;
      const { id, ...restaurantInsert } = ownedRestaurant;
      const query = isNewRestaurant
        ? supabase.from('restaurants').insert(restaurantInsert).select().single()
        : supabase.from('restaurants').upsert(ownedRestaurant).select().single();
      const { data, error } = await query;
      if (error) {
        notify(error.message);
        return;
      }
      setRestaurant(data);
      notify('Restaurant profile saved');
    } else {
      setRestaurant(ownedRestaurant);
      notify('Restaurant profile saved');
    }
  }

  function editItem(item) {
    setEditingId(item.id);
    setDraftItem(item);
  }

  async function saveItem() {
    if (hasSupabase && !restaurant.owner_id) {
      notify('Save the restaurant profile before adding menu items.');
      return;
    }
    const next = { ...draftItem, restaurant_id: restaurant.id, price: Number(draftItem.price || 0), discount_percent: Number(draftItem.discount_percent || 0) };
    if (editingId) {
      setMenuItems((current) => current.map((item) => (item.id === editingId ? next : item)));
      if (hasSupabase) {
        const { error } = await supabase.from('menu_items').upsert(next);
        if (error) {
          notify(error.message);
          return;
        }
      }
    } else {
      if (hasSupabase) {
        const { data, error } = await supabase.from('menu_items').insert(next).select().single();
        if (error) {
          notify(error.message);
          return;
        }
        setMenuItems((current) => [data, ...current]);
      } else {
        const item = { ...next, id: uid('menu') };
        setMenuItems((current) => [item, ...current]);
      }
    }
    setEditingId(null);
    setDraftItem(emptyMenuItem(restaurant.id));
    notify('Menu item saved');
  }

  async function handleImageUpload(file, target) {
    if (!file) return;
    setUploading(target);
    try {
      const folder = target === 'logo' ? `/restaurants/${restaurant.id}/brand` : `/restaurants/${restaurant.id}/menu`;
      const imageUrl = await uploadToImageKit(file, folder);
      if (target === 'logo') {
        setDraftRestaurant((current) => ({ ...current, logo_url: imageUrl }));
      } else {
        setDraftItem((current) => ({ ...current, image_url: imageUrl }));
      }
      notify('Image uploaded to ImageKit');
    } catch (error) {
      notify(error.message);
    } finally {
      setUploading('');
    }
  }

  async function deleteItem(id) {
    if (hasSupabase) {
      const { error } = await supabase.from('menu_items').delete().eq('id', id);
      if (error) {
        notify(error.message);
        return;
      }
    }
    setMenuItems((current) => current.filter((item) => item.id !== id));
  }

  async function toggleItem(id) {
    const item = menuItems.find((entry) => entry.id === id);
    if (!item) return;
    if (hasSupabase) {
      const { error } = await supabase.from('menu_items').update({ is_available: !item.is_available }).eq('id', id);
      if (error) {
        notify(error.message);
        return;
      }
    }
    setMenuItems((current) =>
      current.map((entry) => (entry.id === id ? { ...entry, is_available: !entry.is_available } : entry))
    );
  }

  return (
    <main className="workspace">
      <section className="hero-band">
        <div>
          <p className="eyebrow">QR dine-in platform</p>
          <h1>Restaurant operations, orders, and table QR codes in one console.</h1>
        </div>
        <button className="primary" onClick={() => setView('kitchen')}>
          <ChefHat size={18} /> Open kitchen
        </button>
      </section>

      <section className="stats-grid">
        <Metric label="Revenue" value={money(stats.revenue, restaurant.currency)} />
        <Metric label="Orders" value={stats.count} />
        <Metric label="Top item" value={stats.topItem || 'No orders'} />
      </section>

      <section className="two-column">
        <div className="panel">
          <h2>Restaurant profile</h2>
          <div className="form-grid">
            <label>Name<input value={draftRestaurant.name || ''} onChange={(e) => setDraftRestaurant({ ...draftRestaurant, name: e.target.value })} /></label>
            <label>Logo URL<input value={draftRestaurant.logo_url || ''} onChange={(e) => setDraftRestaurant({ ...draftRestaurant, logo_url: e.target.value })} /></label>
            <ImageUploadField
              label="Upload logo"
              busy={uploading === 'logo'}
              onUpload={(file) => handleImageUpload(file, 'logo')}
            />
            <label>Address<input value={draftRestaurant.address || ''} onChange={(e) => setDraftRestaurant({ ...draftRestaurant, address: e.target.value })} /></label>
            <label>Currency<input value={draftRestaurant.currency || ''} onChange={(e) => setDraftRestaurant({ ...draftRestaurant, currency: e.target.value.toUpperCase() })} /></label>
            <label>Tax %<input type="number" value={draftRestaurant.tax_percent || 0} onChange={(e) => setDraftRestaurant({ ...draftRestaurant, tax_percent: Number(e.target.value) })} /></label>
            <label>Total discount %<input type="number" value={draftRestaurant.total_discount_percent || 0} onChange={(e) => setDraftRestaurant({ ...draftRestaurant, total_discount_percent: Number(e.target.value) })} /></label>
          </div>
          <button className="primary" onClick={saveRestaurant}><Save size={18} /> Save profile</button>
        </div>

        <div className="panel">
          <h2>{editingId ? 'Edit item' : 'Add menu item'}</h2>
          <div className="form-grid">
            <label>Name<input value={draftItem.name} onChange={(e) => setDraftItem({ ...draftItem, name: e.target.value })} /></label>
            <CategorySelect value={draftItem.category} onChange={(v) => setDraftItem({ ...draftItem, category: v })} categories={categories} onAdd={addCategory} />
            <label>Price<input type="number" value={draftItem.price} onChange={(e) => setDraftItem({ ...draftItem, price: e.target.value })} /></label>
            <label>Item discount %<input type="number" value={draftItem.discount_percent} onChange={(e) => setDraftItem({ ...draftItem, discount_percent: e.target.value })} /></label>
            <label className="wide">Image URL<input value={draftItem.image_url} onChange={(e) => setDraftItem({ ...draftItem, image_url: e.target.value })} /></label>
            <ImageUploadField
              label="Upload item image"
              busy={uploading === 'item'}
              onUpload={(file) => handleImageUpload(file, 'item')}
            />
            <label className="wide">Description<textarea value={draftItem.description} onChange={(e) => setDraftItem({ ...draftItem, description: e.target.value })} /></label>
          </div>
          <button className="primary" onClick={saveItem}><Save size={18} /> {editingId ? 'Update item' : 'Add item'}</button>
        </div>
      </section>

      <section className="panel">
        <div className="section-head">
          <h2>Menu management</h2>
          <span>{menuItems.length} items</span>
        </div>
        <div className="menu-admin-list">
          {menuItems.length === 0 ? (
            <p className="empty-state">Menu is empty. Add your first menu item above.</p>
          ) : menuItems.map((item) => (
            <article className="menu-admin-item" key={item.id}>
              <img src={optimizedImage(item.image_url, 220)} alt="" />
              <div>
                <h3>{item.name}</h3>
                <p>{item.category} · {money(item.price, restaurant.currency)} · {item.discount_percent || 0}% off</p>
              </div>
              <button className={item.is_available ? 'stock on' : 'stock'} onClick={() => toggleItem(item.id)}>
                {item.is_available ? 'In stock' : 'Out'}
              </button>
              <button onClick={() => editItem(item)} title="Edit"><Eye size={17} /></button>
              <button onClick={() => deleteItem(item.id)} title="Delete"><Trash2 size={17} /></button>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function KitchenBoard({ restaurant, orders, updateOrderStatus }) {
  const audioRef = useRef(null);
  const activeOrders = orders.filter((order) => order.status !== 'completed' && order.status !== 'cancelled');

  useEffect(() => {
    if (!orders.length || !audioRef.current) return;
    audioRef.current.play().catch(() => {});
  }, [orders.length]);

  return (
    <main className="workspace">
      <audio ref={audioRef} src="data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQgAAAAA/////wAA" />
      <section className="section-head">
        <div>
          <p className="eyebrow">Realtime kitchen board</p>
          <h1>Incoming orders</h1>
        </div>
        <span className="mode-pill"><Clock size={15} /> Target latency under 2s</span>
      </section>
      <div className="order-grid">
        {activeOrders.map((order) => (
          <article className="order-card" key={order.id}>
            <div className="order-top">
              <div>
                <span>Table</span>
                <strong>{order.table_number}</strong>
              </div>
              <StatusBadge status={order.status} />
            </div>
            <ul>
              {(order.items || []).map((item) => (
                <li key={item.id || item.menu_item_id}>
                  <span>{item.quantity}x {item.item_name || item.name}</span>
                  <b>{money(item.price_at_order * item.quantity, restaurant.currency)}</b>
                </li>
              ))}
            </ul>
            {order.special_notes && <p className="note">{order.special_notes}</p>}
            <div className="order-actions">
              <button onClick={() => updateOrderStatus(order.id, 'preparing')}>Preparing</button>
              <button className="primary" onClick={() => updateOrderStatus(order.id, 'completed')}>Complete</button>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}

function QrManager({ restaurant }) {
  const [tables, setTables] = useState('1,2,3,4,5,6,7,8');

  const tableList = tables.split(',').map((table) => table.trim()).filter(Boolean);

  async function downloadQr(table) {
    const url = `${window.location.origin}/menu?restaurant_id=${restaurant.id}&table=${table}`;
    const canvas = document.createElement('canvas');
    await QRCode.toCanvas(canvas, url, { width: 900, margin: 2 });
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `table-${table}-qr.png`;
    link.click();
  }

  async function downloadBulkPdf() {
    const pdf = new jsPDF();
    for (let index = 0; index < tableList.length; index += 1) {
      if (index > 0) pdf.addPage();
      const table = tableList[index];
      const canvas = document.createElement('canvas');
      const url = `${window.location.origin}/menu?restaurant_id=${restaurant.id}&table=${table}`;
      await QRCode.toCanvas(canvas, url, { width: 900, margin: 2 });
      pdf.setFontSize(22);
      pdf.text(`${restaurant.name} - Table ${table}`, 20, 28);
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 35, 45, 140, 140);
      pdf.setFontSize(11);
      pdf.text(url, 20, 198, { maxWidth: 170 });
    }
    pdf.save('table-qr-codes.pdf');
  }

  return (
    <main className="workspace">
      <section className="section-head">
        <div>
          <p className="eyebrow">Dynamic table QR generation</p>
          <h1>Printable QR codes</h1>
        </div>
        <button className="primary" onClick={downloadBulkPdf}><Download size={18} /> Bulk PDF</button>
      </section>
      <div className="panel">
        <label>Tables<input value={tables} onChange={(event) => setTables(event.target.value)} /></label>
      </div>
      <div className="qr-grid">
        {tableList.map((table) => (
          <QrTile key={table} table={table} restaurant={restaurant} onDownload={() => downloadQr(table)} />
        ))}
      </div>
    </main>
  );
}

function QrTile({ table, restaurant, onDownload }) {
  const canvasRef = useRef(null);
  const url = `${window.location.origin}/menu?restaurant_id=${restaurant.id}&table=${table}`;

  useEffect(() => {
    QRCode.toCanvas(canvasRef.current, url, { width: 220, margin: 2 });
  }, [url]);

  return (
    <article className="qr-tile">
      <canvas ref={canvasRef} />
      <h3>Table {table}</h3>
      <button onClick={onDownload}><Download size={17} /> PNG</button>
    </article>
  );
}

function CategorySelect({ value, onChange, categories, onAdd }) {
  const [show, setShow] = useState(false);
  const [name, setName] = useState('');

  async function handleAdd() {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (onAdd) await onAdd(trimmed);
    onChange(trimmed);
    setName('');
    setShow(false);
  }

  return (
    <label>Category
      <div className="cat-select-row">
        <select value={value} onChange={(e) => onChange(e.target.value)}>
          {categories.length === 0 && <option value="">Select a category</option>}
          {categories.map((cat) => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
        </select>
        <button type="button" className="cat-add-btn" onClick={() => setShow(true)} title="Add category">+</button>
      </div>
      {show && (
        <div className="modal-overlay" onClick={() => setShow(false)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <h3>Add category</h3>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Category name" autoFocus onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') setShow(false); }} />
            <div className="button-row">
              <button className="primary" onClick={handleAdd}>Add</button>
              <button onClick={() => setShow(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </label>
  );
}

function ImageUploadField({ label, busy, onUpload }) {
  return (
    <label className="upload-field">
      <span>{label}</span>
      <input
        type="file"
        accept="image/*"
        disabled={busy}
        onChange={(event) => onUpload(event.target.files?.[0])}
      />
      <span className="upload-button"><Upload size={17} /> {busy ? 'Uploading...' : 'Choose image'}</span>
    </label>
  );
}

function CustomerMenu({ restaurant, menuItems, categories, addOrder, notify, session }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState({});

  const menuCategories = useMemo(() => {
    const activeCats = categories
      .filter((cat) => menuItems.some((item) => item.is_available && item.category === cat.name))
      .map((cat) => cat.name);
    return ['All', ...activeCats];
  }, [categories, menuItems]);
  const [notes, setNotes] = useState('');
  const [placedOrder, setPlacedOrder] = useState(null);
  const [email, setEmail] = useState('');
  const params = getTableFromUrl();
  const visibleItems = menuItems.filter((item) => item.is_available && (selectedCategory === 'All' || item.category === selectedCategory));
  const cartItems = Object.entries(cart)
    .map(([id, quantity]) => ({ ...menuItems.find((item) => item.id === id), quantity }))
    .filter((item) => item.id);
  const totals = calculateTotals(cartItems, restaurant);

  function adjustCart(itemId, delta) {
    setCart((current) => {
      const nextQuantity = Math.max(0, (current[itemId] || 0) + delta);
      const next = { ...current, [itemId]: nextQuantity };
      if (!nextQuantity) delete next[itemId];
      return next;
    });
  }

  async function confirmOrder() {
    if (!cartItems.length) return;
    const orderId = crypto.randomUUID();
    const orderPayload = {
      id: orderId,
      restaurant_id: params.restaurant_id,
      table_number: params.table,
      total_amount: totals.total,
      status: 'pending',
      special_notes: notes,
      receipt_token: crypto.randomUUID(),
      created_at: new Date().toISOString()
    };

    if (hasSupabase) {
      const { error } = await supabase.from('orders').insert(orderPayload);
      if (error) {
        notify(error.message);
        return;
      }
    }

    const orderItems = cartItems.map((item) => ({
      id: uid('order-item'),
      order_id: orderId,
      menu_item_id: item.id,
      item_name: item.name,
      quantity: item.quantity,
      price_at_order: item.price * (1 - (item.discount_percent || 0) / 100)
    }));

    if (hasSupabase) {
      const { error } = await supabase.from('order_items').insert(
        orderItems.map(({ id, ...item }) => item)
      );
      if (error) {
        notify(error.message);
        return;
      }
    }
    const completedOrder = { id: orderId, ...orderPayload, items: orderItems };
    setPlacedOrder(completedOrder);
    addOrder(completedOrder);
    setCart({});
  }

  async function saveEmail() {
    if (!placedOrder || !email) return;
    if (hasSupabase) {
      const { error } = await supabase.rpc('set_order_receipt_email', {
        p_order_id: placedOrder.id,
        p_receipt_token: placedOrder.receipt_token,
        p_customer_email: email
      });
      if (error) {
        notify(error.message);
        return;
      }
    }
    setPlacedOrder({ ...placedOrder, customer_email: email });
    notify('Receipt email saved');
  }

  function downloadReceipt() {
    if (!placedOrder) return;
    const pdf = new jsPDF();
    pdf.setFontSize(20);
    pdf.text(restaurant.name, 18, 24);
    pdf.setFontSize(12);
    pdf.text(`Table ${placedOrder.table_number}`, 18, 34);
    pdf.text(`Order ${placedOrder.id}`, 18, 42);
    let y = 58;
    placedOrder.items.forEach((item) => {
      pdf.text(`${item.quantity}x ${item.item_name}`, 18, y);
      pdf.text(money(item.price_at_order * item.quantity, restaurant.currency), 145, y);
      y += 9;
    });
    pdf.line(18, y + 2, 190, y + 2);
    pdf.text(`Total: ${money(placedOrder.total_amount, restaurant.currency)}`, 18, y + 14);
    pdf.save(`receipt-table-${placedOrder.table_number}.pdf`);
  }

  if (placedOrder) {
    return (
      <main className="customer-shell">
        <section className="receipt-view">
          <div className="success-orb"><Receipt size={34} /></div>
          <h1>Order confirmed</h1>
          <p>Table {placedOrder.table_number} · Status: Being prepared</p>
          <div className="bill-lines">
            {placedOrder.items.map((item) => (
              <span key={item.id}>
                <b>{item.quantity}x {item.item_name}</b>
                <b>{money(item.price_at_order * item.quantity, restaurant.currency)}</b>
              </span>
            ))}
            <span><b>Total</b><b>{money(placedOrder.total_amount, restaurant.currency)}</b></span>
          </div>
          <button className="primary" onClick={downloadReceipt}><Download size={18} /> Download PDF bill</button>
          <div className="email-capture">
            <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email for receipt" type="email" />
            <button onClick={saveEmail}><Mail size={18} /></button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="customer-shell">
      <section className="menu-cover" style={{ backgroundImage: `linear-gradient(90deg, rgba(17, 24, 39, .82), rgba(17, 24, 39, .26)), url(${optimizedImage(restaurant.logo_url, 1200)})` }}>
        <div>
          <p className="eyebrow">Table {params.table}</p>
          <h1>{restaurant.name}</h1>
          <p>{restaurant.address}</p>
        </div>
      </section>

      <div className="category-tabs">
        {menuCategories.map((category) => (
          <button key={category} className={selectedCategory === category ? 'active' : ''} onClick={() => setSelectedCategory(category)}>
            {category}
          </button>
        ))}
      </div>

      <section className="customer-layout">
        <div className="menu-grid">
          {visibleItems.map((item) => (
            <article className="menu-card" key={item.id}>
              <div className="menu-card-img-wrap">
                <img src={optimizedImage(item.image_url, 360)} alt="" />
                {item.discount_percent > 0 && <span className="discount-badge">-{item.discount_percent}%</span>}
              </div>
              <div className="menu-card-body">
                <div className="menu-card-head">
                  <h2>{item.name}</h2>
                  <strong>{money(item.price * (1 - (item.discount_percent || 0) / 100), restaurant.currency)}</strong>
                </div>
                <p>{item.description}</p>
                <div className="cart-stepper">
                  <button onClick={() => adjustCart(item.id, -1)}><Minus size={16} /></button>
                  <span>{cart[item.id] || 0}</span>
                  <button onClick={() => adjustCart(item.id, 1)}><Plus size={16} /></button>
                </div>
              </div>
            </article>
          ))}
        </div>

        <aside className="cart-panel">
          <h2><ShoppingCart size={20} /> Cart</h2>
          {cartItems.length === 0 ? <p className="hint">Add dishes to begin.</p> : (
            <>
              {cartItems.map((item) => (
                <div className="cart-line" key={item.id}>
                  <span>{item.quantity}x {item.name}</span>
                  <b>{money(item.price * (1 - (item.discount_percent || 0) / 100) * item.quantity, restaurant.currency)}</b>
                </div>
              ))}
              <textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Special notes" />
              <div className="totals">
                <span>Subtotal <b>{money(totals.subtotal, restaurant.currency)}</b></span>
                <span>Discount <b>-{money(totals.billDiscount, restaurant.currency)}</b></span>
                <span>Tax <b>{money(totals.tax, restaurant.currency)}</b></span>
                <span>Total <b>{money(totals.total, restaurant.currency)}</b></span>
              </div>
              <button className="primary checkout" onClick={confirmOrder}>Confirm order</button>
            </>
          )}
        </aside>
      </section>
    </main>
  );
}

function MenuManager({ restaurant, menuItems, setMenuItems, categories, setCategories, notify, session }) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [draftItem, setDraftItem] = useState(emptyMenuItem(restaurant.id));
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState('');

  useEffect(() => {
    setDraftItem((current) => ({ ...current, restaurant_id: restaurant.id }));
  }, [restaurant]);

  const categoryNames = useMemo(() => {
    return ['All', ...categories.map((c) => c.name)];
  }, [categories]);

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      if (categoryFilter !== 'All' && item.category !== categoryFilter) return false;
      if (search && !item.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [menuItems, search, categoryFilter]);

  async function addCategory(name) {
    if (!hasSupabase) return;
    const { data, error } = await supabase.from('categories').insert({ restaurant_id: restaurant.id, name }).select().single();
    if (error) { notify(error.message); return; }
    setCategories((current) => [...current, data]);
  }

  function editItem(item) {
    setEditingId(item.id);
    setDraftItem(item);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function saveItem() {
    if (hasSupabase && !restaurant.owner_id) {
      notify('Save the restaurant profile before adding menu items.');
      return;
    }
    const next = { ...draftItem, restaurant_id: restaurant.id, price: Number(draftItem.price || 0), discount_percent: Number(draftItem.discount_percent || 0) };
    if (editingId) {
      setMenuItems((current) => current.map((item) => (item.id === editingId ? next : item)));
      if (hasSupabase) {
        const { error } = await supabase.from('menu_items').upsert(next);
        if (error) {
          notify(error.message);
          return;
        }
      }
    } else {
      if (hasSupabase) {
        const { data, error } = await supabase.from('menu_items').insert(next).select().single();
        if (error) {
          notify(error.message);
          return;
        }
        setMenuItems((current) => [data, ...current]);
      } else {
        const item = { ...next, id: uid('menu') };
        setMenuItems((current) => [item, ...current]);
      }
    }
    setEditingId(null);
    setDraftItem(emptyMenuItem(restaurant.id));
    setShowForm(false);
    notify('Menu item saved');
  }

  function cancelForm() {
    setEditingId(null);
    setDraftItem(emptyMenuItem(restaurant.id));
    setShowForm(false);
  }

  async function handleImageUpload(file, target) {
    if (!file) return;
    setUploading(target);
    try {
      const folder = `/restaurants/${restaurant.id}/menu`;
      const imageUrl = await uploadToImageKit(file, folder);
      setDraftItem((current) => ({ ...current, image_url: imageUrl }));
      notify('Image uploaded to ImageKit');
    } catch (error) {
      notify(error.message);
    } finally {
      setUploading('');
    }
  }

  async function deleteItem(id) {
    if (hasSupabase) {
      const { error } = await supabase.from('menu_items').delete().eq('id', id);
      if (error) {
        notify(error.message);
        return;
      }
    }
    setMenuItems((current) => current.filter((item) => item.id !== id));
  }

  async function toggleItem(id) {
    const item = menuItems.find((entry) => entry.id === id);
    if (!item) return;
    if (hasSupabase) {
      const { error } = await supabase.from('menu_items').update({ is_available: !item.is_available }).eq('id', id);
      if (error) {
        notify(error.message);
        return;
      }
    }
    setMenuItems((current) =>
      current.map((entry) => (entry.id === id ? { ...entry, is_available: !entry.is_available } : entry))
    );
  }

  const availableCount = menuItems.filter((item) => item.is_available).length;

  return (
    <main className="workspace">
      <div className="menu-manager-head">
        <div>
          <p className="eyebrow">Menu management</p>
          <h1>{menuItems.length} items &middot; {availableCount} in stock</h1>
        </div>
        <button className="primary" onClick={() => { setShowForm(true); setEditingId(null); setDraftItem(emptyMenuItem(restaurant.id)); }}>
          <Plus size={18} /> Add item
        </button>
      </div>

      {showForm && (
        <section className="panel menu-form-panel">
          <div className="section-head">
            <h2>{editingId ? 'Edit item' : 'New item'}</h2>
            <button onClick={cancelForm}>Cancel</button>
          </div>
          <div className="form-grid">
            <label>Name<input value={draftItem.name} onChange={(e) => setDraftItem({ ...draftItem, name: e.target.value })} /></label>
            <CategorySelect value={draftItem.category} onChange={(v) => setDraftItem({ ...draftItem, category: v })} categories={categories} onAdd={addCategory} />
            <label>Price<input type="number" value={draftItem.price} onChange={(e) => setDraftItem({ ...draftItem, price: e.target.value })} /></label>
            <label>Discount %<input type="number" value={draftItem.discount_percent} onChange={(e) => setDraftItem({ ...draftItem, discount_percent: e.target.value })} /></label>
            <label className="wide">Image URL<input value={draftItem.image_url} onChange={(e) => setDraftItem({ ...draftItem, image_url: e.target.value })} /></label>
            <ImageUploadField label="Upload image" busy={uploading === 'item'} onUpload={(file) => handleImageUpload(file, 'item')} />
            <label className="wide">Description<textarea value={draftItem.description} onChange={(e) => setDraftItem({ ...draftItem, description: e.target.value })} /></label>
          </div>
          <button className="primary" onClick={saveItem}><Save size={18} /> {editingId ? 'Update' : 'Add'} item</button>
        </section>
      )}

      <div className="menu-manager-toolbar">
        <div className="menu-manager-search">
          <Search size={16} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search items..." />
        </div>
        <div className="menu-manager-cats">
          {categoryNames.map((cat) => (
            <button key={cat} className={categoryFilter === cat ? 'active' : ''} onClick={() => setCategoryFilter(cat)}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="menu-manager-list">
        {filteredItems.length === 0 ? (
          <p className="empty-state">{search || categoryFilter !== 'All' ? 'No items match your search.' : 'Menu is empty. Add your first item.'}</p>
        ) : filteredItems.map((item) => (
          <article className="menu-manager-item" key={item.id}>
            <img src={optimizedImage(item.image_url, 120)} alt="" />
            <div className="menu-manager-item-info">
              <h3>{item.name}</h3>
              <p>{item.category} &middot; {money(item.price, restaurant.currency)}{item.discount_percent ? ` · ${item.discount_percent}% off` : ''}</p>
            </div>
            <div className="menu-manager-item-actions">
              <button className={item.is_available ? 'stock on' : 'stock'} onClick={() => toggleItem(item.id)}>
                {item.is_available ? 'In stock' : 'Out'}
              </button>
              <button onClick={() => editItem(item)} title="Edit"><Eye size={17} /></button>
              <button onClick={() => deleteItem(item.id)} title="Delete"><Trash2 size={17} /></button>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}

const features = [
  { icon: Smartphone, title: 'QR Menu Ordering', desc: 'Customers scan a QR code at their table to browse the menu and place orders directly from their phone.' },
  { icon: ChefHat, title: 'Kitchen Dashboard', desc: 'Real-time order board so the kitchen knows exactly what to prepare, when.' },
  { icon: LayoutDashboard, title: 'Full Admin Panel', desc: 'Manage menu items, track inventory, set discounts, and control availability.' },
  { icon: Receipt, title: 'Digital Billing', desc: 'Customers receive itemized receipts via email or download as PDF.' },
  { icon: QrCode, title: 'Table QR Generator', desc: 'Bulk-generate QR codes for every table. Print once, serve hundreds.' },
  { icon: Users, title: 'Multi-Restaurant', desc: 'Superadmin mode to manage multiple restaurant profiles from one dashboard.' }
];

function LandingPage({ onSignIn }) {
  return (
    <div className="landing">
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <span className="landing-logo"><Store size={20} /> QR Dine</span>
          <div className="landing-nav-links">
            <a href="#features">Features</a>
            <a href="#how">How it works</a>
          </div>
          <button className="primary" onClick={onSignIn}>Sign in</button>
        </div>
      </nav>

      <section className="landing-hero">
        <div className="landing-hero-inner">
          <div className="landing-hero-text">
            <span className="landing-hero-badge">No apps &bull; No contact &bull; Just QR</span>
            <h1>Dine-in ordering,<br />reimagined.</h1>
            <p className="landing-hero-sub">Replace paper menus with QR codes. Guests order from their phone, the kitchen sees it in real time, and you run a smoother restaurant.</p>
            <div className="landing-hero-actions">
              <button className="primary landing-cta" onClick={onSignIn}>
                Get started <ArrowRight size={18} />
              </button>
              <a href="#features" className="landing-link">See features</a>
            </div>
          </div>
          <div className="landing-hero-visual">
            <div className="landing-phone-mock">
              <div className="mock-notch" />
              <div className="mock-header">Juniper Table</div>
              <div className="mock-items">
                {['Crisp Herb Arancini', 'Saffron Risotto', 'Lemon Thyme Salmon', 'Dark Chocolate Tart'].map((name, i) => (
                  <div key={i} className="mock-item">
                    <div className="mock-dot" />
                    <span>{name}</span>
                    <span className="mock-price">${[10, 22, 27, 9][i]}</span>
                  </div>
                ))}
              </div>
              <div className="mock-cart">
                <ShoppingCart size={14} /> 2 items &middot; $32.00
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-features" id="features">
        <div className="landing-section-head">
          <span className="eyebrow">Platform</span>
          <h2>Everything you need to run your dining room.</h2>
        </div>
        <div className="landing-features-grid">
          {features.map(({ icon: Icon, title, desc }) => (
            <article key={title} className="landing-feature-card">
              <div className="landing-feature-icon"><Icon size={22} /></div>
              <h3>{title}</h3>
              <p>{desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-how" id="how">
        <div className="landing-section-head">
          <span className="eyebrow">Simple setup</span>
          <h2>Get your tables online in minutes.</h2>
        </div>
        <div className="landing-how-steps">
          {[
            { n: '01', title: 'Create your menu', desc: 'Add dishes, set prices, upload photos. Your digital menu is live instantly.' },
            { n: '02', title: 'Generate table QR codes', desc: 'Print QR codes for each table and place them on the table stand.' },
            { n: '03', title: 'Start taking orders', desc: 'Guests scan, order, and you receive real-time notifications in the kitchen.' }
          ].map(({ n, title, desc }) => (
            <div key={n} className="landing-step">
              <span className="landing-step-num">{n}</span>
              <h3>{title}</h3>
              <p>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="landing-cta-section">
        <div className="landing-cta-inner">
          <h2>Ready to modernize your restaurant?</h2>
          <p>Set up in minutes. No app installation required for your guests.</p>
          <button className="primary landing-cta" onClick={onSignIn}>
            Get started <ArrowRight size={18} />
          </button>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <span className="landing-logo"><Store size={16} /> QR Dine</span>
          <span className="landing-footer-text">Contact: <a href="mailto:akashstiwari444@gmail.com">akashstiwari444@gmail.com</a></span>
        </div>
      </footer>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <article className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function StatusBadge({ status }) {
  return <span className={`status ${status}`}>{status}</span>;
}

function emptyMenuItem(id) {
  return {
    restaurant_id: id,
    name: '',
    description: '',
    price: '',
    category: 'Mains',
    image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=80',
    discount_percent: 0,
    is_available: true
  };
}

function buildStats(orders) {
  const revenue = orders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0);
  const itemCount = {};
  orders.forEach((order) => {
    (order.items || []).forEach((item) => {
      const name = item.item_name || item.name;
      itemCount[name] = (itemCount[name] || 0) + item.quantity;
    });
  });
  const topItem = Object.entries(itemCount).sort((a, b) => b[1] - a[1])[0]?.[0];
  return { revenue, count: orders.length, topItem };
}

createRoot(document.getElementById('root')).render(<App />);
