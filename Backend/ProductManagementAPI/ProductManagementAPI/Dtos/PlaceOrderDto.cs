using System.Collections.Generic;

namespace ProductManagementAPI.Dtos
{
    public class PlaceOrderDto
    {
        public List<CartItemDto> CartItems { get; set; } = new();
        public string ShippingAddress { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
    }
}
