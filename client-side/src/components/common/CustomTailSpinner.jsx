import { TailSpin } from "react-loader-spinner";

export default function CustomTailSpinner() {
  return (
    <TailSpin
      visible={true}
      height="20"
      width="20"
      color="#ffffff"
      ariaLabel="tail-spin-loading"
    />
  );
}
