import { Navigate, Route, Routes } from "react-router-dom";
import { AccountSelectPage } from "./pages/AccountSelectPage";
import { PersonalFlow } from "./flows/PersonalFlow";
import { CorporateFlow } from "./flows/CorporateFlow";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<AccountSelectPage />} />
      <Route path="/personal" element={<PersonalFlow />} />
      <Route path="/corporate" element={<CorporateFlow />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
