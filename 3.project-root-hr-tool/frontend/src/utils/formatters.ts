import { Issue } from '../types/issue';

export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDuration = (milliseconds: number): string => {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
};

export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${(value * 100).toFixed(decimals)}%`;
};

export const formatIssueLocation = (location: Issue['location']): string => {
  const parts: string[] = [];
  
  if (location.page) {
    parts.push(`Page ${location.page}`);
  }
  
  if (location.line) {
    parts.push(`Line ${location.line}`);
  }
  
  if (location.column) {
    parts.push(`Column ${location.column}`);
  }
  
  return parts.join(', ') || 'Unknown location';
};

export const formatIssueCount = (count: number, type?: string): string => {
  if (count === 0) {
    return `No ${type || 'issues'}`;
  } else if (count === 1) {
    return `1 ${type || 'issue'}`;
  } else {
    return `${count} ${type || 'issues'}`;
  }
};

export const getSeverityWeight = (severity: Issue['severity']): number => {
  switch (severity) {
    case 'critical': return 4;
    case 'high': return 3;
    case 'medium': return 2;
    case 'low': return 1;
    default: return 0;
  }
};

export const sortIssuesBySeverity = (issues: Issue[]): Issue[] => {
  return [...issues].sort((a, b) => {
    const weightA = getSeverityWeight(a.severity);
    const weightB = getSeverityWeight(b.severity);
    return weightB - weightA; // Descending order (critical first)
  });
};

export const groupIssuesByType = (issues: Issue[]): Record<Issue['type'], Issue[]> => {
  return issues.reduce((groups, issue) => {
    if (!groups[issue.type]) {
      groups[issue.type] = [];
    }
    groups[issue.type].push(issue);
    return groups;
  }, {} as Record<Issue['type'], Issue[]>);
};

export const groupIssuesBySeverity = (issues: Issue[]): Record<Issue['severity'], Issue[]> => {
  return issues.reduce((groups, issue) => {
    if (!groups[issue.severity]) {
      groups[issue.severity] = [];
    }
    groups[issue.severity].push(issue);
    return groups;
  }, {} as Record<Issue['severity'], Issue[]>);
};

export const calculateOverallConfidence = (issues: Issue[]): number => {
  if (issues.length === 0) return 0;
  
  const totalConfidence = issues.reduce((sum, issue) => {
    return sum + issue.suggestion.confidence;
  }, 0);
  
  return totalConfidence / issues.length;
};

export const truncateText = (text: string, maxLength: number = 100): string => {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength) + '...';
};

export const highlightText = (text: string, searchTerm: string): string => {
  if (!searchTerm) return text;
  
  const regex = new RegExp(`(${searchTerm})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
};