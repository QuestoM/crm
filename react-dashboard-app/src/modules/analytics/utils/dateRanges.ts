import { TimeRange } from '../domain/types';

interface DateRange {
  from: Date;
  to: Date;
}

export function getDateRangeFromTimeRange(timeRange: TimeRange, customFrom?: Date, customTo?: Date): DateRange {
  const now = new Date();
  now.setHours(23, 59, 59, 999); // End of current day
  
  const today = new Date(now);
  today.setHours(0, 0, 0, 0); // Start of current day
  
  switch (timeRange) {
    case TimeRange.TODAY:
      return { from: today, to: now };
      
    case TimeRange.YESTERDAY: {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayEnd = new Date(yesterday);
      yesterdayEnd.setHours(23, 59, 59, 999);
      return { from: yesterday, to: yesterdayEnd };
    }
    
    case TimeRange.THIS_WEEK: {
      const startOfWeek = new Date(today);
      const day = startOfWeek.getDay();
      const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
      startOfWeek.setDate(diff);
      startOfWeek.setHours(0, 0, 0, 0);
      return { from: startOfWeek, to: now };
    }
    
    case TimeRange.LAST_WEEK: {
      const startOfLastWeek = new Date(today);
      const day = startOfLastWeek.getDay();
      const diff = startOfLastWeek.getDate() - day + (day === 0 ? -6 : 1) - 7; // Adjust for Sunday and go back 7 days
      startOfLastWeek.setDate(diff);
      startOfLastWeek.setHours(0, 0, 0, 0);
      
      const endOfLastWeek = new Date(startOfLastWeek);
      endOfLastWeek.setDate(endOfLastWeek.getDate() + 6);
      endOfLastWeek.setHours(23, 59, 59, 999);
      
      return { from: startOfLastWeek, to: endOfLastWeek };
    }
    
    case TimeRange.THIS_MONTH: {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      return { from: startOfMonth, to: now };
    }
    
    case TimeRange.LAST_MONTH: {
      const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      endOfLastMonth.setHours(23, 59, 59, 999);
      return { from: startOfLastMonth, to: endOfLastMonth };
    }
    
    case TimeRange.THIS_QUARTER: {
      const quarter = Math.floor(today.getMonth() / 3);
      const startOfQuarter = new Date(today.getFullYear(), quarter * 3, 1);
      return { from: startOfQuarter, to: now };
    }
    
    case TimeRange.LAST_QUARTER: {
      const quarter = Math.floor(today.getMonth() / 3);
      const startOfLastQuarter = new Date(today.getFullYear(), (quarter - 1) * 3, 1);
      if (startOfLastQuarter.getMonth() < 0) {
        startOfLastQuarter.setFullYear(startOfLastQuarter.getFullYear() - 1);
        startOfLastQuarter.setMonth(9); // October of the previous year
      }
      
      const endOfLastQuarter = new Date(startOfLastQuarter.getFullYear(), startOfLastQuarter.getMonth() + 3, 0);
      endOfLastQuarter.setHours(23, 59, 59, 999);
      
      return { from: startOfLastQuarter, to: endOfLastQuarter };
    }
    
    case TimeRange.THIS_YEAR: {
      const startOfYear = new Date(today.getFullYear(), 0, 1);
      return { from: startOfYear, to: now };
    }
    
    case TimeRange.LAST_YEAR: {
      const startOfLastYear = new Date(today.getFullYear() - 1, 0, 1);
      const endOfLastYear = new Date(today.getFullYear() - 1, 11, 31);
      endOfLastYear.setHours(23, 59, 59, 999);
      return { from: startOfLastYear, to: endOfLastYear };
    }
    
    case TimeRange.CUSTOM: {
      if (!customFrom || !customTo) {
        throw new Error('Custom date range requires both from and to dates');
      }
      return { from: customFrom, to: customTo };
    }
    
    default:
      return { from: today, to: now };
  }
}

export function getPreviousPeriodDateRange(timeRange: TimeRange, from: Date, to: Date): DateRange {
  const rangeInMilliseconds = to.getTime() - from.getTime();
  const previousFrom = new Date(from.getTime() - rangeInMilliseconds);
  const previousTo = new Date(to.getTime() - rangeInMilliseconds);
  
  return { from: previousFrom, to: previousTo };
}

export function formatDateRange(timeRange: TimeRange, from: Date, to: Date): string {
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  };
  
  const fromStr = from.toLocaleDateString('en-US', options);
  const toStr = to.toLocaleDateString('en-US', options);
  
  if (fromStr === toStr) {
    return fromStr;
  }
  
  return `${fromStr} - ${toStr}`;
}

export function formatTimeGranularity(timeRange: TimeRange): 'day' | 'week' | 'month' {
  switch (timeRange) {
    case TimeRange.TODAY:
    case TimeRange.YESTERDAY:
    case TimeRange.THIS_WEEK:
    case TimeRange.LAST_WEEK:
      return 'day';
      
    case TimeRange.THIS_MONTH:
    case TimeRange.LAST_MONTH:
    case TimeRange.THIS_QUARTER:
    case TimeRange.LAST_QUARTER:
      return 'week';
      
    case TimeRange.THIS_YEAR:
    case TimeRange.LAST_YEAR:
    case TimeRange.CUSTOM:
      return 'month';
      
    default:
      return 'day';
  }
} 