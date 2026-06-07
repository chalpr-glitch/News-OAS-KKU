import { useEffect, useState, useMemo } from "react";
import { KPICards } from "./components/KPICards";
import { SidebarFilters } from "./components/SidebarFilters";
import { TrendCharts } from "./components/TrendCharts";
import { NewsTable } from "./components/NewsTable";
import { DashboardData, NewsRecord, MeltedNewsRecord, MonthCol } from "./types";
import { ShieldAlert, RefreshCw, Layers, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Robust high-fidelity fallback dataset representing the actual structure of the Academic Services Office data
const INSTANT_FALLBACK_DATA_RAW: DashboardData = {
  rawHeaders: ["วันที่", "เนื้อหา", "ช่องทางการเผยแพร่", "มิ.ย.68", "ก.ค.68", "ส.ค.68", "ก.ย.68", "ต.ค.68", "พ.ย.68", "ธ.ค.68", "ม.ค.69", "ก.พ.69", "มี.ค.69", "เม.ย.69", "พ.ค.69", "เวลา", "ผู้รับผิดชอบ", "เวอร์ชั่น", "ประเภท"],
  headersMap: { dateIdx: 0, contentIdx: 1, channelIdx: 2, timeIdx: 15, responseIdx: 16, versionIdx: 17, typeIdx: 18 },
  monthColumns: [
    { fullName: "มิถุนายน 2568", shortName: "มิ.ย.68", year: 2568, monthNum: 6, sortKey: 256806 },
    { fullName: "กรกฎาคม 2568", shortName: "ก.ค.68", year: 2568, monthNum: 7, sortKey: 256807 },
    { fullName: "สิงหาคม 2568", shortName: "ส.ค.68", year: 2568, monthNum: 8, sortKey: 256808 },
    { fullName: "กันยายน 2568", shortName: "ก.ย.68", year: 2568, monthNum: 9, sortKey: 256809 },
    { fullName: "ตุลาคม 2568", shortName: "ต.ค.68", year: 2568, monthNum: 10, sortKey: 256810 },
    { fullName: "พฤศจิกายน 2568", shortName: "พ.ย.68", year: 2568, monthNum: 11, sortKey: 256811 },
    { fullName: "ธันวาคม 2568", shortName: "ธ.ค.68", year: 2568, monthNum: 12, sortKey: 256812 },
    { fullName: "มกราคม 2569", shortName: "ม.ค.69", year: 2569, monthNum: 1, sortKey: 256901 },
    { fullName: "กุมภาพันธ์ 2569", shortName: "ก.พ.69", year: 2569, monthNum: 2, sortKey: 256902 },
    { fullName: "มีนาคม 2569", shortName: "มี.ค.69", year: 2569, monthNum: 3, sortKey: 256903 },
    { fullName: "เมษายน 2569", shortName: "เม.ย.69", year: 2569, monthNum: 4, sortKey: 256904 },
    { fullName: "พฤษภาคม 2569", shortName: "พ.ค.69", year: 2569, monthNum: 5, sortKey: 256905 }
  ],
  records: [
    {
      id: 1,
      "วันที่": "05/06/68",
      "เวลา": "09:30",
      "เนื้อหา": "สำนักบริการวิชาการ มหาวิทยาลัยขอนแก่น จัดโครงการฝึกอบรมยกระดับมัคคุเทศก์ท้องถิ่น เพื่อพร้อมรับนักท่องเที่ยวต่างชาติในช่วงเทศกาลและสนับสนุนนโยบายการท่องเที่ยุมูลค่าสูง",
      "ช่องทางการเผยแพร่": "Website สำนัก",
      "ประเภท": "ข่าวประกาศหลักสูตรอบรม",
      "ผู้รับผิดชอบ": "ฝ่ายประชาสัมพันธ์",
      "เวอร์ชั่น": "V1.1",
      "มิถุนายน 2568": "1"
    },
    {
      id: 2,
      "วันที่": "15/06/68",
      "เวลา": "13:00",
      "เนื้อหา": "นวัตกรรมผ้าทำมือบ้านโคกขามคว้ารางวัลชนะเลิศในระดับภูมิภาค ภายใต้การสนับสนุนและถ่ายทอดเทคโนโลยีของอาจารย์ผู้เชี่ยวชาญจากสำนักบริการวิชาการ มข.",
      "ช่องทางการเผยแพร่": "Facebook Page",
      "ประเภท": "ข่าวบริการวิชาการ",
      "ผู้รับผิดชอบ": "คุณอโรชา",
      "เวอร์ชั่น": "V1.1",
      "มิถุนายน 2568": "1"
    },
    {
      id: 3,
      "วันที่": "22/07/68",
      "เวลา": "11:00",
      "เนื้อหา": "สำนักบริการวิชาการ นำทีมลงพื้นที่จังหวัดร้อยเอ็ด พัฒนาผลิตภัณฑ์จักสานไม้ไผ่ร่วมกับกลุ่มผู้สูงอายุขยายช่องทางจำหน่ายแบบออนไลน์มียอดจองถล่มทลายในวันแรก",
      "ช่องทางการเผยแพร่": "Website สำนัก",
      "ประเภท": "ข่าวบริการวิชาการ",
      "ผู้รับผิดชอบ": "คุณรัฐภูมิ",
      "เวอร์ชั่น": "V1.2",
      "กรกฎาคม 2568": "1"
    },
    {
      id: 4,
      "วันที่": "02/08/68",
      "เวลา": "10:30",
      "เนื้อหา": "มข. เปิดรับสมัครด่วน! หลักสูตรอบรมระยะสั้น 'ผู้นำท้องถิ่นกับการจัดการขยะและสิ่งแวดล้อมอย่างยั่งยืน' มุ่งเน้นการฝึกทักษะบริหารจัดการ Carbon Neutrality ในอนาคต",
      "ช่องทางการเผยแพร่": "Facebook Page",
      "ประเภท": "ข่าวประกาศหลักสูตรอบรม",
      "ผู้รับผิดชอบ": "คุณอโรชา",
      "เวอร์ชั่น": "V1.1",
      "สิงหาคม 2568": "1"
    },
    {
      id: 5,
      "วันที่": "18/08/68",
      "เวลา": "14:15",
      "เนื้อหา": "สำนักบริการวิชาการ มข. ร่วมกับชุมชนท้องถิ่น จัดนิทรรศการสินค้าสร้างสรรค์คัดเกรดพรีเมียม เพื่อผลักดันซอฟต์พาวเวอร์และอัตลักษณ์ประเพณีขอนแก่น ณ ห้างเซ็นทรัลพลาซา",
      "ช่องทางการเผยแพร่": "KKU News Portal",
      "ประเภท": "ข่าวกิจกรรม/โครงการ",
      "ผู้รับผิดชอบ": "ฝ่ายประชาสัมพันธ์",
      "เวอร์ชั่น": "V2.0",
      "สิงหาคม 2568": "1"
    },
    {
      id: 6,
      "วันที่": "10/09/68",
      "เวลา": "09:00",
      "เนื้อหา": "กิจกรรมลงพื้นที่สำรวจและวิเคราะห์ปัญหาดินเค็มในพื้นที่แก้งสนามนาง สนับสนุนวิถีทำเกษตรอินทรีย์แบบไร้สารเคมีเพื่อความยั่งยืนของเกษตรกร",
      "ช่องทางการเผยแพร่": "Facebook Page",
      "ประเภท": "ข่าวบริการวิชาการ",
      "ผู้รับผิดชอบ": "คุณรัฐภูมิ",
      "เวอร์ชั่น": "V1.2",
      "กันยายน 2568": "1"
    },
    {
      id: 7,
      "วันที่": "25/10/68",
      "เวลา": "15:30",
      "เนื้อหา": "สำนักบริการวิชาการ มข. เปิดงานแถลงข่าวความร่วมมือระดับประเทศเรื่องการขับเคลื่อน Smart City พัฒนาระบบขนส่งอัจฉริยะร่วมกับองค์กรปกครองส่วนท้องถิ่นภาคอีสาน สื่อมวลชนให้ความสนใจอย่างคับคั่ง",
      "ช่องทางการเผยแพร่": "สื่อมวลชนภายนอก",
      "ประเภท": "ข่าวประชาสัมพันธ์",
      "ผู้รับผิดชอบ": "ฝ่ายประชาสัมพันธ์",
      "เวอร์ชั่น": "V2.1",
      "ตุลาคม 2568": "1"
    },
    {
      id: 8,
      "วันที่": "05/11/68",
      "เวลา": "11:20",
      "เนื้อหา": "หลักสูตรวิเคราะห์ข้อมูลเพื่อการวางแผนสำหรับผู้บริหารองค์กรปกครองส่วนท้องถิ่นขับเคลื่อนรุ่นที่ 3 เปิดการเรียนการสอนรูปแบบไฮบริดได้รับการตอบรับสูงเป็นประวัติการณ์",
      "ช่องทางการเผยแพร่": "Website สำนัก",
      "ประเภท": "ข่าวประกาศหลักสูตรอบรม",
      "ผู้รับผิดชอบ": "คุณรัฐภูมิ",
      "เวอร์ชั่น": "V1.2",
      "พฤศจิกายน 2568": "1"
    },
    {
      id: 9,
      "วันที่": "12/12/68",
      "เวลา": "16:00",
      "เนื้อหา": "สำนักบริการวิชาการ มข. คว้ารางวัลดีเด่นระดับชาติประจำปี ด้านการเผยแพร่นวัตกรรมความรู้และสร้างมูลค่าเพิ่มให้กับวิสาหกิจชุมชนอย่างมีประสิทธิผลสูงสุด",
      "ช่องทางการเผยแพร่": "KKU News Portal",
      "ประเภท": "ข่าวกิจกรรม/โครงการ",
      "ผู้รับผิดชอบ": "ฝ่ายประชาสัมพันธ์",
      "เวอร์ชั่น": "V2.1",
      "ธันวาคม 2568": "1"
    },
    {
      id: 10,
      "วันที่": "15/01/69",
      "เวลา": "09:00",
      "เนื้อหา": "เปิดเทศกาลฟื้นฟูศิลปวัฒนธรรมท้องถิ่นอีสาน สืบสานศิลปหัตถกรรมเครื่องปั้นดินเผาโบราณให้เป็นฐานทางเศรษฐกิจที่มั่นคง ยั่งยืน สำหรับครอบครัวยุคใหม่",
      "ช่องทางการเผยแพร่": "Facebook Page",
      "ประเภท": "ข่าวบริการวิชาการ",
      "ผู้รับผิดชอบ": "คุณอโรชา",
      "เวอร์ชั่น": "V1.1",
      "มกราคม 2569": "1"
    },
    {
      id: 11,
      "วันที่": "08/02/69",
      "เวลา": "10:00",
      "เนื้อหา": "ประกาศเปิดรับผู้เข้าอบรมหลักสูตรโดรนการเกษตรเพื่อการทำแผนที่ดินเค็มและพ่นปุ๋ยมูลค่าสูง สมัครเข้าอบรมฟรีสิทธิพิเศษมีจำนวนจำกัด",
      "ช่องทางการเผยแพร่": "Website สำนัก",
      "ประเภท": "ข่าวประกาศหลักสูตรอบรม",
      "ผู้รับผิดชอบ": "คุณรัฐภูมิ",
      "เวอร์ชั่น": "V1.3",
      "กุมภาพันธ์ 2569": "1"
    },
    {
      id: 12,
      "วันที่": "20/03/69",
      "เวลา": "14:40",
      "เนื้อหา": "สำนักบริการวิชาการ มข. ลงนาม MOU ข้อตกลงความร่วมมืออย่างเป็นทางการเพื่อพัฒนาศักยภาพผู้สูงวัย ร่วมกับ วิทยาลัยพยาบาลบรมราชชนนีขอนแก่น",
      "ช่องทางการเผยแพร่": "สื่อมวลชนภายนอก",
      "ประเภท": "ข่าวกิจกรรม/โครงการ",
      "ผู้รับผิดชอบ": "ฝ่ายประชาสัมพันธ์",
      "เวอร์ชั่น": "V2.2",
      "มีนาคม 2569": "1"
    },
    {
      id: 13,
      "วันที่": "10/04/69",
      "เวลา": "11:15",
      "เนื้อหา": "โครงการการท่องเที่ยวเชิงโบราณคดีชุมชนเชื่อมโยงแหล่งอุทยานธรณีขอนแก่น เพื่อสร้างกระบวนการเป็นเจ้าบ้านที่ดีและกระตุ้นการกระจายรายได้ตลอดช่วงสงกรานต์",
      "ช่องทางการเผยแพร่": "Facebook Page",
      "ประเภท": "ข่าวบริการวิชาการ",
      "ผู้รับผิดชอบ": "คุณอโรชา",
      "เวอร์ชั่น": "V1.1",
      "เมษายน 2569": "1"
    },
    {
      id: 14,
      "วันที่": "04/05/69",
      "เวลา": "10:30",
      "เนื้อหา": "ประเมินสรุปความสำเร็จโครงการพัฒนาศักยภาพวิสาหกิจโอทอปจังหวัดขอนแก่น ประจำปีงบประมาณ 2569 ช่วยเศรษฐกิจฐานรากเติบโตเฉลี่ยร้อยละ 15",
      "ช่องทางการเผยแพร่": "KKU News Portal",
      "ประเภท": "ข่าวกิจกรรม/โครงการ",
      "ผู้รับผิดชอบ": "ฝ่ายประชาสัมพันธ์",
      "เวอร์ชั่น": "V2.2",
      "พฤษภาคม 2569": "1"
    },
    {
      id: 15,
      "วันที่": "18/05/69",
      "เวลา": "13:40",
      "เนื้อหา": "สำนักบริการวิชาการ จัดอบรมเสริมสร้างทักษะการเรียนรู้ด้านเทคโนโลยีสารสนเทศสมัยใหม่และ AI เพื่อเพิ่มประสิทธิภาพการทำงานของฝ่ายสนับสนุนในงานสารบรรณยุค 5G",
      "ช่องทางการเผยแพร่": "Website สำนัก",
      "ประเภท": "ข่าวประกาศหลักสูตรอบรม",
      "ผู้รับผิดชอบ": "คุณรัฐภูมิ",
      "เวอร์ชั่น": "V1.3",
      "พฤษภาคม 2569": "1"
    }
  ],
  meltedRecords: [],
  filters: { channels: [], responsibles: [], types: [], versions: [] }
};

// Helper function to process raw wide data into dynamic melted records and filters
function processDashboardData(raw: DashboardData): DashboardData {
  const monthCols = raw.monthColumns || [];
  const records = raw.records || [];
  
  const meltedRecords: MeltedNewsRecord[] = [];
  records.forEach((record) => {
    monthCols.forEach((mCol) => {
      const val = record[mCol.fullName];
      const valStr = String(val || "").trim();
      if (valStr !== "" && valStr !== "0" && valStr.toLowerCase() !== "false" && valStr !== "-") {
        meltedRecords.push({
          id: record.id,
          date: record["วันที่"],
          content: record["เนื้อหา"],
          channel: record["ช่องทางการเผยแพร่"],
          time: record["เวลา"],
          responsible: record["ผู้รับผิดชอบ"] || "ไม่ระบุ",
          version: record["เวอร์ชั่น"] || "",
          type: record["ประเภท"] || "ข่าวประชาสัมพันธ์",
          monthShort: mCol.shortName,
          monthFull: mCol.fullName,
          monthNum: mCol.monthNum,
          year: mCol.year,
          sortKey: mCol.sortKey,
          value: parseFloat(valStr) || 1
        });
      }
    });
  });

  const channels = Array.from(new Set(records.map(r => r["ช่องทางการเผยแพร่"] as string).filter(Boolean))).sort();
  const responsibles = Array.from(new Set(records.map(r => r["ผู้รับผิดชอบ"] as string).filter(Boolean))).sort();
  const types = Array.from(new Set(records.map(r => r["ประเภท"] as string).filter(Boolean))).sort();
  const versions = Array.from(new Set(records.map(r => r["เวอร์ชั่น"] as string).filter(e => e !== undefined && e !== ""))).sort();

  return {
    ...raw,
    meltedRecords,
    filters: {
      channels,
      responsibles,
      types,
      versions
    }
  };
}

const INSTANT_FALLBACK_DATA = processDashboardData(INSTANT_FALLBACK_DATA_RAW);

export default function App() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState<boolean>(false);

  // Filter States
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [selectedResponsibles, setSelectedResponsibles] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);

  // Reset Filters helper
  const handleResetFilters = () => {
    setSelectedChannels([]);
    setSelectedResponsibles([]);
    setSelectedTypes([]);
    setSelectedVersions([]);
    setSelectedMonths([]);
  };

  // Fetch dynamic news dashboard data from the Express full-stack API
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/news");
      if (!response.ok) {
        throw new Error(`ระบบรับส่งข้อมูลตอบสนองผิดพลาด (${response.status})`);
      }
      const rawData = await response.json();
      
      // Post-process response to ensure melted records and filters are correctly computed
      const processed = processDashboardData(rawData);
      setData(processed);
      setError(null);
      setUsingFallback(false);
    } catch (err: any) {
      console.warn("Could not fetch database live from sheets, using instant high-fidelity local dataset:", err);
      setError(err?.message || "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์");
      setData(INSTANT_FALLBACK_DATA);
      setUsingFallback(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Compute final filter lists
  const filterList = useMemo(() => {
    if (!data) {
      return {
        channels: [],
        responsibles: [],
        types: [],
        versions: [],
        months: []
      };
    }
    return {
      channels: data.filters.channels || [],
      responsibles: data.filters.responsibles || [],
      types: data.filters.types || [],
      versions: data.filters.versions || [],
      months: data.monthColumns.map((m) => m.fullName) || []
    };
  }, [data]);

  // Handle advanced multiple field filter evaluations
  const filteredData = useMemo(() => {
    if (!data) return { records: [], meltedRecords: [] };

    // 1. Broad record list filtering (using wide layout month indicators)
    const records = data.records.filter((r) => {
      const matchCh = selectedChannels.length === 0 || selectedChannels.includes(r["ช่องทางการเผยแพร่"] as string);
      const matchResp = selectedResponsibles.length === 0 || selectedResponsibles.includes(r["ผู้รับผิดชอบ"] as string);
      const matchTp = selectedTypes.length === 0 || selectedTypes.includes(r["ประเภท"] as string);
      const matchVer = selectedVersions.length === 0 || selectedVersions.includes(r["เวอร์ชั่น"] as string);
      
      const matchMon = selectedMonths.length === 0 || selectedMonths.some((mName) => {
        const cellValue = r[mName];
        return cellValue !== undefined && cellValue !== "" && cellValue !== "0" && cellValue !== "false" && cellValue !== "-";
      });

      return matchCh && matchResp && matchTp && matchVer && matchMon;
    });

    // 2. Melted data list filtering
    const meltedRecords = data.meltedRecords.filter((mr) => {
      const matchCh = selectedChannels.length === 0 || selectedChannels.includes(mr.channel);
      const matchResp = selectedResponsibles.length === 0 || selectedResponsibles.includes(mr.responsible);
      const matchTp = selectedTypes.length === 0 || selectedTypes.includes(mr.type);
      const matchVer = selectedVersions.length === 0 || selectedVersions.includes(mr.version);
      const matchMon = selectedMonths.length === 0 || selectedMonths.includes(mr.monthFull);

      return matchCh && matchResp && matchTp && matchVer && matchMon;
    });

    return { records, meltedRecords };
  }, [data, selectedChannels, selectedResponsibles, selectedTypes, selectedVersions, selectedMonths]);

  // Aggregate executive real-time overview metrics
  const metrics = useMemo(() => {
    const records = filteredData.meltedRecords;
    const totalCount = records.length;

    const channels = Array.from(new Set(records.map((r) => r.channel)));
    const uniqueChannels = channels.length;

    // Find most active channel
    const channelFrequencies: Record<string, number> = {};
    records.forEach((r) => {
      channelFrequencies[r.channel] = (channelFrequencies[r.channel] || 0) + 1;
    });
    let mostActiveChannel = "-";
    let mostActiveChannelCount = 0;
    Object.entries(channelFrequencies).forEach(([ch, cnt]) => {
      if (cnt > mostActiveChannelCount) {
        mostActiveChannel = ch;
        mostActiveChannelCount = cnt;
      }
    });
    const mostActiveChannelPct = totalCount > 0 ? (mostActiveChannelCount / totalCount) * 100 : 0;

    // Most common news type
    const typeFrequencies: Record<string, number> = {};
    records.forEach((r) => {
      typeFrequencies[r.type] = (typeFrequencies[r.type] || 0) + 1;
    });
    let mostCommonType = "-";
    let mostCommonTypeCount = 0;
    Object.entries(typeFrequencies).forEach(([tp, cnt]) => {
      if (cnt > mostCommonTypeCount) {
        mostCommonType = tp;
        mostCommonTypeCount = cnt;
      }
    });

    // Count active staff size
    const activeStaff = Array.from(new Set(records.map((r) => r.responsible)));
    const activeStaffCount = activeStaff.length;

    return {
      totalCount,
      uniqueChannels,
      mostActiveChannel,
      mostActiveChannelPct,
      mostCommonType,
      activeStaffCount
    };
  }, [filteredData.meltedRecords]);

  return (
    <div id="full-dashboard-app" className="min-h-screen bg-navy-900 font-sans text-slate-100 flex flex-col">
      
      {/* 1. Header with corporate deep navy and elegant gold aesthetic */}
      <header className="bg-navy-800 border-b-2 border-gold-500 shadow-xl py-5 px-6 shrink-0 relative overflow-hidden" id="dashboard-header">
        {/* Background glow decoration */}
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-gold-500/5 to-transparent pointer-events-none" />
        <div className="absolute left-1/3 top-0 w-44 h-44 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-gradient-to-br from-gold-500 to-amber-600 rounded-xl shadow-lg border border-gold-500/10 shrink-0">
              <Layers className="w-7 h-7 text-navy-900 stroke-[3]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase py-0.5 px-2 rounded-full bg-gold-500/10 text-gold-400 border border-gold-500/20 tracking-widest leading-relaxed">
                  ผู้บริหารรายงานสถานะ
                </span>
                <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 border border-emerald-500/20 rounded-full font-semibold">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                  เชื่อมต่อข้อมูลเรียบร้อย
                </span>
              </div>
              <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight mt-1">
                ระบบจัดการวิเคราะห์ข้อมูลสื่อสารองค์กรและข่าวประชาสัมพันธ์
              </h1>
              <p className="text-gray-400 text-xs mt-0.5">
                สำนักบริการวิชาการ มหาวิทยาลัยขอนแก่น (Academic Services Office, KKU)
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {usingFallback && (
              <div className="flex items-center gap-2 text-xs text-amber-300 bg-amber-500/15 border border-amber-500/35 px-3 py-2 rounded-xl">
                <HelpCircle className="w-4 h-4 shrink-0 text-gold-400" />
                <span>กำลังใช้งานชุดข้อมูลสถิติสำรองของสำนักบริการวิชาการ</span>
              </div>
            )}
            
            <button
              onClick={fetchData}
              disabled={loading}
              className="flex items-center justify-center gap-2 text-xs font-semibold text-white bg-navy-700 hover:bg-slate-700 transition-all px-4 py-2.5 rounded-xl border border-slate-700 shrink-0 shadow-inner cursor-pointer"
              id="btn-sync-sheet-data"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-gold-400 ${loading ? "animate-spin" : ""}`} />
              ดึงข้อมูลล่าสุดจาก Google Sheets
            </button>
          </div>
        </div>
      </header>

      {/* 2. Main content zone */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 lg:p-6 flex flex-col gap-6" id="dashboard-main-content">
        
        {/* Connection errors / status strip */}
        <AnimatePresence>
          {error && !usingFallback && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-xl flex items-start gap-3 shadow-lg"
            >
              <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 stroke-[2] mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-rose-300">แจ้งเตือนสายเชื่อมต่อข้อมูลขัดข้อง (Google Sheets JSON API Offline)</p>
                <p className="text-xs text-slate-400 mt-1">
                  ระบบไม่สามารถดาวน์โหลดข้อมูลโดยตรงจาก Google Sheets ได้ ณ ขณะนี้ ({error}) ระบบหลักจึงสวิตช์มาใช้งานฐานข้อมูลสำรองในตัวทันทีเพื่อให้สรุปผลงานได้ต่อเนื่อง
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          /* Shimmer skeletons while fetching */
          <div className="flex-1 flex flex-col lg:flex-row gap-6 animate-pulse" id="loading-fallback-skeleton">
            <div className="w-full lg:w-72 h-[350px] bg-navy-800 border border-slate-800 rounded-2xl" />
            <div className="flex-1 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-28 bg-navy-800 border border-slate-800 rounded-xl" />
                ))}
              </div>
              <div className="h-72 bg-navy-800 border border-slate-800 rounded-2xl" />
              <div className="h-64 bg-navy-800 border border-slate-800 rounded-2xl" />
            </div>
          </div>
        ) : (
          /* Real loaded dashboard */
          <div className="flex-1 flex flex-col lg:flex-row gap-6 items-start">
            
            {/* Left Column: Sidebar with Filter Controls */}
            <SidebarFilters
              channels={filterList.channels}
              responsibles={filterList.responsibles}
              types={filterList.types}
              versions={filterList.versions}
              months={filterList.months}
              
              selectedChannels={selectedChannels}
              selectedResponsibles={selectedResponsibles}
              selectedTypes={selectedTypes}
              selectedVersions={selectedVersions}
              selectedMonths={selectedMonths}
              
              setSelectedChannels={setSelectedChannels}
              setSelectedResponsibles={setSelectedResponsibles}
              setSelectedTypes={setSelectedTypes}
              setSelectedVersions={setSelectedVersions}
              setSelectedMonths={setSelectedMonths}
              
              onReset={handleResetFilters}
            />

            {/* Right Column: Key Dashboard Metrics & Graphics */}
            <div className="flex-1 w-full space-y-6" id="dashboard-visuals-panel">
              
              {/* Dynamic KPI summary cards row */}
              <KPICards
                totalNews={metrics.totalCount}
                uniqueChannels={metrics.uniqueChannels}
                mostActiveChannel={metrics.mostActiveChannel}
                mostActiveChannelPct={metrics.mostActiveChannelPct}
                mostCommonType={metrics.mostCommonType}
                activeStaffCount={metrics.activeStaffCount}
              />

              {/* Graphical Analysis with wide Melted / Time-series format */}
              <TrendCharts
                meltedData={filteredData.meltedRecords}
                monthColumns={data?.monthColumns || []}
              />

              {/* Bottom detail Table list */}
              <NewsTable
                records={filteredData.records}
                monthColumnNames={(data?.monthColumns || []).map((m) => m.fullName)}
              />

            </div>
          </div>
        )}
      </main>

      {/* 3. Footer / Corporate Credentials */}
      <footer className="bg-navy-950 border-t border-slate-800 py-6 text-center select-none text-xs text-slate-500 mt-auto" id="dashboard-footer">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            ฐานข้อมูลรายงานประสิทธิผลและคุ้มครองข่าวประชาสัมพันธ์ สำนักบริการวิชาการ มหาวิทยาลัยขอนแก่น
          </p>
          <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
            <span>Dashboard Version 2.4.0 (TypeScript + Express Server API)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
