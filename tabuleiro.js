import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls'

// import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
// import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';

// Scene setup
const $canvas = document.getElementById('tabuleiro');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera();
const renderer = new THREE.WebGLRenderer({canvas: $canvas});
const controls = new OrbitControls(camera, renderer.domElement)

function setup(){
    camera.position.set(0, 2, 5);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);

    // add grid helper
    const gridHelper = new THREE.GridHelper(10, 10);
    scene.add(gridHelper);
}

// Animation loop
let oldTime = performance.now();
let now = performance.now();

function animate() {
    controls.update()
    now = performance.now();
    const deltaTime = now - oldTime;
    oldTime = now;
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

function posicaoTabuleiro(n, l, tamanhoCasa = 1, gapcasa = 0){
    // y = quantas linhas foram percorridas
    let y = Math.floor(n / l);

    // x = progresso na linha (invertido se y for ímpar)
    let x = (y % 2) ?  l - (n % l) - 1 : (n % l);
    return [x, y];
}

function criarTabuleiro(casas, temas, tamanhoLinha = 5){
    const numeroCasas = casas.length;
    const tabuleiro = new THREE.Group();
    const gapCasa = 0.5;
    const tamanhoCasa = 1;

    for(let i = 0; i < numeroCasas; i++){
        const pos = posicaoTabuleiro(i, tamanhoLinha);
        const geometry = new THREE.BoxGeometry(tamanhoCasa, 0.1, tamanhoCasa);
        const material = new THREE.MeshStandardMaterial({
            color: temas[casas[i]].cor
        });
        const square = new THREE.Mesh(geometry, material);
        square.position.set(pos[0]*(tamanhoCasa + gapCasa), 0, pos[1]*(tamanhoCasa + gapCasa));
        tabuleiro.add(square);
    }
    tabuleiro.position.set(-(((tamanhoLinha * (tamanhoCasa + gapCasa)) - 3*gapCasa) / 2), 0, -(((numeroCasas/tamanhoLinha * (tamanhoCasa + gapCasa)) - 3*gapCasa) / 2));
    return tabuleiro;
}

let peoes = [];

export function init(params){
    setup();
    scene.add(criarTabuleiro(params.casas, params.temas));
    adicionarPeoes(params.players)
    animate();
}

function adicionarPeoes(players){
    players.forEach((p)=>{
        if (p.ativo){
            const cube = instantiate()
            peoes.push(cube)
            scene.add(cube)
        }
        else{
            peoes.push({})
        }
    })
}

function instantiate(){
    const cube_geometry = new THREE.BoxGeometry();
    const cube_material = new THREE.MeshStandardMaterial();
    return new THREE.Mesh(cube_geometry, cube_material);
}


function moveTo(playerindex, goal_x, goal_z){
    const peao = peoes[playerindex];
    createjs.Tween.get(peao.position)
    .to({ x: goal_x, z: goal_z}, 800, createjs.Ease.getPowInOut(2));
}
