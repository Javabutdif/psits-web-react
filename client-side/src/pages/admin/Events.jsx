import React, { useState, useRef, useEffect } from "react";
import QrScanner from "qr-scanner";

const Events = (props) => {
	const videoRef = useRef(null);
	const [result, setResult] = useState("");

	useEffect(() => {
		const qrScanner = new QrScanner(
			videoRef.current,
			(result) => {
				alert("QR Code result:", result.data);
				setResult(result.data);
			},
			{
				returnDetailedScanResult: true, // Optional: more scan data
			}
		);

		qrScanner.start();

		// Clean up the scanner on unmount
		return () => qrScanner.destroy();
	}, []);

	return (
		<div>
			<h1>QR Scanner wasap </h1>
			<video ref={videoRef} style={{ width: "100%" }}></video>
			<p>Result: {result}</p>
		</div>
	);
};

export default Events;
