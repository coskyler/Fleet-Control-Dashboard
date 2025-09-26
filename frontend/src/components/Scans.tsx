import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ScanRenderer from "./ScanRenderer";
import { Vector3 } from "three";
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

    const scanID = useParams();

    const voxelsRef = useRef<Vector3[]>([]);
    const [scanName, setScanName] = useState('');
    const [scanOwner, setScanOwner] = useState('');
    const [scanDT, setScanDT] = useState('');
    const [visibility, setVisibility] = useState(false);
    const scanIdRef = useRef('-1');

    useEffect(() => {
        async function getScan() {
            const url = new URL(window.location.href);
            const scanID = url.pathname.split('/')[2];
            if(!scanID) { console.log("Error loading scan: Invalid scan ID"); navigate('/newscan'); return; }
            scanIdRef.current = scanID;

            const res = await fetch(`${apiDomain}/api/scans/load/${scanID}`, { credentials: 'include' });

            const body = await res.json();

            if(!body.success) { console.log("Error loading scan: " + body.message); navigate('/newscan'); return; }

            console.log("Scan loaded:\n", body.scan);

            const scan = body.scan;
            voxelsRef.current = [];
            for(let i = 0; i < scan.voxels.length; i+=3) {
                voxelsRef.current.push(new Vector3(scan.voxels[i], scan.voxels[i + 1], scan.voxels[i + 2] * -1));
            }

            setScanOwner(scan.username);
            setScanName(scan.name);
            setVisibility(scan.public);
            setScanDT(new Date(scan.created_at).toLocaleString('en-US', {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            }));
            

        };
        getScan();
    }, [scanID]);

    const updateVisibility = async () => {
        const res = await fetch(`${apiDomain}/api/scans/update`, {
            method: "PUT",
            headers: {
            "Content-Type": "application/json"
            },
            body: JSON.stringify({ visibility: !visibility, scanID: scanIdRef.current}),
            credentials: "include"
        });

        const body = await res.json();

        if(!body.success) { console.log('Error updating visibility: ' + body.message); return; }

        setVisibility(!visibility);
    };

    return  (
        <main className="h-full flex flex-col bg-neutral-800 p-6 text-white">
            <section className="flex justify-between items-end">
                <h1 className="text-3xl mb-2">{scanName}</h1>
                <h2 className="text-neutral-200 mb-2">Owner: {scanOwner}</h2>
            </section>
             <section className="flex justify-between items-end">
                <h1 className="text-neutral-200 mb-4">{scanDT}</h1>
                <div className="flex mb-4">
                    <h2 className="text-neutral-200 mr-1">Visibility:</h2>
                    <button onClick={updateVisibility} className={`${visibility ? 'text-black bg-neutral-200 hover:bg-neutral-400 active:bg-neutral-200' : 'text-white bg-neutral-700 hover:bg-neutral-600 active:bg-neutral-700'} min-w-[75px] cursor-pointer font-semibold px-2 rounded-xl transition duration-100`}>{visibility ? 'Public' : 'Private'}</button>
                </div>
            </section>
            <section className="flex-1 flex bg-neutral-700 rounded-xl">
                <ScanRenderer voxelsRef={voxelsRef}/>
            </section>
        </main>
    );
}