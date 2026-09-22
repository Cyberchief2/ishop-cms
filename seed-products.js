// seed-products.js — run with: node seed-products.js
// Bulk-imports products + images into your Strapi backend.

const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch'); // npm install node-fetch@2

const STRAPI_URL = 'http://localhost:1337';
const ADMIN_EMAIL = 'your-admin-email@example.com';   // ← change this
const ADMIN_PASSWORD = 'your-admin-password';          // ← change this

// Real Unsplash image URLs (free for commercial use — no attribution required)
// We download each one, then upload it to Strapi's media library.
const PRODUCTS = [
    // ELECTRONICS
    {
        name: 'Samsung Galaxy S24 Ultra',
        type: 'electronics', price: 1250000, brand: 'Samsung',
        rating: 4.8, inStock: true, icon: '📱',
        description: 'The ultimate Galaxy experience with S Pen, 200MP camera, and Snapdragon 8 Gen 3.',
        imageUrl: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&q=80'
    },
    {
        name: 'iPhone 15 Pro Max',
        type: 'electronics', price: 1450000, brand: 'Apple',
        rating: 4.9, inStock: true, icon: '📱',
        description: 'Titanium design, A17 Pro chip, and the most powerful iPhone camera system yet.',
        imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&q=80'
    },
    {
        name: 'HP Spectre x360 Laptop',
        type: 'electronics', price: 980000, brand: 'HP',
        rating: 4.6, inStock: true, icon: '💻',
        description: 'Premium 2-in-1 convertible laptop with Intel Core Ultra and OLED touch display.',
        imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80'
    },
    {
        name: 'Sony WH-1000XM5 Headphones',
        type: 'electronics', price: 320000, brand: 'Sony',
        rating: 4.8, inStock: true, icon: '🎧',
        description: 'Industry-leading noise cancellation with 30-hour battery life.',
        imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'
    },
    {
        name: 'Samsung 55" QLED Smart TV',
        type: 'electronics', price: 780000, brand: 'Samsung',
        rating: 4.7, inStock: true, icon: '📺',
        description: 'Quantum Dot technology, 4K resolution, and built-in Alexa.',
        imageUrl: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&q=80'
    },
    {
        name: 'Apple Watch Series 9',
        type: 'electronics', price: 420000, brand: 'Apple',
        rating: 4.8, inStock: true, icon: '⌚',
        description: 'Advanced health sensors, always-on Retina display, and S9 chip.',
        imageUrl: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&q=80'
    },

    // FASHION
    {
        name: 'Floral Summer Dress',
        type: 'fashion', price: 18500, brand: 'Zara',
        rating: 4.5, inStock: true, icon: '👗',
        description: 'Lightweight breathable fabric with a flattering A-line cut.',
        imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80'
    },
    {
        name: 'Classic Oxford Shirt',
        type: 'fashion', price: 13500, brand: 'H&M',
        rating: 4.4, inStock: true, icon: '👔',
        description: 'Timeless Oxford shirt in premium cotton.',
        imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80'
    },
    {
        name: 'Ankara Print Gown',
        type: 'fashion', price: 28000, brand: 'Naija Couture',
        rating: 4.9, inStock: true, icon: '👗',
        description: 'Vibrant handmade Ankara gown with tailored fit.',
        imageUrl: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=800&q=80'
    },
    {
        name: 'White Sneakers',
        type: 'fashion', price: 25000, brand: 'Nike',
        rating: 4.7, inStock: true, icon: '👟',
        description: 'Clean minimal sneakers with cushioned soles.',
        imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80'
    },
    {
        name: 'Leather Handbag',
        type: 'fashion', price: 38000, brand: 'Michael Kors',
        rating: 4.6, inStock: true, icon: '👜',
        description: 'Genuine leather handbag with gold-tone hardware.',
        imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80'
    },
    {
        name: 'Gold Necklace',
        type: 'fashion', price: 55000, brand: 'Pandora',
        rating: 4.8, inStock: true, icon: '📿',
        description: '18K gold-plated pendant necklace.',
        imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80'
    },

    // BEAUTY
    {
        name: 'Vitamin C Face Serum',
        type: 'beauty', price: 15500, brand: 'The Ordinary',
        rating: 4.7, inStock: true, icon: '🧴',
        description: 'Brightening serum with 20% Vitamin C and hyaluronic acid.',
        imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80'
    },
    {
        name: 'Matte Lipstick Set',
        type: 'beauty', price: 12000, brand: 'MAC',
        rating: 4.6, inStock: true, icon: '💄',
        description: 'Set of 5 long-lasting matte lipsticks in trending shades.',
        imageUrl: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800&q=80'
    },
    {
        name: 'Luxury Perfume 100ml',
        type: 'beauty', price: 45000, brand: 'Chanel',
        rating: 4.9, inStock: true, icon: '🌸',
        description: 'Long-lasting luxury fragrance with floral and woody notes.',
        imageUrl: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80'
    },
    {
        name: 'Hair Growth Oil',
        type: 'beauty', price: 8500, brand: 'Shea Moisture',
        rating: 4.5, inStock: true, icon: '💇',
        description: 'Natural oil blend that promotes hair growth and shine.',
        imageUrl: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=800&q=80'
    },
    {
        name: 'Sunscreen SPF 50',
        type: 'beauty', price: 9800, brand: 'Neutrogena',
        rating: 4.7, inStock: true, icon: '☀️',
        description: 'Broad-spectrum SPF 50 — lightweight, non-greasy formula.',
        imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&q=80'
    },

    // DIGITAL
    {
        name: 'Pro Photo Editor',
        type: 'digital', price: 12500, brand: 'Adobe',
        rating: 4.7, inStock: true, icon: '🖥️',
        description: 'Professional photo editing suite with AI-powered tools.',
        imageUrl: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&q=80'
    },
    {
        name: 'Naija Business E-Book',
        type: 'digital', price: 3200, brand: 'ShopNaija',
        rating: 4.6, inStock: true, icon: '📘',
        description: 'Learn how to start and scale a business in Nigeria.',
        imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80'
    },
    {
        name: 'Digital Marketing Course',
        type: 'digital', price: 18000, brand: 'ShopNaija',
        rating: 4.8, inStock: true, icon: '🎓',
        description: 'Complete 12-week course covering SEO, ads, and social media.',
        imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80'
    },
    {
        name: 'Resume Template Pack',
        type: 'digital', price: 2500, brand: 'ShopNaija',
        rating: 4.5, inStock: true, icon: '📄',
        description: '25 professional resume and CV templates.',
        imageUrl: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&q=80'
    },
    {
        name: 'Antivirus Pro (1yr)',
        type: 'digital', price: 9800, brand: 'Norton',
        rating: 4.6, inStock: true, icon: '🛡️',
        description: 'One-year protection for up to 5 devices.',
        imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&q=80'
    }
];

