import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  PieChart,
  Pie
} from "recharts";
import { MeltedNewsRecord, MonthCol } from "../types";
import { BarChart3, TrendingUp, Users2, PieChartIcon } from "lucide-react";

interface TrendChartsProps {
  meltedData: MeltedNewsRecord[];
  monthColumns: MonthCol[];
}

export const TrendCharts: React.FC<TrendChartsProps> = ({ meltedData, monthColumns }) => {
  
  // 1. Prepare monthly trend data (ordered correctly by sortKey from มิ.ย.68 to พ.ค.69)
  const monthlyDataMap = new Map<number, { name: string; count: number; valueSum: number }>();
  
  // Initialize with all monthColumns to guarantee continuous time-series without gaps
  monthColumns.forEach(m => {
    monthlyDataMap.set(m.sortKey, {
      name: m.fullName,
      count: 0,
      valueSum: 0
    });
  });

  meltedData.forEach(item => {
    const monthKey = item.sortKey;
    const current = monthlyDataMap.get(monthKey);
    if (current) {
      current.count += 1;
      current.valueSum += (item.value || 1);
    } else {
      // fallback in case of missing headers map
      monthlyDataMap.set(monthKey, {
        name: item.monthFull,
        count: 1,
        valueSum: item.value || 1
      });
    }
  });

  const monthlyTrendSource = Array.from(monthlyDataMap.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([key, info]) => ({
      sortKey: key,
      monthName: info.name.split(" ")[0] + " " + info.name.split(" ")[1]?.substring(2), // shorter name like มิถุนายน 68
      fullMonthName: info.name,
      "จำนวนข่าว": info.count,
      "ปริมาณรวม": info.valueSum
    }));

  // 2. Prepare Channel distribution data
  const channelCounts: Record<string, number> = {};
  meltedData.forEach(item => {
    const ch = item.channel || "ไม่ระบุช่องทาง";
    channelCounts[ch] = (channelCounts[ch] || 0) + 1;
  });
  const channelData = Object.entries(channelCounts)
    .map(([name, count]) => ({ name, "จำนวนข่าว": count }))
    .sort((a, b) => b["จำนวนข่าว"] - a["จำนวนข่าว"]);

  // 3. Prepare types distribution data
  const typeCounts: Record<string, number> = {};
  meltedData.forEach(item => {
    const tp = item.type || "ข่าวประชาสัมพันธ์";
    typeCounts[tp] = (typeCounts[tp] || 0) + 1;
  });
  const typeData = Object.entries(typeCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // 4. Prepare responsible person performance
  const staffCounts: Record<string, number> = {};
  meltedData.forEach(item => {
    const staff = item.responsible || "รวม/ไม่ระบุผู้รับผิดชอบ";
    staffCounts[staff] = (staffCounts[staff] || 0) + 1;
  });
  const staffData = Object.entries(staffCounts)
    .map(([name, count]) => ({ name, "จำนวนข่าว": count }))
    .sort((a, b) => b["จำนวนข่าว"] - a["จำนวนข่าว"])
    .slice(0, 7); // Top 7 staff members for readability

  // Distinct executive luxury color palette
  const GOLD_COLORS = ["#D4AF37", "#C59B27", "#E5C158", "#B38F1F", "#F3E5AB", "#F6E8B1"];
  const ACCENT_COLORS = ["#3B82F6", "#10B981", "#8B5CF6", "#EC4899", "#F59E0B", "#EF4444"];

  const CustomChartTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-navy-900 border border-gold-500/30 p-3 rounded-lg shadow-xl text-xs text-white">
          <p className="font-semibold text-gold-400 mb-1">{label}</p>
          {payload.map((pld: any, index: number) => (
            <p key={index} style={{ color: pld.color || "#FFF" }}>
              {pld.name}: <span className="font-bold text-sm text-whites truncate">{Math.round(pld.value)} ข่าว</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div id="dashboard-charts" className="space-y-6">
      
      {/* 1. Primary Line Chart: Time series Monthly trend */}
      <div id="chart-panel-trend" className="bg-navy-800 border border-slate-800/80 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-700/30">
          <TrendingUp className="w-5 h-5 text-gold-400" />
          <div>
            <h4 className="text-white text-sm font-semibold tracking-wider">
              แนวโน้มปริมาณการเผยแพร่ข่าวสารรายเดือน (Time-series)
            </h4>
            <p className="text-gray-400 text-xs mt-0.5">
              แสดงข้อมูลสถิติจำนวนข่าวจาก {monthColumns[0]?.fullName || "เริ่มต้นโครงการ"} ถึง {monthColumns[monthColumns.length - 1]?.fullName || "สิ้นสุด"}
            </p>
          </div>
        </div>
        
        <div className="h-64 sm:h-80 w-full" id="monthly-trend-line-chart">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyTrendSource} margin={{ top: 10, right: 30, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
              <XAxis 
                dataKey="monthName" 
                stroke="#94a3b8" 
                tick={{ fontSize: 11 }} 
                axisLine={{ stroke: "#334155" }}
              />
              <YAxis 
                stroke="#94a3b8" 
                tick={{ fontSize: 11 }} 
                axisLine={{ stroke: "#334155" }}
                allowDecimals={false}
              />
              <Tooltip content={<CustomChartTooltip />} />
              <Line
                type="monotone"
                dataKey="จำนวนข่าว"
                name="จำนวนข่าวที่ประชาสัมพันธ์"
                stroke="#D4AF37"
                strokeWidth={3}
                activeDot={{ r: 8, stroke: "#111c33", strokeWidth: 2 }}
                dot={{ r: 4, stroke: "#D4AF37", fill: "#111c33", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Secondary Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-2">
        
        {/* Bar Chart: Channel breakdown */}
        <div id="chart-panel-channels" className="bg-navy-800 border border-slate-800/80 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-700/30">
            <BarChart3 className="w-5 h-5 text-gold-400" />
            <div>
              <h4 className="text-white text-sm font-semibold tracking-wider">
                จำนวนข่าวสารแยกตามช่องทางการเผยแพร่
              </h4>
              <p className="text-gray-400 text-xs mt-0.5">เปรียบเทียบขีดความสามารถการคุ้มครองและเผยแพร่ข่าวประชาสัมพันธ์</p>
            </div>
          </div>
          
          <div className="h-64 w-full" id="channel-distribution-bar-chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={channelData} layout="vertical" margin={{ top: 5, right: 15, left: 15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.4} horizontal={true} vertical={false} />
                <XAxis type="number" stroke="#94a3b8" tick={{ fontSize: 11 }} axisLine={{ stroke: "#334155" }} allowDecimals={false} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" tick={{ fontSize: 10 }} width={100} axisLine={{ stroke: "#334155" }} />
                <Tooltip content={<CustomChartTooltip />} />
                <Bar dataKey="จำนวนข่าว" name="จำนวนข่าว" radius={[0, 4, 4, 0]}>
                  {channelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={GOLD_COLORS[index % GOLD_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart: Performance per responsible staff members */}
        <div id="chart-panel-staff" className="bg-navy-800 border border-slate-800/80 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-700/30">
            <Users2 className="w-5 h-5 text-gold-400" />
            <div>
              <h4 className="text-white text-sm font-semibold tracking-wider">
                ผู้จัดการและผู้รับผิดชอบงานข่าวสาร (Top 7)
              </h4>
              <p className="text-gray-400 text-xs mt-0.5">จัดลำดับปริมาณงานที่รับผิดชอบเผยแพร่</p>
            </div>
          </div>
          
          <div className="h-64 w-full" id="staff-performance-bar-chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={staffData} margin={{ top: 10, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.4} />
                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 9 }} axisLine={{ stroke: "#334155" }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} axisLine={{ stroke: "#334155" }} allowDecimals={false} />
                <Tooltip content={<CustomChartTooltip />} />
                <Bar dataKey="จำนวนข่าว" name="จำนวนข่าว" radius={[4, 4, 0, 0]} fill="#3b82f6">
                  {staffData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={ACCENT_COLORS[index % ACCENT_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* 3. Small details panel: Pie chart for News Type Breakdown */}
      <div id="chart-panel-types" className="bg-navy-800 border border-slate-800/80 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-700/30">
          <PieChartIcon className="w-5 h-5 text-gold-400" />
          <div>
            <h4 className="text-white text-sm font-semibold tracking-wider">
              สัดส่วนจำนวนข่าวประชาสัมพันธ์แยกตามประเภทงาน
            </h4>
            <p className="text-gray-400 text-xs mt-0.5">วิเคราะห์สัดส่วนเนื้อหาข่าวสารที่สื่อสารออกไป</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-2">
          <div className="w-full sm:w-1/2 h-52 sm:h-64 flex justify-center" id="news-type-pie-chart">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={typeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={true}
                >
                  {typeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={GOLD_COLORS[index % GOLD_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="w-full sm:w-1/2 flex flex-col justify-center space-y-3 px-4">
            <h5 className="text-white/80 text-xs font-semibold uppercase tracking-wider">รายละเอียดสัดส่วนประเภทข่าว</h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" id="news-type-legend-list">
              {typeData.map((item, idx) => {
                const total = typeData.reduce((acc, c) => acc + c.value, 0);
                const percentVal = total > 0 ? (item.value / total) * 100 : 0;
                return (
                  <div key={item.name} className="flex items-center gap-3 py-1.5 px-2 bg-navy-900/40 rounded-lg border border-slate-800/60 shadow-sm">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: GOLD_COLORS[idx % GOLD_COLORS.length] }} />
                    <div className="truncate min-w-0">
                      <p className="text-xs font-medium text-white/95 truncate">{item.name}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{item.value} ข่าว ({percentVal.toFixed(1)}%)</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
