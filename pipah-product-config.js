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
// *** FIX: Define PRODUCTS_DATA directly on the window object so it is globally accessible. ***
window.PRODUCTS_DATA = [
  {
    id: 'P1',
    name: 'Seasalt Cookies', // Nama ringkas untuk dashboard
    title: 'Seasalt Cookies (65pcs)', // Nama penuh untuk portal pelanggan
    img_url: 'images/ss1.jpg',
    images: ['images/ss1.jpg', 'images/ss2.jpg', 'images/ss3.jpg'], // Gambar untuk slider pelanggan
    rrp: 16.00, // Harga Runcit Disyorkan
    // oldPrice: 18.00, // <--- DIBUANG
    tiers: [ // Kos Reseller
      { max: 4, price: 16, name: 'Tier 1 (1-4 units)' },
      { max: 9, price: 15, name: 'Tier 2 (5-9 units)' },
      { max: Infinity, price: 14, name: 'Tier 3 (10+ units)' }
    ]
  },
  {
    id: 'P2',
    name: 'Choc Chip Cookies', // Nama ringkas
    title: 'Choc Chip Cookies (65pcs)', // Nama penuh
    img_url: 'images/ch1.jpg',
    images: ['images/ch1.jpg', 'images/ch2.jpg', 'images/ch3.jpg'],
    rrp: 20.00,
    // oldPrice: 22.00, // <--- DIBUANG
    tiers: [
      { max: 4, price: 18, name: 'Tier 1 (1-4 units)' },
      { max: 9, price: 17, name: 'Tier 2 (5-9 units)' },
      { max: Infinity, price: 16, name: 'Tier 3 (10+ units)' }
    ]
  },
  {
    id: 'P3',
    name: 'Brookie',
    title: 'Brookie (300g)',
    img_url: 'images/br1.jpg',
    images: ['images/br1.jpg', 'images/br2.jpg', 'images/br3.jpg'],
    rrp: 25.00,
    // oldPrice: 28.00, // <--- DIBUANG
    tiers: [
      { max: 4, price: 21, name: 'Tier 1 (1-4 units)' },
      { max: 9, price: 20, name: 'Tier 2 (5-9 units)' },
      { max: Infinity, price: 19, name: 'Tier 3 (10+ units)' }
    ]
  },
  {
    id: 'P4',
    name: 'Brownies Choc',
    title: 'Brownies Choc (10x10in)',
    img_url: 'images/bc1.jpg',
    images: ['images/bc1.jpg', 'images/bc2.jpg', 'images/bc3.jpg'],
    rrp: 30.00,
    // oldPrice: 32.00, // <--- DIBUANG
    tiers: [
      { max: 4, price: 25, name: 'Tier 1 (1-4 units)' },
      { max: 9, price: 24, name: 'Tier 2 (5-9 units)' },
      { max: Infinity, price: 23, name: 'Tier 3 (10+ units)' }
    ]
  },
  {
    id: 'P5',
    name: 'Red Velvet',
    title: 'Red Velvet (10x10in)',
    img_url: 'images/rv1.jpg',
    images: ['images/rv1.jpg', 'images/rv2.jpg', 'images/rv3.jpg'],
    rrp: 32.00,
    // oldPrice: 35.00, // <--- DIBUANG
    tiers: [
      { max: 4, price: 27, name: 'Tier 1 (1-4 units)' },
      { max: 9, price: 26, name: 'Tier 2 (5-9 units)' },
      { max: Infinity, price: 25, name: 'Tier 3 (10+ units)' }
    ]
  },
  {
    id: 'P6',
    name: 'Double Choc',
    title: 'Double Choc (10x10in)',
    img_url: 'images/dc1.jpg',
    images: ['images/dc1.jpg', 'images/dc2.jpg', 'images/dc3.jpg'],
    rrp: 30.00,
    // oldPrice: 24.00, // <--- DIBUANG
    tiers: [
      { max: 4, price: 25, name: 'Tier 1 (1-4 units)' },
      { max: 9, price: 24, name: 'Tier 2 (5-9 units)' },
      { max: Infinity, price: 23, name: 'Tier 3 (10+ units)' }
    ]
  }
];


// --- 3. BUSINESS LOGIC FUNCTIONS ---

/**
 * Mendapatkan kos Reseller per unit berdasarkan ID produk dan kuantiti.
 * @param {string} productId - ID produk (e.g., 'P1').
 * @param {number} quantity - Kuantiti unit yang ditempah.\n
 * @returns {{cost: number, name: string}} Objek yang mengandungi kos unit dan nama tier.
 */
function getResellerCost(productId, quantity) {
    // *** FIX: Reference window.PRODUCTS_DATA which is now global ***
    const product = window.PRODUCTS_DATA.find(p => p.id === productId);

    if (!product) {
        return { cost: 0, name: 'Product Not Found' };
    }

    if (quantity <= 0) {
        // Return Tier 1 price if quantity is 0, to show default price on load
        const tier1 = product.tiers[0];
        return { cost: tier1.price, name: tier1.name };
    }

    // Cari tier yang sepadan dengan kuantiti
    for (const tier of product.tiers) {
        if (quantity <= tier.max) {
            return { cost: tier.price, name: tier.name };
        }
    }

    // Fallback to the highest tier if quantity exceeds all defined tiers (shouldn't happen with Infinity)
    const lastTier = product.tiers[product.tiers.length - 1];
    return { cost: lastTier.price, name: lastTier.name };
}

// Make the function globally accessible
window.getResellerCost = getResellerCost;
