using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Coursework.Contracts;
using Coursework.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Coursework.Controllers;

[ApiController]
[Route("api/customer/profile")]
[Authorize(Roles = "Customer")]
public class CustomerProfileController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public CustomerProfileController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetProfile()
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            return Unauthorized(new { message = "User not authenticated." });

        var user = await _context.Users.FindAsync(userId);
        if (user == null)
            return NotFound(new { message = "User not found." });

        return Ok(new CustomerProfileDto(
            UserId: user.UserId.ToString(),
            Email: user.Email,
            FullName: user.FullName,
            PhoneNumber: user.Phone,
            Address: user.Address,
            IsActive: true,
            CreatedAt: user.CreatedAt
        ));
    }

    [HttpPut]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            return Unauthorized(new { message = "User not authenticated." });

        var user = await _context.Users.FindAsync(userId);
        if (user == null)
            return NotFound(new { message = "User not found." });

        user.FullName = dto.FullName;
        user.Phone = dto.PhoneNumber;
        user.Address = dto.Address;

        await _context.SaveChangesAsync();

        return Ok(new CustomerProfileDto(
            UserId: user.UserId.ToString(),
            Email: user.Email,
            FullName: user.FullName,
            PhoneNumber: user.Phone,
            Address: user.Address,
            IsActive: true,
            CreatedAt: user.CreatedAt
        ));
    }

    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        if (dto.NewPassword != dto.ConfirmNewPassword)
            return BadRequest(new { message = "New passwords do not match." });

        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            return Unauthorized(new { message = "User not authenticated." });

        var user = await _context.Users.FindAsync(userId);
        if (user == null)
            return NotFound(new { message = "User not found." });

        if (!VerifyPassword(dto.CurrentPassword, user.PasswordHash))
            return BadRequest(new { message = "Current password is incorrect." });

        user.PasswordHash = HashPassword(dto.NewPassword);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Password changed successfully." });
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
