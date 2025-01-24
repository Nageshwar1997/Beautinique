import { RouterProvider } from "react-router-dom";
import DarkMode from "./components/DarkMode";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import router from "./routes";
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="bg-primary relative">
        <div className="absolute top-4 right-4 bg-red-500 p-4 z-10 rounded-full">
          <DarkMode />
        </div>
        <RouterProvider router={router} />
      </div>
      {/* React Query Devtools */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
