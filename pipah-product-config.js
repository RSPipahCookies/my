/**
 * =========================================================================
 * PIPAHCOOKIES - RESELLER PRODUCT CONFIGURATION & BUSINESS LOGIC
 * Fail ini menyediakan 'Single Source of Truth' (SSOT) untuk semua data produk 
 * dan logik pengiraan yang digunakan oleh RSDashboard.html dan index.html.
 * =========================================================================
 */

// --- 1. GENERAL CONFIGURATION ---
window.HEADER_IMAGE_URL = 'images/Header2.jpg';
window.HQ_WHATSAPP_NUMBER = '601163962328';      // WhatsApp HQ untuk RSDashboard
window.ORDER_WHATSAPP_NUMBER = '601121243407'; // WhatsApp untuk Reseller Order Form

// --- 2. PRODUCT DATA DEFINITION (SSOT) ---
const PRODUCTS_DATA = [
  {
    id: 'P1',
    name: 'Seasalt Cookies', // Nama ringkas untuk dashboard
    title: 'Seasalt Cookies (65pcs)', // Nama penuh untuk portal pelanggan
    img_url: 'images/ss1.jpg',
    images: ['images/ss1.jpg', 'images/ss2.jpg', 'images/ss3.jpg'], // Gambar untuk slider pelanggan
    rrp: 16.00, // Harga Runcit Disyorkan
    oldPrice: 18.00, // Harga lama (jika ada) untuk portal pelanggan
    tiers: [ // Kos Reseller
      { max: 4, price: 16, name: 'Tier 1 (1-4 units)' },
      { max: 9, price: 15, name: 'Tier 2 (5-9 units)' },
      { max: Infinity, price: 14, name: 'Tier 3 (10+ units)' }
    ]
  },
  {
    id: 'P2',
    name: 'ChocHazelnut Button',
    title: 'ChocHazelnut Button (38pcs)',
    img_url: 'images/ch1.jpg',
    images: ['images/ch1.jpg', 'images/ch2.jpg', 'images/ch3.jpg'],
    rrp: 22.00,
    oldPrice: 25.00,
    tiers: [
      { max: 4, price: 22, name: 'Tier 1 (1-4 units)' },
      { max: 9, price: 21, name: 'Tier 2 (5-9 units)' },
      { max: Infinity, price: 20, name: 'Tier 3 (10+ units)' }
    ]
  },
  {
    id: 'P3',
    name: 'Brownies Cookies',
    title: 'Brownies Cookies (70pcs)',
    img_url: 'images/br1.jpg',
    images: ['images/br1.jpg', 'images/br2.jpg', 'images/br3.jpg'],
    rrp: 17.00,
    oldPrice: 19.00,
    tiers: [
      { max: 4, price: 17, name: 'Tier 1 (1-4 units)' },
      { max: 9, price: 16, name: 'Tier 2 (5-9 units)' },
      { max: Infinity, price: 15, name: 'Tier 3 (10+ units)' }
    ]
  },
  {
    id: 'P4',
    name: 'Black Cookies',
    title: 'Black Cookies (80pcs)',
    img_url: 'images/bc1.jpg',
    images: ['images/bc1.jpg', 'images/bc2.jpg', 'images/bc3.jpg'],
    rrp: 22.00,
    oldPrice: 25.00,
    tiers: [
      { max: 5, price: 19, name: 'Tier 1 (1-5 units)' },
      { max: 49, price: 11, name: 'Tier 2 (6-49 units)' },
      { max: Infinity, price: 10, name: 'Tier 3 (50+ units)' }
    ]
  },
  {
    id: 'P5',
    name: 'RedVelvet Button',
    title: 'RedVelvet Button',
    img_url: 'images/rv1.jpg',
    images: ['images/rv1.jpg', 'images/rv2.jpg', 'images/rv3.jpg'],
    rrp: 22.00,
    oldPrice: 24.00,
    tiers: [
      { max: 4, price: 20, name: 'Tier 1 (1-4 units)' },
      { max: 9, price: 19, name: 'Tier 2 (5-9 units)' },
      { max: Infinity, price: 18, name: 'Tier 3 (10+ units)' }
    ]
  },
  {
    id: 'P6',
    name: 'DarkChoc Cookies',
    title: 'DarkChoc Cookies (70pcs)',
    img_url: 'images/dc1.jpg',
    images: ['images/dc1.jpg', 'images/dc2.jpg', 'images/dc3.jpg'],
    rrp: 22.00,
    oldPrice: 24.00,
    tiers: [
      { max: 4, price: 19, name: 'Tier 1 (1-4 units)' },
      { max: 9, price: 18, name: 'Tier 2 (5-9 units)' },
      { max: Infinity, price: 17, name: 'Tier 3 (10+ units)' }
    ]
  }
];

// --- 3. BUSINESS LOGIC FUNCTIONS ---

/**
 * Mendapatkan kos Reseller per unit berdasarkan ID produk dan kuantiti.
 * @param {string} productId - ID produk (e.g., 'P1').
 * @param {number} quantity - Kuantiti unit yang ditempah.
 * @returns {{cost: number, name: string}} Objek yang mengandungi kos unit dan nama tier.
 */
function getResellerCost(productId, quantity) {
    const product = PRODUCTS_DATA.find(p => p.id === productId);

    if (!product || quantity < 1) {
        return { cost: 0.00, name: 'N/A' };
    }

    for (const tier of product.tiers) {
        if (quantity <= tier.max) {
            return { cost: tier.price, name: tier.name };
        }
    }
    
    // Fallback
    const lastTier = product.tiers[product.tiers.length - 1];
    return { cost: lastTier.price, name: lastTier.name };
}

// --- 4. GLOBAL EXPOSURE ---
window.PRODUCTS_DATA = PRODUCTS_DATA;
window.getResellerCost = getResellerCost;
