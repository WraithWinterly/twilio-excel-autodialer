import { useEffect, useState } from "react";
import { api } from "~/utils/api";

export default function Call() {
  const [number, setNumber] = useState<number>(0);
  const call = api.phone.call.useMutation({
    onSuccess: (data) => {
      console.log(data);
    },
  });

  return (
    <div className="flex flex-col gap-2">
      <h1>Call Test</h1>
      <input
        type="text"
        value={number}
        className="input"
        onChange={(e) => {
          setNumber(Number(e.currentTarget.value));
        }}
      />
      <button
        className="btn-primary btn"
        onClick={() => {
          call.mutateAsync({ number: String(number) });
        }}
      >
        Call Number from Twilio
      </button>
    </div>
  );
}
