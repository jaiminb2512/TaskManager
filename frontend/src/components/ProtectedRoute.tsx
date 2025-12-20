import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute() {
    // Check for user existence in localStorage as a proxy for authentication
    // Ideally we would verify the token/cookie existence, but since it's HttpOnly, we rely on the API 401 response
    // to kick us out, or the presence of user metadata in localStorage if we store it there on login.
    const user = localStorage.getItem("user");

    if (!user) {
        return <Navigate to="/signin" replace />;
    }

    return <Outlet />;
}
