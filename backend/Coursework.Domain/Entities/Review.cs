using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Coursework.Domain.Entities;

[Table("reviews")]
public class Review
{
    [Key]
    [Column("review_id")]
    public int ReviewId { get; set; }

    [Required]
    [Column("customer_id")]
    public int CustomerId { get; set; }

    [ForeignKey(nameof(CustomerId))]
    public User Customer { get; set; } = null!;

    [Column("appointment_id")]
    public int? AppointmentId { get; set; }

    [ForeignKey(nameof(AppointmentId))]
    public Appointment? Appointment { get; set; }

    [Range(1, 5)]
    [Column("rating")]
    public int Rating { get; set; }

    [MaxLength(500)]
    [Column("comment")]
    public string? Comment { get; set; }

    [Column("reviewed_date")]
    public DateTime ReviewedDate { get; set; } = DateTime.UtcNow;
}
