// ============================================
// IMPORT 50 PRODUCTS TO STRAPI
// ============================================

const products = require('./products-data');

// ============================================
// STRAPI CONFIGURATION
// ============================================

const STRAPI_URL = 'http://localhost:1337';
const API_TOKEN = 'PASTE_YOUR_API_TOKEN_HERE'; // 👈 REPLACE THIS

// ============================================
// IMPORT SINGLE PRODUCT
// ============================================

async function importProduct(product) {
    try {
        // Prepare the data
        const productData = {
            data: {
                Product_Name: product.Product_Name,
                Price: product.Price,
                Category: product.Category,
                Sub_Type: product.Sub_Type,
                Type: product.Type,
                Rating: product.Rating,
                Description: product.Description,
                Specifications: product.Specifications
            }
        };

        // Send to Strapi
        const response = await fetch(`${STRAPI_URL}/api/products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_TOKEN}`
            },
            body: JSON.stringify(productData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const result = await response.json();
        console.log(`✅ Imported: ${product.Product_Name}`);
        
        // Upload image if we have a product ID
        if (result.data && result.data.id && product.Image) {
            try {
                await uploadImage(result.data.id, product.Image);
                console.log(`   📸 Image uploaded`);
            } catch (imgError) {
                console.log(`   ⚠️ Image upload failed: ${imgError.message}`);
            }
        }
        
        return result;
    } catch (error) {
        console.error(`❌ Failed: ${product.Product_Name}`);
        console.error(`   Error: ${error.message}`);
        return null;
    }
}

// ============================================
// UPLOAD IMAGE
// ============================================

async function uploadImage(productId, imageUrl) {
    try {
        // Download the image
        const imageResponse = await fetch(imageUrl);
        if (!imageResponse.ok) {
            throw new Error(`Failed to download: ${imageResponse.status}`);
        }
        
        const arrayBuffer = await imageResponse.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        // Create form data
        const formData = new FormData();
        const blob = new Blob([buffer], { type: 'image/jpeg' });
        formData.append('files', blob, `product-${productId}.jpg`);
        
        // Upload to Strapi
        const uploadResponse = await fetch(`${STRAPI_URL}/api/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_TOKEN}`
            },
            body: formData
        });
        
        if (!uploadResponse.ok) {
            throw new Error(`Upload failed: ${uploadResponse.status}`);
        }
        
        const uploadResult = await uploadResponse.json();
        const imageId = uploadResult[0]?.id;
        
        if (imageId) {
            // Link image to product
            await fetch(`${STRAPI_URL}/api/products/${productId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${API_TOKEN}`
                },
                body: JSON.stringify({
                    data: { Image: [imageId] }
                })
            });
        }
        
        return true;
    } catch (error) {
        throw new Error(`Image upload failed: ${error.message}`);
    }
}

// ============================================
// MAIN IMPORT FUNCTION
// ============================================

async function importAllProducts() {
    console.log('=================================');
    console.log('🚀 SHOPNAIJA PRODUCT IMPORT');
    console.log('=================================');
    console.log(`📦 Total products: ${products.length}`);
    console.log('=================================\n');

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < products.length; i++) {
        const product = products[i];
        console.log(`[${i + 1}/${products.length}] Importing: ${product.Product_Name}`);
        
        const result = await importProduct(product);
        
        if (result) {
            successCount++;
        } else {
            failCount++;
        }
        
        // Small delay to avoid overwhelming Strapi
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('\n=================================');
    console.log('✅ IMPORT COMPLETE');
    console.log('=================================');
    console.log(`✅ Success: ${successCount} products`);
    console.log(`❌ Failed: ${failCount} products`);
    console.log('=================================');
    console.log('\n🎉 Check your Strapi admin to see the products!');
    console.log('👉 http://localhost:1337/admin/content-manager/collection-types/api::product.product');
}

// ============================================
// RUN
// ============================================

importAllProducts().catch(console.error);