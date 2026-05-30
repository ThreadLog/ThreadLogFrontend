import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.ADMIN_EMAIL,
    pass: process.env.ADMIN_EMAIL_PASSWORD,
  },
});

export async function sendSupportMail(data: {
  firstname: string;
  lastname: string;
  email: string;
  message: string;
}) {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return;

  return transporter.sendMail({
    from: `"Support" <${adminEmail}>`,
    to: adminEmail,
    subject: "Ny supportförfrågan",
    text: `
      Namn: ${data.firstname} ${data.lastname}
      Email: ${data.email}
      Meddelande:
      ${data.message}
    `,
  });
}
