using Coursework.Application.DTOs.Reports;
using Coursework.Application.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Coursework.Application.Services;

public class FinancialReportService : IFinancialReportService
{
    private readonly ISalesInvoiceRepository _salesInvoiceRepository;
    private readonly ISalesInvoiceItemRepository _salesInvoiceItemRepository;
    private readonly IPurchaseInvoiceItemRepository _purchaseInvoiceItemRepository;

    public FinancialReportService(
        ISalesInvoiceRepository salesInvoiceRepository,
        ISalesInvoiceItemRepository salesInvoiceItemRepository,
        IPurchaseInvoiceItemRepository purchaseInvoiceItemRepository)
    {
        _salesInvoiceRepository = salesInvoiceRepository;
        _salesInvoiceItemRepository = salesInvoiceItemRepository;
        _purchaseInvoiceItemRepository = purchaseInvoiceItemRepository;
    }

    public async Task<FinancialReportResponseDto> GetDailyReport(DateTime date)
    {
        var start = DateTime.SpecifyKind(date.Date, DateTimeKind.Utc);
        var end = start.AddDays(1);

        return await BuildReport(start, end, date.ToString("MMM dd, yyyy"));
    }

    public async Task<FinancialReportResponseDto> GetMonthlyReport(int year, int month)
    {
        var start = new DateTime(year, month, 1, 0, 0, 0, DateTimeKind.Utc);
        var end = start.AddMonths(1);

        return await BuildReport(start, end, start.ToString("MMMM yyyy"));
    }

    public async Task<FinancialReportResponseDto> GetYearlyReport(int year)
    {
        var start = new DateTime(year, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        var end = start.AddYears(1);

        return await BuildReport(start, end, year.ToString());
    }

    private async Task<FinancialReportResponseDto> BuildReport(
        DateTime start,
        DateTime end,
        string period)
    {
        var sales = await _salesInvoiceRepository
            .FindByCondition(s => s.InvoiceDate >= start && s.InvoiceDate < end)
            .AsNoTracking()
            .ToListAsync();

        var purchaseItems = await _purchaseInvoiceItemRepository
            .FindByCondition(p =>
                p.PurchaseInvoice.PurchaseDate >= start &&
                p.PurchaseInvoice.PurchaseDate < end)
            .AsNoTracking()
            .ToListAsync();

        var salesRevenue = sales.Sum(s => s.FinalAmount);
        var discount = sales.Sum(s => s.DiscountAmount);
        var paid = sales.Sum(s => s.PaidAmount);
        var credit = sales.Sum(s => s.FinalAmount - s.PaidAmount);
        var purchaseCost = purchaseItems.Sum(p => p.LineTotal);
        var profit = salesRevenue - purchaseCost;

        var topParts = await _salesInvoiceItemRepository
            .FindByCondition(i =>
                i.SalesInvoice.InvoiceDate >= start &&
                i.SalesInvoice.InvoiceDate < end)
            .AsNoTracking()
            .GroupBy(i => new
            {
                i.Part.PartName,
                i.Part.PartNumber,
                i.Part.StockQuantity
            })
            .Select(g => new TopSellingPartDto
            {
                PartName = g.Key.PartName,
                PartNumber = g.Key.PartNumber,
                QuantitySold = g.Sum(x => x.Quantity),
                Revenue = g.Sum(x => x.LineTotal),
                CurrentStock = g.Key.StockQuantity
            })
            .OrderByDescending(x => x.QuantitySold)
            .Take(5)
            .ToListAsync();

        var row = new FinancialReportRowDto
        {
            Period = period,
            SalesRevenue = salesRevenue,
            PurchaseCost = purchaseCost,
            DiscountGiven = discount,
            PaidAmount = paid,
            CreditAmount = credit,
            GrossProfit = profit,
            InvoiceCount = sales.Count
        };

        return new FinancialReportResponseDto
        {
            Rows = new List<FinancialReportRowDto> { row },
            TopSellingParts = topParts
        };
    }
}