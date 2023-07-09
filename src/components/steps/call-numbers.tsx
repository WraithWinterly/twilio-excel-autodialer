import {
  MouseEvent,
  MouseEventHandler,
  createRef,
  useEffect,
  useId,
  useState,
} from "react";
import { CallInstance } from "twilio/lib/rest/api/v2010/account/call";
import { MainDataArray } from "~/pages";
import { api } from "~/utils/api";
import { ezObj, fixPhoneNumber, formatPhoneNumber } from "~/utils/utils";
import Dropdown from "../dropdown";
import { env } from "process";

export default function CallNumbers({
  mainDataArray,
  desiredNumbers,
}: {
  mainDataArray: MainDataArray;
  desiredNumbers: string[];
}) {
  const [newMainDataArray, setNewMainDataArray] = useState<MainDataArray>([]);

  const [currentNumber, setCurrentNumber] = useState<string>("");
  const [currentAvailableNumbers, setCurrentAvailableNumbers] = useState<
    string[]
  >([]);
  const [callData, setCallData] = useState<{ [x: string]: CallInstance }>();

  const callButtonRef = createRef<HTMLButtonElement>();

  const callMutation = api.phone.call.useMutation();

  const [autoRefetch, setAutoRefetch] = useState(false);

  const callLogQuery = api.phone.callLogs.useQuery(
    {
      number: currentNumber,
    },
    {
      enabled: !!currentNumber,
      refetchOnMount: false,
      refetchInterval: autoRefetch ? 2000 : 0,
    }
  );

  useEffect(() => {
    setAutoRefetch(false);
  }, [currentNumber]);

  useEffect(() => {
    // This goes through the data and removes empty strings, and deletes objects with no phone numbers
    const localCopy = structuredClone(mainDataArray);
    const updatedLocalCopy = localCopy
      .map((obj) => {
        const updatedObj = { ...obj };
        Object.keys(updatedObj).forEach((key) => {
          const updatedArr = updatedObj[key]!.filter((str) => str !== "");
          updatedObj[key] = updatedArr;
          if (updatedArr.length === 0) {
            delete updatedObj[key];
          } else {
          }
        });

        return updatedObj;
      })
      .filter((obj) => Object.keys(obj).length > 0);

    // console.log(updatedLocalCopy);

    setNewMainDataArray(updatedLocalCopy);
  }, [mainDataArray]);

  async function handleCall() {
    const button = callButtonRef.current;
    if (!button) throw new Error("Button not found");
    button.disabled = true;
    setAutoRefetch(true);
    const data = await callMutation.mutateAsync({ number: currentNumber });
    button.disabled = false;

    if (data.error) {
      button.classList.remove("btn-success");
      button.classList.add("btn-error");
    } else {
      button.classList.remove("btn-error");
      button.classList.add("btn-success");
    }
    if (!data.data) {
      return;
    }
    const calldata: CallInstance = data.data;
    setCallData((call) => {
      return { ...call, [currentNumber]: calldata };
    });
  }
  const id = useId();

  return (
    <div className="flex flex-col">
      <h2 className="bg-gradient-to-r from-purple-500 via-purple-400 to-purple-300 bg-clip-text  pb-4 text-center text-2xl font-extrabold text-transparent transition-colors duration-300">
        Ready to Call!
      </h2>

      <div className="flex gap-2">
        <div className="flex h-[400px] w-96 flex-col gap-2 overflow-y-auto rounded-l-xl bg-violet-900/50 p-8">
          <h4 className="pb-2 text-center text-xl font-bold">Your Call List</h4>
          {newMainDataArray.map((data, i) => (
            <button
              className="btn"
              key={`${ezObj(data).value[0]}-${i}`}
              onClick={() => setCurrentAvailableNumbers(ezObj(data).value)}
            >
              {ezObj(data).title}
            </button>
          ))}
        </div>
        <div className="flex-1 rounded-r-xl bg-violet-900/70">
          <h4 className="pt-6 text-center text-xl font-bold text-violet-200">
            {currentAvailableNumbers.length === 0 && "Select a Number to Call"}
            {currentAvailableNumbers.length > 0 && (
              <Dropdown
                items={currentAvailableNumbers}
                onSelect={(item) => {
                  console.log("Yes: ", item);
                  setCurrentNumber(item);
                }}
                key={`${id}-${currentAvailableNumbers[0] || 0}`}
              />
            )}
          </h4>
          {currentNumber && (
            <div className="flex flex-col items-center pt-14">
              <button
                className="btn-success btn w-80"
                onClick={handleCall}
                ref={callButtonRef}
              >
                Manual Call this number
              </button>
              {/* {!!callData?.[currentNumber] && (
                <div className="mx-2 my-4 flex w-fit flex-col justify-start self-start bg-black/50 p-2">
                  <pre>Answered By: {callData[currentNumber]!.answeredBy}</pre>
                  <pre>Caller Name: {callData[currentNumber]!.callerName}</pre>
                  <pre>Direction: {callData[currentNumber]!.direction}</pre>
                  <pre>Duration: {callData[currentNumber]!.duration}</pre>
                  <pre>
                    Date:{" "}
                    {new Date(
                      callData[currentNumber]!.dateCreated
                    ).toLocaleTimeString()}
                  </pre>
                </div>
              )} */}
              <button
                className="btn my-2"
                onClick={() => {
                  callLogQuery.refetch();
                }}
              >
                Fetch Logs
              </button>
              <div className="flex gap-2">
                <label htmlFor="auto-refetch">Auto Refetech</label>
                <input
                  id="auto-refetch"
                  type="checkbox"
                  className="checkbox-primary checkbox"
                  checked={autoRefetch}
                  onChange={(e) => {
                    setAutoRefetch(e.target.checked);
                  }}
                ></input>
              </div>

              {!!callLogQuery.data && (
                <div className="mx-2 my-4 flex w-fit flex-col justify-start self-start bg-black/50 p-2">
                  <pre>
                    Latest Call Information:{" "}
                    {callLogQuery.data.map((log, i) => (
                      <div
                        key={`${log.sid}-${i}`}
                        className="border border-solid p-1"
                      >
                        <pre>Call Sid: {log.sid}</pre>
                        <pre>Call Status: {log.status}</pre>
                        <pre>Call Status: {log.callerName}</pre>
                        <pre>Call Duration: {log.duration}</pre>
                        <pre>
                          Date: {new Date(log.dateCreated).toLocaleTimeString()}
                        </pre>
                      </div>
                    ))}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
