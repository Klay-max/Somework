/**
 * 存储服务
 * 
 * 功能：
 * - 跨平台存储（Web: localStorage, Mobile: AsyncStorage）
 * - 报告历史记录管理
 * - 数据持久化
 */

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ReportData } from './types';

const STORAGE_KEY_PREFIX = 'vision_core_';
const REPORTS_KEY = `${STORAGE_KEY_PREFIX}reports`;
const MAX_REPORTS = 50; // 最多保存 50 条记录

export interface StoredReport {
  id: string;
  timestamp: string;
  score: number;
  accuracy: number;
  data: ReportData;
}

export class StorageService {
  /**
   * 保存报告到历史记录
   */
  static async saveReport(report: ReportData): Promise<void> {
    try {
      const reports = await this.getAllReports();
      
      const storedReport: StoredReport = {
        id: report.id,
        timestamp: report.timestamp,
        score: report.score.score,
        accuracy: report.score.accuracy,
        data: report,
      };
      
      // 添加到列表开头
      reports.unshift(storedReport);
      
      // 限制最大数量
      if (reports.length > MAX_REPORTS) {
        reports.splice(MAX_REPORTS);
      }
      
      await this.setItem(REPORTS_KEY, JSON.stringify(reports));
      
      console.log('报告已保存:', report.id);
    } catch (error) {
      console.error('保存报告失败:', error);
      throw new Error('保存报告失败');
    }
  }
  
  /**
   * 获取所有报告历史记录
   */
  static async getAllReports(): Promise<StoredReport[]> {
    try {
      const data = await this.getItem(REPORTS_KEY);
      
      if (!data) {
        return [];
      }
      
      return JSON.parse(data);
    } catch (error) {
      console.error('获取报告列表失败:', error);
      return [];
    }
  }
  
  /**
   * 根据 ID 获取报告
   */
  static async getReportById(id: string): Promise<ReportData | null> {
    try {
      const reports = await this.getAllReports();
      const report = reports.find(r => r.id === id);
      
      return report ? report.data : null;
    } catch (error) {
      console.error('获取报告失败:', error);
      return null;
    }
  }
  
  /**
   * 删除报告
   */
  static async deleteReport(id: string): Promise<void> {
    try {
      const reports = await this.getAllReports();
      const filtered = reports.filter(r => r.id !== id);
      
      await this.setItem(REPORTS_KEY, JSON.stringify(filtered));
      
      console.log('报告已删除:', id);
    } catch (error) {
      console.error('删除报告失败:', error);
      throw new Error('删除报告失败');
    }
  }
  
  /**
   * 清空所有报告
   */
  static async clearAllReports(): Promise<void> {
    try {
      await this.removeItem(REPORTS_KEY);
      console.log('所有报告已清空');
    } catch (error) {
      console.error('清空报告失败:', error);
      throw new Error('清空报告失败');
    }
  }
  
  /**
   * 获取报告统计信息
   */
  static async getStatistics(): Promise<{
    totalReports: number;
    averageScore: number;
    highestScore: number;
    lowestScore: number;
    averageAccuracy: number;
  }> {
    try {
      const reports = await this.getAllReports();
      
      if (reports.length === 0) {
        return {
          totalReports: 0,
          averageScore: 0,
          highestScore: 0,
          lowestScore: 0,
          averageAccuracy: 0,
        };
      }
      
      const scores = reports.map(r => r.score);
      const accuracies = reports.map(r => r.accuracy);
      
      return {
        totalReports: reports.length,
        averageScore: scores.reduce((a, b) => a + b, 0) / scores.length,
        highestScore: Math.max(...scores),
        lowestScore: Math.min(...scores),
        averageAccuracy: accuracies.reduce((a, b) => a + b, 0) / accuracies.length,
      };
    } catch (error) {
      console.error('获取统计信息失败:', error);
      return {
        totalReports: 0,
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0,
        averageAccuracy: 0,
      };
    }
  }
  
  // ========== 底层存储方法 ==========
  
  /**
   * 设置存储项
   */
  private static async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
    } else {
      await AsyncStorage.setItem(key, value);
    }
  }
  
  /**
   * 获取存储项
   */
  private static async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    } else {
      return await AsyncStorage.getItem(key);
    }
  }
  
  /**
   * 删除存储项
   */
  private static async removeItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
    } else {
      await AsyncStorage.removeItem(key);
    }
  }
}
