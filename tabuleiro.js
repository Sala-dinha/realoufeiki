/* ======= Imports ======= */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { OutlinePass } from 'three/addons/postprocessing/OutlinePass.js';


/* ======= Scene setup & constants ======= */
THREE.Cache.enabled = true;
const $canvas = document.getElementById('tabuleiro');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera();
const renderer = new THREE.WebGLRenderer({canvas: $canvas});
const composer = new EffectComposer(renderer);
const controls = new OrbitControls(camera, renderer.domElement)
const clock = new THREE.Clock();

const outlinePass = new OutlinePass( new THREE.Vector2(window.innerWidth, window.innerHeight), scene, camera);


/* ======= Event listeners ======= */
window.addEventListener('resize', () =>{
    renderer.setSize($canvas.clientWidth, $canvas.clientHeight)
    composer.setSize($canvas.clientWidth, $canvas.clientHeight)

})

/* ======= Scene configuration ======= */
function setup(){
    camera.position.set(0, 2, 5);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);

    // add grid helper
    const gridHelper = new THREE.GridHelper(10, 10);
    scene.add(gridHelper);

    // composer.renderer.outputColorSpace = THREE.SRGBColorSpace;
    // // composer.addPass(new RenderPass(scene, camera));
    // // composer.renderTarget1 = renderer.renderTarget1;
    // outlinePass.edgeStrength = 1.0;
    // outlinePass.visibleEdgeColor.set('#FFFFFF');
    // composer.addPass(outlinePass);
    
}

/* ======= Model loading ======= */
const path_modelo = './modelos/cubao.glb';
const loader = new GLTFLoader();

/* ======= Animation functions ======= */
function animate() {
    const delta = clock.getDelta()
    mixers.forEach((m) => {
        if (m)
        m.update(delta)
    })
    controls.update();
    renderer.render(scene, camera);
    // composer.render();
    requestAnimationFrame(animate);
}

/* ======= Board creation & utilities ======= */
function posicaoTabuleiro(n, l, tamanhoCasa = 1, gapcasa = 0){
    // y = quantas linhas foram percorridas
    let y = Math.floor(n / l);

    // x = progresso na linha (invertido se y for ímpar)
    let x = (y % 2) ?  l - (n % l) - 1 : (n % l);
    return [x, y];
}
const casas = []
function criarTabuleiro(pcasas, temas, tamanhoLinha = 5){
    const numeroCasas = pcasas.length;
    const tabuleiro = new THREE.Group();
    const gapCasa = 0.5;
    const tamanhoCasa = 1;

    for(let i = 0; i < numeroCasas; i++){
        const pos = posicaoTabuleiro(i, tamanhoLinha);
        const geometry = new THREE.BoxGeometry(tamanhoCasa, 0.1, tamanhoCasa);
        const material = new THREE.MeshStandardMaterial({
            color: temas[pcasas[i]].cor
        });
        const square = new THREE.Mesh(geometry, material);
        square.position.set(pos[0]*(tamanhoCasa + gapCasa), 0, pos[1]*(tamanhoCasa + gapCasa));
        casas.push(square)
        tabuleiro.add(square);
    }
    tabuleiro.position.set(-(((tamanhoLinha * (tamanhoCasa + gapCasa)) - 3*gapCasa) / 2), 0, -(((numeroCasas/tamanhoLinha * (tamanhoCasa + gapCasa)) - 3*gapCasa) / 2));
    return tabuleiro;
}
/* ======= State variables ======= */
let tabuleiro;
let mixers = []
let animacoes = [];
let peoes = [];

/* ======= Initialization ======= */
export async function init(params){
    setup();
    tabuleiro = criarTabuleiro(params.casas, params.temas)
    scene.add(tabuleiro);
    await adicionarPeoes(params.players)
    
    animate();
    setTimeout(() => renderer.setSize($canvas.clientWidth, $canvas.clientHeight), 50)
}

