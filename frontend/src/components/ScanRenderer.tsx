import { Canvas } from '@react-three/fiber';
import { OrbitControls, Instances, Instance } from '@react-three/drei';
import { Vector3, Quaternion } from "three";

type RenderProps = {
    voxelsRef?: React.RefObject<Vector3[]>,
    dronesRef?: React.RefObject<Vector3[]>
};

export default function ScanRenderer(props: RenderProps) {
    const voxelsRef = props.voxelsRef;
    const voxels = voxelsRef?.current;

    console.log("rendered the renderer");

    return (
        <div className="relative w-full h-full">
            <Canvas className="!absolute !inset-0" dpr={[1, 2]}>
                <ambientLight intensity={.5} />
                <directionalLight position={[5, 5, 5]} intensity={.8} />
                <directionalLight position={[-5, 2, -2]} intensity={.4} />
                <directionalLight position={[5, 5, -5]} intensity={.3} />
                <mesh>
                    <boxGeometry />
                    <meshStandardMaterial color="red" />
                </mesh>

                <Instances>
                    <boxGeometry args={[1, 1, 1]} />
                    <meshStandardMaterial color="red" />
                    {voxels?.map((pos, i) => (
                        <Instance key={i} position={[pos.x, pos.y, pos.z]} />
                    ))}
                </Instances>

                <OrbitControls />
                
            </Canvas>
        </div>
    )
}
