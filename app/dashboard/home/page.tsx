"use client";

import PracticeRecordList from "@/app/components/PracticeRecordList";
import type { PracticeRecordListRef } from "@/app/components/PracticeRecordList";
import { useState, useEffect, useCallback, useRef } from "react";
import { http } from "@/lib/request";
import { useAuth } from "@/app/hooks/useAuth";
import { showResultToaster } from "@/app/components/ResultToaster";
import { toast } from "sonner";
import { usePracticeSettings } from "@/app/store/practiceSettings";

// 配置变量
const MIN_LENGTH = 3; // 最小长度
const MAX_LENGTH = 8; // 最大长度
const DEFAULT_QUESTIONS_PER_SESSION = 80; // 默认每轮练习题目数
const DEFAULT_TIME_LIMIT = 5 * 60 * 1000; // 默认5分钟时间限制（毫秒）

export default function BankKeypadPractice() {
  const { userId } = useAuth();
  const { minLength, maxLength, timeLimit, questionsPerSession } =
    usePracticeSettings();
  const [targetNumber, setTargetNumber] = useState("");
  const [nextNumber, setNextNumber] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [charStatus, setCharStatus] = useState<("correct" | "wrong")[]>([]);
  const [startTime, setStartTime] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentQuestionCount, setCurrentQuestionCount] = useState(0);
  const [sessionCorrectCount, setSessionCorrectCount] = useState(0);
  const totalCharacters = useRef(0);
  const [isRunning, setIsRunning] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const isDone = useRef<boolean>(false);
  const isBlockingInput = useRef(false);
  const practiceRecordListRef = useRef<PracticeRecordListRef>(null);
  const [enterTip, setEnterTip] = useState("");

  // 新增：成绩弹框 state
  // 生成纯数字练习序列（无小数点）
  const generatePracticeNumber = useCallback(() => {
    const length =
      minLength + Math.floor(Math.random() * (maxLength - minLength + 1));
    return Array.from({ length }, () => Math.floor(Math.random() * 10)).join(
      "",
    );
  }, [minLength, maxLength]);

  // 组件挂载时初始化
  useEffect(() => {
    const newNumber = generatePracticeNumber();
    const next = generatePracticeNumber();
    setTargetNumber(newNumber);
    setNextNumber(next);
  }, [generatePracticeNumber]);

  // 完成练习会话
  const completeSession = useCallback(
    async (correctCount: number) => {
      isBlockingInput.current = true;
      // 如果会话已经完成或当前没有进行中的练习，不再记录
      if (isDone.current || !isRunning) return;
      isDone.current = true;
      const totalTime = Math.floor((Date.now() - startTime) / 1000);
      const sessionAccuracy = Math.round(
        (correctCount / questionsPerSession) * 100,
      );
      const numbersPerMinute = Math.round(
        totalCharacters.current / (totalTime / 60),
      );

      // 新增：用 sonner 弹框显示成绩
      showResultToaster({
        correctCount,
        accuracy: sessionAccuracy,
        duration: totalTime,
        wpm: numbersPerMinute,
        totalCount: questionsPerSession,
      });
      // 只在完成一轮练习且用户已登录时才更新记录
      if (currentQuestionCount > 0 && userId !== null) {
        try {
          // 保存到数据库
          const res = (await http.post("/api/bankRecord", {
            correctCount,
            accuracy: sessionAccuracy,
            duration: totalTime,
            wpm: numbersPerMinute,
            userId: userId,
            totalCount: questionsPerSession,
          })) as { code: number; message?: string };
          if (res.code !== 200) {
            toast.error("保存练习记录失败：" + (res.message || "请稍后重试"));
          }
          // 刷新练习记录列表
          practiceRecordListRef.current?.refresh();
        } catch (error: any) {
          toast.error("保存练习记录异常：" + (error?.message || "请稍后重试"));
          console.error("保存练习记录失败:", error);
        }
      }

      // 只停止练习，不重置任何状态
      setIsRunning(false);
    },
    [startTime, currentQuestionCount, isRunning, questionsPerSession, userId],
  );

  // 开始/暂停练习
  const togglePractice = useCallback(() => {
    if (!isRunning) {
      // 如果当前没有进行中的练习，重置所有状态
      if (isDone.current) {
        isBlockingInput.current = false;
        setStartTime(Date.now());
        setSessionCorrectCount(0);
        setCurrentQuestionCount(0);
        setElapsedTime(0);
        totalCharacters.current = 0; // 重置总字符数
        isDone.current = false;
        // 确保在开始练习时生成新的目标数字
        const newNumber = generatePracticeNumber();
        setTargetNumber(newNumber);
        setNextNumber(generatePracticeNumber());
        setInputValue("");
      } else {
        setStartTime(Date.now() - elapsedTime);
      }
      setIsRunning(true);
    } else {
      setElapsedTime(Date.now() - startTime);
      setIsRunning(false);
    }
  }, [isRunning, startTime, elapsedTime, generatePracticeNumber]);

  // 实时匹配逻辑
  useEffect(() => {
    // 不再设置waitingNext，始终允许修改
    const newStatus = inputValue
      .split("")
      .map((char, i) =>
        i < targetNumber.length && char === targetNumber[i]
          ? "correct"
          : "wrong",
      );
    setCharStatus(newStatus);

    // 输入满后显示提示
    if (
      inputValue.length === targetNumber.length &&
      targetNumber &&
      !isDone.current
    ) {
      setEnterTip("请按Enter进入下一组");
    } else {
      setEnterTip("");
    }
  }, [inputValue, targetNumber, isDone.current]);

  // 计时器逻辑
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRunning && startTime > 0 && !isDone.current) {
      timer = setInterval(() => {
        const currentElapsed = Date.now() - startTime;
        setElapsedTime(currentElapsed);

        // 检查是否超过时间限制
        if (currentElapsed >= timeLimit) {
          isBlockingInput.current = true;
          setTimeout(() => {
            completeSession(sessionCorrectCount);
          }, 500);
        }
      }, 100);
    }
    return () => clearInterval(timer);
  }, [isRunning, startTime, completeSession, isDone.current, timeLimit]);

  // 处理键盘输入
  const handleKeyDown = useCallback(
    (e: any) => {
      if (isBlockingInput.current && !(e.key === "Enter" && !isRunning)) {
        e.preventDefault();
        return;
      }
      if (!isRunning) {
        if (e.key === "Enter") {
          togglePractice();
          return;
        }
        return;
      }

      // 只有输入满且按Enter时才进入下一组
      if (e.key === "Enter" && inputValue.length === targetNumber.length) {
        // 如果是最后一题，立即阻断输入
        if (currentQuestionCount + 1 >= questionsPerSession) {
          isBlockingInput.current = true;
        }
        const isCorrect = charStatus.every((s) => s === "correct");
        if (isCorrect) {
          setSessionCorrectCount((prev) => prev + 1);
        }
        setCurrentQuestionCount((prev) => {
          const newCount = prev + 1;
          if (newCount >= questionsPerSession) {
            setTimeout(() => {
              completeSession(sessionCorrectCount + (isCorrect ? 1 : 0));
            }, 500);
          }
          return newCount;
        });
        // 生成新数字，重置输入
        setTargetNumber(nextNumber);
        setNextNumber(generatePracticeNumber());
        setInputValue("");
        setCharStatus([]);
        setEnterTip("");
        e.preventDefault();
        return;
      }

      // 只处理数字键和功能键
      if (e.key >= "0" && e.key <= "9") {
        if (inputValue.length < targetNumber.length) {
          setInputValue((prev) => prev + e.key);
          totalCharacters.current += 1;
        }
        e.preventDefault();
      } else if (e.key === "Backspace") {
        if (inputValue.length > 0) {
          totalCharacters.current -= 1;
          setInputValue((prev) => prev.slice(0, -1));
        }
        e.preventDefault();
      } else if (e.key === "Escape" || e.key === "Delete") {
        setInputValue("");
        totalCharacters.current = 0;
        e.preventDefault();
      }
    },
    [
      inputValue,
      targetNumber,
      isRunning,
      togglePractice,
      nextNumber,
      generatePracticeNumber,
      charStatus,
      sessionCorrectCount,
      questionsPerSession,
      completeSession,
      isDone.current,
      isBlockingInput.current,
      currentQuestionCount,
    ],
  );

  // 自动聚焦输入框
  useEffect(() => {
    const handleFocus = () => inputRef.current?.focus();
    window.addEventListener("click", handleFocus);
    return () => window.removeEventListener("click", handleFocus);
  }, []);

  // 键盘事件监听
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="h-[calc(100vh-60px)] overflow-y-hidden bg-gray-50 sm:px-6 lg:px-8 scrollbar-hide">
      <div className="overflow-y-hidden h-full p-8 mx-auto my-4 bg-white rounded-xl shadow-md">
        <div className="flex gap-8 h-full">
          {/* 左侧练习区域 */}
          <div className="flex-1">
            <div className="flex flex-col justify-center mb-8 space-y-4">
              {/* 第一行 */}
              <div className="flex justify-center space-x-8">
                <div className="p-4 w-32 bg-blue-50 rounded-lg">
                  <p className="mb-1 text-sm text-blue-600">用时</p>
                  <p className="font-mono text-2xl">
                    {(elapsedTime / 1000).toFixed(1)}s
                  </p>
                </div>
                <div className="p-4 w-32 bg-green-50 rounded-lg">
                  <p className="mb-1 text-sm text-green-600">正确题数</p>
                  <p className="font-mono text-2xl">{sessionCorrectCount}</p>
                </div>
                <div className="p-4 w-32 bg-purple-50 rounded-lg">
                  <p className="mb-1 text-sm text-purple-600">当前进度</p>
                  <p className="font-mono text-2xl">
                    {currentQuestionCount}/{questionsPerSession}
                  </p>
                </div>
                <div className="p-4 w-32 bg-yellow-50 rounded-lg">
                  <p className="mb-1 text-sm text-yellow-600">剩余时间</p>
                  <p className="font-mono text-2xl">
                    {Math.max(0, (timeLimit - elapsedTime) / 1000).toFixed(1)}s
                  </p>
                </div>
                <div className="p-4 w-32 bg-red-50 rounded-lg">
                  <p className="mb-1 text-sm text-red-600">总字数</p>
                  <p className="font-mono text-2xl">
                    {totalCharacters.current}
                  </p>
                </div>
              </div>
            </div>

            {/* 目标数字显示区 */}
            <div className="mb-8">
              <h2 className="mb-4 text-xl font-semibold text-gray-700">
                请输入以下数字(长度：{targetNumber.length})：
                {!isRunning && (
                  <span className="ml-2 text-sm text-gray-500">
                    (按 Enter 开始)
                  </span>
                )}
              </h2>
              <div
                className="p-6 font-mono text-4xl tracking-widest bg-gray-100 rounded-xl shadow-inner"
                onClick={() => inputRef.current?.focus()}
              >
                {targetNumber.split("").map((char, i) => (
                  <span key={i} className="inline-block w-12 text-center">
                    {char}
                  </span>
                ))}
              </div>
            </div>

            {/* 输入反馈区 */}
            <div
              className="relative mb-8 min-h-[80px] border-2 border-gray-300 rounded-xl p-6 font-mono text-3xl tracking-widest flex flex-wrap items-center"
              onClick={() => inputRef.current?.focus()}
            >
              {inputValue.split("").map((char, i) => (
                <span
                  key={i}
                  className={`inline-block w-12 text-center ${
                    charStatus[i] === "correct"
                      ? "text-green-500"
                      : "text-red-500 underline"
                  }`}
                >
                  {char}
                </span>
              ))}

              {/* 光标 */}
              {inputValue.length < targetNumber.length && (
                <span className="inline-block ml-1 w-2 h-12 align-middle bg-gray-800 animate-pulse"></span>
              )}

              {/* 隐藏的输入框（用于获取物理键盘输入） */}
              <input
                ref={inputRef}
                type="text"
                className="absolute opacity-0 -z-10"
                autoFocus
              />
            </div>
            {/* 新增：下一组数字显示区 */}
            <div className="mb-8">
              <div className="flex items-center mb-2">
                <h3 className="text-lg text-gray-500">下一组数字：</h3>
                <div className="ml-4 text-red-500">{enterTip}</div>
              </div>
              <div className="p-4 font-mono text-2xl tracking-widest bg-gray-50 rounded shadow-inner text-gray-400">
                {nextNumber.split("").map((char, i) => (
                  <span key={i} className="inline-block w-8 text-center">
                    {char}
                  </span>
                ))}
              </div>
            </div>
            {/* 操作提示 */}
            <div className="p-4 bg-yellow-50 rounded-lg">
              <p className="text-center text-yellow-700">
                <span className="font-semibold">操作说明：</span>
                按Enter进行下一组数字 | Backspace删除 | Delete清空
              </p>
            </div>
          </div>

          {/* 右侧历史记录 */}
          <div className="flex-1 flex flex-col">
            <PracticeRecordList
              ref={practiceRecordListRef}
              targetNumberLength={targetNumber.length}
            />
          </div>
        </div>
      </div>
      {/* <VisitCounter /> */}
    </div>
  );
}
