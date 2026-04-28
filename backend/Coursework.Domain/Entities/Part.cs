using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Coursework.Domain.Entities;

[Table("parts")]
public class Part
{
    [Key]
    [Column("part_id")]
    public int PartId { get; set; }

    [Column("vendor_id")]
    public int VendorId { get; set; }

    [ForeignKey(nameof(VendorId))]
    public Vendor Vendor { get; set; } = null!;

    [Required]
    [MaxLength(100)]
    [Column("part_name")]
    public string PartName { get; set; } = string.Empty;

    [MaxLength(500)]
    [Column("description")]
    public string? Description { get; set; }

    [MaxLength(100)]
    [Column("category")]
    public string? Category { get; set; }

    [Column("stock_quantity")]
    public int StockQuantity { get; set; }

    [MaxLength(50)]
    [Column("unit")]
    public string? Unit { get; set; }

    [Column("cost_price_per_unit")]
    public decimal CostPricePerUnit { get; set; }

    [Column("selling_price_per_unit")]
    public decimal SellingPricePerUnit { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [NotMapped]
    public string PartNumber => $"PART-{PartId:D6}";

    public ICollection<SalesInvoiceItem> SalesInvoiceItems { get; set; } = new List<SalesInvoiceItem>();
    public ICollection<PurchaseInvoiceItem> PurchaseInvoiceItems { get; set; } = new List<PurchaseInvoiceItem>();
}
