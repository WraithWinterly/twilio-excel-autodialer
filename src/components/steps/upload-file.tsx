import { type WorkSheet, read, utils } from "xlsx";
import { createRef, useId, useState } from "react";

import {
  convertToSpreadSheetNumber,
  formatPhoneNumber,
  ezObj,
  convertToSpreadSheetLetter,
} from "~/utils/utils";
import { MainDataArray } from "~/pages";

const COLUMN_NUMBER_IDENTIFIER_DEFAULT_VALUE = "b";
const COLUMN_NUMBER_DEFAULT_VALUE = "k";
const ROW_START_IDX_DEFAULT_VALUE = 0;
const MAX_ROWS_DEFAULT_VALUE = 10;

export default function UploadFile({
  onContinue,
  setIndexMainDataArray,
}: {
  onContinue: (mainDataArray: MainDataArray) => void;
  setIndexMainDataArray: (mainDataArray: MainDataArray) => void;
}) {
  const id = useId();
  const id2 = useId();
  const id3 = useId();
  const id4 = useId();
  const id5 = useId();

  const [mainDataArray, setMainDataArray] = useState<MainDataArray>([]);

  const [file, setFile] = useState<File | undefined>(undefined);

  const [columnLetterInputValues, setColumnLetterInputValues] = useState<
    string[]
  >([COLUMN_NUMBER_DEFAULT_VALUE]);

  const [
    phoneNumberColumnLetterInputBoxCount,
    setPhoneNumberColumnLetterInputBoxCount,
  ] = useState<number>(1);

  const refs = {
    columnNumberIdentifier: createRef<HTMLInputElement>(),
    columnNumber: createRef<HTMLInputElement>(),
    rowStartIdx: createRef<HTMLInputElement>(),
    maxRows: createRef<HTMLInputElement>(),
  };

  const [errors, setErrors] = useState<{
    columnNumberError: string;
    rowStartIdxError: string;
    maxRowsError: string;
    columnNumberIdentifierError: string;
  }>({
    columnNumberError: "",
    rowStartIdxError: "",
    maxRowsError: "",
    columnNumberIdentifierError: "",
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0]);
    setMainDataArray([]);
  };

  function onSubmit() {
    setErrors({
      columnNumberError: "",
      rowStartIdxError: "",
      maxRowsError: "",
      columnNumberIdentifierError: "",
    });

    let columnNumberIdentifier = convertToSpreadSheetNumber(
      COLUMN_NUMBER_IDENTIFIER_DEFAULT_VALUE
    );
    let columnNumbers: Array<number> = [];
    let rowStartIdx = ROW_START_IDX_DEFAULT_VALUE;
    let maxRows = MAX_ROWS_DEFAULT_VALUE;

    function handleColumnNumberIdentifierInput() {
      const columnNumberIdentifierValue =
        refs.columnNumberIdentifier.current?.value;

      if (
        !!columnNumberIdentifierValue &&
        columnNumberIdentifierValue.length > 0
      ) {
        let finalColumnNumberIdentifier: number;
        if (isNaN(Number(columnNumberIdentifierValue))) {
          finalColumnNumberIdentifier = convertToSpreadSheetNumber(
            columnNumberIdentifierValue
          );
        } else {
          finalColumnNumberIdentifier = Number(columnNumberIdentifierValue);
        }

        columnNumberIdentifier = finalColumnNumberIdentifier;
      } else {
        setErrors((prev) => ({
          ...prev,
          columnNumberIdentifierError:
            "Please enter a number or letter for the column identifier.",
        }));
        return;
      }
    }

    function handleColumnNumberInput() {
      const columnNumberValue = refs.columnNumber.current;
      if (!columnNumberValue) throw new Error("Column number input not found");

      columnNumberValue.childNodes.forEach((child) => {
        const button = child as HTMLButtonElement;
        if (!!columnNumberValue && button.value.length > 0) {
          let finalColumnNumber: number;
          if (isNaN(Number(button.value))) {
            finalColumnNumber = convertToSpreadSheetNumber(button.value);
          } else {
            finalColumnNumber = Number(button.value);
          }

          // finalColumnNumber = convertToSpreadSheetNumber(button.value);
          if (finalColumnNumber != null) {
            columnNumbers.push(finalColumnNumber);
          }
        } else {
          setErrors((prev) => ({
            ...prev,
            columnNumberError:
              "Please enter a number or letter for the column identifier.",
          }));
          return;
        }
      });
    }

    function handleRowStartIdxInput() {
      const rowStartIdxValue = refs.rowStartIdx.current?.value;

      if (
        !!rowStartIdxValue &&
        !isNaN(Number(rowStartIdxValue)) &&
        rowStartIdxValue.length > 0
      ) {
        const finalRowStartIdx = Number(rowStartIdxValue);
        rowStartIdx = finalRowStartIdx;
      } else {
        setErrors((prev) => ({
          ...prev,
          rowStartIdxError: "Please enter a number for the row start index.",
        }));
        return;
      }
    }

    function handleMaxRowsInput() {
      const maxRowsValue = refs.maxRows.current?.value;

      if (
        !!maxRowsValue &&
        !isNaN(Number(maxRowsValue)) &&
        maxRowsValue.length > 0
      ) {
        const finalMaxRows = Number(maxRowsValue);
        maxRows = finalMaxRows;
      } else {
        setErrors((prev) => ({
          ...prev,
          maxRowsError: "Please enter a number for the max rows.",
        }));
        return;
      }
    }

    handleColumnNumberInput();
    handleColumnNumberIdentifierInput();
    handleRowStartIdxInput();
    handleMaxRowsInput();

    if (areErrors()) return;
    if (!file) return;

    readExcelFile(
      file,
      setMainDataArray,
      columnNumberIdentifier,
      columnNumbers,
      rowStartIdx,
      maxRows
    );
  }

  function areErrors() {
    let _errors = "";
    Object.values(errors).forEach((error) => {
      if (error.length > 0) {
        _errors += error;
      }
    });
    return _errors.length > 0;
  }

  return (
    <>
      <div className="flex flex-col items-center gap-12 lg:flex-row lg:items-start">
        <div className="flex flex-col gap-2">
          <h4 className="text-xl font-bold">Upload your Excel File</h4>
          <div className="pt-3">
            <input
              type="file"
              onChange={handleFileChange}
              className="file-input"
              accept=".xlsx"
            />
          </div>
          {}
          <label htmlFor="" className="w-full max-w-sm">
            Column Letter(s) to load NAMES / IDENTIFIER (how you will know what
            each number is for)
          </label>
          <input
            type="text"
            defaultValue={COLUMN_NUMBER_IDENTIFIER_DEFAULT_VALUE}
            ref={refs.columnNumberIdentifier}
            className={`input ${
              errors.columnNumberIdentifierError.length > 0
                ? "input-error"
                : "input-success"
            }`}
          />
          <label htmlFor="">Column Letter(s) to load PHONE NUMBERS</label>
          <div className="flex gap-2">
            <button
              onClick={() =>
                setPhoneNumberColumnLetterInputBoxCount((prev) => prev + 1)
              }
              className="btn-square btn text-sm"
            >
              +
            </button>
            <button
              onClick={() =>
                setPhoneNumberColumnLetterInputBoxCount((prev) =>
                  prev <= 1 ? 1 : prev - 1
                )
              }
              className="btn-square btn text-sm"
            >
              -
            </button>
            <button
              className="btn"
              disabled={!file}
              onClick={() => {
                if (!file) return;
                const reader = new FileReader();

                reader.onload = (e) => {
                  console.log("on load");
                  const data = new Uint8Array(e.target?.result as ArrayBuffer);

                  const workbook = read(data, { type: "array" });

                  const worksheet: WorkSheet =
                    workbook.Sheets[workbook.SheetNames[0] as string] || {};

                  const jsonData = utils.sheet_to_json(worksheet, {
                    header: 1,
                  });
                  const columnIndexes: Array<string> = [];
                  let reps = 0;
                  for (const row of jsonData as unknown[][]) {
                    if (reps > 0) break;
                    console.log(row);
                    row.forEach((cellValue) => {
                      const ccv = cellValue as string;
                      console.log(ccv);
                      if (
                        ccv.toLowerCase().includes("phone") &&
                        !ccv.toLowerCase().includes("type")
                      ) {
                        columnIndexes.push(
                          convertToSpreadSheetLetter(row.indexOf(cellValue) + 1)
                        );
                      }
                    });

                    console.log(columnIndexes);

                    reps++;
                  }
                  setColumnLetterInputValues([
                    ...columnIndexes.map((cv, i) => {
                      // if (i == 0) return "";
                      return String(cv);
                    }),
                  ]);
                  setPhoneNumberColumnLetterInputBoxCount(columnIndexes.length);
                };

                reader.readAsArrayBuffer(file);
              }}
            >
              Auto Detect
            </button>
          </div>
          <div ref={refs.columnNumber} className="flex w-96 flex-wrap gap-2">
            {Array.from({
              length: phoneNumberColumnLetterInputBoxCount,
            }).map((_, i) => (
              <input
                type="text"
                value={columnLetterInputValues[i]}
                onChange={(e) => {
                  console.log(e.target.value);
                  const values = [...columnLetterInputValues];
                  values[i] = e.target.value;
                  setColumnLetterInputValues(values);
                }}
                className={`input w-28 ${
                  errors.columnNumberError.length > 0
                    ? "input-error"
                    : "input-success"
                }`}
                key={`${id}-${i}`}
              />
            ))}
          </div>

          <label htmlFor="">Skip rows</label>
          <input
            type="text"
            defaultValue={ROW_START_IDX_DEFAULT_VALUE}
            ref={refs.rowStartIdx}
            className={`input ${
              errors.rowStartIdxError.length > 0
                ? "input-error"
                : "input-success"
            }`}
          />
          <label htmlFor="">Maximum Rows to load (set 0 for all)</label>
          <input
            type="text"
            defaultValue={MAX_ROWS_DEFAULT_VALUE}
            ref={refs.maxRows}
            className={`input ${
              errors.maxRowsError.length > 0 ? "input-error" : "input-success"
            }`}
          />
          {areErrors() && (
            <div className="text-red-500">
              {Object.values(errors).map((error, i) => {
                if (error.length > 0) {
                  return <div key={`${id2}-${i}`}>{error}</div>;
                }
              })}
            </div>
          )}
          <button
            disabled={file == null}
            onClick={onSubmit}
            className="btn-primary btn"
          >
            {mainDataArray?.length || 0 > 0 ? "Reload" : "Load"}
          </button>
          <button
            className="btn-success btn"
            disabled={mainDataArray?.length === 0}
            onClick={() => {
              onContinue(mainDataArray!);
            }}
          >
            Continue
          </button>
          <button
            className="self-start pt-4 text-sm text-blue-500/80"
            onClick={() => {
              setFile(undefined);
              setMainDataArray([]);
              setIndexMainDataArray([]);
              onContinue([]);
            }}
          >
            I don't have a spreadsheet.
          </button>
        </div>
        <div className="flex w-full flex-col gap-2">
          <h4 className="text-xl font-bold">Overview of Your Loaded Data</h4>
          <p>Currently only supports US based numbers</p>

          <div className="my-2 w-full flex-1 rounded-xl bg-primary/50 p-2">
            <table>
              <thead>
                <tr>
                  <th className="mx-8 px-8">Identifier</th>
                  <th className="mx-8 px-8">Original Number</th>
                  <th className="mx-8 px-8">Detected Number</th>
                </tr>
              </thead>
              <tbody className="">
                {mainDataArray?.map((data, index) => (
                  <tr
                    key={`${id3}-${index}`}
                    className="items-center border-b-2 border-solid border-gray-800 text-start"
                  >
                    {!!mainDataArray && (
                      <td className="">{ezObj(data).title}</td>
                    )}

                    <td className="">
                      {ezObj(data).value.map((v, i) => (
                        <span
                          className="block bg-violet-800/80 p-1"
                          key={`${id4}-${i}`}
                        >{`${i + 1}: ${v}`}</span>
                      ))}
                    </td>

                    <td className="">
                      {ezObj(data).value.map((v, i) => (
                        <span
                          key={`${id5}-${i}`}
                          className={`block p-1  ${
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
        </div>
      </div>
    </>
  );
}

function readExcelFile(
  file: File,
  setMainDataArray: React.Dispatch<React.SetStateAction<MainDataArray>>,
  columnNumberIdentifier: number,
  columnNumbers: number[],
  rowStartIdx: number,
  maxRows: number
) {
  if (!file) return;
  const reader = new FileReader();

  reader.onload = (event) => {
    const data = new Uint8Array(event.target?.result as ArrayBuffer);

    const workbook = read(data, { type: "array" });

    const worksheet: WorkSheet =
      workbook.Sheets[workbook.SheetNames[0] as string] || {};

    const jsonData = utils.sheet_to_json(worksheet, { header: 1 });

    const localColumnNumberIdentifiers: { [x: string]: string[] }[] = [];

    let rowCount = 0;

    for (const row of jsonData as unknown[][]) {
      if (rowCount < rowStartIdx) {
        rowCount++;
        continue;
      }

      // Construct the array of column values
      const columnValues = columnNumbers.map((columnNumber) => {
        const value = row[columnNumber - 1];
        return value != null ? String(value) : "";
      });

      // Get the identifier value from the row
      const identifierValue = row[columnNumberIdentifier - 1];

      // Check if any non-empty value exists in the columnValues array
      const hasNonEmptyValue = columnValues.some((value) => value.length > 0);

      // If identifierValue is null or empty, use the first phone number instead
      const identifier =
        identifierValue != null && String(identifierValue).trim() !== ""
          ? String(identifierValue)
          : columnValues.find((value) => value.length > 0) || "No Identifier";

      // Push the columnValues array into localColumnNumberIdentifiers if it has at least one non-empty value
      if (hasNonEmptyValue) {
        localColumnNumberIdentifiers.push({
          [identifier]: columnValues.filter((value) => value.length > 0),
        });
      }

      rowCount++;
      if (maxRows !== 0 && rowCount >= maxRows + rowStartIdx) {
        break; // Exit the loop if maximum row count is reached
      }
    }

    setMainDataArray(localColumnNumberIdentifiers);
  };

  reader.readAsArrayBuffer(file);
}
