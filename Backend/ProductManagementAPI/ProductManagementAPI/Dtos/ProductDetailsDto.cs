namespace ProductManagementAPI.Dtos
{
    public class ProductDetailsDto
    {
        public string Name { get; set; }=string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string Category { get; set; } = string.Empty;
        public string ImageURL { get; set; }= string.Empty;
        public double Rating { get; set; }
        public int RatingCount { get; set; }
    }
}
