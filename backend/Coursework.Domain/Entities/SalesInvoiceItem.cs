using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Coursework.Domain.Entities;

[Table("sales_invoice_items")]
public class SalesInvoiceItem
{
    [Key]
    [Column("sales_invoice_items_id")]
    public int SalesInvoiceItemId { get; set; }

    [Column("sales_invoice_id")]
    public int SalesInvoiceId { get; set; }

    [ForeignKey(nameof(SalesInvoiceId))]
    public SalesInvoice SalesInvoice { get; set; } = null!;

    [Column("part_id")]
    public int PartId { get; set; }

    [ForeignKey(nameof(PartId))]
    public Part Part { get; set; } = null!;

    [Column("quantity")]
    public int Quantity { get; set; }

    [Column("price_per_unit")]
    public decimal PricePerUnit { get; set; }

    [NotMapped]
    public decimal LineTotal => Quantity * PricePerUnit;
}
