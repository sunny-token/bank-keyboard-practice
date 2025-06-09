import {
  useState,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import { http } from "@/lib/request";
import { PracticeSession, BankRecordResponse } from "@/app/types/practice";
import { useAuth } from "../hooks/useAuth";

interface PracticeRecordListProps {
  questionsPerSession: number;
  targetNumberLength: number;
}

export interface PracticeRecordListRef {
  refresh: () => Promise<void>;
}

const ITEMS_PER_PAGE = 10; // 每页显示的记录数

const PracticeRecordList = forwardRef<
  PracticeRecordListRef,
  PracticeRecordListProps
>(({ questionsPerSession, targetNumberLength }, ref) => {
  const [practiceSessions, setPracticeSessions] = useState<PracticeSession[]>(
    [],
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { userId } = useAuth();

  // 计算总页数
  const totalPages = Math.ceil(totalRecords / ITEMS_PER_PAGE);

  // 获取练习记录
  const fetchPracticeRecords = useCallback(async () => {
    try {
      if (userId === null) {
        console.log("userId is null");
        return;
      }
      setIsLoading(true);
      console.log("userId:", userId);

      const response = await http.get<BankRecordResponse>(
        `/api/bankRecord?userId=${userId}&page=${currentPage}&pageSize=${ITEMS_PER_PAGE}`,
      );
      console.log("response:", response);

      if (response.records) {
        setPracticeSessions(
          response.records.map((record: any) => ({
            totalQuestions: questionsPerSession,
            correctCount: record.correctCount,
            totalTime: record.duration,
            accuracy: record.accuracy,
            completedAt: new Date(record.completedAt)
              .toISOString()
              .split("T")[0],
            numbersPerMinute: record.wpm,
            totalCharacters: record.correctCount * targetNumberLength,
          })),
        );
        setTotalRecords(response.pagination.total);
      }
    } catch (error) {
      console.error("获取练习记录失败:", error);
    } finally {
      setIsLoading(false);
    }
  }, [questionsPerSession, targetNumberLength, userId, currentPage]);

  useImperativeHandle(ref, () => ({
    refresh: fetchPracticeRecords,
  }));

  // 组件加载时获取练习记录
  useEffect(() => {
    fetchPracticeRecords();
  }, [userId, currentPage]);

  // 处理页码变化
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="w-[600px] flex flex-col h-full">
      <h3 className="mb-4 text-xl font-semibold text-gray-700">练习记录</h3>
      <div className="flex-1 overflow-y-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="sticky top-0 bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                序号
              </th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                完成时间
              </th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                正确题数
              </th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                正确率
              </th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                用时(秒)
              </th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                字数/分钟
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
                    <span>加载中...</span>
                  </div>
                </td>
              </tr>
            ) : (
              practiceSessions.map((session, index) => (
                <tr
                  key={index}
                  className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                    {totalRecords -
                      ((currentPage - 1) * ITEMS_PER_PAGE + index)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                    {session.completedAt}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                    {session.correctCount}/{questionsPerSession}
                  </td>
                  <td className="px-6 py-4 text-sm whitespace-nowrap">
                    <span
                      className={`px-2 py-1 rounded-full ${
                        session.accuracy > 90
                          ? "bg-green-100 text-green-800"
                          : session.accuracy > 70
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {session.accuracy}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                    {session.totalTime}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                    {session.numbersPerMinute}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 分页控件 */}
      <div className="flex items-center justify-center pb-4 mt-4 space-x-2">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1 || isLoading}
          className={`px-3 py-1 rounded ${
            currentPage === 1 || isLoading
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          上一页
        </button>
        <span className="text-gray-600">
          第 {currentPage} 页 / 共 {totalPages} 页
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages || isLoading}
          className={`px-3 py-1 rounded ${
            currentPage === totalPages || isLoading
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          下一页
        </button>
      </div>
    </div>
  );
});

export default PracticeRecordList;
