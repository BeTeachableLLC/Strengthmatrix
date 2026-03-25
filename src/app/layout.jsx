import ClientBodyClass from "./ClientBodyClass";
import { Toaster } from "react-hot-toast";

import "../App.css";
import "../Swot.css";
import "../ui/newSwot.css";
import "../index.css";

export const metadata = {
  title: "Strengthmatrix",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ClientBodyClass />
        <Toaster position="top-right" />
        {children}
      </body>
    </html>
  );
}

