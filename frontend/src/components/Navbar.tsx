import { Link, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";


export default function Navbar() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    const handleLogout = async () => {
        // Clear local storage (user info)
        localStorage.removeItem("user");

        // Clear cookie by calling backend logout endpoint if it existed, 
        // but since we only have httpOnly cookie and no specific logout endpoint that clears it documented yet,
        // we usually rely on client-side state clearing or an expiration.
        // Ideally, we'd call await api.post("/auth/logout");

        // For now, force reload/navigate to signin which effectively "logs out" the view
        navigate("/signin");
    };

    return (
        <nav className="border-b bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                                TaskManager
                            </span>
                        </div>
                        <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                            <Link
                                to="/"
                                className="border-indigo-500 text-gray-900 dark:text-gray-100 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                            >
                                Dashboard
                            </Link>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <span className="text-sm text-gray-500 mr-4">
                            Hello, {user.name || "User"}
                        </span>
                        <Button variant="outline" size="sm" onClick={handleLogout}>
                            Sign Out
                        </Button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
