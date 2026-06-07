import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

// Thai month representations and full names
const THAI_MONTH_MAP: Record<string, { name: string; num: number; yearOffset: number }> = {
  "ม.ค.": { name: "มกราคม", num: 1, yearOffset: 543 },
  "ก.พ.": { name: "กุมภาพันธ์", num: 2, yearOffset: 543 },
  "มี.ค.": { name: "มีนาคม", num: 3, yearOffset: 543 },
  "เม.ย.": { name: "เมษายน", num: 4, yearOffset: 543 },
  "พ.ค.": { name: "พฤษภาคม", num: 5, yearOffset: 543 },
  "มิ.ย.": { name: "มิถุนายน", num: 6, yearOffset: 543 },
  "ก.ค.": { name: "กรกฎาคม", num: 7, yearOffset: 543 },
  "ส.ค.": { name: "สิงหาคม", num: 8, yearOffset: 543 },
  "ก.ย.": { name: "กันยายน", num: 9, yearOffset: 543 },
  "ต.ค.": { name: "ตุลาคม", num: 10, yearOffset: 543 },
  "พ.ย.": { name: "พฤศจิกายน", num: 11, yearOffset: 543 },
  "ธ.ค.": { name: "ธันวาคม", num: 12, yearOffset: 543 }
};

// Helper to check if a header column is a month column
function getMonthMetadata(header: string) {
  const trimmed = header.trim();
  for (const prefix of Object.keys(THAI_MONTH_MAP)) {
    if (trimmed.startsWith(prefix)) {
      // Extract year (e.g., มิ.ย.68 -> 68)
      const matches = trimmed.match(/\.?(\d+)/);
      const yearStr = matches ? matches[1] : "68";
      const yearNum = parseInt(yearStr, 10);
      return {
        isMonth: true,
        shortName: prefix + yearStr,
        fullName: `${THAI_MONTH_MAP[prefix].name} 25${yearStr}`,
        monthNum: THAI_MONTH_MAP[prefix].num,
        year: 2500 + yearNum,
        sortKey: (2500 + yearNum) * 100 + THAI_MONTH_MAP[prefix].num
      };
    }
  }
  return { isMonth: false };
}

// Custom CSV Parser to handle quotes and nested commas
function parseCSV(text: string): string[][] {
  const result: string[][] = [];
  let row: string[] = [];
  let current = "";
  let insideQuotes = false;
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];
    
    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        current += '"';
        i++; // skip next quote
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      row.push(current.trim().replace(/^\ufeff/, "")); // Strip Byte Order Mark (BOM) if present
      current = "";
    } else if ((char === '\r' || char === '\n') && !insideQuotes) {
      row.push(current.trim().replace(/^\ufeff/, ""));
      current = "";
      if (row.length > 1 || (row.length === 1 && row[0] !== "")) {
        result.push(row);
      }
      row = [];
      if (char === '\r' && nextChar === '\n') {
        i++; // skip LF
      }
    } else {
      current += char;
    }
  }
  if (row.length > 0 || current !== "") {
    row.push(current.trim().replace(/^\ufeff/, ""));
    if (row.length > 1 || (row.length === 1 && row[0] !== "")) {
      result.push(row);
    }
  }
  return result;
}

