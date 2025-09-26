import { Vector3 } from "three";

type Props = {
  droneName: string
  dronePos: Vector3;
};

export default function DroneRow({ droneName, dronePos }: Props) {
    return (
        <a
        //onClick={() => {navigate(scanLink)}}
        className="block rounded-xl py-2 px-3 bg-[#292929] hover:bg-[#303030] transition-colors cursor-pointer"
        >
        <div className="text-[16px] font-semibold text-white">{droneName}</div>
        <div className="text-[14px] text-gray-400">{dronePos.x} x, {dronePos.y} y, {dronePos.z} z</div>
        </a>
    );
}