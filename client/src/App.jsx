import { Toaster } from "react-hot-toast"
import AppRoute from "./route/AppRoute"

const App = () => {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: { background: "#1e293b", color: "#f1f5f9", borderRadius: "8px" },
          success: { iconTheme: { primary: "#22c55e" } },
          error: { iconTheme: { primary: "#ef4444" } },
        }}
      />
      <AppRoute />
    </>
  )
}

export default App
