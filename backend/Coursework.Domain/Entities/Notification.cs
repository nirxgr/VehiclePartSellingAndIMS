using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Coursework.Domain.Entities;

[Table("notifications")]
public class Notification
{
    [Key]
    [Column("notification_id")]
    public int NotificationId { get; set; }

    [Required]
    [Column("user_id")]
    public int UserId { get; set; }

    [ForeignKey(nameof(UserId))]
    public User User { get; set; } = null!;

    [MaxLength(50)]
    [Column("log_type")]
    public string? LogType { get; set; }

    [MaxLength(150)]
    [Column("subject")]
    public string? Subject { get; set; }

    [MaxLength(500)]
    [Column("message")]
    public string? Message { get; set; }

    [MaxLength(50)]
    [Column("mailed_status")]
    public string? MailedStatus { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
