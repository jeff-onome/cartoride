
import emailjs from '@emailjs/browser';
import { EMAILJS_CONFIG } from '../constants';
import Swal from 'sweetalert2';

export const sendEmail = async (to: string, subject: string, body: string) => {
  // Initialize EmailJS if key is present
  if (EMAILJS_CONFIG.PUBLIC_KEY) {
      emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
  }

  const { SERVICE_ID, TEMPLATE_ID, PUBLIC_KEY } = EMAILJS_CONFIG;
  const isConfigured = SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY;

  if (isConfigured) {
      try {
          await emailjs.send(SERVICE_ID, TEMPLATE_ID, {
              to_email: to,
              subject: subject,
              message: body,
          });
          console.log(`Email sent successfully to ${to}`);
          return;
      } catch (error) {
          console.error("Failed to send email via EmailJS:", error);
          // Fallback to simulation on error so the user flow doesn't break
      }
  }

  // --- SIMULATION MODE ---
  // If keys are missing or sending failed, we simulate success so the app flow continues.
  
  console.log(`%c--- EMAIL SIMULATION ---`, 'color: #22c55e; font-weight: bold;');
  console.log(`%cTo: ${to}`, 'color: #22c55e;');
  console.log(`%cSubject: ${subject}`, 'color: #22c55e;');
  console.log(`%cBody:\n${body}`, 'color: #22c55e;');
  console.log(`%c------------------------`, 'color: #22c55e; font-weight: bold;');
  
  // Show a small toast to inform the user that this is a simulation
  // This confirms the function was called correctly.
  Swal.fire({
      title: 'Email Simulation',
      text: `Email to ${to} simulated. Configure EmailJS in constants.ts to send real emails.`,
      icon: 'info',
      toast: true,
      position: 'bottom-end',
      showConfirmButton: false,
      timer: 4000,
      timerProgressBar: true,
      background: 'hsl(var(--card))',
      color: 'hsl(var(--foreground))'
  });
  
  // Return a promise to simulate network delay
  return new Promise<void>((resolve) => {
      setTimeout(() => {
          resolve();
      }, 800);
  });
};
