using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.IO;
using ProductManagementAPI.Dtos;
using ProductManagementAPI.Models;

namespace ProductManagementAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductController : ControllerBase
    {
        private readonly MyDBContext _dbContext;

        public ProductController(MyDBContext dbContext)
        {
            _dbContext = dbContext;
        }

        [HttpGet("ViewProducts")]
        public async Task<IActionResult> GetAllProducts()
        {
            var products = await _dbContext.Products.ToListAsync();
            return Ok(products);
        }

        [HttpGet("ProductById")]
        public async Task<IActionResult> GetProductById(int id)
        {
            var product = await _dbContext.Products
                .Where(p => p.Id == id)
                .Select(p => new ProductDetailsDto
                {
                    Name = p.Name,
                    Description = p.Description,
                    Price = p.Price,
                    Category = p.Category,
                    ImageURL = p.ImageURL,
                    Rating = p.Rating,
                    RatingCount = p.RatingCount
                })
                .FirstOrDefaultAsync();

            if (product == null)
                return NotFound("Product not found");

            return Ok(product);
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("AddProduct")]
        public async Task<IActionResult> AddProduct([FromBody] UpsertProductDto productDto)
        {
            var product = new Product
            {
                Name = productDto.Name,
                Description = productDto.Description,
                Price = productDto.Price,
                Category = productDto.Category,
                ImageURL = productDto.ImageURL,
                Rating = 0,
                RatingCount = 0
            };

            _dbContext.Products.Add(product);
            await _dbContext.SaveChangesAsync();

            return Ok(new { message = "Product added successfully", productId = product.Id });
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("UpdateProduct/{id}")]
        public async Task<IActionResult> UpdateProduct(int id, [FromBody] UpsertProductDto productDto)
        {
            var product = await _dbContext.Products.FindAsync(id);
            if (product == null) return NotFound("Product not found");

            product.Name = productDto.Name;
            product.Description = productDto.Description;
            product.Price = productDto.Price;
            product.Category = productDto.Category;
            product.ImageURL = productDto.ImageURL;

            await _dbContext.SaveChangesAsync();

            return Ok("Product updated successfully");
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("DeleteProduct/{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var product = await _dbContext.Products.FindAsync(id);
            if (product == null) return NotFound("Product not found");

            _dbContext.Products.Remove(product);
            await _dbContext.SaveChangesAsync();

            return Ok("Product deleted successfully");
        }

        /*[Authorize(Roles = "Admin")]
        [HttpPost("UploadImage")]
        public async Task<IActionResult> UploadImage([FromForm] IFormFile image)
        {
            if (image == null || image.Length == 0)
                return BadRequest("No image uploaded");

            var imagesPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "Images");
            if (!Directory.Exists(imagesPath)) Directory.CreateDirectory(imagesPath);

            var fileName = Guid.NewGuid().ToString() + Path.GetExtension(image.FileName);
            var filePath = Path.Combine(imagesPath, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await image.CopyToAsync(stream);
            }

            return Ok(new { fileName });
        }*/
    }
}
