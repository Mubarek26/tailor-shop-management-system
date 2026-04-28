const cron = require('node-cron');
const Order = require('./orders.model');
const sendEmail = require('../../utils/email');

const checkOverdueAppointments = async () => {
    console.log('Running scheduled job: checkOverdueAppointments');
    try {
        const now = new Date();

        // Find orders where appointment_date is in the past, and status is not completed
        const overdueOrders = await Order.find({
            appointment_date: { $lt: now },
            status: { $ne: 'completed' }
        }).populate('customer_id').populate('owner_id').populate('assigned_tailor_id');

        console.log(`Found ${overdueOrders.length} overdue orders`);

        for (const order of overdueOrders) {
            const customerName = order.customer_id?.name || 'Customer';
            const orderId = order._id.toString().slice(-6);
            const appointmentDate = order.appointment_date.toLocaleDateString();

            // Notify Owner
            if (order.owner_id?.email) {
                await sendEmail({
                    email: order.owner_id.email,
                    subject: `⚠️ Overdue Appointment: Order #${orderId}`,
                    message: `The appointment for customer ${customerName} (Order #${orderId}) was scheduled for ${appointmentDate} and is now overdue. Please check the status of this order.`,
                    html: `
            <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
              <h2 style="color: #e11d48;">Overdue Appointment Alert</h2>
              <p>The appointment for <strong>${customerName}</strong> (Order #${orderId}) is now overdue.</p>
              <p><strong>Scheduled Date:</strong> ${appointmentDate}</p>
              <p><strong>Current Status:</strong> ${order.status}</p>
              <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
              <p style="font-size: 14px; color: #666;">Please log in to the dashboard to update the order status or contact the tailor.</p>
            </div>
          `
                }).catch(err => console.error(`Failed to send email to owner ${order.owner_id.email}:`, err.message));
            }

            // Notify Tailor
            if (order.assigned_tailor_id?.email) {
                await sendEmail({
                    email: order.assigned_tailor_id.email,
                    subject: `📋 Reminder: Overdue Order #${orderId}`,
                    message: `Hi ${order.assigned_tailor_id.fullName}, the order for ${customerName} is now past its appointment date (${appointmentDate}). Please update the order status if it's already in progress or completed.`,
                    html: `
            <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
              <h2 style="color: #2563eb;">Overdue Order Reminder</h2>
              <p>Hi ${order.assigned_tailor_id.fullName},</p>
              <p>The order for <strong>${customerName}</strong> (Order #${orderId}) is now past its appointment date.</p>
              <p><strong>Scheduled Date:</strong> ${appointmentDate}</p>
              <p><strong>Current Status:</strong> ${order.status}</p>
              <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
              <p style="font-size: 14px; color: #666;">Please ensure the work is on track and update the status in your portal.</p>
            </div>
          `
                }).catch(err => console.error(`Failed to send email to tailor ${order.assigned_tailor_id.email}:`, err.message));
            }
        }
    } catch (error) {
        console.error('Error in checkOverdueAppointments job:', error);
    }
};

// Schedule the job to run every day at 8:00 AM
const initOrdersJobs = () => {
    // '0 8 * * *' runs every day at 08:00
    // For testing purposes, you might want to run it more frequently, 
    // but for production daily is usually enough.
    cron.schedule('0 8 * * *', checkOverdueAppointments);
    console.log('Orders jobs initialized');
};

module.exports = { initOrdersJobs, checkOverdueAppointments };
