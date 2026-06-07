import React, { useState } from "react";
import { Filter, RotateCcw, ChevronDown, ChevronUp, Check, Hash, Calendar, Layers, UserCheck, Radio } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface SidebarFiltersProps {
  channels: string[];
  responsibles: string[];
  types: string[];
  versions: string[];
  months: string[];
  
  selectedChannels: string[];
  selectedResponsibles: string[];
  selectedTypes: string[];
  selectedVersions: string[];
  selectedMonths: string[];

  setSelectedChannels: (val: string[] | ((prev: string[]) => string[])) => void;
  setSelectedResponsibles: (val: string[] | ((prev: string[]) => string[])) => void;
  setSelectedTypes: (val: string[] | ((prev: string[]) => string[])) => void;
  setSelectedVersions: (val: string[] | ((prev: string[]) => string[])) => void;
  setSelectedMonths: (val: string[] | ((prev: string[]) => string[])) => void;

  onReset: () => void;
}

export const SidebarFilters: React.FC<SidebarFiltersProps> = ({
  channels,
  responsibles,
  types,
  versions,
  months,
  selectedChannels,
  selectedResponsibles,
  selectedTypes,
  selectedVersions,
  selectedMonths,
  setSelectedChannels,
  setSelectedResponsibles,
  setSelectedTypes,
  setSelectedVersions,
  setSelectedMonths,
  onReset,
}) => {
  const [collapsed, setCollapsed] = useState({
    channel: false,
    type: false,
    responsible: false,
    version: false,
    month: false,
  });

  const toggleCollapse = (section: keyof typeof collapsed) => {
    setCollapsed((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleToggle = (
    item: string,
    currentSelected: string[],
    setSelected: (val: string[] | ((prev: string[]) => string[])) => void
  ) => {
    if (currentSelected.includes(item)) {
      setSelected(currentSelected.filter((i) => i !== item));
    } else {
      setSelected([...currentSelected, item]);
    }
  };

  const selectAll = (all: string[], setSelected: (val: string[]) => void) => {
    setSelected(all);
  };

  const clearSection = (setSelected: (val: string[]) => void) => {
    setSelected([]);
  };

  return (
    <div id="sidebar-filters" className="w-full lg:w-72 bg-navy-800 border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col h-full shrink-0">
      <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-700/50">
        <div className="flex items-center gap-2 text-white font-semibold">
          <Filter className="w-5 h-5 text-gold-400" />
          <span className="text-sm uppercase tracking-wider">ตัวกรองข้อมูลข่าว</span>
        </div>
        <button
          id="btn-reset-filters"
          onClick={onReset}
          className="flex items-center gap-1.5 text-xs text-amber-500 hover:text-gold-400 transition-colors bg-amber-500/5 border border-amber-500/20 px-2.5 py-1.5 rounded-lg font-medium cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          รีเซ็ตทั้งหมด
        </button>
      </div>

      <div className="space-y-5 overflow-y-auto pr-1 flex-1 max-h-[70vh] lg:max-h-none">
        
        {/* Types Filter */}
        <div id="filter-section-type" className="border-b border-slate-700/30 pb-4">
          <button
            onClick={() => toggleCollapse("type")}
            className="flex items-center justify-between w-full text-slate-200 hover:text-white font-medium text-xs mb-3 uppercase tracking-wider cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-gold-500" />
              ประเภทข่าว ({selectedTypes.length || "ทั้งหมด"})
            </span>
            {collapsed.type ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
          
          <AnimatePresence initial={false}>
            {!collapsed.type && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="flex gap-2 mb-2 text-[11px]">
                  <button onClick={() => selectAll(types, setSelectedTypes)} className="text-gold-400 hover:underline cursor-pointer">เลือกทั้งหมด</button>
                  <span className="text-slate-600">|</span>
                  <button onClick={() => clearSection(setSelectedTypes)} className="text-slate-400 hover:underline cursor-pointer">ล้างค่า</button>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {types.map((type) => (
                    <label key={type} className="flex items-center gap-2.5 text-slate-300 text-xs hover:text-white cursor-pointer group py-0.5">
                      <div className="relative flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={selectedTypes.includes(type)}
                          onChange={() => handleToggle(type, selectedTypes, setSelectedTypes)}
                          className="sr-only"
                        />
                        <div className={`w-4.5 h-4.5 rounded border transition-all flex items-center justify-center ${selectedTypes.includes(type) ? 'bg-gold-500 border-gold-500 shadow-md shadow-gold-500/20' : 'bg-navy-900 border-slate-700 group-hover:border-slate-500'}`}>
                          {selectedTypes.includes(type) && <Check className="w-3 h-3 text-navy-900 stroke-[3]" />}
                        </div>
                      </div>
                      <span className="truncate">{type}</span>
                    </label>
                  ))}
                  {types.length === 0 && <span className="text-slate-500 text-xs italic">ไม่มีข้อมูล</span>}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Channel Filter */}
        <div id="filter-section-channel" className="border-b border-slate-700/30 pb-4">
          <button
            onClick={() => toggleCollapse("channel")}
            className="flex items-center justify-between w-full text-slate-200 hover:text-white font-medium text-xs mb-3 uppercase tracking-wider cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Radio className="w-3.5 h-3.5 text-gold-500" />
              ช่องทางเผยแพร่ ({selectedChannels.length || "ทั้งหมด"})
            </span>
            {collapsed.channel ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
          
          <AnimatePresence initial={false}>
            {!collapsed.channel && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="flex gap-2 mb-2 text-[11px]">
                  <button onClick={() => selectAll(channels, setSelectedChannels)} className="text-gold-400 hover:underline cursor-pointer">เลือกทั้งหมด</button>
                  <span className="text-slate-600">|</span>
                  <button onClick={() => clearSection(setSelectedChannels)} className="text-slate-400 hover:underline cursor-pointer">ล้างค่า</button>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {channels.map((ch) => (
                    <label key={ch} className="flex items-center gap-2.5 text-slate-300 text-xs hover:text-white cursor-pointer group py-0.5" id={`channel-checkbox-${ch}`}>
                      <div className="relative flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={selectedChannels.includes(ch)}
                          onChange={() => handleToggle(ch, selectedChannels, setSelectedChannels)}
                          className="sr-only"
                        />
                        <div className={`w-4.5 h-4.5 rounded border transition-all flex items-center justify-center ${selectedChannels.includes(ch) ? 'bg-gold-500 border-gold-500 shadow-md shadow-gold-500/20' : 'bg-navy-900 border-slate-700 group-hover:border-slate-500'}`}>
                          {selectedChannels.includes(ch) && <Check className="w-3 h-3 text-navy-900 stroke-[3]" />}
                        </div>
                      </div>
                      <span className="truncate">{ch}</span>
                    </label>
                  ))}
                  {channels.length === 0 && <span className="text-slate-500 text-xs italic">ไม่มีข้อมูล</span>}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Responsible Filter */}
        <div id="filter-section-responsible" className="border-b border-slate-700/30 pb-4">
          <button
            onClick={() => toggleCollapse("responsible")}
            className="flex items-center justify-between w-full text-slate-200 hover:text-white font-medium text-xs mb-3 uppercase tracking-wider cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <UserCheck className="w-3.5 h-3.5 text-gold-500" />
              ผู้รับผิดชอบ ({selectedResponsibles.length || "ทั้งหมด"})
            </span>
            {collapsed.responsible ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
          
          <AnimatePresence initial={false}>
            {!collapsed.responsible && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="flex gap-2 mb-2 text-[11px]">
                  <button onClick={() => selectAll(responsibles, setSelectedResponsibles)} className="text-gold-400 hover:underline cursor-pointer">เลือกทั้งหมด</button>
                  <span className="text-slate-600">|</span>
                  <button onClick={() => clearSection(setSelectedResponsibles)} className="text-slate-400 hover:underline cursor-pointer">ล้างค่า</button>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {responsibles.map((p) => (
                    <label key={p} className="flex items-center gap-2.5 text-slate-300 text-xs hover:text-white cursor-pointer group py-0.5">
                      <div className="relative flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={selectedResponsibles.includes(p)}
                          onChange={() => handleToggle(p, selectedResponsibles, setSelectedResponsibles)}
                          className="sr-only"
                        />
                        <div className={`w-4.5 h-4.5 rounded border transition-all flex items-center justify-center ${selectedResponsibles.includes(p) ? 'bg-gold-500 border-gold-500 shadow-md shadow-gold-500/20' : 'bg-navy-900 border-slate-700 group-hover:border-slate-500'}`}>
                          {selectedResponsibles.includes(p) && <Check className="w-3 h-3 text-navy-900 stroke-[3]" />}
                        </div>
                      </div>
                      <span className="truncate">{p}</span>
                    </label>
                  ))}
                  {responsibles.length === 0 && <span className="text-slate-500 text-xs italic">ไม่มีข้อมูล</span>}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Month Filter */}
        <div id="filter-section-month" className="border-b border-slate-700/30 pb-4">
          <button
            onClick={() => toggleCollapse("month")}
            className="flex items-center justify-between w-full text-slate-200 hover:text-white font-medium text-xs mb-3 uppercase tracking-wider cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-gold-500" />
              ช่วงเวลาเดือน ({selectedMonths.length || "ทั้งหมด"})
            </span>
            {collapsed.month ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
          
          <AnimatePresence initial={false}>
            {!collapsed.month && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="flex gap-2 mb-2 text-[11px]">
                  <button onClick={() => selectAll(months, setSelectedMonths)} className="text-gold-400 hover:underline cursor-pointer">เลือกทั้งหมด</button>
                  <span className="text-slate-600">|</span>
                  <button onClick={() => clearSection(setSelectedMonths)} className="text-slate-400 hover:underline cursor-pointer">ล้างค่า</button>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {months.map((m) => (
                    <label key={m} className="flex items-center gap-2.5 text-slate-300 text-xs hover:text-white cursor-pointer group py-0.5">
                      <div className="relative flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={selectedMonths.includes(m)}
                          onChange={() => handleToggle(m, selectedMonths, setSelectedMonths)}
                          className="sr-only"
                        />
                        <div className={`w-4.5 h-4.5 rounded border transition-all flex items-center justify-center ${selectedMonths.includes(m) ? 'bg-gold-500 border-gold-500 shadow-md shadow-gold-500/20' : 'bg-navy-900 border-slate-700 group-hover:border-slate-500'}`}>
                          {selectedMonths.includes(m) && <Check className="w-3 h-3 text-navy-900 stroke-[3]" />}
                        </div>
                      </div>
                      <span className="truncate">{m}</span>
                    </label>
                  ))}
                  {months.length === 0 && <span className="text-slate-500 text-xs italic">ไม่มีข้อมูล</span>}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Version Filter */}
        {versions.length > 0 && (
          <div id="filter-section-version" className="pb-2">
            <button
              onClick={() => toggleCollapse("version")}
              className="flex items-center justify-between w-full text-slate-200 hover:text-white font-medium text-xs mb-3 uppercase tracking-wider cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Hash className="w-3.5 h-3.5 text-gold-500" />
                เวอร์ชั่น/กลุ่มโครงการ ({selectedVersions.length || "ทั้งหมด"})
              </span>
              {collapsed.version ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
            
            <AnimatePresence initial={false}>
              {!collapsed.version && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex gap-2 mb-2 text-[11px]">
                    <button onClick={() => selectAll(versions, setSelectedVersions)} className="text-gold-400 hover:underline cursor-pointer">เลือกทั้งหมด</button>
                    <span className="text-slate-600">|</span>
                    <button onClick={() => clearSection(setSelectedVersions)} className="text-slate-400 hover:underline cursor-pointer">ล้างค่า</button>
                  </div>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {versions.map((ver) => (
                      <label key={ver} className="flex items-center gap-2.5 text-slate-300 text-xs hover:text-white cursor-pointer group py-0.5">
                        <div className="relative flex items-center justify-center">
                          <input
                            type="checkbox"
                            checked={selectedVersions.includes(ver)}
                            onChange={() => handleToggle(ver, selectedVersions, setSelectedVersions)}
                            className="sr-only"
                          />
                          <div className={`w-4.5 h-4.5 rounded border transition-all flex items-center justify-center ${selectedVersions.includes(ver) ? 'bg-gold-500 border-gold-500 shadow-md shadow-gold-500/20' : 'bg-navy-900 border-slate-700 group-hover:border-slate-500'}`}>
                            {selectedVersions.includes(ver) && <Check className="w-3 h-3 text-navy-900 stroke-[3]" />}
                          </div>
                        </div>
                        <span className="truncate">{ver}</span>
                      </label>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

      </div>
    </div>
  );
};
