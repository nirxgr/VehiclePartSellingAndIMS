using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Coursework.Domain.Entities;

[Table("sales_invoice")]
public class SalesInvoice
{
    [Key]
    [Column("sales_invoice_id")]
    public int SalesInvoiceId { get; set; }

    [Required]
    [Column("customer_id")]
    public int CustomerId { get; set; }

    [ForeignKey(nameof(CustomerId))]
    public User Customer { get; set; } = null!;

    [Column("staff_id")]
    public int? StaffId { get; set; }

    [ForeignKey(nameof(StaffId))]
    public User? Staff { get; set; }

    [Column("vehicle_id")]
    public int? VehicleId { get; set; }

    [ForeignKey(nameof(VehicleId))]
    public Vehicle? Vehicle { get; set; }

    [Column("invoice_date")]
    public DateTime InvoiceDate { get; set; } = DateTime.UtcNow;

    [Column("sub_total")]
    public decimal SubTotal { get; set; }

    [Column("discount_amount")]
    public decimal DiscountAmount { get; set; }

    [Column("final_amount")]
    public decimal FinalAmount { get; set; }

    [Column("isPaid")]
    public bool IsPaid { get; set; } = false;

    [Column("due_date")]
    public DateTime? DueDate { get; set; }

    [NotMapped]
    public string InvoiceNumber => $"INV-{SalesInvoiceId:D6}";

    public ICollection<SalesInvoiceItem> Items { get; set; } = new List<SalesInvoiceItem>();
    public ICollection<Payment> Payments { get; set; } = new List<Payment>();
}
