import React from "react";

const Alert = ({
  type,
  children,
}: {
  type: "info" | "success" | "warning" | "error";
  children: React.ReactNode;
}) => {
  let alertClassName = "alert";
  let svgClassName = "stroke-current shrink-0 w-6 h-6";
  let svgPath = <></>;

  switch (type) {
    case "info":
      alertClassName += " alert-info";
      svgPath = (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        ></path>
      );
      break;
    case "success":
      alertClassName += " alert-success";
      svgClassName += " h-6 w-6";
      svgPath = (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      );
      break;
    case "warning":
      alertClassName += " alert-warning";
      svgClassName += " h-6 w-6";
      svgPath = (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      );
      break;
    case "error":
      alertClassName += " alert-error";
      svgClassName += " h-6 w-6";
      svgPath = (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      );
      break;
    default:
      svgPath = (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        ></path>
      );
      break;
  }

  return (
    <div
      className={`${alertClassName} animate-in fade-in slide-in-from-top-5 w-full duration-500`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        className={svgClassName}
      >
        {svgPath}
      </svg>
      <span>{children}</span>
    </div>
  );
};

export default Alert;
