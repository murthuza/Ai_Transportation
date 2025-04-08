import mail from '@sendgrid/mail';
import { RouteWithDetails } from '@shared/schema';
import { formatDuration, formatPrice } from '../client/src/lib/utils';

// Check if the API key is set
if (!process.env.SENDGRID_API_KEY) {
  console.warn("Warning: SENDGRID_API_KEY is not set. Email functionality will not work.");
} else {
  mail.setApiKey(process.env.SENDGRID_API_KEY);
}

export interface EmailParams {
  to: string;
  subject: string;
  text: string;
  html: string;
}

/**
 * Send an email using SendGrid
 */
export async function sendEmail(params: EmailParams): Promise<boolean> {
  try {
    if (!process.env.SENDGRID_API_KEY) {
      throw new Error("SENDGRID_API_KEY environment variable is not set");
    }
    
    await mail.send({
      to: params.to,
      from: 'travel@smartcities.india.com', // Replace with your verified sender
      subject: params.subject,
      text: params.text,
      html: params.html,
    });
    
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}

/**
 * Generate an email confirmation for a travel route
 */
export function generateRouteConfirmationEmail(
  route: RouteWithDetails,
  userEmail: string,
  userName: string
): EmailParams {
  const subject = `Travel Confirmation: ${route.originCity.name} to ${route.destinationCity.name}`;
  
  const transportMode = route.transportMode.name;
  const provider = route.provider;
  const price = formatPrice(route.price);
  const duration = formatDuration(route.duration);
  const departureTime = route.departureTime;
  const arrivalTime = route.arrivalTime;
  
  // Ensure amenities is an array
  const amenities = Array.isArray(route.amenities) ? route.amenities : [];
  
  // Plain text version
  const text = `
    Dear ${userName},
    
    Thank you for choosing Smart Cities Transportation System!
    
    Your travel details:
    
    From: ${route.originCity.name}
    To: ${route.destinationCity.name}
    Transport: ${transportMode} (${provider})
    Departure: ${departureTime}
    Arrival: ${arrivalTime}
    Duration: ${duration}
    Price: ${price}
    
    Amenities included: ${amenities.join(', ')}
    
    Description: ${route.description}
    
    Have a safe journey!
    Smart Cities Transportation Team
  `;
  
  // Generate amenities list items HTML
  const amenitiesHtml = amenities.map((amenity: string) => `<li>${amenity}</li>`).join('');
  
  // HTML version with styling
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
        }
        .header {
          background-color: #4f46e5;
          color: white;
          padding: 20px;
          text-align: center;
          border-radius: 5px 5px 0 0;
        }
        .content {
          padding: 20px;
          border: 1px solid #ddd;
          border-top: none;
          border-radius: 0 0 5px 5px;
        }
        .route-details {
          margin: 20px 0;
          padding: 15px;
          background-color: #f9fafb;
          border-radius: 5px;
        }
        .detail-row {
          display: flex;
          margin-bottom: 10px;
        }
        .detail-label {
          font-weight: bold;
          width: 110px;
        }
        .amenities {
          margin-top: 20px;
          padding: 10px;
          background-color: #f0f9ff;
          border-radius: 5px;
        }
        .footer {
          margin-top: 30px;
          text-align: center;
          font-size: 0.9em;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Travel Confirmation</h1>
      </div>
      <div class="content">
        <p>Dear ${userName},</p>
        <p>Thank you for choosing Smart Cities Transportation System!</p>
        
        <div class="route-details">
          <h2>${route.originCity.name} to ${route.destinationCity.name}</h2>
          
          <div class="detail-row">
            <div class="detail-label">Transport:</div>
            <div>${transportMode} (${provider})</div>
          </div>
          
          <div class="detail-row">
            <div class="detail-label">Departure:</div>
            <div>${departureTime}</div>
          </div>
          
          <div class="detail-row">
            <div class="detail-label">Arrival:</div>
            <div>${arrivalTime}</div>
          </div>
          
          <div class="detail-row">
            <div class="detail-label">Duration:</div>
            <div>${duration}</div>
          </div>
          
          <div class="detail-row">
            <div class="detail-label">Price:</div>
            <div>${price}</div>
          </div>
          
          <div class="amenities">
            <h3>Amenities included:</h3>
            <ul>
              ${amenitiesHtml}
            </ul>
          </div>
          
          <p><strong>Description:</strong> ${route.description}</p>
        </div>
        
        <p>Have a safe journey!</p>
        <p>Smart Cities Transportation Team</p>
        
        <div class="footer">
          <p>This is an automated confirmation email. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return {
    to: userEmail,
    subject,
    text,
    html
  };
}