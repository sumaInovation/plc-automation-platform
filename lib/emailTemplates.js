export function orderPlacedEmail(order) {
  return {
    subject: `Order Confirmation — ${order.orderNumber}`,
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
        <h2 style="color: #131B22;">Thank you for your order!</h2>
        <p>Hi ${order.deliveryDetails.fullName},</p>
        <p>We've received your order <strong>${order.orderNumber}</strong>. Please complete payment via bank transfer and upload your slip to confirm.</p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          ${order.items.map(item => `
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${item.name} × ${item.qty}</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;">Rs. ${(item.price * item.qty).toLocaleString()}</td>
            </tr>
          `).join('')}
          <tr>
            <td style="padding: 12px 0; font-weight: bold;">Total</td>
            <td style="padding: 12px 0; font-weight: bold; text-align: right;">Rs. ${order.total.toLocaleString()}</td>
          </tr>
        </table>
        <p>Track your order: <a href="https://sumaautomation.lk/dashboard/orders/${order._id}">View Order</a></p>
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