// ─────────────────────────────────────────────
// 1. Log in as admin to get a JWT
// ─────────────────────────────────────────────
async function login() {
    const res = await fetch(`${STRAPI_URL}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
    });
    if (!res.ok) throw new Error(`Login failed: ${res.status}`);
    const json = await res.json();
    return json.data.token;
}

// ─────────────────────────────────────────────
// 2. Download an image from a URL
// ─────────────────────────────────────────────
async function downloadImage(url) {
    const res = await fetch(url);
    const buffer = await res.buffer();
    const ext = 'jpg';
    const filename = `product-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const tmpPath = path.join(__dirname, 'tmp-' + filename);
    fs.writeFileSync(tmpPath, buffer);
    return tmpPath;
}

// ─────────────────────────────────────────────
// 3. Upload an image to Strapi's media library
// ─────────────────────────────────────────────
async function uploadImage(filePath, token) {
    const FormData = require('form-data');
    const form = new FormData();
    form.append('files', fs.createReadStream(filePath));

    const res = await fetch(`${STRAPI_URL}/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form
    });
    if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
    const json = await res.json();
    fs.unlinkSync(filePath); // delete temp file
    return json[0].id; // media ID
}

// ─────────────────────────────────────────────
// 4. Create a product entry
// ─────────────────────────────────────────────
async function createProduct(product, imageId, token) {
    const body = {
        data: {
            name: product.name,
            type: product.type,
            price: product.price,
            brand: product.brand,
            rating: product.rating,
            inStock: product.inStock,
            icon: product.icon,
            description: product.description,
            image: imageId
        }
    };

    const res = await fetch(`${STRAPI_URL}/api/products`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
    });

    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Create product "${product.name}" failed: ${err}`);
    }
    return (await res.json()).data;
}

// ─────────────────────────────────────────────
// 5. Main
// ─────────────────────────────────────────────
async function main() {
    console.log('🔐 Logging in to Strapi...');
    const token = await login();
    console.log('✅ Logged in.');

    for (const product of PRODUCTS) {
        try {
            console.log(`⬇️  Downloading image for "${product.name}"...`);
            const tmpPath = await downloadImage(product.imageUrl);

            console.log(`⬆️  Uploading image to Strapi...`);
            const imageId = await uploadImage(tmpPath, token);

            console.log(`📦 Creating product "${product.name}"...`);
            const created = await createProduct(product, imageId, token);
            console.log(`   ✅ Created with id ${created.id}`);
        } catch (err) {
            console.error(`   ❌ ${err.message}`);
        }
    }

    console.log('\n🎉 Done! Open Strapi admin to see your products.');
}

main().catch(console.error);