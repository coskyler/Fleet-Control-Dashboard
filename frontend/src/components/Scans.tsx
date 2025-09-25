import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ScanRenderer from "./ScanRenderer";
const apiDomain = import.meta.env.VITE_API_DOMAIN;

type ScanRow = {
    scan_id: number;
    user_id: number;
    name: string;
    created_at: string;
    voxels: string;
    username: string;
    public: boolean
};

export default function Scans() {
    const navigate = useNavigate();

    const voxelsRef = useRef([]);
    const [scanName, setScanName] = useState('Untitled Scan');
    const [scanDT, setScanDT] = useState('-1');

    useEffect(() => {
        function noAccess() {

        };

        async function getScan() {
            const url = new URL(window.location.href);
            const unityID = url.pathname.split('/')[2];
            if(!unityID) { noAccess(); return; }

            const res = await fetch(`${apiDomain}/api/scans/load/${unityID}`, { credentials: 'include' });

            const body = await res.json();

            if(!body.success) { console.log("Error loading scan: " + body.message); navigate('/newscan'); return; }

            console.log("Scan loaded:\n", body.scan);

        };
        getScan();
    }, []);

    return  (
        <main className="h-full flex flex-col bg-neutral-800 p-6 text-white">
            <section className="flex justify-between items-end">
                <h1 className="text-3xl mb-4">Untitled Scan</h1>
                <h2 className="text-neutral-200 mb-4">timestamp</h2>
            </section>
            <section className="flex-1 flex bg-neutral-700 rounded-xl">
                <ScanRenderer voxelsRef={voxelsRef}/>
            </section>
        </main>
    );
}