// Process sheet and prepare structured JSON response
async function fetchAndProcessSheet() {
  const SHEET_URL = "https://docs.google.com/spreadsheets/d/1gkNfgjyItfyTjHPPOnLeLozP2PGDzywyDrg_n6JlT1Q/export?format=csv&gid=0";
  
  const response = await fetch(SHEET_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch spreadsheet: ${response.statusText}`);
  }
  
  const csvText = await response.text();
  const rows = parseCSV(csvText);
  if (rows.length < 2) {
    throw new Error("No data or headers found in Google Sheet");
  }
  
  const rawHeaders = rows[0].map(h => h.trim().replace(/\s+/g, " "));
  const dataRows = rows.slice(1);
  
  // Find key column indices by matching titles (thai keywords)
  let dateIdx = -1;
  let contentIdx = -1;
  let channelIdx = -1;
  let timeIdx = -1;
  let responseIdx = -1;
  let versionIdx = -1;
  let typeIdx = -1;
  const monthCols: { index: number; shortName: string; fullName: string; year: number; monthNum: number; sortKey: number }[] = [];
  
  rawHeaders.forEach((header, index) => {
    const cleanHeader = header.toLowerCase();
    
    // Exact or loose matching for main columns
    if (cleanHeader.includes("วันที่")) {
      dateIdx = index;
    } else if (cleanHeader.includes("เนื้อหา")) {
      contentIdx = index;
    } else if (cleanHeader.includes("ช่องทางการเผยแพร่") || cleanHeader.includes("ช่องทาง")) {
      channelIdx = index;
    } else if (cleanHeader.includes("เวลา")) {
      timeIdx = index;
    } else if (cleanHeader.includes("ผู้รับผิดชอบ")) {
      responseIdx = index;
    } else if (cleanHeader.includes("เวอร์ชั่น") || cleanHeader.includes("เวอร์ชัน")) {
      versionIdx = index;
    } else if (cleanHeader.includes("ประเภท")) {
      typeIdx = index;
    } else {
      const monthMeta = getMonthMetadata(header);
      if (monthMeta.isMonth && monthMeta.shortName && monthMeta.fullName && monthMeta.year && monthMeta.monthNum && monthMeta.sortKey) {
        monthCols.push({
          index,
          shortName: monthMeta.shortName,
          fullName: monthMeta.fullName,
          year: monthMeta.year,
          monthNum: monthMeta.monthNum,
          sortKey: monthMeta.sortKey
        });
      }
    }
  });

  // Fallbacks if columns are not found in header
  if (dateIdx === -1) dateIdx = 0;
  if (contentIdx === -1) contentIdx = 1;
  if (channelIdx === -1) channelIdx = 2;
  // If we missed any columns physically, map them to next indices or default safely
  
  // Process the original wide list
  const wideRecords = dataRows.map((row, rowIdx) => {
    const record: Record<string, string | number> = { id: rowIdx + 1 };
    
    record["วันที่"] = row[dateIdx] || "";
    record["เนื้อหา"] = row[contentIdx] || "";
    record["ช่องทางการเผยแพร่"] = row[channelIdx] || "";
    record["เวลา"] = row[timeIdx] || "";
    record["ผู้รับผิดชอบ"] = row[responseIdx] || "ไม่ระบุ";
    record["เวอร์ชั่น"] = row[versionIdx] || "";
    record["ประเภท"] = row[typeIdx] || "ข่าวประชาสัมพันธ์";
    
    // Month columns original wide values
    monthCols.forEach(mCol => {
      const val = row[mCol.index] || "";
      record[mCol.fullName] = val;
    });
    
    return record;
  });

  // Filter out records which have no text content at all to prevent blank noise rows
  const activeRecords = wideRecords.filter(r => (r["เนื้อหา"] as string).trim() !== "");

  // Unpivot / Melt the data for time-series analysis
  const meltedRecords: any[] = [];
  activeRecords.forEach(record => {
    // A record can be published in multiple months, or we look at wide month values
    // Often month column contains binary '1', counts, or specific targets. 
    monthCols.forEach(mCol => {
      const val = record[mCol.fullName];
      // If cell has value (e.g. "1", "x", ">0", etc.), consider it active in that month
      const valStr = String(val).trim();
      if (valStr !== "" && valStr !== "0" && valStr.toLowerCase() !== "false" && valStr !== "-") {
        meltedRecords.push({
          id: record.id,
          date: record["วันที่"],
          content: record["เนื้อหา"],
          channel: record["ช่องทางการเผยแพร่"],
          time: record["เวลา"],
          responsible: record["ผู้รับผิดชอบ"],
          version: record["เวอร์ชั่น"],
          type: record["ประเภท"],
          monthShort: mCol.shortName,
          monthFull: mCol.fullName,
          monthNum: mCol.monthNum,
          year: mCol.year,
          sortKey: mCol.sortKey,
          value: parseFloat(valStr) || 1 // if it is a numeric value, use it, otherwise treat as 1 count
        });
      }
    });
  });

  // Extract unique categories for filters
  const channels = Array.from(new Set(activeRecords.map(r => r["ช่องทางการเผยแพร่"] as string).filter(Boolean)));
  const responsibles = Array.from(new Set(activeRecords.map(r => r["ผู้รับผิดชอบ"] as string).filter(Boolean)));
  const types = Array.from(new Set(activeRecords.map(r => r["ประเภท"] as string).filter(Boolean)));
  const versions = Array.from(new Set(activeRecords.map(r => r["เวอร์ชั่น"] as string).filter(e => e !== undefined && e !== "")));
  
  // Sort months metadata
  monthCols.sort((a, b) => a.sortKey - b.sortKey);

  return {
    rawHeaders,
    headersMap: {
      dateIdx,
      contentIdx,
      channelIdx,
      timeIdx,
      responseIdx,
      versionIdx,
      typeIdx
    },
    monthColumns: monthCols.map(m => ({ fullName: m.fullName, shortName: m.shortName, year: m.year, monthNum: m.monthNum, sortKey: m.sortKey })),
    records: activeRecords,
    meltedRecords,
    filters: {
      channels,
      responsibles,
      types,
      versions
    }
  };
}

// Cache of Google Sheet data to prevent hitting rate limits/speed issues
let cachedData: any = null;
let lastFetchedTime = 0;
const CACHE_TTL_MS = 60000; // Cache for 1 minute

// API Routes
app.get("/api/news", async (req, res) => {
  try {
    const now = Date.now();
    if (!cachedData || now - lastFetchedTime > CACHE_TTL_MS) {
      cachedData = await fetchAndProcessSheet();
      lastFetchedTime = now;
    }
    res.json(cachedData);
  } catch (err: any) {
    console.error("Error fetching sheet:", err);
    // If we have cached data, return it instead of failing
    if (cachedData) {
      return res.json({ ...cachedData, _stale: true, _error: err.message });
    }
    res.status(500).json({ error: "Failed to fetch or parse news data", details: err.message });
  }
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", port: PORT });
});

async function startServer() {
  // Vite dev server middleware integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Dashboard running on http://localhost:${PORT}`);
  });
}

startServer();
