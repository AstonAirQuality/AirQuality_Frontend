import React from 'react';

// Unauthorised component displays a 401 error message for unauthorized users
const Unauthorised: React.FC = () => {
    return (
        <div className="page items-center justify-center">
            <h1 className="page-title">Unauthorised user: 401</h1>
            <p className="page-text">You do not meet the user requirements to view this page</p>
        </div>
    );
};

export default Unauthorised;