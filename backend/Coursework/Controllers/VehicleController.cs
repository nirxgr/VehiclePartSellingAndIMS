using System.Security.Claims;
using Coursework.Contracts;
using Coursework.Domain.Entities;
using Coursework.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Coursework.Controllers;

[ApiController]
[Route("api/customer/vehicles")]
[Authorize(Roles = "Customer")]
public class VehicleController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public VehicleController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetMyVehicles()
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            return Unauthorized(new { message = "User not authenticated." });

        var vehicles = await _context.Vehicles
            .Where(v => v.CustomerId == userId)
            .OrderByDescending(v => v.CreatedAt)
            .Select(v => new VehicleDto(
                v.VehicleId,
                v.VehicleNumber,
                v.Brand,
                v.Model,
                v.Year,
                0,
                v.CreatedAt
            ))
            .ToListAsync();

        return Ok(vehicles);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetVehicle(int id)
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            return Unauthorized(new { message = "User not authenticated." });

        var vehicle = await _context.Vehicles
            .FirstOrDefaultAsync(v => v.VehicleId == id && v.CustomerId == userId);

        if (vehicle == null)
            return NotFound(new { message = "Vehicle not found." });

        return Ok(new VehicleDto(
            vehicle.VehicleId,
            vehicle.VehicleNumber,
            vehicle.Brand,
            vehicle.Model,
            vehicle.Year,
            0,
            vehicle.CreatedAt
        ));
    }

    [HttpPost]
    public async Task<IActionResult> CreateVehicle([FromBody] CreateVehicleDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            return Unauthorized(new { message = "User not authenticated." });

        var existingVehicle = await _context.Vehicles
            .AnyAsync(v => v.VehicleNumber == dto.VehicleNumber);

        if (existingVehicle)
            return BadRequest(new { message = "A vehicle with this registration number already exists." });

        var vehicle = new Vehicle
        {
            CustomerId = userId,
            VehicleNumber = dto.VehicleNumber,
            Brand = dto.Brand,
            Model = dto.Model,
            Year = dto.Year,
            CreatedAt = DateTime.UtcNow
        };

        _context.Vehicles.Add(vehicle);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetVehicle), new { id = vehicle.VehicleId }, new VehicleDto(
            vehicle.VehicleId,
            vehicle.VehicleNumber,
            vehicle.Brand,
            vehicle.Model,
            vehicle.Year,
            0,
            vehicle.CreatedAt
        ));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateVehicle(int id, [FromBody] UpdateVehicleDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            return Unauthorized(new { message = "User not authenticated." });

        var vehicle = await _context.Vehicles
            .FirstOrDefaultAsync(v => v.VehicleId == id && v.CustomerId == userId);

        if (vehicle == null)
            return NotFound(new { message = "Vehicle not found." });

        var duplicateVehicle = await _context.Vehicles
            .AnyAsync(v => v.VehicleNumber == dto.VehicleNumber && v.VehicleId != id);

        if (duplicateVehicle)
            return BadRequest(new { message = "A vehicle with this registration number already exists." });

        vehicle.VehicleNumber = dto.VehicleNumber;
        vehicle.Brand = dto.Brand;
        vehicle.Model = dto.Model;
        vehicle.Year = dto.Year;

        await _context.SaveChangesAsync();

        return Ok(new VehicleDto(
            vehicle.VehicleId,
            vehicle.VehicleNumber,
            vehicle.Brand,
            vehicle.Model,
            vehicle.Year,
            0,
            vehicle.CreatedAt
        ));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteVehicle(int id)
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            return Unauthorized(new { message = "User not authenticated." });

        var vehicle = await _context.Vehicles
            .FirstOrDefaultAsync(v => v.VehicleId == id && v.CustomerId == userId);

        if (vehicle == null)
            return NotFound(new { message = "Vehicle not found." });

        _context.Vehicles.Remove(vehicle);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Vehicle deleted successfully." });
    }
}
