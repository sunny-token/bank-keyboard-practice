export default function Keypad({
  onKeyPress,
}: {
  onKeyPress: (key: string) => void;
}) {
  const keys = [
    "7",
    "8",
    "9",
    "4",
    "5",
    "6",
    "1",
    "2",
    "3",
    "0",
    "backspace",
    "clear",
  ];

  return (
    <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
      {keys.map((key) => (
        <button
          key={key}
          onClick={() => onKeyPress(key)}
          className={`
            py-4 px-2 rounded-lg text-xl font-bold 
            ${
              key === "backspace" || key === "clear"
                ? "bg-gray-200 hover:bg-gray-300"
                : "bg-gray-100 hover:bg-gray-200"
            }
            transition duration-200 
          `}
        >
          {key === "backspace" ? "⌫" : key === "clear" ? "C" : key}
        </button>
      ))}
    </div>
  );
}