/* ======= Debug & testing ======= */
let i = 0;
window.addEventListener('keydown', (e) => {
    if (e.key != 'i') return;
    moveTo(0, i++)
});
let j = 0;
window.addEventListener('keydown', (e) => {
    if (e.key != 'j') return;
    moveTo(1, j++)
});
let k = 0;
window.addEventListener('keydown', (e) => {
    if (e.key != 'k') return;
    moveTo(2, k++)
});
let l = 0;
window.addEventListener('keydown', (e) => {
    if (e.key != 'l') return;
    moveTo(3, l++)
});

async function adicionarPeoes(players){
    console.log(players)
    
    await players.forEach(async (p)=>{
        if (p.ativo){
            const gltf = await loader.loadAsync(path_modelo, () => {})

            const peao = gltf.scene;
            const textura = new THREE.TextureLoader().load(p.imagem);
            const mixer = new THREE.AnimationMixer(peao);
            
            textura.colorSpace = THREE.SRGBColorSpace
            textura.flipY = false;
            
            if (!animacoes.includes(gltf.animations))
            animacoes.push(gltf.animations);

            peao.traverse((child) => {
                if (child.name == 'Cabeca'){
                    child.material.map = textura;
                    child.material.needsUpdate = true;
                }
                if (child.name == 'Membros'){
                    child.material = new THREE.MeshStandardMaterial({color: p.cor})
                    child.material.needsUpdate = true;
                }
            })
            mixers[p.indice] = mixer;
            peoes[p.indice] = peao;
            scene.add(peao)

            peao.scale.set(0.25, 0.25, 0.25)
            peao.position.y += 0.6;
            moveTo(p.indice, 0, 0)
            
        }
        else{
            mixers[p.indice] = null;
            peoes[p.indice] = null;
        }
    })
}

export function moveTo(playerindex, numcasa, t=800){
    const peao = peoes[playerindex];
    const mixer = mixers[playerindex]
    const goal = casas[numcasa].getWorldPosition(new THREE.Vector3())

    // posição
    createjs.Tween.get(peao.position)
    // .call(() => {mixer.clipAction(THREE.AnimationClip.findByName(animacoes[0], 'Andar')).play()})
    .to({ x: goal.x, z: goal.z}, t, createjs.Ease.getPowInOut(2))
    // .call(() => {mixer.clipAction(THREE.AnimationClip.findByName(animacoes[0], 'Andar')).stop()})

    // rodar
    
    const previous = casas[Math.max(0, numcasa-1)].getWorldPosition(new THREE.Vector3())
    const a = new THREE.Vector2(-previous.x, previous.z);
    const b = new THREE.Vector2(-goal.x, goal.z);

    const angulo = (a.sub(b).angle());
    peao.rotation.y = angulo;
}

export function prettyWalk(playerindex, pos_atual, numcasa, t=800){
    let i = pos_atual+1;
    
    const mixer = mixers[playerindex]
    mixer.clipAction(THREE.AnimationClip.findByName(animacoes[0], 'Andar')).play()
    walk(playerindex, i, numcasa)
    function walk(playerindex, i, numcasa){
        const peao = peoes[playerindex];
        const goal = casas[i].getWorldPosition(new THREE.Vector3())
        createjs.Tween.get(peao.position)
        .call(() => {
                const previous = casas[Math.max(0, i-1)].getWorldPosition(new THREE.Vector3())
                const a = new THREE.Vector2(-previous.x, previous.z);
                const b = new THREE.Vector2(-goal.x, goal.z);

                const angulo = (a.sub(b).angle());
                peao.rotation.y = angulo;
        })
        .to({ x: goal.x, z: goal.z}, t, createjs.Ease.getPowInOut(2))
        .call(() => {(++i <= numcasa) ? walk(playerindex, i, numcasa): mixer.clipAction(THREE.AnimationClip.findByName(animacoes[0], 'Andar')).stop()})
    }
}
