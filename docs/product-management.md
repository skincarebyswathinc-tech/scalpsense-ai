# Product Management Guide

## Product Types

### 1. Inventory-Based Products
- Tracked with quantity field
- Fields: name, brand, description, price, quantity, category, images
- Stock automatically tracked

### 2. External Link Products
- Links to external purchase URLs
- Fields: name, description, purchase URL, preview image, pricing

## Payment Links
- Each product can have a configurable payment link
- Users are redirected to this link when clicking "Buy Now"
- Supports any payment provider URL (Stripe, Razorpay, PayPal, etc.)

## Product Categories
- Shampoo
- Conditioner
- Serum / Oil
- Supplement
- Tool / Device

## Product Tiers
- **Free**: Visible to all users
- **Premium**: Only visible to premium subscribers

## Target Configuration
- **Scalp Types**: dry, balanced, slightly_oily, very_oily
- **Symptoms**: Products can target specific symptoms for personalized recommendations

## Managing Products
1. Navigate to `/admin/products`
2. Click "Add Product" to create a new product
3. Fill in all required fields
4. Set product type (inventory or external link)
5. Configure payment link if applicable
6. Set target scalp types and symptoms for recommendation engine
