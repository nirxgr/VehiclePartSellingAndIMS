using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Coursework.Domain.Entities;

[Table("part_requests")]
public class PartRequest
{
    [Key]
    [Column("part_request_id")]
    public int PartRequestId { get; set; }

    [Required]
    [Column("customer_id")]
    public int CustomerId { get; set; }

    [ForeignKey(nameof(CustomerId))]
    public User Customer { get; set; } = null!;

    [Required]
    [MaxLength(100)]
    [Column("part_name")]
    public string PartName { get; set; } = string.Empty;

    [MaxLength(500)]
    [Column("description")]
    public string? Description { get; set; }

    [Column("requested_date")]
    public DateTime RequestedDate { get; set; } = DateTime.UtcNow;

    [Required]
    [MaxLength(50)]
    [Column("status")]
    public string Status { get; set; } = "Pending";
}
