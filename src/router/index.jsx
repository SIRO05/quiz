import { Routes, Route } from "react-router-dom";

// pages
import HomePage from "../pages/HomePage";

const Approuter = () => {
    return (
        <Routes>
            <Route index element={<HomePage />} />
        </Routes>
    )
}

export default Approuter