using System.Net.Mail;
using System.Net;

namespace ProductManagementAPI.Services
{
    public class EmailService
    {
        public static async Task SendOtp(string toEmail, string otp)
        {
            var message = new MailMessage();
            message.From = new MailAddress("umaimamushtaq09@gmail.com", "Product Hub App");
            message.To.Add(toEmail);
            message.Subject = "Your OTP Code";
            message.Body = $"Your OTP is: {otp}\n\nThis OTP will expire in 5 minutes.";
            message.IsBodyHtml = false;

            var smtp = new SmtpClient("smtp.gmail.com", 587)
            {
                Credentials = new NetworkCredential(
                    "umaimamushtaq09@gmail.com",
                    "ycln nksh tegt ydms"
                ),
                EnableSsl = true
            };

            await smtp.SendMailAsync(message);
        }
    }
}
