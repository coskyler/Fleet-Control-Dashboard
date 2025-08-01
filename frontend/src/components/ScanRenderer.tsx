import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

export default function ScanRenderer() {
    return (
        <Canvas style={{ width: '100%', height: '100%'}}>
            <ambientLight intensity={.5} />
            <directionalLight position={[5, 5, 5]} intensity={.8} />
            <directionalLight position={[-5, 2, -2]} intensity={.4} />
            <directionalLight position={[5, 5, -5]} intensity={.3} />
            <mesh>
                <boxGeometry />
                <meshStandardMaterial color="red" />
            </mesh>
            <OrbitControls />
            
        </Canvas>
    )
}
