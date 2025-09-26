import { Canvas } from '@react-three/fiber';
import { OrbitControls, Instances, Instance, useGLTF } from '@react-three/drei';
import { Vector3, Quaternion } from "three";
import { Suspense } from 'react';

type RenderProps = {
    voxelsRef?: React.RefObject<Vector3[]>,
    dronesRef?: React.RefObject<Map<string, DroneData>>,
    voxelSize?: number
};

type DroneData = {
    name: string,
    pos: Vector3,
    scale: Vector3,
    orientation: Quaternion
}

function DroneModel(props: {quaternion: Quaternion, position: Vector3}) {
    const { scene } = useGLTF("/media/Drone.glb");
    const {quaternion, position} = props;

    return (
        <primitive
            object={scene.clone()}  // clone so each drone has its own instance
            scale={1}
            position={[position.x, position.y, position.z]}
            quaternion={quaternion}
        />
    );
}

export default function ScanRenderer(props: RenderProps) {
    const voxelsRef = props.voxelsRef;
    const voxels = voxelsRef?.current;
    const voxelSize = props.voxelSize || 1;

    useGLTF.preload('/media/Drone.glb');

    return (
        <div className="relative w-full h-full">
            <Canvas className="!absolute !inset-0" dpr={[1, 2]}>
                <ambientLight intensity={.5} />
                <directionalLight position={[5, 5, 5]} intensity={.8} />
                <directionalLight position={[-5, 2, -2]} intensity={.4} />
                <directionalLight position={[5, 5, -5]} intensity={.3} />

                <Instances>
                    <boxGeometry args={[1 * voxelSize, 1 * voxelSize, 1 * voxelSize]} />
                    <meshStandardMaterial color="red" />
                    {voxels?.map((pos, i) => (
                        <Instance key={i} position={[pos.x, pos.y, pos.z]} />
                    ))}
                </Instances>

                <OrbitControls />

                <Suspense fallback={null}>
                    {Array.from(props.dronesRef?.current?.entries() ?? []).map(([key, d]) => (
                        <DroneModel
                        key={key}
                        position={d.pos}
                        quaternion={d.orientation}
                        />
                    ))}
                </Suspense>

                
            </Canvas>
        </div>
    )
}
