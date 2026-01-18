namespace ProductManagementAPI.Models
{
    public class Product : BaseClass
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int Price { get; set; }
        public string Category { get; set; } = string.Empty;
        public string ImageURL { get; set; } = string.Empty;
        public float Rating {  get; set; }
        public int RatingCount {  get; set; }

        public List<OrderItem> OrderItems { get; set; } = new();
    }
}
