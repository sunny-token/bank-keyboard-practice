"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface CompletedNumber {
  number: string;
  input: string;
  accuracy: number;
  time: string;
}

// 银行实际业务数据集
const BANK_NUMBERS = [
  "940223400",
  "932699900",
  "623385000",
  "991366200",
  "784512300",
  "657894100",
  "320145600",
  "458796200",
  "123456700",
  "876543200",
];

// 配置变量
const MIN_LENGTH = 8; // 最小长度
const MAX_LENGTH = 12; // 最大长度

export default function BankKeypadPractice() {
  const [targetNumber, setTargetNumber] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [charStatus, setCharStatus] = useState<("correct" | "wrong")[]>([]);
  const [startTime, setStartTime] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [completedNumbers, setCompletedNumbers] = useState<CompletedNumber[]>(
    [],
  );
  const inputRef = useRef<HTMLInputElement>(null);

  // 生成纯数字练习序列（无小数点）
  const generatePracticeNumber = useCallback(() => {
    // 50%概率使用银行真实数据
    if (Math.random() > 0.5 && BANK_NUMBERS.length > 0) {
      return BANK_NUMBERS[Math.floor(Math.random() * BANK_NUMBERS.length)];
    }

    // 随机生成长度8-12的数字
    const length =
      MIN_LENGTH + Math.floor(Math.random() * (MAX_LENGTH - MIN_LENGTH + 1));
    return Array.from({ length }, () => Math.floor(Math.random() * 10)).join(
      "",
    );
  }, []);

  // 初始化练习
  const initPractice = useCallback(() => {
    const newNumber = generatePracticeNumber();
    setTargetNumber(newNumber);
    setInputValue("");
    setCharStatus([]);
    setStartTime(Date.now());
    setElapsedTime(0);
    setAccuracy(0);
    inputRef.current?.focus();
  }, [generatePracticeNumber]);

  useEffect(() => {
    initPractice();
  }, [initPractice]);

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

    // 计算实时正确率
    const correctCount = newStatus.filter((s) => s === "correct").length;
    const totalChars = Math.max(inputValue.length, 1);
    setAccuracy(Math.round((correctCount / totalChars) * 100));
    if (inputValue.length === targetNumber.length && targetNumber) {
      completePractice(newStatus);
    }
  }, [inputValue, targetNumber]);

  // 计时器逻辑
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (startTime > 0 && inputValue.length < targetNumber.length) {
      timer = setInterval(() => {
        setElapsedTime(Date.now() - startTime);
      }, 100);
    }
    return () => clearInterval(timer);
  }, [startTime, inputValue, targetNumber]);

  // 处理键盘输入 [4]()[9]()
  const handleKeyDown = useCallback(
    (e: any) => {
      if (inputValue.length >= targetNumber.length) {
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
      } else if (
        e.key === "Enter" &&
        inputValue.length === targetNumber.length
      ) {
        completePractice(charStatus);
      }
    },
    [inputValue, targetNumber],
  );

  // 完成练习统计
  const completePractice = (newStatus: ("correct" | "wrong")[]) => {
    const correctCount = newStatus.filter((s) => s === "correct").length;
    const totalChars = targetNumber.length;
    const practiceAccuracy = Math.round((correctCount / totalChars) * 100);
    const timeUsed = (Date.now() - startTime) / 1000;

    setCompletedNumbers((prev) => [
      ...prev,
      {
        number: targetNumber,
        input: inputValue,
        accuracy: practiceAccuracy,
        time: timeUsed.toFixed(2),
      },
    ]);

    // 2秒后开始新练习
    setTimeout(() => {
      initPractice();
    }, 2000);
  };

  // 自动聚焦输入框 [1]()
  useEffect(() => {
    const handleFocus = () => inputRef.current?.focus();
    window.addEventListener("click", handleFocus);
    return () => window.removeEventListener("click", handleFocus);
  }, []);

  // 键盘事件监听 [4]()[9]()
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="min-h-screen bg-gray-50 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            银行数字键盘训练系统
          </h1>
          <p className="text-gray-600">使用物理键盘输入下方显示的数字序列</p>
        </div>

        <div className="flex gap-8 h-[calc(100vh-12rem)]">
          {/* 左侧练习区域 */}
          <div className="flex-1">
            <div className="flex justify-center space-x-8 mb-8">
              <div className="bg-blue-50 rounded-lg p-4 w-32">
                <p className="text-sm text-blue-600 mb-1">用时</p>
                <p className="text-2xl font-mono">
                  {(elapsedTime / 1000).toFixed(1)}s
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 w-32">
                <p className="text-sm text-green-600 mb-1">正确率</p>
                <p className="text-2xl font-mono">{accuracy}%</p>
              </div>
            </div>

            {/* 目标数字显示区 */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">
                请输入以下数字(长度：{targetNumber.length})：
              </h2>
              <div
                className="text-4xl font-mono bg-gray-100 p-6 rounded-xl shadow-inner tracking-widest"
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
                <span className="ml-1 animate-pulse bg-gray-800 w-2 h-12 inline-block align-middle"></span>
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
            <div className="bg-yellow-50 rounded-lg p-4">
              <p className="text-yellow-700 text-center">
                <span className="font-semibold">操作说明：</span>
                使用键盘数字键输入 | Backspace删除 | Delete清空 | Enter提交
              </p>
            </div>
          </div>

          {/* 右侧历史记录 */}
          <div className="w-[600px] flex flex-col">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">
              练习记录
            </h3>
            <div className="flex-1 overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      序号
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      目标数字
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      输入数字
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      正确率
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      用时(秒)
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {[...completedNumbers].reverse().map((record, index) => (
                    <tr
                      key={index}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {completedNumbers.length - index}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                        {record.number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                        {record.input}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`px-2 py-1 rounded-full ${
                            record.accuracy > 90
                              ? "bg-green-100 text-green-800"
                              : record.accuracy > 70
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {record.accuracy}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.time}
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
