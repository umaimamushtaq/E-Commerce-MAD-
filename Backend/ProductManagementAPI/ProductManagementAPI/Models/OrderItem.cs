using System.ComponentModel.DataAnnotations.Schema;

namespace ProductManagementAPI.Models
{
    public class OrderItem:BaseClass
    {
        public int OrderId { get; set; }
        public UserOrder Order { get; set; } = null!;

        public int ProductId { get; set; }
        public Product Product { get; set; } = null!;

        public int Quantity { get; set; }

        public int UnitPrice { get; set; }
    }
}
