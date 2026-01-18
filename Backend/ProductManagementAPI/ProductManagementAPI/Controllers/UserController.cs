using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProductManagementAPI.Dtos;
using ProductManagementAPI.Models;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using ProductManagementAPI.Services;


namespace ProductManagementAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly MyDBContext _dbContext;

        public UserController(MyDBContext dbContext)
        {
            _dbContext = dbContext;
        }

        [HttpPost("SendOtp")]
        public async Task<IActionResult> SendOtp(SendOtpDto sendOtpDto)
        {
            if (await _dbContext.Users.AnyAsync(u => u.Email == sendOtpDto.Email))
                return BadRequest("Email already in use");

            if (await _dbContext.Users.AnyAsync(u => u.Username == sendOtpDto.Username))
                return BadRequest("Username already exist");

            var otp = new Random().Next(100000, 999999).ToString();

            var passwordHasher = new PasswordHasher<ProductManagementAPI.Models.User>();
            var hashedPassword = passwordHasher.HashPassword(null!, sendOtpDto.Password);

            var existingOtp = await _dbContext.EmailOtps
                .FirstOrDefaultAsync(x => x.Email == sendOtpDto.Email);

            if (existingOtp != null)
                _dbContext.EmailOtps.Remove(existingOtp);

            _dbContext.EmailOtps.Add(new EmailOtp
            {
                Email = sendOtpDto.Email,
                Username = sendOtpDto.Username,
                PasswordHash = hashedPassword,
                Otp = otp,
                ExpiryTime = DateTime.UtcNow.AddMinutes(5)

            });

            await _dbContext.SaveChangesAsync();

            // Send Email 
            await EmailService.SendOtp(sendOtpDto.Email, otp);

            return Ok("OTP sent to email");
        }

        [HttpPost("VerifyOtp")]
        public async Task<IActionResult> VerifyOtp(VerifyOtpDto verifyOtpDto)
        {
            var otpEntry = await _dbContext.EmailOtps
                .FirstOrDefaultAsync(x =>
                    x.Email == verifyOtpDto.Email &&
                    x.Otp == verifyOtpDto.Otp &&
                    x.ExpiryTime > DateTime.UtcNow);

            if (otpEntry == null)
                return BadRequest("Invalid or expired OTP");

            var user = new ProductManagementAPI.Models.User
            {
                Email = otpEntry.Email,
                Username = otpEntry.Username,
                Role = "User",
                Password = otpEntry.PasswordHash
            };

            _dbContext.Users.Add(user);
            _dbContext.EmailOtps.Remove(otpEntry);

            await _dbContext.SaveChangesAsync();

            return Ok("Registration successful");
        }



        /*[HttpPost("Register")]
        public async Task<IActionResult> Register(SignupDto signupDto)

        {

            if (await _dbContext.Users.AnyAsync(u => u.Email == signupDto.Email))
                return BadRequest("Email is already in use");

            if (await _dbContext.Users.AnyAsync(u => u.Username == signupDto.Username))
                return BadRequest("Username already exist");


            var user = new User
            {
                Email = signupDto.Email,
                Username = signupDto.Username,
                Role = "User",
                Password = signupDto.Password
            };

            var PasswordHasher = new PasswordHasher<User>();
            user.Password = PasswordHasher.HashPassword(user, signupDto.Password);

            _dbContext.Users.Add(user);
            await _dbContext.SaveChangesAsync();

            return Ok("Registration Sucessful");

        }*/

        [HttpPost("Login")]
        public async Task<IActionResult> Login(LoginDto loginDto)
        {
            var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Username == loginDto.Username && !u.IsDeleted);

            if (user == null)
                return BadRequest("Invalid Username or Password");

            var PasswordHasher = new PasswordHasher<ProductManagementAPI.Models.User>();
            var result = PasswordHasher.VerifyHashedPassword(user, user.Password, loginDto.Password);

            if (result == PasswordVerificationResult.Failed)
                return BadRequest("Invalid Username or Password");

            var jwtConfig = HttpContext.RequestServices.GetRequiredService<IConfiguration>().GetSection("JwtConfig");

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Username),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role),
                new Claim("UserId", user.Id.ToString())
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtConfig["Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: jwtConfig["Issuer"],
                audience: jwtConfig["Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(double.Parse(jwtConfig["TokenValidityMins"]!)),
                signingCredentials: creds
            );

            var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

            return Ok(new
            {
                token = tokenString,
                user = new
                {
                    user.Username,
                    user.Email,
                    user.Role
                }
            });

        }

        [HttpPost("ChangePassword")]
        [Authorize] 
        public async Task<IActionResult> ChangePassword(ChangePasswordDto dto)
        {
            // Get UserId from JWT
            var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == "UserId");
            if (userIdClaim == null)
                return Unauthorized("Invalid token");

            int userId = int.Parse(userIdClaim.Value);

            // Find user and check IsDeleted
            var user = await _dbContext.Users
                .FirstOrDefaultAsync(u => u.Id == userId && !u.IsDeleted);

            if (user == null)
                return NotFound("User not found");

            var passwordHasher = new PasswordHasher<ProductManagementAPI.Models.User>();

            // Verify old password
            var verifyResult = passwordHasher.VerifyHashedPassword(
                user,
                user.Password,
                dto.OldPassword
            );

            if (verifyResult == PasswordVerificationResult.Failed)
                return BadRequest("Old password is incorrect");

            //Hash and update new password
            user.Password = passwordHasher.HashPassword(user, dto.NewPassword);

            _dbContext.Users.Update(user);
            await _dbContext.SaveChangesAsync();

            return Ok("Password changed successfully");
        }

        [HttpGet("Profile")]
        [Authorize]
        public async Task<IActionResult> GetProfile()
        {
            var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == "UserId");
            if (userIdClaim == null) return Unauthorized("Invalid token");
            int userId = int.Parse(userIdClaim.Value);

            var user = await _dbContext.Users.FindAsync(userId);
            if (user == null) return NotFound("User not found");

            return Ok(new
            {
                user.Username,
                user.Email,
                user.Phone,
                user.Gender,
                user.Address
            });
        }

        [HttpPut("UpdateProfile")]
        [Authorize]
        public async Task<IActionResult> UpdateProfile(UpdateProfileDto updateProfiledto)
        {
            var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == "UserId");
            if (userIdClaim == null) return Unauthorized("Invalid token");
            int userId = int.Parse(userIdClaim.Value);

            var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Id == userId && !u.IsDeleted);
            if (user == null) return NotFound("User not found");

            user.Phone = updateProfiledto.Phone;
            user.Gender = updateProfiledto.Gender;
            user.Address = updateProfiledto.Address;

            _dbContext.Users.Update(user);
            await _dbContext.SaveChangesAsync();

            return Ok("Profile updated successfully");
        }

        [HttpPost("AddAdmin")]
        public async Task<IActionResult> AddAdmin(SignupDto signupDto)
        {
            if (await _dbContext.Users.AnyAsync(u => u.Email == signupDto.Email))
                return BadRequest("Email is already in use");

            if (await _dbContext.Users.AnyAsync(u => u.Username == signupDto.Username))
                return BadRequest("Username already exist");

            var user = new User
            {
                Email = signupDto.Email,
                Username = signupDto.Username,
                Role = "Admin",
                Password = signupDto.Password
            };

            var passwordHasher = new PasswordHasher<User>();
            user.Password = passwordHasher.HashPassword(user, signupDto.Password);

            _dbContext.Users.Add(user);
            await _dbContext.SaveChangesAsync();

            return Ok("Admin created successfully");
        }
    }
}
