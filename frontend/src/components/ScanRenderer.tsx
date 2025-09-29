import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import { Vector3, Quaternion, Matrix4, InstancedMesh } from "three";
import { Suspense, useMemo, useRef, useState, useEffect } from 'react';

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

function DroneModel(props: { quaternion: Quaternion, position: Vector3 }) {
  const { scene } = useGLTF("/media/Drone.glb");
  const { quaternion, position } = props;
  return (
    <primitive
      object={scene.clone()}
      scale={1}
      position={[position.x, position.y, position.z]}
      quaternion={quaternion}
    />
  );
}

function VoxelInstances({
  voxelsRef,
  voxelSize = 1
}: {
  voxelsRef?: React.RefObject<Vector3[]>;
  voxelSize?: number;
}) {
  const meshRef = useRef<InstancedMesh>(null!);
  const m4 = useMemo(() => new Matrix4(), []);
  const lastCount = useRef(0);

  const [capacity, setCapacity] = useState(1024);
  const meshKey = capacity;

  const rewriteAll = useRef(false);
  useEffect(() => {
    lastCount.current = 0;
    rewriteAll.current = true;
  }, [capacity]);

  useFrame(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const arr = voxelsRef?.current ?? [];

    if (arr.length > capacity) {
      const nextPow2 = 1 << Math.ceil(Math.log2(arr.length));
      setCapacity(Math.max(1024, nextPow2));
      return;
    }

    if (rewriteAll.current) {
      for (let i = 0; i < arr.length; i++) {
        const v = arr[i];
        m4.makeTranslation(v.x, v.y, v.z);
        mesh.setMatrixAt(i, m4);
      }
      mesh.instanceMatrix.needsUpdate = true;
      lastCount.current = arr.length;
      rewriteAll.current = false;
    } else {
      for (let i = lastCount.current; i < arr.length; i++) {
        const v = arr[i];
        m4.makeTranslation(v.x, v.y, v.z);
        mesh.setMatrixAt(i, m4);
      }
      if (arr.length !== lastCount.current) {
        mesh.instanceMatrix.needsUpdate = true;
        lastCount.current = arr.length;
      }
    }

    const step = 2000;
    if (mesh.count < arr.length) {
      mesh.count = Math.min(mesh.count + step, arr.length);
    } else if (mesh.count > arr.length) {
      mesh.count = arr.length;
    }
  });

  return (
    <instancedMesh key={meshKey} ref={meshRef} args={[undefined as any, undefined as any, capacity]}>
      <boxGeometry args={[voxelSize, voxelSize, voxelSize]} />
      <meshStandardMaterial color="red" />
    </instancedMesh>
  );
}

export default function ScanRenderer(props: RenderProps) {
  const voxelSize = props.voxelSize || 1;
  useGLTF.preload('/media/Drone.glb');

  return (
    <div className="relative w-full h-full">
      <Canvas className="!absolute !inset-0" dpr={[1, 2]}>
        <ambientLight intensity={.5} />
        <directionalLight position={[5, 5, 5]} intensity={.8} />
        <directionalLight position={[-5, 2, -2]} intensity={.4} />
        <directionalLight position={[5, 5, -5]} intensity={.3} />

        <VoxelInstances voxelsRef={props.voxelsRef} voxelSize={voxelSize} />

        <OrbitControls />

        <Suspense fallback={null}>
          {Array.from(props.dronesRef?.current?.entries() ?? []).map(([key, d]) => (
            <DroneModel key={key} position={d.pos} quaternion={d.orientation} />
          ))}
        </Suspense>
      </Canvas>
    </div>
  );
}
