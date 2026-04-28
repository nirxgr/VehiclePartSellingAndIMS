import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../../../api/apiConfig";
import jsPDF from "jspdf";



type ReportType = "Daily" | "Monthly" | "Yearly";

type FinancialRow = {
    period: string;
    salesRevenue: number;
    purchaseCost: number;
    discountGiven: number;
    paidAmount: number;
    creditAmount: number;
    grossProfit: number;
    invoiceCount: number;
};

type TopSellingPart = {
    partName: string;
    partNumber: string;
    quantitySold: number;
    revenue: number;
    currentStock: number;
};

type ApiResponse<T> = {
    success: boolean;
    message: string;
    data: T;
    errors: string[] | null;
    statusCode: number;
};

type FinancialReportResponse = {
    rows: FinancialRow[];
    topSellingParts: TopSellingPart[];
};

function FinancialReports() {
    const [reportType, setReportType] = useState<ReportType>("Daily");
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedMonth, setSelectedMonth] = useState("");
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

    const [reportRows, setReportRows] = useState<FinancialRow[]>([]);
    const [topSellingParts, setTopSellingParts] = useState<TopSellingPart[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);

    const summary = useMemo(() => {
        const totalRevenue = reportRows.reduce((sum, row) => sum + row.salesRevenue, 0);
        const totalPurchaseCost = reportRows.reduce((sum, row) => sum + row.purchaseCost, 0);
        const totalDiscount = reportRows.reduce((sum, row) => sum + row.discountGiven, 0);
        const totalPaid = reportRows.reduce((sum, row) => sum + row.paidAmount, 0);
        const totalCredit = reportRows.reduce((sum, row) => sum + row.creditAmount, 0);
        const grossProfit = reportRows.reduce((sum, row) => sum + row.grossProfit, 0);
        const totalInvoices = reportRows.reduce((sum, row) => sum + row.invoiceCount, 0);

        return {
            totalRevenue,
            totalPurchaseCost,
            totalDiscount,
            totalPaid,
            totalCredit,
            grossProfit,
            totalInvoices,
        };
    }, [reportRows]);

    const fetchFinancialReport = async (): Promise<boolean> => {
        let url = "";

        if (reportType === "Daily") {
            if (!selectedDate) {
                toast.error("Please select a date.");
                return false;
            }

            url = `${API_BASE_URL}/api/admin/reports/financial/daily?date=${selectedDate}`;
        }

        if (reportType === "Monthly") {
            if (!selectedMonth) {
                toast.error("Please select a month.");
                return false;
            }

            const [year, month] = selectedMonth.split("-");

            url = `${API_BASE_URL}/api/admin/reports/financial/monthly?year=${year}&month=${Number(month)}`;
        }

        if (reportType === "Yearly") {
            if (!selectedYear) {
                toast.error("Please select a year.");
                return false;
            }

            url = `${API_BASE_URL}/api/admin/reports/financial/yearly?year=${selectedYear}`;
        }

        try {
            setIsGenerating(true);

            const response = await fetch(url);
            const result: ApiResponse<FinancialReportResponse> = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || "Failed to generate financial report.");
            }

            setReportRows(result.data?.rows ?? []);
            setTopSellingParts(result.data?.topSellingParts ?? []);

            toast.success(`${reportType} financial report generated successfully.`);
            return true;
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Something went wrong while generating report."
            );
            return false;
        } finally {
            setIsGenerating(false);
        }
    };

    const handleGenerateReport = async () => {
        await fetchFinancialReport();
    };

    const getSelectedPeriodLabel = () => {
        if (reportType === "Daily") {
            return selectedDate || "N/A";
        }

        if (reportType === "Monthly") {
            return selectedMonth || "N/A";
        }

        return selectedYear || "N/A";
    };

    const handleDownloadPdf = async () => {
        let hasReport = reportRows.length > 0;

        if (!hasReport) {
            hasReport = await fetchFinancialReport();

            if (!hasReport) {
                return;
            }

            toast.info("Report generated. Please click Download PDF again.");
            return;
        }

        try {
            const pdf = new jsPDF("p", "mm", "a4");

            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();

            let y = 18;

            const addFooter = () => {
                pdf.setFontSize(8);
                pdf.setTextColor(120, 120, 120);
                pdf.text("AutoCare IMS | Admin Financial Report", 14, pageHeight - 10);
                pdf.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth - 58, pageHeight - 10);
            };

            const checkPage = (neededHeight = 20) => {
                if (y + neededHeight > pageHeight - 20) {
                    addFooter();
                    pdf.addPage();
                    y = 18;
                }
            };

            // HEADER
            pdf.setFillColor(15, 76, 129);
            pdf.rect(0, 0, pageWidth, 34, "F");

            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(20);
            pdf.setFont("helvetica", "bold");
            pdf.text("AutoCare IMS", 14, 15);

            pdf.setFontSize(12);
            pdf.setFont("helvetica", "normal");
            pdf.text("Financial Report", 14, 24);

            pdf.setFontSize(10);
            pdf.text(`Report Type: ${reportType}`, pageWidth - 60, 15);
            pdf.text(`Selected Period: ${getSelectedPeriodLabel()}`, pageWidth - 60, 23);

            y = 46;

            // SUMMARY TITLE
            pdf.setTextColor(15, 76, 129);
            pdf.setFontSize(15);
            pdf.setFont("helvetica", "bold");
            pdf.text("Summary", 14, y);

            y += 8;

            const cardWidth = 58;
            const cardHeight = 24;
            const gap = 6;

            const summaryCards = [
                ["Total Revenue", formatCurrency(summary.totalRevenue)],
                ["Purchase Cost", formatCurrency(summary.totalPurchaseCost)],
                ["Gross Profit", formatCurrency(summary.grossProfit)],
                ["Paid Amount", formatCurrency(summary.totalPaid)],
                ["Pending Credit", formatCurrency(summary.totalCredit)],
                ["Discount Given", formatCurrency(summary.totalDiscount)],
            ];

            summaryCards.forEach((card, index) => {
                const col = index % 3;
                const row = Math.floor(index / 3);

                const x = 14 + col * (cardWidth + gap);
                const cardY = y + row * (cardHeight + gap);

                pdf.setFillColor(247, 249, 251);
                pdf.setDrawColor(220, 225, 230);
                pdf.roundedRect(x, cardY, cardWidth, cardHeight, 3, 3, "FD");

                pdf.setTextColor(80, 95, 118);
                pdf.setFontSize(8);
                pdf.setFont("helvetica", "bold");
                pdf.text(card[0], x + 4, cardY + 8);

                pdf.setTextColor(15, 76, 129);
                pdf.setFontSize(11);
                pdf.text(card[1], x + 4, cardY + 17);
            });

            y += 62;

            // DETAILED REPORT
            checkPage(50);

            pdf.setTextColor(15, 76, 129);
            pdf.setFontSize(15);
            pdf.setFont("helvetica", "bold");
            pdf.text("Detailed Financial Report", 14, y);

            y += 8;

            // Table header
            pdf.setFillColor(15, 76, 129);
            pdf.rect(14, y, 182, 9, "F");

            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(8);
            pdf.text("Period", 16, y + 6);
            pdf.text("Revenue", 50, y + 6);
            pdf.text("Cost", 82, y + 6);
            pdf.text("Discount", 108, y + 6);
            pdf.text("Paid", 138, y + 6);
            pdf.text("Profit", 166, y + 6);

            y += 9;

            reportRows.forEach((row, index) => {
                checkPage(12);

                pdf.setFillColor(index % 2 === 0 ? 255 : 247, index % 2 === 0 ? 255 : 249, index % 2 === 0 ? 255 : 251);
                pdf.rect(14, y, 182, 10, "F");

                pdf.setTextColor(25, 28, 30);
                pdf.setFontSize(8);
                pdf.setFont("helvetica", "normal");

                pdf.text(row.period, 16, y + 6);
                pdf.text(formatCurrency(row.salesRevenue), 50, y + 6);
                pdf.text(formatCurrency(row.purchaseCost), 82, y + 6);
                pdf.text(formatCurrency(row.discountGiven), 108, y + 6);
                pdf.text(formatCurrency(row.paidAmount), 138, y + 6);

                if (row.grossProfit >= 0) {
                    pdf.setTextColor(22, 163, 74);
                } else {
                    pdf.setTextColor(220, 38, 38);
                }

                pdf.text(formatCurrency(row.grossProfit), 166, y + 6);

                y += 10;
            });

            y += 12;

            // TOP SELLING PARTS
            checkPage(50);

            pdf.setTextColor(15, 76, 129);
            pdf.setFontSize(15);
            pdf.setFont("helvetica", "bold");
            pdf.text("Top Selling Parts", 14, y);

            y += 8;

            pdf.setFillColor(15, 76, 129);
            pdf.rect(14, y, 182, 9, "F");

            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(8);
            pdf.text("Part Name", 16, y + 6);
            pdf.text("Part Number", 75, y + 6);
            pdf.text("Qty", 120, y + 6);
            pdf.text("Revenue", 140, y + 6);
            pdf.text("Stock", 172, y + 6);

            y += 9;

            topSellingParts.forEach((part, index) => {
                checkPage(12);

                pdf.setFillColor(index % 2 === 0 ? 255 : 247, index % 2 === 0 ? 255 : 249, index % 2 === 0 ? 255 : 251);
                pdf.rect(14, y, 182, 10, "F");

                pdf.setTextColor(25, 28, 30);
                pdf.setFontSize(8);

                pdf.text(part.partName.substring(0, 28), 16, y + 6);
                pdf.text(part.partNumber, 75, y + 6);
                pdf.text(part.quantitySold.toString(), 120, y + 6);
                pdf.text(formatCurrency(part.revenue), 140, y + 6);

                if (part.currentStock < 10) {
                    pdf.setTextColor(220, 38, 38);
                } else {
                    pdf.setTextColor(22, 163, 74);
                }

                pdf.text(`${part.currentStock} units`, 172, y + 6);

                y += 10;
            });

            addFooter();

            pdf.save(`financial-report-${getSelectedPeriodLabel()}.pdf`);

            toast.success("PDF downloaded successfully.");
        } catch (error) {
            console.error("PDF download error:", error);
            toast.error("Failed to download PDF.");
        }
    };

    const resetFilters = () => {
        setReportType("Daily");
        setSelectedDate("");
        setSelectedMonth("");
        setSelectedYear(new Date().getFullYear().toString());
        setReportRows([]);
        setTopSellingParts([]);
    };

    return (
        <div className="bg-[#f7f9fb] text-[#191c1e]">
            <main className="p-8 max-w-7xl mx-auto">
                <header className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10">
                    <div>
                        <nav className="flex items-center gap-2 text-xs font-semibold text-[#727780] mb-4 uppercase tracking-wide">
                            <span className="hover:text-[#00355f] cursor-pointer">
                                Dashboard
                            </span>
                            <span>›</span>
                            <span className="hover:text-[#00355f] cursor-pointer">
                                Reports
                            </span>
                            <span>›</span>
                            <span className="text-[#00355f] font-bold">
                                Financial Reports
                            </span>
                        </nav>

                        <h1 className="text-4xl font-bold text-[#00355f] mb-2">
                            Financial Reports
                        </h1>

                        <p className="text-base text-[#505f76] max-w-2xl">
                            Generate and view daily, monthly, and yearly financial reports
                            for sales, purchase cost, profit, discounts, and pending credit.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <button
                            type="button"
                            onClick={handleGenerateReport}
                            disabled={isGenerating}
                            className="px-5 py-2.5 rounded-lg border border-slate-300 text-[#505f76] font-bold bg-white hover:bg-slate-50 transition-all flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            <span className="material-symbols-outlined text-lg">
                                description
                            </span>
                            {isGenerating ? "Generating..." : "Generate Report"}
                        </button>

                        <button
                            type="button"
                            onClick={handleDownloadPdf}
                            className="px-5 py-2.5 rounded-lg bg-[#0f4c81] text-white font-bold hover:bg-[#00355f] transition-all shadow-lg flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-lg">
                                download
                            </span>
                            Download PDF
                        </button>
                    </div>
                </header>

                <section className="bg-white rounded-2xl shadow-[0px_4px_20px_rgba(15,76,129,0.05)] border border-slate-100 p-6 mb-8">
                    <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-6">
                        <div>
                            <h2 className="text-xl font-semibold text-[#00355f] mb-2">
                                Report Filter
                            </h2>
                            <p className="text-sm text-[#505f76]">
                                Select report type and period before generating the report.
                            </p>
                        </div>

                        <div className="flex flex-col lg:flex-row gap-4 lg:items-end">
                            <div className="flex p-1 bg-[#eceef0] rounded-xl h-12">
                                {(["Daily", "Monthly", "Yearly"] as ReportType[]).map((type) => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => setReportType(type)}
                                        className={
                                            reportType === type
                                                ? "px-6 rounded-lg bg-white text-[#00355f] font-bold shadow-sm transition-all"
                                                : "px-6 rounded-lg text-[#505f76] font-bold hover:bg-white/60 transition-all"
                                        }
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>

                            {reportType === "Daily" && (
                                <FilterField label="Select Date">
                                    <input
                                        type="date"
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        className="h-12 rounded-lg border border-slate-200 bg-white px-4 text-sm outline-none focus:border-[#00355f] focus:ring-2 focus:ring-[#00355f]/20"
                                    />
                                </FilterField>
                            )}

                            {reportType === "Monthly" && (
                                <FilterField label="Select Month">
                                    <input
                                        type="month"
                                        value={selectedMonth}
                                        onChange={(e) => setSelectedMonth(e.target.value)}
                                        className="h-12 rounded-lg border border-slate-200 bg-white px-4 text-sm outline-none focus:border-[#00355f] focus:ring-2 focus:ring-[#00355f]/20"
                                    />
                                </FilterField>
                            )}

                            {reportType === "Yearly" && (
                                <FilterField label="Select Year">
                                    <select
                                        value={selectedYear}
                                        onChange={(e) => setSelectedYear(e.target.value)}
                                        className="h-12 rounded-lg border border-slate-200 bg-white px-4 pr-10 text-sm outline-none focus:border-[#00355f] focus:ring-2 focus:ring-[#00355f]/20"
                                    >
                                        {Array.from({ length: 10 }, (_, index) => {
                                            const year = new Date().getFullYear() - index;
                                            return (
                                                <option key={year} value={year}>
                                                    {year}
                                                </option>
                                            );
                                        })}
                                    </select>
                                </FilterField>
                            )}

                            <button
                                type="button"
                                onClick={resetFilters}
                                className="h-12 px-5 rounded-lg border border-slate-300 text-[#505f76] font-bold bg-white hover:bg-slate-50 transition-all"
                            >
                                Reset
                            </button>
                        </div>
                    </div>
                </section>

              <div id="financial-report-pdf">
                <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-6 mb-8">
                    <SummaryCard
                        title="Total Revenue"
                        value={formatCurrency(summary.totalRevenue)}
                        icon="payments"
                        variant="primary"
                        note="Based on selected report"
                    />
                    <SummaryCard
                        title="Purchase Cost"
                        value={formatCurrency(summary.totalPurchaseCost)}
                        icon="shopping_cart"
                        variant="neutral"
                        note="Cost from purchase invoices"
                    />
                    <SummaryCard
                        title="Gross Profit"
                        value={formatCurrency(summary.grossProfit)}
                        icon="account_balance_wallet"
                        variant={summary.grossProfit >= 0 ? "success" : "danger"}
                        note={summary.grossProfit >= 0 ? "Profitable period" : "Loss detected"}
                    />
                    <SummaryCard
                        title="Sales Invoices"
                        value={summary.totalInvoices.toString()}
                        icon="receipt_long"
                        variant="neutral"
                        note="Completed sales only"
                    />
                    <SummaryCard
                        title="Pending Credit"
                        value={formatCurrency(summary.totalCredit)}
                        icon="priority_high"
                        variant="danger"
                        note="Requires follow-up"
                    />
                    </section>
                

                <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    <div className="lg:col-span-2 bg-white rounded-2xl shadow-[0px_4px_20px_rgba(15,76,129,0.05)] border border-slate-100 p-6">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-xl font-semibold text-[#00355f]">
                                    Revenue Trend
                                </h3>
                                <p className="text-sm text-[#505f76]">
                                    Revenue overview for selected {reportType.toLowerCase()} report.
                                </p>
                            </div>

                            <span className="px-3 py-1 rounded-full bg-blue-50 text-[#0f4c81] text-xs font-bold">
                                {reportType}
                            </span>
                        </div>

                        <div className="h-64 flex items-end justify-between gap-3">
                            {reportRows.map((row) => {
                                const height = Math.max(20, (row.salesRevenue / 16000) * 100);

                                return (
                                    <div
                                        key={row.period}
                                        className="flex-1 flex flex-col items-center gap-2"
                                    >
                                        <div className="w-full h-52 bg-slate-50 rounded-t-xl flex items-end overflow-hidden">
                                            <div
                                                className="w-full bg-[#0f4c81] rounded-t-xl transition-all"
                                                style={{ height: `${height}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-[10px] text-slate-400 font-bold">
                                            {row.period.split(",")[0]}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="bg-[#0f4c81] rounded-2xl shadow-xl p-6 text-white">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="material-symbols-outlined text-[#ffdbca] text-[26px]">
                                insights
                            </span>
                            <h3 className="text-xl font-semibold">Financial Insights</h3>
                        </div>

                        <div className="space-y-5">
                            <Highlight
                                icon="trending_up"
                                title="Revenue Performance"
                                text="Current report period shows positive revenue activity."
                            />
                            <Highlight
                                icon="percent"
                                title="Discount Tracking"
                                text="Loyalty discounts are reflected in total revenue."
                            />
                            <Highlight
                                icon="payments"
                                title="Credit Monitoring"
                                text="Pending credit requires follow-up for cash flow stability."
                            />
                        </div>
                    </div>
                </section>

                <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white rounded-2xl shadow-[0px_4px_20px_rgba(15,76,129,0.05)] border border-slate-100 p-6">
                        <h3 className="text-xl font-semibold text-[#00355f] mb-6">
                            Revenue Summary
                        </h3>

                        <div className="space-y-5">
                            <SummaryLine
                                label="Total Revenue"
                                value={formatCurrency(summary.totalRevenue)}
                            />
                            <SummaryLine
                                label="Paid Amount"
                                value={formatCurrency(summary.totalPaid)}
                            />
                            <SummaryLine
                                label="Pending Credit"
                                value={formatCurrency(summary.totalCredit)}
                            />
                            <SummaryLine
                                label="Discount Given"
                                value={formatCurrency(summary.totalDiscount)}
                            />
                            <SummaryLine
                                label="Gross Profit"
                                value={formatCurrency(summary.grossProfit)}
                            />
                        </div>

                        {reportRows.length === 0 && (
                            <p className="text-sm text-[#505f76] mt-6">
                                Select a date and generate a report to view revenue summary.
                            </p>
                        )}
                    </div>

                    <div className="bg-white rounded-2xl shadow-[0px_4px_20px_rgba(15,76,129,0.05)] border border-slate-100 p-6">
                        <h3 className="text-xl font-semibold text-[#00355f] mb-6">
                            Payment Summary
                        </h3>

                        <div className="space-y-5">
                            <PaymentBar label="Paid Amount" value={summary.totalPaid} total={summary.totalRevenue} />
                            <PaymentBar label="Pending Credit" value={summary.totalCredit} total={summary.totalRevenue} danger />
                            <PaymentBar label="Discount Given" value={summary.totalDiscount} total={summary.totalRevenue} warning />
                        </div>
                    </div>
                </section>

                <section className="bg-white rounded-2xl shadow-[0px_4px_20px_rgba(15,76,129,0.05)] border border-slate-100 overflow-hidden mb-8">
                    <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                        <div>
                            <h3 className="text-xl font-semibold text-[#00355f]">
                                Detailed Financial Report
                            </h3>
                            <p className="text-sm text-[#505f76]">
                                Revenue, purchase cost, discount, payment, credit, and profit details.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={handleDownloadPdf}
                            className="px-4 py-2 rounded-lg bg-blue-50 text-[#0f4c81] font-bold hover:bg-blue-100 transition-all flex items-center gap-2 w-fit"
                        >
                            <span className="material-symbols-outlined text-lg">
                                picture_as_pdf
                            </span>
                            Download PDF
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <TableHead>Date / Period</TableHead>
                                    <TableHead>Sales Revenue</TableHead>
                                    <TableHead>Purchase Cost</TableHead>
                                    <TableHead>Discount</TableHead>
                                    <TableHead>Paid Amount</TableHead>
                                    <TableHead>Credit</TableHead>
                                    <TableHead>Profit</TableHead>
                                    <TableHead>Invoices</TableHead>
                                    <TableHead>Status</TableHead>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                                {reportRows.map((row) => (
                                    <tr key={row.period} className="hover:bg-slate-50/50">
                                        <td className="px-6 py-4 font-semibold text-[#00355f]">
                                            {row.period}
                                        </td>
                                        <td className="px-6 py-4">
                                            {formatCurrency(row.salesRevenue)}
                                        </td>
                                        <td className="px-6 py-4 text-[#505f76]">
                                            {formatCurrency(row.purchaseCost)}
                                        </td>
                                        <td className="px-6 py-4 text-red-600">
                                            -{formatCurrency(row.discountGiven)}
                                        </td>
                                        <td className="px-6 py-4 text-emerald-600 font-semibold">
                                            {formatCurrency(row.paidAmount)}
                                        </td>
                                        <td className="px-6 py-4 text-orange-700 font-semibold">
                                            {formatCurrency(row.creditAmount)}
                                        </td>
                                        <td
                                            className={
                                                row.grossProfit >= 0
                                                    ? "px-6 py-4 text-emerald-600 font-bold"
                                                    : "px-6 py-4 text-red-600 font-bold"
                                            }
                                        >
                                            {formatCurrency(row.grossProfit)}
                                        </td>
                                        <td className="px-6 py-4">{row.invoiceCount}</td>
                                        <td className="px-6 py-4">
                                            <ReportStatusBadge row={row} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                    <div className="xl:col-span-8 bg-white rounded-2xl shadow-[0px_4px_20px_rgba(15,76,129,0.05)] border border-slate-100 p-6">
                        <h3 className="text-xl font-semibold text-[#00355f] mb-6">
                            Top Selling Parts
                        </h3>

                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[760px] text-left table-fixed">
                                <thead>
                                    <tr className="border-b border-slate-100">
                                        <th className="w-[30%] px-4 py-4 text-[11px] text-[#505f76] uppercase tracking-wider font-bold">
                                            Part Name
                                        </th>
                                        <th className="w-[22%] px-4 py-4 text-[11px] text-[#505f76] uppercase tracking-wider font-bold">
                                            Part Number
                                        </th>
                                        <th className="w-[14%] px-4 py-4 text-[11px] text-[#505f76] uppercase tracking-wider font-bold">
                                            Qty Sold
                                        </th>
                                        <th className="w-[18%] px-4 py-4 text-[11px] text-[#505f76] uppercase tracking-wider font-bold">
                                            Revenue
                                        </th>
                                        <th className="w-[16%] px-4 py-4 text-[11px] text-[#505f76] uppercase tracking-wider font-bold">
                                            Stock
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                    {topSellingParts.map((part) => (
                                        <tr key={part.partNumber}>
                                            <td className="px-4 py-5 font-bold text-[#191c1e] whitespace-nowrap">
                                                {part.partName}
                                            </td>

                                            <td className="px-4 py-5 text-slate-500 font-mono text-sm whitespace-nowrap">
                                                {part.partNumber}
                                            </td>

                                            <td className="px-4 py-5 whitespace-nowrap">
                                                {part.quantitySold}
                                            </td>

                                            <td className="px-4 py-5 text-[#0f4c81] font-bold whitespace-nowrap">
                                                {formatCurrency(part.revenue)}
                                            </td>

                                            <td className="px-4 py-5 whitespace-nowrap">
                                                <span
                                                    className={
                                                        part.currentStock < 10
                                                            ? "inline-flex px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold whitespace-nowrap"
                                                            : "inline-flex px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold whitespace-nowrap"
                                                    }
                                                >
                                                    {part.currentStock} units
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="xl:col-span-4 bg-white rounded-2xl shadow-[0px_4px_20px_rgba(15,76,129,0.05)] border border-slate-100 p-6">
                        <h3 className="text-xl font-semibold text-[#00355f] mb-4">
                            PDF Report Summary
                        </h3>

                        <div className="space-y-4 text-sm">
                            <SummaryLine label="Report Type" value={reportType} />
                            <SummaryLine label="Generated Date" value={new Date().toLocaleDateString()} />
                            <SummaryLine label="Total Records" value={reportRows.length.toString()} />
                            <SummaryLine label="Includes Charts" value="Yes" />
                        </div>

                        <button
                            type="button"
                            onClick={handleDownloadPdf}
                            className="mt-6 w-full h-12 rounded-lg bg-[#0f4c81] text-white font-bold hover:bg-[#00355f] transition-all flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined">
                                picture_as_pdf
                            </span>
                            Download PDF
                        </button>

                        <p className="text-xs text-[#505f76] mt-3">
                            PDF includes summary cards, charts, detailed report, and generated date.
                        </p>
                    </div>
                    </section>
                </div>
            </main>
        </div>
    );
}

function FilterField({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-[#727780] uppercase tracking-wider">
                {label}
            </label>
            {children}
        </div>
    );
}

function SummaryCard({
    title,
    value,
    icon,
    note,
    variant,
}: {
    title: string;
    value: string;
    icon: string;
    note: string;
    variant: "primary" | "success" | "danger" | "neutral";
}) {
    const variantClass = {
        primary: "border-l-4 border-[#0f4c81]",
        success: "border-l-4 border-emerald-500",
        danger: "border-l-4 border-red-500",
        neutral: "border-l-4 border-slate-300",
    }[variant];

    const iconClass = {
        primary: "bg-blue-50 text-[#0f4c81]",
        success: "bg-emerald-50 text-emerald-600",
        danger: "bg-red-50 text-red-600",
        neutral: "bg-slate-50 text-slate-600",
    }[variant];

    return (
        <div className={`bg-white p-6 rounded-2xl shadow-[0px_4px_20px_rgba(15,76,129,0.05)] ${variantClass}`}>
            <div className="flex justify-between items-start mb-4">
                <div className={`p-2 rounded-lg ${iconClass}`}>
                    <span className="material-symbols-outlined">{icon}</span>
                </div>
            </div>

            <p className="text-xs text-[#727780] uppercase tracking-wider font-bold mb-1">
                {title}
            </p>
            <h3 className="text-xl font-bold text-[#191c1e]">{value}</h3>
            <p className="text-xs text-[#505f76] mt-2">{note}</p>
        </div>
    );
}

function Highlight({
    icon,
    title,
    text,
}: {
    icon: string;
    title: string;
    text: string;
}) {
    return (
        <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                <span className="material-symbols-outlined text-blue-100 text-[22px] leading-none overflow-hidden">
                    {icon}
                </span>
            </div>

            <div>
                <p className="font-bold text-sm">{title}</p>
                <p className="text-sm text-blue-100">{text}</p>
            </div>
        </div>
    );
}

function PaymentBar({
    label,
    value,
    total,
    danger = false,
    warning = false,
}: {
    label: string;
    value: number;
    total: number;
    danger?: boolean;
    warning?: boolean;
}) {
    const percentage = total === 0 ? 0 : Math.round((value / total) * 100);

    const color = danger
        ? "bg-red-500"
        : warning
            ? "bg-orange-500"
            : "bg-emerald-500";

    return (
        <div>
            <div className="flex justify-between text-sm font-semibold mb-1.5">
                <span>{label}</span>
                <span>{percentage}%</span>
            </div>

            <div className="w-full bg-slate-100 rounded-full h-2">
                <div
                    className={`${color} h-2 rounded-full`}
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>

            <p className="text-xs text-[#505f76] mt-1">{formatCurrency(value)}</p>
        </div>
    );
}

function TableHead({ children }: { children: React.ReactNode }) {
    return (
        <th className="px-6 py-4 text-[11px] text-[#505f76] uppercase tracking-wider font-bold">
            {children}
        </th>
    );
}

function ReportStatusBadge({ row }: { row: FinancialRow }) {
    if (row.grossProfit < 0) {
        return (
            <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-[11px] font-bold">
                LOSS
            </span>
        );
    }

    if (row.creditAmount > 0) {
        return (
            <span className="px-2.5 py-1 rounded-full bg-orange-100 text-orange-700 text-[11px] font-bold">
                PENDING PAYMENT
            </span>
        );
    }

    return (
        <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-bold">
            PROFITABLE
        </span>
    );
}

function SummaryLine({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-[#505f76]">{label}</span>
            <span className="font-bold text-[#191c1e]">{value}</span>
        </div>
    );
}

function formatCurrency(value: number) {
    return `Rs. ${value.toLocaleString("en-IN")}`;
}

export default FinancialReports;