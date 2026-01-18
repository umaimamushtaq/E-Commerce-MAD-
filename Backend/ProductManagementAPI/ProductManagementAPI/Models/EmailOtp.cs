namespace ProductManagementAPI.Models
{
    public class EmailOtp
    {
        public int Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public string Otp { get; set; } = string.Empty;
        public DateTime ExpiryTime { get; set; }
    }
}
