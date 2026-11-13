import * as THREE from 'three';

/** Free the GPU buffers of every mesh, instanced mesh and material under `root`. */
export function disposeTree(root: THREE.Object3D): void {
  root.traverse((obj) => {
    const instanced = obj as THREE.InstancedMesh;
    if (instanced.isInstancedMesh) instanced.dispose();
    const mesh = obj as THREE.Mesh;
    mesh.geometry?.dispose?.();
    const mat = mesh.material;
    if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
    else mat?.dispose?.();
  });
}
