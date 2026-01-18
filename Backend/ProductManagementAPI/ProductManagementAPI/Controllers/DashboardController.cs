using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProductManagementAPI.Dtos;
using ProductManagementAPI.Models;

namespace ProductManagementAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class DashboardController : ControllerBase
    {
        private readonly MyDBContext _dbContext;

        public DashboardController(MyDBContext dbContext)
        {
            _dbContext = dbContext;
        }

        [HttpGet("Stats")]
        public async Task<IActionResult> GetStats()
        {
            var totalSales = await _dbContext.UserOrders.CountAsync();
            
            var lastWeek = DateTime.Now.AddDays(-7);
            var newCustomersLastWeek = await _dbContext.Users
                .Where(u => u.Role == "User" && u.CreatedAt >= lastWeek && !u.IsDeleted)
                .CountAsync();

            var totalCustomers = await _dbContext.Users
                .Where(u => u.Role == "User" && !u.IsDeleted)
                .CountAsync();

            return Ok(new DashboardStatsDto
            {
                TotalSales = totalSales,
                NewCustomersLastWeek = newCustomersLastWeek,
                TotalCustomers = totalCustomers
            });
        }
    }
}
