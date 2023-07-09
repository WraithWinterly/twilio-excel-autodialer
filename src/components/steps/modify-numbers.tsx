import { useEffect, useId, useState } from "react";
import { MainDataArray } from "~/pages";
import { ezObj, fixPhoneNumber, formatPhoneNumber } from "~/utils/utils";

export default function ModifyNumbers({
  mainDataArray,
  onContinue,
}: {
  mainDataArray: MainDataArray;
  onContinue: (mainDataArray: MainDataArray) => void;
}) {
  const [newMainDataArray, setNewMainDataArray] = useState<MainDataArray>([]);

  useEffect(() => {
    // This goes through the array and formats the phone numbers to have no symbols
    // +1 (000) 000-000  =>  +10000000000
    const localCopy = structuredClone(mainDataArray);
    const updatedLocalCopy = localCopy.map((obj) => {
      const updatedObj = { ...obj };
      Object.keys(updatedObj).forEach((key) => {
        const updatedArr = updatedObj[key]!.map((str) => {
          if (str === "") return str;
          return fixPhoneNumber(str);
        });

        updatedObj[key] = updatedArr;
      });

      return updatedObj;
    });

    setNewMainDataArray(updatedLocalCopy);
  }, [mainDataArray]);

  const id = useId();
  const id2 = useId();
  const id3 = useId();
  const id4 = useId();
  const id5 = useId();

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
        <table>
          <thead>
            <tr>
              <th className="mx-8 px-8">Identifier</th>
              <th className="mx-8 px-8">Original Number</th>
              <th className="mx-8 px-8">Input Number (Edit These)</th>
              <th className="mx-8 px-8">Detected Number</th>
            </tr>
          </thead>
          <tbody className="">
            {mainDataArray?.map((data, index) => (
              <tr
                key={`${id3}-${index}`}
                className="items-center border-b-4 border-solid border-gray-800 text-start"
              >
                {/* Identifier */}
                {!!mainDataArray && (
                  <td className="bg-violet-900/80">{ezObj(data).title}</td>
                )}
                {/* Original Number */}
                <td className="">
                  {ezObj(data).value.map((v, i) => (
                    <span
                      className="block 
                    whitespace-nowrap bg-violet-900/80 p-3"
                      key={`${id4}-${i}`}
                    >{`${i + 1}: ${v}`}</span>
                  ))}
                </td>
                {/* Input Number */}
                <td className="">
                  {!!newMainDataArray[index] &&
                    ezObj(newMainDataArray[index]!).value.map((v, i) => (
                      <input
                        className={`input m-0 block rounded-none border-none border-gray-500 bg-violet-800/80 p-1`}
                        key={`${id4}-${i}`}
                        defaultValue={v}
                        onBlur={(e) => {
                          setNewMainDataArray((prev) => {
                            const newMainDataArrayCopy = [...prev];
                            const val = Object.values(
                              newMainDataArrayCopy[index]!
                            )[0];
                            // console.log(val);

                            val![i] = e.target.value;
                            // console.log(val[i]);

                            return newMainDataArrayCopy;
                          });
                          // const newValue = e.target.value;
                          // const newMainDataArrayCopy = [...newMainDataArray];
                          // newMainDataArrayCopy[index].value[i] = newValue;
                          // setNewMainDataArray(newMainDataArrayCopy);
                        }}
                      />
                    ))}
                </td>
                {/* Detected Number */}
                <td className="">
                  {!!newMainDataArray[index] &&
                    ezObj(newMainDataArray[index]!).value.map((v, i) => (
                      <span
                        key={`${id5}-${i}`}
                        className={`block whitespace-nowrap p-3  ${
                          formatPhoneNumber(v).length > 0
                            ? "bg-green-500"
                            : "bg-rose-800"
                        }`}
                      >
                        <span className="text-sm opacity-0">{i + 1}</span>
                        <span>{formatPhoneNumber(v)}</span>
                      </span>
                    ))}
                </td>
              </tr>
            ))}
            {mainDataArray?.length === 0 && (
              <tr>
                <td colSpan={3} className="text-center">
                  No Data Loaded
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <button
        className="btn-success btn mt-8 w-80"
        onClick={() => {
          onContinue(newMainDataArray);
        }}
      >
        Continue
      </button>
    </div>
  );
}
