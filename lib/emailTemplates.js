export function orderPlacedEmail(order) {
  const subtotal = order.subtotal ?? order.items.reduce((s, i) => s + (i.price * i.qty), 0) ?? 0;
  const fmt = (n) => Number(n || 0).toLocaleString();

  return {
    subject: `Order Received — ${order.orderNumber} | Delivery Charge Pending`,
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; background: #fff; padding: 24px; border: 1px solid #eee; border-radius: 12px;">
        <h2 style="color: #131B22; margin: 0 0 8px;">Thank you, ${order.deliveryDetails.fullName}! 🎉</h2>
        <p style="color: #555; line-height: 1.6;">We've received your order <strong>${order.orderNumber}</strong>.</p>
        
        <div style="background: #fef3c7; border: 1px solid #fcd34d; padding: 12px 16px; border-radius: 8px; margin: 16px 0;">
          <p style="margin: 0; font-size: 14px; color: #92400e; line-height: 1.5;">
            <strong>📦 Important:</strong> Your delivery charge is being calculated based on your address (${order.deliveryDetails.city}). 
            We will add the delivery fee shortly and notify you via email. Please wait for our confirmation before making the payment.
          </p>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          ${order.items.map(item => `
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-size: 14px;">${item.name} × ${item.qty}</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right; font-size: 14px;">Rs. ${fmt(item.price * item.qty)}</td>
            </tr>
          `).join('')}
          <tr>
            <td style="padding: 12px 0; font-weight: bold;">Items Subtotal</td>
            <td style="padding: 12px 0; font-weight: bold; text-align: right;">Rs. ${fmt(subtotal)}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #d97706; font-size: 13px;">+ Delivery Charge</td>
            <td style="padding: 4px 0; color: #d97706; font-size: 13px; text-align: right;">To be calculated</td>
          </tr>
        </table>

        <p style="font-size: 14px; color: #555;">Delivery to:<br><strong>${order.deliveryDetails.fullName}</strong><br>${order.deliveryDetails.address}, ${order.deliveryDetails.city}<br>${order.deliveryDetails.phone}</p>
        
        <a href="https://sumaautomation.lk/dashboard/orders/${order._id}" style="display: inline-block; background: #131B22; color: white; padding: 12px 20px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 12px; font-size: 14px;">Track Your Order</a>
        <p style="font-size: 12px; color: #999; margin-top: 20px;">- Suma Automation Team</p>
      </div>
    `,
  };
}

export function orderConfirmedEmail(order) {
  return {
    subject: `Payment Confirmed — ${order.orderNumber}`,
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
        <h2 style="color: #3F9142;">✓ Payment Confirmed</h2>
        <p>Hi ${order.deliveryDetails.fullName},</p>
        <p>Your payment for order <strong>${order.orderNumber}</strong> has been confirmed. We're preparing your order for delivery.</p>
        <p>Track your order: <a href="https://sumaautomation.lk/dashboard/orders/${order._id}">View Order</a></p>
      </div>
    `,
  };
}

export function enrollmentConfirmedEmail(enrollment) {
  return {
    subject: `Enrollment Confirmed — ${enrollment.courseName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
        <h2 style="color: #3F9142;">✓ You're enrolled!</h2>
        <p>Your enrollment for <strong>${enrollment.courseName}</strong> (${enrollment.batchName}) has been confirmed.</p>
        <p>We'll be in touch with further details before the course starts.</p>
        <p><a href="https://sumaautomation.lk/dashboard/learning/${enrollment._id}">View Enrollment</a></p>
      </div>
    `,
  };
}

export function deliveryChargeSetEmail(order) {
  const subtotal = order.subtotal ?? order.items.reduce((s, i) => s + (i.price * i.qty), 0) ?? 0;
  const delivery = order.deliveryCharge ?? 0;
  const total = order.total ?? (subtotal + delivery);
  const fmt = (n) => Number(n || 0).toLocaleString();

  return {
    subject: `Delivery Charge Added — ${order.orderNumber} | Pay Now Rs. ${fmt(total)}`,
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; background: #fff; padding: 24px; border: 1px solid #eee; border-radius: 12px;">
        <h2 style="color: #131B22; margin: 0 0 8px;">Delivery Charge Added!</h2>
        <p>Hi ${order.deliveryDetails.fullName},</p>
        <p>Your order <strong>${order.orderNumber}</strong> is ready for payment. Delivery charge for ${order.deliveryDetails.city} has been added.</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0; background: #f9fafb; border-radius: 8px; padding: 12px;">
          <tr>
            <td style="padding: 8px 12px; font-size: 14px;">Items Subtotal</td>
            <td style="padding: 8px 12px; text-align: right; font-size: 14px;">Rs. ${fmt(subtotal)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; font-size: 14px;">Delivery Charge</td>
            <td style="padding: 8px 12px; text-align: right; font-size: 14px;">Rs. ${fmt(delivery)}</td>
          </tr>
          <tr>
            <td style="padding: 12px; font-weight: bold; border-top: 2px solid #131B22; font-size: 16px;">Total to Pay</td>
            <td style="padding: 12px; font-weight: bold; border-top: 2px solid #131B22; text-align: right; font-size: 16px;">Rs. ${fmt(total)}</td>
          </tr>
        </table>

        <div style="background: #eff6ff; border: 1px solid #bfdbfe; padding: 12px 16px; border-radius: 8px; margin: 16px 0;">
          <p style="margin: 0; font-size: 14px; color: #1e40af;"><strong>Next Step:</strong> Please make the bank transfer for <strong>Rs. ${fmt(total)}</strong> and upload your payment slip.</p>
        </div>

        <a href="https://sumaautomation.lk/dashboard/orders/${order._id}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px;">Upload Payment Slip Now</a>
      </div>
    `,
  };
}