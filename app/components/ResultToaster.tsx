import { toast } from "sonner";
import React from "react";

export interface ResultData {
  correctCount: number;
  accuracy: number;
  duration: number;
  wpm: number;
  totalCount: number;
}

export function showResultToaster(result: ResultData) {
  toast(
    <div className="min-w-[260px] bg-gradient-to-br from-yellow-50 to-white rounded-xl shadow-2xl p-5 border border-yellow-100">
      <div className="flex flex-col items-center">
        <div className="text-3xl mb-2">🏆</div>
        <div className="font-extrabold text-xl mb-2 text-yellow-700 tracking-wide">
          本轮成绩
        </div>
        <div className="space-y-2 w-full">
          <div>
            <span className="font-semibold text-gray-700">正确题数：</span>
            <span className="font-bold text-green-600">
              {result.correctCount}
            </span>
            <span className="text-gray-400"> / {result.totalCount}</span>
          </div>
          <div>
            <span className="font-semibold text-gray-700">准确率：</span>
            <span className="font-bold text-blue-600">{result.accuracy}%</span>
          </div>
          <div>
            <span className="font-semibold text-gray-700">用时：</span>
            <span className="font-bold text-purple-600">{result.duration}</span>
            <span className="text-gray-400"> 秒</span>
          </div>
          <div>
            <span className="font-semibold text-gray-700">WPM：</span>
            <span className="font-bold text-pink-600">{result.wpm}</span>
            <span className="text-gray-400">（每分钟数字数）</span>
          </div>
        </div>
      </div>
    </div>,
    {
      duration: 8000,
      position: "bottom-center",
      className: "custom-result-toast",
      closeButton: true,
    },
  );
}
