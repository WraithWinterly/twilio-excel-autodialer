import Head from "next/head";
import { useEffect, useState } from "react";

import UploadFile from "~/components/steps/upload-file";
import { BiCloudUpload } from "react-icons/bi";
import { AiOutlineEdit } from "react-icons/ai";
import { FiPhoneCall } from "react-icons/fi";
import ModifyNumbers from "~/components/steps/modify-numbers";
import CallNumbers from "~/components/steps/call-numbers";

export enum Steps {
  UploadFile,
  ModifyNumbers,
  CallNumbers,
}

const StepResources = {
  [Steps.UploadFile]: {
    title: "Upload your file",
    icon: <BiCloudUpload />,
  },
  [Steps.ModifyNumbers]: {
    title: "Modify Numbers",
    icon: <AiOutlineEdit />,
  },
  [Steps.CallNumbers]: {
    title: "Call Numbers",
    icon: <FiPhoneCall />,
  },
};

export type MainDataArray = { [key: string]: string[] }[];

export default function Home() {
  const [mainDataArray, setMainDataArray] = useState<MainDataArray>([]);

  const [currentStep, setCurrentStep] = useState<Steps>(Steps.UploadFile);
  const [maxStep, setMaxStep] = useState<Steps>(Steps.UploadFile);

  useEffect(() => {
    setMaxStep((prevMaxStep) => Math.max(prevMaxStep, currentStep));
  }, [currentStep]);

  return (
    <>
      <Head>
        <title>DialFusion</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {/* Breadcrumbs */}
      <div className="breadcrumbs mb-4">
        <ul className="rounded-xl bg-slate-800 px-4 pb-3 pt-2 text-xl">
          {Object.entries(StepResources).map(([key, value]) => (
            <li
              key={key}
              className={`flex gap-2 ${
                currentStep === Number(key)
                  ? "text-green-400"
                  : maxStep >= Number(key)
                  ? "text-white"
                  : "text-gray-400"
              } ${
                maxStep >= Number(key) ? "cursor-pointer" : "cursor-not-allowed"
              }`}
              onClick={() => {
                if (maxStep >= Number(key)) {
                  setCurrentStep(Number(key));
                }
              }}
            >
              {value.icon}
              {value.title}
            </li>
          ))}
        </ul>
      </div>
      <div className="mb-48 w-full rounded-3xl bg-violet-900/30 px-2 py-8 lg:px-8">
        <div hidden={currentStep !== Steps.UploadFile}>
          {currentStep === Steps.UploadFile && (
            <UploadFile
              onContinue={(newMainDataArray) => {
                // console.log(Object.keys(mainDataArray) === 0);
                if (newMainDataArray.length === 0) {
                  // Skip steps
                  setMaxStep(Steps.CallNumbers);
                  setCurrentStep(Steps.CallNumbers);
                  return;
                }
                setMainDataArray(newMainDataArray);
                setCurrentStep(Steps.ModifyNumbers);
              }}
              setIndexMainDataArray={setMainDataArray}
            />
          )}
        </div>

        <div hidden={currentStep !== Steps.ModifyNumbers}>
          {currentStep === Steps.ModifyNumbers && (
            <ModifyNumbers
              mainDataArray={mainDataArray}
              onContinue={(newMainDataArray) => {
                setMainDataArray(newMainDataArray);
                setCurrentStep(Steps.CallNumbers);
              }}
            />
          )}
        </div>

        <div hidden={currentStep !== Steps.CallNumbers}>
          {currentStep === Steps.CallNumbers && (
            <CallNumbers
              mainDataArray={mainDataArray}
              desiredNumbers={[]}
              setMainDataArray={setMainDataArray}
            />
          )}
        </div>
      </div>
    </>
  );
}
