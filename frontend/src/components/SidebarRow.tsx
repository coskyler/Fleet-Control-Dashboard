import { useNavigate } from "react-router-dom";

type Props = {
  scanName: string
  scanDateTime: string
  scanLink: string
};

export default function SidebarRow({ scanName, scanDateTime, scanLink }: Props) {
    const navigate = useNavigate();

    return (
        <a
        onClick={() => {navigate(scanLink)}}
        className="block bg-neutral-800 rounded-xl py-2 px-3 hover:bg-neutral-700 transition-colors cursor-pointer"
        >
        <div className="text-[16px] font-semibold text-white">{scanName}</div>
        <div className="text-[14px] text-gray-400">
            {(() => {
                const diffMs = Date.now() - new Date(scanDateTime).getTime();
                const diffMin = Math.floor(diffMs / 60000);

                if (diffMin < 1) return "Now";
                if (diffMin < 60) return `${diffMin} minutes ago`;

                const diffHr = Math.floor(diffMin / 60);
                if (diffHr < 24) return `${diffHr} hours ago`;

                const diffDay = Math.floor(diffHr / 24);
                return `${diffDay} days ago`;
            })()}
        </div>
        </a>
    );
}