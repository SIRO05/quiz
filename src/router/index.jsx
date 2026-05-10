import { Routes, Route } from "react-router-dom";

// pages
import HomePage from "../pages/HomePage";
import IndexHelper from "../pages/HelperPage";
import DevPage from "../pages/DevPage";

const Approuter = () => {
    return (
        <Routes>
            <Route index element={<HomePage />} />
            <Route path="/dev" element={<DevPage />} />
            <Route path="/helper" element={<IndexHelper />} />
        </Routes>
    )
}

export default Approuter