'use client'
import { SalesContext } from "../contexts/SalesContext";
import { useContext } from "react";

export function useSalesContext() {
    const context = useContext(SalesContext);
    return context;
}