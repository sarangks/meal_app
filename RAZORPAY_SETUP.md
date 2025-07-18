# Razorpay Integration Setup Guide

## Quick Setup (10 minutes)

### 1. Create Razorpay Account

1. Go to [razorpay.com](https://razorpay.com/) and sign up
2. Complete business verification
3. Go to **Dashboard** → **Settings** → **API Keys**
4. Generate **Test Mode** API keys first
5. Copy your **Key ID** (starts with `rzp_test_`)

### 2. Update Configuration

Replace the demo key in `client/lib/razorpayService.ts`:

```typescript
const RAZORPAY_CONFIG = {
  key_id: "rzp_test_your_actual_key_here", // Replace this
  currency: "INR",
  company_name: "College Canteen",
  company_logo: "", // Optional: Add your logo URL
  theme_color: "#22c55e",
};
```

### 3. Test the Integration

1. Run your app: `npm run dev`
2. Go to `/student` page
3. Fill order form and select "Pay with Razorpay"
4. Click payment button
5. Use Razorpay test cards:
   - **Card**: 4111 1111 1111 1111
   - **CVV**: Any 3 digits
   - **Expiry**: Any future date

### 4. Enable UPI/QR Code

In Razorpay Dashboard:

1. Go to **Settings** → **Payment Methods**
2. Enable **UPI**
3. Enable **QR Code**
4. Save settings

## Payment Flow

### Student Experience:

1. **Fill order form** (Name, Roll, Item)
2. **Choose payment method**:
   - 💳 **Pay with Razorpay** (UPI/Cards/Net Banking)
   - 💰 **Add to Account** (Pay at counter)
3. **Razorpay checkout** opens with:
   - ✅ **UPI apps** (GPay, PhonePe, Paytm)
   - ✅ **QR code** for UPI scan
   - ✅ **Credit/Debit cards**
   - ✅ **Net banking**
4. **Payment confirmation** → Order auto-marked as "Paid"

### Admin Dashboard:

- ✅ **Real-time order updates**
- ✅ **Payment method badges** (Razorpay/Account)
- ✅ **Razorpay payment IDs** for verification
- ✅ **Online revenue tracking**
- ✅ **Separate statistics** for online vs counter payments

## Firestore Data Structure

Orders now include Razorpay fields:

```typescript
{
  name: "John Doe",
  roll: "CS2021001",
  item: "Veg Meal",
  price: 40,
  paymentStatus: "Paid" | "Unpaid",
  paymentMethod: "Razorpay" | "Account" | "Counter",
  payment_id: "pay_1234567890", // Razorpay payment ID
  timestamp: Timestamp,
  date: "2024-01-15"
}
```

## Production Setup

### 1. Go Live

1. Complete **KYC verification** in Razorpay dashboard
2. Switch to **Live Mode**
3. Generate **Live API keys**
4. Update `key_id` with live key (`rzp_live_...`)

### 2. Webhook Setup (Optional)

For advanced payment verification:

1. Go to **Settings** → **Webhooks**
2. Add endpoint: `your-domain.com/api/razorpay-webhook`
3. Select events: `payment.captured`, `payment.failed`

## Security Features

✅ **Payment verification** via Razorpay payment ID
✅ **Automatic order status** updates
✅ **Error handling** for failed payments
✅ **User-friendly** payment flow
✅ **Mobile-responsive** checkout
✅ **Real-time** admin updates

## Razorpay Pricing

**No setup fees**, pay per transaction:

- **Domestic payments**: 2% + GST
- **International**: 3% + GST
- **UPI**: 0.8% + GST (lower cost!)

Perfect for college canteen with low transaction amounts!

## Features Available

### Student Features:

- 💳 **Multiple payment options** (UPI/Cards/Net Banking)
- 📱 **Mobile-friendly** checkout
- ⚡ **Instant payment** confirmation
- 🔒 **Secure payment** processing

### Admin Features:

- 📊 **Payment analytics** (Online vs Counter)
- 🔍 **Payment verification** via Razorpay IDs
- 💰 **Revenue tracking** by payment method
- ⏱️ **Real-time updates** when payments complete

## Troubleshooting

**Payment window doesn't open?**

- Check browser console for errors
- Verify Razorpay script is loaded
- Ensure key_id is correct

**Payments fail?**

- Check Razorpay dashboard for failed payments
- Verify test card details
- Check network connection

**Orders not saving after payment?**

- Check browser console for Firestore errors
- Verify Firebase configuration
- Check network connectivity

## Support

- **Razorpay Docs**: [razorpay.com/docs](https://razorpay.com/docs)
- **Test Cards**: [razorpay.com/docs/payments/payments/test-card-details](https://razorpay.com/docs/payments/payments/test-card-details)
- **UPI Testing**: Use any UPI app in test mode
