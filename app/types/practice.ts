export interface PracticeSession {
  totalQuestions: number;
  correctCount: number;
  totalTime: number;
  accuracy: number;
  completedAt: string;
  numbersPerMinute: number;
  totalCharacters: number;
}

export interface BankRecordResponse {
  records: Array<{
    correctCount: number;
    duration: number;
    accuracy: number;
    completedAt: string;
    wpm: number;
    totalCount?: number;
  }>;
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
  code?: number;
}
