using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Coursework.Domain.Entities;

[Table("vehicles")]
public class Vehicle
{
    [Key]
    [Column("vehicle_id")]
    public int VehicleId { get; set; }

    [Required]
    [Column("customer_id")]
    public int CustomerId { get; set; }

    [ForeignKey(nameof(CustomerId))]
    public User Customer { get; set; } = null!;

    [Required]
    [MaxLength(50)]
    [Column("vehicle_number")]
    public string VehicleNumber { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    [Column("brand")]
    public string Brand { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    [Column("model")]
    public string Model { get; set; } = string.Empty;

    [Column("year")]
    public int Year { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
