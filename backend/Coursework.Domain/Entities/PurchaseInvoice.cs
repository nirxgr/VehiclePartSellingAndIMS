using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Coursework.Domain.Enums;

namespace Coursework.Domain.Entities;

[Table("purchase_orders")]
public class PurchaseInvoice
{
    [Key]
    [Column("purchase_order_id")]
    public int PurchaseInvoiceId { get; set; }

    [Column("vendor_id")]
    public int VendorId { get; set; }

    [ForeignKey(nameof(VendorId))]
    public Vendor Vendor { get; set; } = null!;

    [Column("order_date")]
    public DateTime PurchaseDate { get; set; } = DateTime.UtcNow;

    [MaxLength(100)]
    [Column("invoice_number")]
    public string InvoiceNumber { get; set; } = string.Empty;

    [Column("total_amount")]
    public decimal TotalAmount { get; set; }

    public int? CreatedById { get; set; }

    [ForeignKey(nameof(CreatedById))]
    public User? CreatedBy { get; set; }

    public PurchaseInvoiceStatus Status { get; set; } = PurchaseInvoiceStatus.Completed;

    public ICollection<PurchaseInvoiceItem> Items { get; set; } = new List<PurchaseInvoiceItem>();
}
