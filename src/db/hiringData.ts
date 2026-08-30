import { supabase } from '@/lib/supabase';

export interface KeyValueItem {
  key: string;
  value: number;
}

export interface HireOverviewData {
  titleKw: string;
  titleType: string;
  city: string;
  src: string;
  titleLevel: string;
  avgSal: string;
  titleCnt: number;
  titleModifyDate: string;
  cityCnt: number;
}

export interface HireStatisticsData {
  companyName: string;
  avgSal: number;
  avgSalStr: string;
  priProvince: string;
  zpnumber: number;
  bkEducation: string;
  btw3and5Years: string;
  educationList: KeyValueItem[];
  salaryList: KeyValueItem[];
  yearsList: KeyValueItem[];
  recruitPosition: string[];
  zpnumberList: KeyValueItem[];
  ssNumHisList: KeyValueItem[];
}

// 查询企业招聘概况
export async function fetchHireOverview(keyword: string): Promise<HireOverviewData> {
  const { data, error } = await supabase.functions.invoke('hire-overview', {
    body: { keyword },
  });
  if (error) {
    const msg = await error?.context?.text?.();
    throw new Error(msg || error.message || '查询失败');
  }
  if (data?.code !== 200) {
    throw new Error(data?.code === 201 ? '未查询到该企业的招聘数据，请尝试输入企业全称或统一信用代码' : `查询失败：${data?.msg || '未知错误'}`);
  }
  return data.data as HireOverviewData;
}

// 查询企业招聘数据统计
export async function fetchHireStatistics(keyword: string): Promise<HireStatisticsData> {
  const { data, error } = await supabase.functions.invoke('hire-statistics', {
    body: { keyword },
  });
  if (error) {
    const msg = await error?.context?.text?.();
    throw new Error(msg || error.message || '查询失败');
  }
  if (data?.code !== 200) {
    throw new Error(data?.code === 201 ? '未查询到该企业的招聘数据，请尝试输入企业全称或统一信用代码' : `查询失败：${data?.msg || '未知错误'}`);
  }
  return data.data as HireStatisticsData;
}

// 将逗号分隔的字符串转为标签数组
export function splitToList(str: string | undefined | null): string[] {
  if (!str) return [];
  return str.split(/[,，、\s]+/).map(s => s.trim()).filter(Boolean);
}