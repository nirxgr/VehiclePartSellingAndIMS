using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Coursework.Domain.Entities;

[Table("purchase_order_items")]
public class PurchaseInvoiceItem
{
    [Key]
    [Column("purchase_order_item_id")]
    public int PurchaseInvoiceItemId { get; set; }

    [Column("purchase_order_id")]
    public int PurchaseInvoiceId { get; set; }

    [ForeignKey(nameof(PurchaseInvoiceId))]
    public PurchaseInvoice PurchaseInvoice { get; set; } = null!;

    [Column("part_id")]
    public int PartId { get; set; }

    [ForeignKey(nameof(PartId))]
    public Part Part { get; set; } = null!;

    [Column("quantity")]
    public int Quantity { get; set; }

    [Column("price_per_unit")]
    public decimal CostPricePerUnit { get; set; }

    [NotMapped]
    public decimal LineTotal => Quantity * CostPricePerUnit;
}
