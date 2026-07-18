import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/Login/Login";
import Dashboard from "../pages/Dashboard/Dashboard";
import Chat from "../pages/Chat/Chat";
import KnowledgeBase from "../pages/KnowledgeBase/KnowledgeBase";
import Documents from "../pages/Documents/Documents";
import Models from "../pages/Models/Models";
import ApiKeys from "../pages/ApiKeys/ApiKeys";
import Users from "../pages/Users/Users";
import Settings from "../pages/Settings/Settings";

import MainLayout from "../layouts/MainLayout";
import ProtectedRoute from "./ProtectedRoute";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/knowledge-base" element={<KnowledgeBase />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/models" element={<Models />} />
        <Route path="/api-keys" element={<ApiKeys />} />
        <Route path="/users" element={<Users />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
