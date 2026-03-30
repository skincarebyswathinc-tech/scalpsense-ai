# Payment Link Configuration

## Overview
ScalpSense uses admin-configurable payment links rather than direct gateway integration.

## How It Works
1. Admin sets a payment link URL for each product in the admin panel
2. When users click "Buy Now", they are redirected to the payment link
3. Payment processing happens on the external platform

## Supported Payment Providers
Any URL-based payment provider works:
- **Stripe Payment Links**: `https://buy.stripe.com/...`
- **Razorpay**: `https://rzp.io/...`
- **PayPal**: `https://www.paypal.com/...`
- **Custom checkout pages**: Any HTTPS URL

## Configuration Steps
1. Go to Admin → Products
2. Select or create a product
3. Enter the payment link URL in the "Payment Link" field
4. Save the product

## Tracking
- Product clicks are tracked in the `product_clicks` table
- Click types: `view`, `buy_click`, `payment_link`
