import React from "react";
import { motion } from "motion/react";
import { Newspaper, Share2, Award, Users, CheckCircle, TrendingUp } from "lucide-react";

interface KPICardsProps {
  totalNews: number;
  uniqueChannels: number;
  mostActiveChannel: string;
  mostActiveChannelPct: number;
  mostCommonType: string;
  activeStaffCount: number;
}

export const KPICards: React.FC<KPICardsProps> = ({
  totalNews,
  uniqueChannels,
  mostActiveChannel,
  mostActiveChannelPct,
  mostCommonType,
  activeStaffCount,
}) => {
  const cards = [
    {
      id: "card-total",
      title: "จำนวนข่าวทั้งหมด",
      value: totalNews,
      sub: "ปริมาณข่าวประชาสัมพันธ์รวม",
      icon: Newspaper,
      color: "from-blue-600/20 to-indigo-600/25",
      iconColor: "text-blue-400",
      accent: "border-blue-500/30",
    },
    {
      id: "card-channels",
      title: "ช่องทางการเผยแพร่ข่าว",
      value: `${uniqueChannels} ช่องทาง`,
      sub: `ช่องทางหลัก: ${mostActiveChannel || "-"} (${mostActiveChannelPct.toFixed(0)}%)`,
      icon: Share2,
      color: "from-amber-600/20 to-yellow-600/25",
      iconColor: "text-gold-400",
      accent: "border-gold-500/30",
    },
    {
      id: "card-type",
      title: "ประเภทข่าวเด่น",
      value: mostCommonType || "-",
      sub: "มีสัดส่วนการเผยแพร่สูงสุด",
      icon: Award,
      color: "from-emerald-600/20 to-teal-600/25",
      iconColor: "text-emerald-400",
      accent: "border-emerald-500/30",
    },
    {
      id: "card-users",
      title: "จำนวนผู้รับผิดชอบ",
      value: `${activeStaffCount} รายชื่อ`,
      sub: "ทีมงานดูแลและสื่อสารข้อมูล",
      icon: Users,
      color: "from-purple-600/20 to-pink-600/25",
      iconColor: "text-purple-400",
      accent: "border-purple-500/30",
    },
  ];

  return (
    <div id="kpi-cards-container" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <motion.div
            id={card.id}
            key={card.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.1 }}
            whileHover={{ scale: 1.02, translateY: -2 }}
            className={`relative overflow-hidden bg-gradient-to-br ${card.color} border ${card.accent} rounded-xl p-5 shadow-lg backdrop-blur-md`}
          >
            {/* Absolute decorative glow */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gold-500/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">
                  {card.title}
                </p>
                <h3 className="text-2xl font-bold text-white tracking-tight">
                  {card.value}
                </h3>
                <span className="text-gray-300 text-xs block mt-2 opacity-90 truncate max-w-[210px] sm:max-w-xs">
                  {card.sub}
                </span>
              </div>
              <div className={`p-3 rounded-lg bg-navy-800 border border-white/5 shadow-inner`}>
                <Icon className={`w-6 h-6 ${card.iconColor}`} />
              </div>
            </div>
            
            {/* Elegant bottom accent line */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-gold-500/0 via-gold-500/40 to-transparent" />
          </motion.div>
        );
      })}
    </div>
  );
};
