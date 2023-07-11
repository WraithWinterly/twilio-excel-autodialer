import {
  MouseEvent,
  MouseEventHandler,
  createRef,
  use,
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
import { set } from "zod";
import Modal from "../modal";
import Alert from "../alert";

export default function CallNumbers({
  mainDataArray,
  desiredNumbers,
  setMainDataArray,
}: {
  mainDataArray: MainDataArray;
  desiredNumbers: string[];
  setMainDataArray: (mainDataArray: MainDataArray) => void;
}) {
  const [newMainDataArray, setNewMainDataArray] = useState<MainDataArray>([]);

  const [currentNumber, setCurrentNumber] = useState<string>("");
  const [currentAvailableNumbers, setCurrentAvailableNumbers] = useState<
    string[]
  >([]);
  const [callData, setCallData] = useState<{ [x: string]: CallInstance }>();

  const callButtonRef = createRef<HTMLButtonElement>();

  const callMutation = api.phone.call.useMutation();
  const textMutation = api.phone.text.useMutation();

  const [addNumberModalOpen, setAddNumberModalOpen] = useState(false);
  const [newNumberTitle, setNewNumberTitle] = useState("");
  const [newNumber, setNewNumber] = useState("");
  const [newNumberError, setNewNumberError] = useState("");

  const [autoRefetch, setAutoRefetch] = useState(false);

  const [autoSendSMS, setAutoSendSMS] = useState(true);
  const [smsContent, setSMSContent] = useState<string>("");

  const [dialedInThisContext, setDialedInThisContext] = useState<boolean>();
  const [autoRedial, setAutoRedial] = useState(false);
  const [redialCount, setRedialCount] = useState(0);

  const sendSMS = () => {
    textMutation.mutateAsync(
      { number: currentNumber, message: smsContent },
      {
        onSuccess: (data) => {
          setDialedInThisContext(false);
          setRedialCount(0);
          setAutoRefetch(false);
        },
      }
    );
  };

  const onSubmitAddNumber = () => {
    setNewNumberError("");
    let localNumberTitle = newNumberTitle;
    let localNewNumberErrors = newNumberError;
    if (newNumberTitle.trim().length <= 0) {
      localNumberTitle = formatPhoneNumber(fixPhoneNumber(newNumber));
    }
    // if (newNumberTitle.trim().length <= 0) {
    //   setNewNumberError((prev) => prev + "\nPlease enter a title");
    // }

    if (fixPhoneNumber(newNumber.trim()).length < 1) {
      localNewNumberErrors = "\nPlease enter a valid phone number";
      setNewNumberError((prev) => prev + localNewNumberErrors);
    }

    if (localNewNumberErrors.length > 0) {
      return;
    }

    if (localNumberTitle && newNumber) {
      const arr = [
        {
          [localNumberTitle]: [fixPhoneNumber(newNumber)],
        },
        ...newMainDataArray,
      ];
      setNewMainDataArray(arr);
      setMainDataArray(arr);
    }

    setAddNumberModalOpen(false);
  };

  useEffect(() => {
    if (typeof localStorage != "undefined") {
      const smsContent: { [type: string]: string } = JSON.parse(
        localStorage.getItem("smsContent") || "{}"
      );
      smsContent[currentNumber] = smsContent[currentNumber] || "";
      localStorage.setItem("smsContent", JSON.stringify(smsContent));
    }
  }, [smsContent]);

  useEffect(() => {
    console.log(currentNumber);
    if (typeof localStorage != "undefined") {
      const smsContent: { [type: string]: string } = JSON.parse(
        localStorage.getItem("smsContent") || "{}"
      );
      if (smsContent[currentNumber]) {
        setSMSContent(smsContent[currentNumber] || "");
      }
    }
  }, [currentNumber, smsContent]);

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
    setRedialCount(0);
    setDialedInThisContext(false);
    callMutation.reset();
    textMutation.reset();
  }, [currentNumber]);
  useEffect(() => {
    // Redial
    // Duration is 14 or 15 seconds on IOS if you reject the call or don't answer. Assume they did not answer.
    if (!callLogQuery.data) return;
    if (!callLogQuery.data.length || 0 > 0) return;
    if (!callMutation.data) return;

    const didNotAnswerCall =
      (callLogQuery.data[0]!.status === "completed" &&
        (callLogQuery.data[0]!.duration === "15" ||
          callLogQuery.data[0]!.duration === "14")) ||
      callLogQuery.status === "error";

    console.log("Did not answer call: ", didNotAnswerCall);

    if (didNotAnswerCall) {
      if (autoRedial) {
        // Redial
        if (redialCount < 3 && dialedInThisContext) {
          setRedialCount((count) => count + 1);
          handleCall(true);
        } else {
          sendSMS();
          setRedialCount(0);
          setDialedInThisContext(false);
          setAutoRefetch(false);
        }
      } else {
        setRedialCount(0);
        setDialedInThisContext(false);
        setAutoRefetch(false);
        sendSMS();
      }
    }

    // if (!autoRedial)
    //   if (!autoRedial || redialCount >= 3) {
    //     if (
    //       !!callLogQuery.data &&
    //       callLogQuery.data.length > 0 &&
    //       callLogQuery.data[0]!.status === "completed"
    //     ) {
    //       setAutoRefetch(false);
    //       setRedialCount(0);
    //       setDialedInThisContext(false);
    //     }
    //   }
  }, [callLogQuery.data]);

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

  async function handleCall(isRedial = false) {
    if (isRedial === false) {
      setRedialCount(0);
      setDialedInThisContext(true);
    }
    const button = callButtonRef.current;
    if (!button) throw new Error("Button not found");
    button.disabled = true;
    if (isRedial) {
      button.textContent = "Redialing...";
    } else {
      button.textContent = "Dialing...";
    }
    setAutoRefetch(true);
    textMutation.reset();
    const data = await callMutation.mutateAsync({ number: currentNumber });
    button.disabled = false;

    if (data.error) {
      button.classList.remove("btn-success");
      button.classList.add("btn-error");
    } else {
      button.classList.remove("btn-error");
      button.classList.add("btn-success");
    }
    button.textContent = "Call This Number";
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
        <div className="flex h-full max-h-[650px] w-96 flex-col gap-2 overflow-y-auto rounded-l-xl bg-violet-900/50 p-8">
          <button
            className="btn-primary btn"
            onClick={() => setAddNumberModalOpen(true)}
          >
            Add Number
          </button>
          <Modal
            modalOpen={addNumberModalOpen}
            setModalOpen={setAddNumberModalOpen}
          >
            <div className="flex flex-col gap-2">
              <h4 className="text-center text-xl font-bold text-gray-200">
                Add a New Number
              </h4>
              <label htmlFor="new-phone-number-title">
                Phone Number Identifier (Name) *
              </label>
              <input
                type="text"
                className="input"
                id="new-phone-number-title"
                value={newNumberTitle}
                onChange={(e) => {
                  setNewNumberTitle(e.target.value);
                }}
              />
              <label htmlFor="new-phone-number">Phone Number *</label>
              <input
                type="text"
                className="input"
                id="new-phone-number"
                value={newNumber}
                onChange={(e) => {
                  setNewNumber(e.target.value);
                }}
              />
              <input
                type="text"
                className={`input ${
                  fixPhoneNumber(newNumber).length > 1
                    ? "disabled:bg-green-800"
                    : "disabled: bg-red-800"
                }`}
                id="new-phone-number"
                disabled
                value={formatPhoneNumber(fixPhoneNumber(newNumber))}
              />
              {newNumberError.length > 0 && (
                <p className="text-red-500">{newNumberError}</p>
              )}
              <button className="btn" onClick={() => onSubmitAddNumber()}>
                Add Number
              </button>
              {/* <div className="flex flex-col gap-2">
                <label htmlFor="title">Title</label>
                <input
                  type="text"
                  id="title"
                  className="input"
                  value={newNumberTitle}
                  onChange={(e) => setNewNumberTitle(e.target.value)}
                />
              </div> */}
            </div>
          </Modal>
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
                items={currentAvailableNumbers.map((num) =>
                  formatPhoneNumber(num)
                )}
                onSelect={(item) => {
                  console.log("Yes: ", item);
                  setCurrentNumber(fixPhoneNumber(item));
                }}
                key={`${id}-${currentAvailableNumbers[0] || 0}`}
              />
            )}
          </h4>
          {currentNumber && (
            <div className="flex flex-col items-center pt-14">
              <button
                className="btn-success btn w-80"
                onClick={() => handleCall()}
                ref={callButtonRef}
              >
                Call This Number
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
              {redialCount > 0 && <p>Redialing... Tried {redialCount} times</p>}

              <button
                className="btn my-2"
                onClick={() => {
                  callLogQuery.refetch();
                }}
              >
                Fetch Logs
              </button>

              <div className="flex gap-2">
                <label htmlFor="auto-refetch">Auto Redial (3 tries)</label>
                <input
                  id="auto-refetch"
                  type="checkbox"
                  className="checkbox-primary checkbox"
                  checked={autoRedial}
                  onChange={(e) => {
                    setAutoRedial(e.target.checked);
                  }}
                ></input>
              </div>
              <br />
              <div className="flex w-11/12 flex-col items-end">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="checkbox-primary checkbox"
                    checked={autoSendSMS}
                    onChange={(e) => {
                      setAutoSendSMS(e.target.checked);
                    }}
                  />
                  <label htmlFor="sendsms">
                    {autoRedial
                      ? "Send This SMS On Redial Failure / Max Tries"
                      : "Send This SMS On No Answer"}
                  </label>
                </div>

                <textarea
                  className="textarea mt-1 w-full resize-none"
                  id="sendsms"
                  value={smsContent}
                  onChange={(e) => setSMSContent(e.target.value || "")}
                ></textarea>
                {textMutation.data?.success && (
                  <Alert type="success">SMS Sent Successfully</Alert>
                )}
                {textMutation.data?.error && (
                  <Alert type="error">
                    There was an issue sending this SMS.
                  </Alert>
                )}
                <button
                  className="btn-success btn mt-1 self-end"
                  onClick={sendSMS}
                  disabled={smsContent.trim().length === 0}
                >
                  Send SMS
                </button>
              </div>

              {!!callLogQuery.data && (
                <div className="mx-auto my-4 flex w-11/12 flex-col justify-start self-start bg-black/50 p-2">
                  <pre>
                    Latest Call Information:{" "}
                    {callLogQuery.data.map((log, i) => (
                      <div
                        key={`${log.sid}-${i}`}
                        className="border border-solid p-1"
                      >
                        {/* {JSON.stringify(log, null, 2)} */}
                        <pre>Call Sid:</pre>
                        <pre>{log.sid}</pre>
                        <pre>Call Status: {log.status}</pre>
                        {/* <pre>Call Status: {log.callerName}</pre> */}
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
