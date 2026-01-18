using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProductManagementAPI.Dtos;
using ProductManagementAPI.Models;

namespace ProductManagementAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrderController : ControllerBase
    {
        private readonly MyDBContext _dbContext;

        public OrderController(MyDBContext dbContext)
        {
            _dbContext = dbContext;
        }

        [HttpPost("PlaceOrder")]
        public async Task<IActionResult> PlaceOrder([FromBody] PlaceOrderDto orderDto)
        {
            // Get UserId from JWT
            var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == "UserId");
            if (userIdClaim == null)
                return Unauthorized("Invalid token");

            int userId = int.Parse(userIdClaim.Value);

            if (orderDto.CartItems == null || !orderDto.CartItems.Any())
                return BadRequest("Cart is empty");

            if (string.IsNullOrWhiteSpace(orderDto.ShippingAddress) || string.IsNullOrWhiteSpace(orderDto.PhoneNumber))
                return BadRequest("Shipping address and phone number are required");

            int productsTotal = 0;
            var orderItems = new List<OrderItem>();

            foreach (var item in orderDto.CartItems)
            {
                var product = await _dbContext.Products.FindAsync(item.ProductId);
                if (product == null) return NotFound($"Product with id {item.ProductId} not found");

                orderItems.Add(new OrderItem
                {
                    ProductId = product.Id,
                    Quantity = item.Quantity,
                    UnitPrice = product.Price
                });

                productsTotal += product.Price * item.Quantity;
            }

            var order = new UserOrder
            {
                UserId = userId,
                TotalAmount = productsTotal + 300, // Fixed 300 Delivery Charge
                DeliveryFee = 300,
                ShippingAddress = orderDto.ShippingAddress,
                PhoneNumber = orderDto.PhoneNumber,
                Status = "Pending",
                OrderItems = orderItems
            };

            _dbContext.UserOrders.Add(order);
            await _dbContext.SaveChangesAsync();

            return Ok(new { orderId = order.Id, message = "Order placed successfully" });
        }

        [HttpGet("OrderHistory")]
        public async Task<IActionResult> GetOrderHistory()
        {
            var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == "UserId");
            if (userIdClaim == null) return Unauthorized("Invalid token");
            int userId = int.Parse(userIdClaim.Value);

            var orders = await _dbContext.UserOrders
                .Where(o => o.UserId == userId)
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();

            return Ok(orders);
        }

        [HttpPost("MarkAsReceived/{orderId}")]
        public async Task<IActionResult> MarkAsReceived(int orderId)
        {
            var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == "UserId");
            if (userIdClaim == null) return Unauthorized("Invalid token");
            int userId = int.Parse(userIdClaim.Value);

            var order = await _dbContext.UserOrders.FirstOrDefaultAsync(o => o.Id == orderId && o.UserId == userId);
            if (order == null) return NotFound("Order not found");

            order.Status = "Completed";
            await _dbContext.SaveChangesAsync();

            return Ok("Order marked as completed");
        }

        [HttpGet("AllOrders")]
        public async Task<IActionResult> GetAllOrders()
        {
            var orders = await _dbContext.UserOrders
                .Include(o => o.User)
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();

            return Ok(orders);
        }
    }
}

