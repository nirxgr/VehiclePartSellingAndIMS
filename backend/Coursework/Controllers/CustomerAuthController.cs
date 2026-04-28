using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Coursework.Contracts;
using Coursework.Domain.Entities;
using Coursework.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace Coursework.Controllers;

[ApiController]
[Route("api/customer/auth")]
public class CustomerAuthController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IConfiguration _configuration;

    public CustomerAuthController(ApplicationDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] CustomerRegisterDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        if (dto.Password != dto.ConfirmPassword)
            return BadRequest(new { message = "Passwords do not match." });

        var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
        if (existingUser != null)
            return BadRequest(new { message = "A user with this email already exists." });

        var user = new User
        {
            FullName = dto.FullName,
            Email = dto.Email,
            Phone = dto.PhoneNumber,
            Address = dto.Address,
            PasswordHash = HashPassword(dto.Password),
            Role = "Customer",
            CreatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var token = GenerateJwtToken(user);
        var expiry = DateTime.UtcNow.AddDays(7);

        return Ok(new CustomerLoginResponseDto(
            Token: token,
            UserId: user.UserId.ToString(),
            Email: user.Email,
            FullName: user.FullName,
            ExpiresAt: expiry
        ));
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] CustomerLoginDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
        if (user == null)
            return Unauthorized(new { message = "Invalid email or password." });

        if (!VerifyPassword(dto.Password, user.PasswordHash))
            return Unauthorized(new { message = "Invalid email or password." });

        if (user.Role != "Customer")
            return Unauthorized(new { message = "This login is for customers only." });

        var token = GenerateJwtToken(user);
        var expiry = DateTime.UtcNow.AddDays(7);

        return Ok(new CustomerLoginResponseDto(
            Token: token,
            UserId: user.UserId.ToString(),
            Email: user.Email,
            FullName: user.FullName,
            ExpiresAt: expiry
        ));
    }

    private string GenerateJwtToken(User user)
    {
        var jwtKey = _configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key not configured");
        var jwtIssuer = _configuration["Jwt:Issuer"] ?? "VehiclePartsIMS";
        var jwtAudience = _configuration["Jwt:Audience"] ?? "VehiclePartsIMS";

        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.UserId.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(ClaimTypes.Name, user.FullName),
            new Claim(ClaimTypes.Role, user.Role),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var token = new JwtSecurityToken(
            issuer: jwtIssuer,
            audience: jwtAudience,
            claims: claims,
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private static string HashPassword(string password)
    {
        using var sha256 = SHA256.Create();
        var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
        return Convert.ToBase64String(hashedBytes);
    }

    private static bool VerifyPassword(string password, string hash)
    {
        return HashPassword(password) == hash;
    }
}
