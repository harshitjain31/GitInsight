import React from "react";
import ReactLoading from "react-loading";
import '../App.css';

export default function Loading() {
    return (
        <>
            <h2 className="loading-text">Cloning your repository!</h2>
            <div className="loading" >
                <ReactLoading type="bars" color="#09090b"
                />
            </div>
        </>
    );
}