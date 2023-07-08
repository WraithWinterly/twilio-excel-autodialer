import { useEffect, useState } from "react";
import { number, set } from "zod";
import { fixPhoneNumber, formatPhoneNumber } from "~/utils/utils";

export default function ModifyNumbers({
  numbers,
  originalNumbers,
  onContinue,
}: {
  numbers: string[];
  originalNumbers: string[];
  onContinue: (numbers: string[]) => void;
}) {
  const [desiredNumbers, setDesiredNumbers] = useState<string[]>(numbers);
  useEffect(() => {
    setDesiredNumbers(numbers);
  }, [numbers]);
  return (
    <div className="flex w-full max-w-2xl flex-col gap-2">
      <h1 className="text-3xl font-bold">Modify Numbers</h1>
      <p className="max-w-xl text-gray-200">
        This table has three columns. The first column contains the original
        loaded values from the spreadsheet. The second column allows you to edit
        a specific number. The final value in the third column will be the final
        value, and will only appear once you finish writing the entire phone
        number.
      </p>
      <b>You may leave the values red or empty and they will be ignored.</b>

      <div className="mx-auto flex h-[400px] w-full gap-8 overflow-auto pt-10">
        <div className="flex w-52 flex-col gap-2">
          <h4 className="h-12">Original Loaded Values</h4>
          {numbers.map((number, index) => (
            <div
              key={index}
              className="flex h-12 w-52 shrink-0 rounded-md bg-violet-900/50 px-4 pt-[0.6rem]"
            >
              <p>{originalNumbers[index]}</p>
            </div>
          ))}
        </div>
        <div className="flex w-52 flex-col gap-2">
          <h4 className="h-12">Input Your Values</h4>
          {desiredNumbers.map((number, index) => (
            <input
              key={index}
              defaultValue={desiredNumbers[index]}
              onChange={(e) => {
                const newNumbers = [...desiredNumbers];
                newNumbers[index] = e.target.value;
                setDesiredNumbers(newNumbers);
              }}
              className="input h-12 w-52 shrink-0"
            />
          ))}
        </div>
        <div className="flex w-52 flex-col gap-2">
          <h4 className="h-12">Final Values</h4>
          {desiredNumbers.map((number, index) => (
            <div
              key={index}
              className={`h-12 w-52 shrink-0 rounded-md px-4 pt-[0.6rem] ${
                fixPhoneNumber(number).length > 0
                  ? "bg-green-600"
                  : "bg-red-600 "
              }`}
            >
              <p>{formatPhoneNumber(fixPhoneNumber(desiredNumbers[index]!))}</p>
            </div>
          ))}
        </div>
      </div>
      <button
        className="btn-success btn mt-8 w-80"
        onClick={() => {
          onContinue(desiredNumbers);
        }}
      >
        Continue
      </button>
    </div>
  );
}
