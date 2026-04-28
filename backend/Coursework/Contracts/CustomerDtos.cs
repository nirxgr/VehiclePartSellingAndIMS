using System.ComponentModel.DataAnnotations;

namespace Coursework.Contracts;

public record CustomerRegisterDto(
    [Required][MaxLength(100)] string FullName,
    [Required][EmailAddress] string Email,
    [Required][Phone] string PhoneNumber,
    [MaxLength(250)] string? Address,
    [Required][MinLength(6)] string Password,
    [Required][MinLength(6)] string ConfirmPassword
);

public record CustomerLoginDto(
    [Required][EmailAddress] string Email,
    [Required] string Password
);

public record CustomerLoginResponseDto(
    string Token,
    string UserId,
    string Email,
    string FullName,
    DateTime ExpiresAt
);

public record CustomerProfileDto(
    string UserId,
    string Email,
    string FullName,
    string? PhoneNumber,
    string? Address,
    bool IsActive,
    DateTime CreatedAt
);

public record UpdateProfileDto(
    [Required][MaxLength(100)] string FullName,
    [Phone] string? PhoneNumber,
    [MaxLength(250)] string? Address
);

public record ChangePasswordDto(
    [Required] string CurrentPassword,
    [Required][MinLength(6)] string NewPassword,
    [Required][MinLength(6)] string ConfirmNewPassword
);

public record VehicleDto(
    int VehicleId,
    string VehicleNumber,
    string Brand,
    string Model,
    int Year,
    int Mileage,
    DateTime CreatedAt
);

public record CreateVehicleDto(
    [Required][MaxLength(50)] string VehicleNumber,
    [Required][MaxLength(100)] string Brand,
    [Required][MaxLength(100)] string Model,
    [Range(1900, 2100)] int Year,
    [Range(0, int.MaxValue)] int Mileage
);

public record UpdateVehicleDto(
    [Required][MaxLength(50)] string VehicleNumber,
    [Required][MaxLength(100)] string Brand,
    [Required][MaxLength(100)] string Model,
    [Range(1900, 2100)] int Year,
    [Range(0, int.MaxValue)] int Mileage
);
