export default function Dashboard() {
    return  (
        <main className="h-full flex flex-col bg-neutral-800 p-6 text-white">
            <h1 className="text-xl font-bold mb-4">New Scan</h1>
            
            <section className="flex-1 flex">
                <aside className="w-64 bg-neutral-900">

                </aside>
                <div className="flex-1 bg-neutral-700">
                    
                </div>
            </section>

            <section className="flex mt-4">
                <div className="w-64 flex flex-col gap-2">
                    <button className="w-fit font-semibold bg-green-700 px-3 py-1 rounded hover:bg-green-800 transition duration-200 active:bg-green-700">Start Scan</button>
                    <button className="w-fit font-semibold bg-red-800 px-3 py-1 rounded hover:bg-red-900 transition duration-200 active:bg-red-800">End Scan</button>
                </div>

                <div className="flex-1 flex justify-center gap-4 pb-6">
                    <button className="w-fit font-semibold bg-neutral-600 px-3 py-1 rounded hover:bg-neutral-700 transition duration-200 active:bg-neutral-600">Dispatch</button>
                    <button className="w-fit font-semibold bg-neutral-600 px-3 py-1 rounded hover:bg-neutral-700 transition duration-200 active:bg-neutral-600">Recall</button>
                </div>
            </section>
        </main>
    );
}