namespace ProductManagementAPI.Dtos
{
    public class UpsertProductDto
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int Price { get; set; }
        public string Category { get; set; } = string.Empty;
        public string ImageURL { get; set; } = string.Empty;
    }
}
