"use client";

import { OrbitControls, RoundedBox } from "@react-three/drei";
import { Canvas, ThreeEvent, useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";

type Target = {
  x: number;
  z: number;
};

const START: Target = { x: 0, z: 1.2 };

function PaperCat({ target }: { target: Target }) {
  const group = useRef<THREE.Group>(null);
  const frontLeft = useRef<THREE.Mesh>(null);
  const frontRight = useRef<THREE.Mesh>(null);
  const backLeft = useRef<THREE.Mesh>(null);
  const backRight = useRef<THREE.Mesh>(null);
  const tail = useRef<THREE.Mesh>(null);

  const [moving, setMoving] = useState(false);
  const walkClock = useRef(0);

  useFrame((_, delta) => {
    const cat = group.current;
    if (!cat) return;

    const dx = target.x - cat.position.x;
    const dz = target.z - cat.position.z;
    const distance = Math.hypot(dx, dz);
    const shouldMove = distance > 0.08;

    setMoving((value) => (value === shouldMove ? value : shouldMove));

    if (shouldMove) {
      const speed = 1.65;
      const step = Math.min(distance, speed * delta);
      cat.position.x += (dx / distance) * step;
      cat.position.z += (dz / distance) * step;

      const desiredRotation = Math.atan2(-dx, -dz);
      const current = new THREE.Euler(0, cat.rotation.y, 0);
      const next = new THREE.Quaternion().setFromEuler(
        new THREE.Euler(0, desiredRotation, 0),
      );
      cat.quaternion.slerp(next, Math.min(1, delta * 8));

      walkClock.current += delta * 8;
    }

    const phase = walkClock.current;
    const swing = shouldMove ? Math.sin(phase) * 0.42 : 0;
    const opposite = shouldMove ? Math.sin(phase + Math.PI) * 0.42 : 0;

    if (frontLeft.current) frontLeft.current.rotation.x = swing;
    if (backRight.current) backRight.current.rotation.x = swing;
    if (frontRight.current) frontRight.current.rotation.x = opposite;
    if (backLeft.current) backLeft.current.rotation.x = opposite;

    if (tail.current) {
      tail.current.rotation.y = Math.sin(phase * 0.7) * 0.32;
      tail.current.rotation.z = -0.3;
    }

    cat.position.y = shouldMove
      ? 0.08 + Math.abs(Math.sin(phase)) * 0.035
      : 0.08 + Math.sin(performance.now() * 0.002) * 0.012;
  });

  const paper = "#f7f4ea";
  const edge = "#d8d1c4";

  return (
    <group ref={group} position={[START.x, 0.08, START.z]}>
      <RoundedBox
        args={[1.5, 0.8, 1.7]}
        radius={0.08}
        smoothness={3}
        position={[0, 0.95, 0]}
        castShadow
      >
        <meshStandardMaterial color={paper} roughness={0.86} />
      </RoundedBox>

      <RoundedBox
        args={[1.18, 1.0, 0.86]}
        radius={0.08}
        smoothness={3}
        position={[0, 1.32, -1.05]}
        castShadow
      >
        <meshStandardMaterial color={paper} roughness={0.86} />
      </RoundedBox>

      <mesh position={[-0.32, 1.47, -1.49]}>
        <boxGeometry args={[0.22, 0.15, 0.04]} />
        <meshStandardMaterial color="#22252b" />
      </mesh>
      <mesh position={[0.32, 1.47, -1.49]}>
        <boxGeometry args={[0.22, 0.15, 0.04]} />
        <meshStandardMaterial color="#22252b" />
      </mesh>
      <mesh position={[0, 1.25, -1.5]}>
        <boxGeometry args={[0.2, 0.12, 0.05]} />
        <meshStandardMaterial color="#ef5f83" />
      </mesh>

      {[
        { ref: frontLeft, x: -0.48, z: -0.52 },
        { ref: frontRight, x: 0.48, z: -0.52 },
        { ref: backLeft, x: -0.48, z: 0.52 },
        { ref: backRight, x: 0.48, z: 0.52 },
      ].map((leg, index) => (
        <mesh
          key={index}
          ref={leg.ref}
          position={[leg.x, 0.45, leg.z]}
          castShadow
        >
          <boxGeometry args={[0.34, 0.9, 0.34]} />
          <meshStandardMaterial color={paper} roughness={0.88} />
        </mesh>
      ))}

      <mesh ref={tail} position={[0, 1.06, 1.28]} rotation={[-0.12, 0, -0.3]} castShadow>
        <boxGeometry args={[0.26, 0.26, 1.6]} />
        <meshStandardMaterial color={paper} roughness={0.88} />
      </mesh>

      <mesh position={[0, 0.94, 0]} scale={[1.02, 1.02, 1.02]}>
        <boxGeometry args={[1.5, 0.8, 1.7]} />
        <meshBasicMaterial color={edge} wireframe transparent opacity={0.08} />
      </mesh>

      {moving && (
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.85, 0.9, 48]} />
          <meshBasicMaterial color="#8b5cf6" transparent opacity={0.18} />
        </mesh>
      )}
    </group>
  );
}

