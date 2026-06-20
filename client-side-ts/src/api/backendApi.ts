function backendConnection() {
  const env = import.meta.env;

  return (
    env?.VITE_API_URL ||
    env?.VITE_BACKEND_URL ||
    env?.VITE_SERVER_URL ||
    (typeof window !== "undefined" ? window.location.origin : "")
  );
}

export default backendConnection;
