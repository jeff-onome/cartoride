
export const sendEmail = async (to: string, subject: string, body: string) => {
  // In a real application, this would interact with an email service provider like SendGrid, EmailJS, or a backend API.
  // For this demo, we will log the email to the console and show an alert to simulate the action.
  console.log(`%c--- EMAIL SIMULATION ---`, 'color: #22c55e; font-weight: bold;');
  console.log(`%cTo: ${to}`, 'color: #22c55e;');
  console.log(`%cSubject: ${subject}`, 'color: #22c55e;');
  console.log(`%cBody:\n${body}`, 'color: #22c55e;');
  console.log(`%c------------------------`, 'color: #22c55e; font-weight: bold;');
  
  // Return a promise to simulate network delay
  return new Promise<void>((resolve) => {
      setTimeout(() => {
          resolve();
      }, 800);
  });
};