function Room() {
  const [target, setTarget] = useState<Target>(START);

  const floorMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#ebe8df",
        roughness: 0.98,
      }),
    [],
  );

  const handleFloorPointer = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    setTarget({
      x: THREE.MathUtils.clamp(event.point.x, -5.6, 5.6),
      z: THREE.MathUtils.clamp(event.point.z, -4.5, 4.8),
    });
  };

  return (
    <>
      <color attach="background" args={["#dfeafb"]} />
      <fog attach="fog" args={["#dfeafb", 10, 20]} />

      <ambientLight intensity={1.35} />
      <directionalLight
        position={[4, 8, 3]}
        intensity={2.1}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        onPointerDown={handleFloorPointer}
      >
        <planeGeometry args={[14, 12]} />
        <primitive object={floorMaterial} attach="material" />
      </mesh>

      <mesh position={[0, 3, 5.9]} receiveShadow>
        <boxGeometry args={[14, 6, 0.18]} />
        <meshStandardMaterial color="#f9f6ef" roughness={1} />
      </mesh>

      <mesh position={[-6.9, 3, 0]} receiveShadow>
        <boxGeometry args={[0.18, 6, 12]} />
        <meshStandardMaterial color="#f2ede4" roughness={1} />
      </mesh>

      <mesh position={[2.6, 0.025, 1.0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.75, 64]} />
        <meshStandardMaterial color="#c9b7e8" roughness={0.98} />
      </mesh>

      <RoundedBox
        args={[2.4, 0.7, 1.2]}
        radius={0.12}
        smoothness={4}
        position={[-3.4, 0.36, 3.9]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color="#b7cbb5" roughness={0.92} />
      </RoundedBox>

      <RoundedBox
        args={[1.05, 1.05, 1.05]}
        radius={0.16}
        smoothness={4}
        position={[4.5, 0.54, 3.9]}
        castShadow
      >
        <meshStandardMaterial color="#efc88f" roughness={0.88} />
      </RoundedBox>

      <PaperCat target={target} />

      <OrbitControls
        makeDefault
        enablePan={false}
        minDistance={5}
        maxDistance={11}
        minPolarAngle={0.55}
        maxPolarAngle={1.32}
        target={[0, 0.9, 0.4]}
      />
    </>
  );
}

export default function CraftWorld() {
  return (
    <div className="world-wrap">
      <Canvas
        className="world-canvas"
        shadows
        dpr={[1, 1.75]}
        camera={{ position: [5.8, 4.2, 7.2], fov: 48 }}
      >
        <Room />
      </Canvas>
      <div className="world-hint">Нажмите на пол — кот пойдёт туда</div>
    </div>
  );
}
