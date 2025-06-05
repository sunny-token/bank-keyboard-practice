"use client";

import { useState, useEffect, useCallback, useRef } from "react";

// 新增练习会话接口
interface PracticeSession {
  totalQuestions: number;
  correctCount: number;
  totalTime: number;
  accuracy: number;
  completedAt: string;
}

// 配置变量
const MIN_LENGTH = 3; // 最小长度
const MAX_LENGTH = 8; // 最大长度
const QUESTIONS_PER_SESSION = 80; // 每轮练习题目数
const TIME_LIMIT = 5 * 60 * 1000; // 5分钟时间限制（毫秒）

export default function BankKeypadPractice() {
  const [targetNumber, setTargetNumber] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [charStatus, setCharStatus] = useState<("correct" | "wrong")[]>([]);
  const [startTime, setStartTime] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [minLength, setMinLength] = useState(MIN_LENGTH);
  const [maxLength, setMaxLength] = useState(MAX_LENGTH);
  const [currentQuestionCount, setCurrentQuestionCount] = useState(0);
  const [practiceSessions, setPracticeSessions] = useState<PracticeSession[]>(
    [],
  );
  const [sessionCorrectCount, setSessionCorrectCount] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const isDone = useRef<boolean>(false);

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
    setTargetNumber(newNumber);
  }, [generatePracticeNumber]);

  // 完成练习会话
  const completeSession = useCallback(
    (correctCount: number) => {
      // 如果会话已经完成或当前没有进行中的练习，不再记录
      if (isDone.current || !isRunning) return;
      isDone.current = true;
      const totalTime = (Date.now() - startTime) / 1000;
      const sessionAccuracy = Math.round(
        (correctCount / QUESTIONS_PER_SESSION) * 100,
      );

      // 只在完成一轮练习时才更新记录
      if (currentQuestionCount > 0) {
        setPracticeSessions((prev) => [
          ...prev,
          {
            totalQuestions: QUESTIONS_PER_SESSION,
            correctCount: correctCount,
            totalTime: totalTime,
            accuracy: sessionAccuracy,
            completedAt: new Date().toLocaleString(),
          },
        ]);
      }

      // 只停止练习，不重置任何状态
      setIsRunning(false);
    },
    [startTime, currentQuestionCount, isRunning],
  );

  // 开始/暂停练习
  const togglePractice = useCallback(() => {
    if (!isRunning) {
      // 如果当前没有进行中的练习，重置所有状态
      if (isDone.current) {
        setStartTime(Date.now());
        setSessionCorrectCount(0);
        setCurrentQuestionCount(0);
        setElapsedTime(0);
        isDone.current = false;
        // 确保在开始练习时生成新的目标数字
        const newNumber = generatePracticeNumber();
        setTargetNumber(newNumber);
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
    const newStatus = inputValue
      .split("")
      .map((char, i) =>
        i < targetNumber.length && char === targetNumber[i]
          ? "correct"
          : "wrong",
      );
    setCharStatus(newStatus);

    if (
      inputValue.length === targetNumber.length &&
      targetNumber &&
      !isDone.current
    ) {
      const isCorrect = newStatus.every((s) => s === "correct");
      const newCorrectCount = isCorrect
        ? sessionCorrectCount + 1
        : sessionCorrectCount;
      if (isCorrect) {
        setSessionCorrectCount((prev) => prev + 1);
      }

      setCurrentQuestionCount((prev) => {
        const newCount = prev + 1;
        if (newCount >= QUESTIONS_PER_SESSION) {
          setTimeout(() => {
            completeSession(newCorrectCount);
          }, 500);
          return newCount; // 保持当前计数，不重置
        }
        return newCount;
      });

      // 直接生成新的目标数字，不暂停
      const newNumber = generatePracticeNumber();
      setTargetNumber(newNumber);
      setInputValue("");
      setCharStatus([]);
    }
  }, [
    inputValue,
    targetNumber,
    completeSession,
    generatePracticeNumber,
    sessionCorrectCount,
    currentQuestionCount,
    isDone.current,
  ]);

  // 计时器逻辑
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRunning && startTime > 0 && !isDone.current) {
      timer = setInterval(() => {
        const currentElapsed = Date.now() - startTime;
        setElapsedTime(currentElapsed);

        // 检查是否超过5分钟
        if (currentElapsed >= TIME_LIMIT) {
          setTimeout(() => {
            completeSession(sessionCorrectCount);
          }, 500);
        }
      }, 100);
    }
    return () => clearInterval(timer);
  }, [isRunning, startTime, completeSession, isDone.current]);

  // 处理键盘输入
  const handleKeyDown = useCallback(
    (e: any) => {
      if (!isRunning) {
        if (e.key === "Enter") {
          togglePractice();
          return;
        }
        return;
      }

      if (inputValue.length >= targetNumber.length || isDone.current) {
        return;
      }
      // 只处理数字键和功能键
      if (e.key >= "0" && e.key <= "9") {
        setInputValue((prev) => prev + e.key);
        e.preventDefault();
      } else if (e.key === "Backspace") {
        setInputValue((prev) => prev.slice(0, -1));
        e.preventDefault();
      } else if (e.key === "Escape" || e.key === "Delete") {
        setInputValue("");
        e.preventDefault();
      }
    },
    [inputValue, targetNumber, isRunning, togglePractice],
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
    <div className="h-screen overflow-y-auto bg-gray-50 sm:px-6 lg:px-8 scrollbar-hide">
      <div className="p-8 mx-auto my-2 overflow-y-hidden bg-white shadow-md rounded-xl">
        <div className="mb-10 text-center">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            银行数字键盘训练系统
          </h1>
          <p className="text-gray-600">使用物理键盘输入下方显示的数字序列</p>
        </div>

        <div className="flex gap-8">
          {/* 左侧练习区域 */}
          <div className="flex-1">
            <div className="flex justify-center mb-8 space-x-8">
              <div className="w-32 p-4 rounded-lg bg-blue-50">
                <p className="mb-1 text-sm text-blue-600">用时</p>
                <p className="font-mono text-2xl">
                  {(elapsedTime / 1000).toFixed(1)}s
                </p>
              </div>
              <div className="w-32 p-4 rounded-lg bg-green-50">
                <p className="mb-1 text-sm text-green-600">正确题数</p>
                <p className="font-mono text-2xl">{sessionCorrectCount}</p>
              </div>
              <div className="w-32 p-4 rounded-lg bg-purple-50">
                <p className="mb-1 text-sm text-purple-600">当前进度</p>
                <p className="font-mono text-2xl">
                  {currentQuestionCount}/{QUESTIONS_PER_SESSION}
                </p>
              </div>
              <div className="w-32 p-4 rounded-lg bg-yellow-50">
                <p className="mb-1 text-sm text-yellow-600">剩余时间</p>
                <p className="font-mono text-2xl">
                  {Math.max(0, (TIME_LIMIT - elapsedTime) / 1000).toFixed(1)}s
                </p>
              </div>
              <div className="p-4 rounded-lg bg-indigo-50">
                <p className="mb-1 text-sm text-indigo-600">数字长度设置</p>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <label className="text-xs text-indigo-600">最小:</label>
                    <input
                      type="number"
                      min="1"
                      max={maxLength}
                      value={minLength}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        if (value > 0 && value <= maxLength) {
                          setMinLength(value);
                          const newNumber = generatePracticeNumber();
                          setTargetNumber(newNumber);
                        }
                      }}
                      className="w-12 px-1 py-0.5 text-sm border rounded border-indigo-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <span className="text-indigo-600">-</span>
                  <div className="flex items-center space-x-1">
                    <label className="text-xs text-indigo-600">最大:</label>
                    <input
                      type="number"
                      min={minLength}
                      max="20"
                      value={maxLength}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        if (value >= minLength && value <= 20) {
                          setMaxLength(value);
                          const newNumber = generatePracticeNumber();
                          setTargetNumber(newNumber);
                        }
                      }}
                      className="w-12 px-1 py-0.5 text-sm border rounded border-indigo-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
              <button
                onClick={togglePractice}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  isRunning
                    ? "bg-red-100 text-red-600 hover:bg-red-200"
                    : "bg-green-100 text-green-600 hover:bg-green-200"
                }`}
              >
                {isRunning ? "暂停" : "开始"}
              </button>
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
                className="p-6 font-mono text-4xl tracking-widest bg-gray-100 shadow-inner rounded-xl"
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
                <span className="inline-block w-2 h-12 ml-1 align-middle bg-gray-800 animate-pulse"></span>
              )}

              {/* 隐藏的输入框（用于获取物理键盘输入） */}
              <input
                ref={inputRef}
                type="text"
                className="absolute opacity-0 -z-10"
                autoFocus
              />
            </div>

            {/* 操作提示 */}
            <div className="p-4 rounded-lg bg-yellow-50">
              <p className="text-center text-yellow-700">
                <span className="font-semibold">操作说明：</span>
                使用键盘数字键输入 | Backspace删除 | Delete清空
              </p>
            </div>
          </div>

          {/* 右侧历史记录 */}
          <div className="w-[600px] flex flex-col">
            <h3 className="mb-4 text-xl font-semibold text-gray-700">
              练习记录
            </h3>
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
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {practiceSessions
                    .slice()
                    .reverse()
                    .map((session, index) => (
                      <tr
                        key={index}
                        className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      >
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                          {practiceSessions.length - index}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                          {session.completedAt}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                          {session.correctCount}/{QUESTIONS_PER_SESSION}
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
                          {session.totalTime.toFixed(1)}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
