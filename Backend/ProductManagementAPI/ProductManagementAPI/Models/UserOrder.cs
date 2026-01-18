namespace ProductManagementAPI.Models
{
    public class UserOrder:BaseClass
    {
        public int UserId { get; set; }
        public User User { get; set; } = null!;

        public int TotalAmount { get; set; }
        public int DeliveryFee { get; set; } = 300;
        public string ShippingAddress { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;

        public string Status { get; set; } = "Pending"; 

        // Navigation property
        public List<OrderItem> OrderItems { get; set; } = new();
    }
}
