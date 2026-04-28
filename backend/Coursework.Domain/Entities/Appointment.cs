using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Coursework.Domain.Enums;

namespace Coursework.Domain.Entities;

[Table("appointments")]
public class Appointment
{
    [Key]
    [Column("appointment_id")]
    public int AppointmentId { get; set; }

    [Required]
    [Column("customer_id")]
    public int CustomerId { get; set; }

    [ForeignKey(nameof(CustomerId))]
    public User Customer { get; set; } = null!;

    [Column("vehicle_id")]
    public int VehicleId { get; set; }

    [ForeignKey(nameof(VehicleId))]
    public Vehicle Vehicle { get; set; } = null!;

    [Column("requested_date")]
    public DateTime RequestedDate { get; set; }

    [MaxLength(500)]
    [Column("remarks")]
    public string? Remarks { get; set; }

    [Required]
    [MaxLength(50)]
    [Column("status")]
    public string Status { get; set; } = "Pending";

    public ICollection<Review> Reviews { get; set; } = new List<Review>();
}
