import nodemailer from 'nodemailer';

const sendEmail = async (options: any) => {
  // 1) Create a transporter
  const transporter = nodemailer.createTransport({
    host: 'smtp.mailtrap.io',
    port: 2525,
    auth: {
      user: '6394957c1083bf',
      pass: 'd4801b10bd00eb',
    },
  });

  // 2) Define the email options
  const mailOptions = {
    from: 'harvey huynh <thienhuynh.it@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html:
  };

  // 3) Actually send the email
  await transporter.sendMail(mailOptions);
};

export default sendEmail;
