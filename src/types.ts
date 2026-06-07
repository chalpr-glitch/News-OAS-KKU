export interface NewsRecord {
  id: number;
  [key: string]: string | number;
  "วันที่": string;
  "เนื้อหา": string;
  "ช่องทางการเผยแพร่": string;
  "เวลา": string;
  "ผู้รับผิดชอบ": string;
  "เวอร์ชั่น": string;
  "ประเภท": string;
}

export interface MeltedNewsRecord {
  id: number;
  date: string;
  content: string;
  channel: string;
  time: string;
  responsible: string;
  version: string;
  type: string;
  monthShort: string;
  monthFull: string;
  monthNum: number;
  year: number;
  sortKey: number;
  value: number;
}

export interface MonthCol {
  fullName: string;
  shortName: string;
  year: number;
  monthNum: number;
  sortKey: number;
}

export interface DashboardData {
  rawHeaders: string[];
  headersMap: {
    dateIdx: number;
    contentIdx: number;
    channelIdx: number;
    timeIdx: number;
    responseIdx: number;
    versionIdx: number;
    typeIdx: number;
  };
  monthColumns: MonthCol[];
  records: NewsRecord[];
  meltedRecords: MeltedNewsRecord[];
  filters: {
    channels: string[];
    responsibles: string[];
    types: string[];
    versions: string[];
  };
  _stale?: boolean;
  _error?: string;
}
