export default function Dashboard() {
    return  (
        <main className="h-full flex flex-col bg-neutral-800 p-6 text-white">
            <h1 className="text-3xl mb-4">Untitled Scan</h1>
            
            <section className="flex-1 flex">
                <aside className="w-64 bg-neutral-700 rounded-xl mr-2">

                </aside>
                <div className="flex-1 bg-neutral-700 rounded-xl">
                    
                </div>
            </section>

            <section className="flex mt-2">
                <div className="w-64 mr-2"></div>
                
                <div className="relative flex-1 flex justify-center gap-4">
                    <button className="absolute left-0 font-semibold text-black bg-neutral-200 px-3 py-1 rounded-xl hover:bg-neutral-400 transition duration-100 active:bg-neutral-200">Start Scan</button>
                    <button className="font-semibold text-black bg-neutral-200 px-3 py-1 rounded-xl  hover:bg-neutral-400 transition duration-100 active:bg-neutral-200">Dispatch</button>
                    <button className="font-semibold text-black bg-neutral-200 px-3 py-1 rounded-xl  hover:bg-neutral-400 transition duration-100 active:bg-neutral-200">Recall</button>
                    <button className="absolute text-black right-0 font-semibold bg-red-400 px-3 py-1 rounded-xl hover:bg-red-500 transition duration-100 active:bg-red-400">End Scan</button>
                </div>
            </section>
        </main>
    );
}