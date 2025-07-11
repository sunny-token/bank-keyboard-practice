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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
  PaginationLink,
} from "../../components/ui/pagination";

interface PracticeRecordListProps {
  targetNumberLength: number;
}

export interface PracticeRecordListRef {
  refresh: () => Promise<void>;
}

const ITEMS_PER_PAGE = 10; // 每页显示的记录数

const PracticeRecordList = forwardRef<
  PracticeRecordListRef,
  PracticeRecordListProps
>(({ targetNumberLength }, ref) => {
  const [practiceSessions, setPracticeSessions] = useState<PracticeSession[]>(
    [],
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { userId } = useAuth();

  // 计算总页数
  const totalPages =
    Math.ceil(totalRecords / ITEMS_PER_PAGE) === 0
      ? 1
      : Math.ceil(totalRecords / ITEMS_PER_PAGE);

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
            correctCount: record.correctCount,
            totalQuestions: record.totalCount,
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
  }, [targetNumberLength, userId, currentPage]);

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
    <Card className="w-full max-w-2xl h-full flex flex-col mx-auto">
      <CardHeader>
        <CardTitle className="text-xl">练习记录</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto">
        <div className="flex-1">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>序号</TableHead>
                <TableHead>完成时间</TableHead>
                <TableHead>正确题数</TableHead>
                <TableHead>正确率</TableHead>
                <TableHead>用时(秒)</TableHead>
                <TableHead>字数/分钟</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
                      <span>加载中...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                practiceSessions.map((session, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      {totalRecords -
                        ((currentPage - 1) * ITEMS_PER_PAGE + index)}
                    </TableCell>
                    <TableCell>{session.completedAt}</TableCell>
                    <TableCell>
                      {session.correctCount}/{session.totalQuestions}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          session.accuracy > 90
                            ? "default"
                            : session.accuracy > 70
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {session.accuracy}%
                      </Badge>
                    </TableCell>
                    <TableCell>{session.totalTime}</TableCell>
                    <TableCell>{session.numbersPerMinute}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        {/* 分页控件 */}
        <div className="flex items-center justify-center pb-4 mt-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  aria-disabled={currentPage === 1 || isLoading}
                  tabIndex={currentPage === 1 || isLoading ? -1 : 0}
                  className={
                    currentPage === 1 || isLoading
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                  onClick={(e) => {
                    if (currentPage === 1 || isLoading) {
                      e.preventDefault();
                      return;
                    }
                    handlePageChange(currentPage - 1);
                  }}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink
                    isActive={currentPage === i + 1}
                    aria-disabled={currentPage === i + 1}
                    tabIndex={currentPage === i + 1 ? -1 : 0}
                    className={
                      currentPage === i + 1
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                    onClick={(e) => {
                      if (currentPage === i + 1) {
                        e.preventDefault();
                        return;
                      }
                      handlePageChange(i + 1);
                    }}
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  aria-disabled={currentPage === totalPages || isLoading}
                  tabIndex={currentPage === totalPages || isLoading ? -1 : 0}
                  className={
                    currentPage === totalPages || isLoading
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                  onClick={(e) => {
                    if (currentPage === totalPages || isLoading) {
                      e.preventDefault();
                      return;
                    }
                    handlePageChange(currentPage + 1);
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </CardContent>
    </Card>
  );
});

export default PracticeRecordList;
