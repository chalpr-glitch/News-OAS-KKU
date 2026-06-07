import React, { useState, useMemo } from "react";
import { NewsRecord } from "../types";
import { Search, Download, ChevronLeft, ChevronRight, ListCollapse, FileSpreadsheet, CalendarDays } from "lucide-react";

interface NewsTableProps {
  records: NewsRecord[];
  monthColumnNames: string[];
}

export const NewsTable: React.FC<NewsTableProps> = ({ records, monthColumnNames }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filter records based on active textual search term
  const searchedRecords = useMemo(() => {
    if (!searchTerm.trim()) return records;
    const term = searchTerm.toLowerCase();
    return records.filter((r) => {
      const content = String(r["เนื้อหา"] || "").toLowerCase();
      const responsible = String(r["ผู้รับผิดชอบ"] || "").toLowerCase();
      const channel = String(r["ช่องทางการเผยแพร่"] || "").toLowerCase();
      const type = String(r["ประเภท"] || "").toLowerCase();
      return (
        content.includes(term) ||
        responsible.includes(term) ||
        channel.includes(term) ||
        type.includes(term)
      );
    });
  }, [records, searchTerm]);

  // Handle pagination values
  const paginatedRecords = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return searchedRecords.slice(startIndex, startIndex + pageSize);
  }, [searchedRecords, currentPage, pageSize]);

  const totalPages = Math.ceil(searchedRecords.length / pageSize) || 1;

  // Reset pagination if search term changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Export filtered rows to CSV
  const handleExportCSV = () => {
    const headers = [
      "ID",
      "วันที่",
      "เวลา",
      "เนื้อหาข่าวสาร",
      "ช่องทางการเผยแพร่",
      "ประเภทข่าว",
      "ผู้รับผิดชอบ",
      "เวอร์ชั่น",
      ...monthColumnNames
    ];

    const csvRows = [
      // BOM to support Thai Excel open
      "\uFEFF" + headers.join(","), 
      ...searchedRecords.map((r) => {
        return [
          r.id,
          `"${String(r["วันที่"] || "").replace(/"/g, '""')}"`,
          `"${String(r["เวลา"] || "").replace(/"/g, '""')}"`,
          `"${String(r["เนื้อหา"] || "").replace(/"/g, '""').replace(/\n/g, ' ')}"`,
          `"${String(r["ช่องทางการเผยแพร่"] || "").replace(/"/g, '""')}"`,
          `"${String(r["ประเภท"] || "").replace(/"/g, '""')}"`,
          `"${String(r["ผู้รับผิดชอบ"] || "").replace(/"/g, '""')}"`,
          `"${String(r["เวอร์ชั่น"] || "").replace(/"/g, '""')}"`,
          ...monthColumnNames.map((col) => `"${String(r[col] || "").replace(/"/g, '""')}"`)
        ].join(",");
      })
    ];

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "academic_news_dashboard_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper to get category colors for custom badges
  const getTypeBadgeStyles = (type: string) => {
    switch (type) {
      case "ข่าวบริการวิชาการ":
        return "bg-amber-500/10 text-amber-300 border-amber-500/30";
      case "ข่าวกิจกรรม/โครงการ":
        return "bg-blue-500/10 text-blue-300 border-blue-500/30";
      case "ข่าวประกาศหลักสูตรอบรม":
        return "bg-purple-500/10 text-purple-300 border-purple-500/30";
      default:
        return "bg-emerald-500/10 text-emerald-300 border-emerald-500/30";
    }
  };

  return (
    <div id="data-table-panel" className="bg-navy-800 border border-slate-800 rounded-2xl p-5 shadow-2xl">
      {/* Header Controls for Table */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-700/30">
        <div className="flex items-center gap-2">
          <ListCollapse className="w-5 h-5 text-gold-400" />
          <h4 className="text-white text-base font-semibold tracking-wider">
            ตารางรายงานข้อมูลข่าวเชิงลึก ({searchedRecords.length} รายการที่สอดคล้อง)
          </h4>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Dynamic Search Box */}
          <div className="relative" id="table-search-box">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ค้นหา ข่าวสาร/ผู้รับผิดชอบ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-navy-900 border border-slate-700/50 rounded-xl pl-9 pr-4 py-1.5 text-xs text-white placeholder-slate-400 w-full sm:w-56 focus:outline-none focus:ring-1 focus:ring-gold-500/50"
            />
          </div>

          {/* Export CSV Button */}
          <button
            id="btn-export-csv"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 text-xs text-navy-800 bg-gold-500 hover:bg-gold-400 font-semibold px-3.5 py-1.5 rounded-xl shadow-md transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            ส่งออกไฟล์ CSV
          </button>
        </div>
      </div>

      {/* Main Table Display */}
      <div className="overflow-x-auto w-full border border-slate-800 rounded-xl bg-navy-900/60 shadow-inner">
        <table className="w-full text-left border-collapse" id="news-dashboard-table">
          <thead>
            <tr className="bg-navy-900 border-b border-slate-800 text-slate-300 text-xs font-semibold select-none">
              <th className="py-3.5 px-4 text-center w-12">ลำดับ</th>
              <th className="py-3.5 px-3 min-w-[280px]">เนื้อข่าวประชาสัมพันธ์</th>
              <th className="py-3.5 px-3 min-w-[140px]">ช่องทางเผยแพร่</th>
              <th className="py-3.5 px-3 min-w-[120px]">ประเภทข่าว</th>
              <th className="py-3.5 px-3 text-center min-w-[100px]">ผู้รับผิดชอบ</th>
              <th className="py-3.5 px-3 text-center w-24">วันที่/เวลา</th>
              <th className="py-3.5 px-3 text-center w-20">เวอร์ชั่น</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs text-slate-100">
            {paginatedRecords.map((item, idx) => {
              const rowNumber = (currentPage - 1) * pageSize + idx + 1;
              return (
                <tr key={item.id} className="hover:bg-navy-800/45 transition-colors group">
                  <td className="py-3 px-4 text-center text-slate-500 font-mono">
                    {rowNumber}
                  </td>
                  <td className="py-3 px-3">
                    <p className="text-white/95 font-medium leading-relaxed max-w-xl group-hover:text-gold-400/90 transition-colors">
                      {item["เนื้อหา"] as string || "-"}
                    </p>
                  </td>
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center gap-1.5 text-slate-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                      {item["ช่องทางการเผยแพร่"] as string || "-"}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`inline-block border text-[10px] font-semibold px-2.5 py-0.5 rounded-full leading-relaxed ${getTypeBadgeStyles(item["ประเภท"] as string)}`}>
                      {item["ประเภท"] as string || "ปกติ"}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center select-none">
                    <span className="text-slate-300 bg-slate-800/40 border border-slate-700/30 px-2 py-0.5 rounded-md">
                      {item["ผู้รับผิดชอบ"] as string || "-"}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center text-slate-300 font-mono">
                    <div className="flex flex-col items-center justify-center gap-0.5">
                      <span className="flex items-center gap-1 text-[11px] font-medium">
                        <CalendarDays className="w-3 h-3 text-gold-500" />
                        {item["วันที่"] as string || "-"}
                      </span>
                      {item["เวลา"] && <span className="text-[10px] text-gray-400">{item["เวลา"] as string}</span>}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-center font-semibold text-slate-400">
                    {item["เวอร์ชั่น"] as string || "-"}
                  </td>
                </tr>
              );
            })}

            {paginatedRecords.length === 0 && (
              <tr>
                <td colSpan={7} className="py-12 text-center text-gray-400 font-medium">
                  <p className="text-sm">ไม่พบข้อมูลข่าวสารที่สอดคล้องกับคำหลักหรือตัวกรองที่เลือก</p>
                  <button
                    onClick={() => setSearchTerm("")}
                    className="text-xs text-gold-400 hover:underline mt-2 cursor-pointer"
                  >
                    ล้างคำค้นหา
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Table Pagination controls footer */}
      {searchedRecords.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 select-none">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>แสดงผล</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-navy-900 border border-slate-700/60 rounded px-2 py-1 text-white text-xs focus:ring-1 focus:ring-gold-500/50 outline-none"
            >
              {[10, 20, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size} รายการ
                </option>
              ))}
            </select>
            <span>จากทั้งหมด {searchedRecords.length} รายการ</span>
          </div>

          <div className="flex items-center gap-2" id="table-pagination">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg bg-navy-900 border border-slate-700/40 text-slate-300 hover:text-white disabled:opacity-40 hover:bg-slate-800 disabled:hover:bg-transparent transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1.5">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((page) => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
                .map((page, index, array) => {
                  const prevPage = array[index - 1];
                  const hasGap = prevPage && page - prevPage > 1;

                  return (
                    <React.Fragment key={page}>
                      {hasGap && <span className="text-slate-600 text-xs">...</span>}
                      <button
                        onClick={() => setCurrentPage(page)}
                        className={`w-7 h-7 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          currentPage === page
                            ? "bg-gold-500 text-navy-900 shadow-md shadow-gold-500/20"
                            : "bg-navy-900 border border-slate-700/30 text-slate-400 hover:text-white hover:bg-slate-800"
                        }`}
                      >
                        {page}
                      </button>
                    </React.Fragment>
                  );
                })}
            </div>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg bg-navy-900 border border-slate-700/40 text-slate-300 hover:text-white disabled:opacity-40 hover:bg-slate-800 disabled:hover:bg-transparent transition-all cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
