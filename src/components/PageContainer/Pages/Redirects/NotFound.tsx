import React from "react";

/**
 * NotFound component displays a 404 error message
 * when the requested page is not found.
 */
const NotFound: React.FC = () => {
    return (
        <div className="page items-center justify-center">
            <h1 className="page-title">Page Not Found: 404</h1>
            <p className="page-text">Sorry, we couldn't find the page you're looking for</p>
        </div>
    );
};

export default NotFound;