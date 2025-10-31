import deck from './quiz.json' with {type: 'json'};
import Personagens from './personagens.json' with {type: 'json'};

/* ======= Constants & state ======= */
const TEMAS = ['raluca', 'politica', 'podcasts', 'politiquetes', 'celebretes', 'davy jones', 'alanzoka'];
const animacao = {}
let carta_atual = {tema: '', texto: '', real: false};
let jogadores = [
    {personagem: '', score: 0, ativo: false, posicao: 0},
    {personagem: '', score: 0, ativo: false, posicao: 0},
    {personagem: '', score: 0, ativo: false, posicao: 0},
    {personagem: '', score: 0, ativo: false, posicao: 0}
];
let jogadores_ativos = [];
let jogador_atual = 0;

/* ======= DOM references (cached) ======= */
const $baralho = document.querySelector('#baralho');
const $copo = document.querySelector('#copo');
const $dado = document.querySelector('#dado');
const $iniciar_jogo = document.querySelector('#iniciar_jogo');
const $feiki = document.querySelector('#feiki');
const $real = document.querySelector('#real');
const $cartaTexto = document.querySelector('#carta p');
const $confirmaPersonagens = document.querySelector('#confirma_personagens');

// telas
let $tela_atual = null;
const $entrada = document.getElementById('tela_entrada');
const $selecao = document.getElementById('tela_selecao');
const $tabuleiro = document.getElementById('tela_tabuleiro');
const $jogo = document.getElementById('tela_jogo');
const $podio = document.getElementById('tela_podio');

/* ======= Utility functions ======= */

function trocaTela(telaDestino){
    
    $copo.classList.remove('levantando');
    if ($tela_atual) {
        $tela_atual.style.display = 'none';
    }
    $tela_atual = telaDestino;
    if ($tela_atual) {
        $tela_atual.style.display = '';
    }
}

function comecarJogo(){
    // setup tabuleiro
    const tabuleiro = gerarTabuleiro(20);
    console.log('Tabuleiro gerado:', tabuleiro);
    jogadores.forEach((j, index) => {if (j.ativo) {
        jogadores_ativos.push(index);
        criarPerfil(j);
    }});
    jogador_atual = jogadores_ativos[0];
    import('./tabuleiro.js')

    trocaTela($tabuleiro);
    // turno();
}

function criarPerfil(jogador){
    const $statusPlayers = document.querySelector('#status_players');
    const personagem = jogador.personagem;
    const imagem = Personagens.find((p) => p.character == personagem).imagem;
    $statusPlayers.innerHTML +=
                    `<div class = "player">
                        <img src="${imagem}"/>
                        <div class="coluna">
                            <p>${personagem}</p>
                            <div class="barra">
                                <div class="progresso"><p>0%</p></div>
                            </div>
                        </div>
                    </div>`
}

function rodarDado(){
    let resultado = Math.floor(Math.random() * 6) + 1;
    // colocar animação bonitinha aqui

    return resultado;
}

function confirmaPersonagens(){
    const cursores = document.querySelectorAll('.seletor');
    cursores.forEach((seletor, index) => {
        const personagem = seletor.getAttribute('character');
        jogadores[index].personagem = personagem;
        if (personagem) {
            jogadores[index].ativo = true;
        }
        else {
            jogadores[index].ativo = false;
        }
    });
    console.log('Jogadores confirmados:', jogadores);
    if (jogadores.filter(j => j.ativo).length < 1) {
        alert('Selecione pelo menos um personagem para jogar!');
        return;
    }
    comecarJogo();
}

function gerarTabuleiro(tamanho) {
    return Array.from({length: tamanho}, () => Math.ceil(Math.random() * (TEMAS.length -1)));
    // sem tema raluca porque é chato
}



function deck_pull() {
    // draw a random card from the deck and remove it
    const index = Math.floor(Math.random() * deck.length);
    const carta = deck[index];
    // defensive: if deck is empty, return a default
    if (!carta) return {tema: '', texto: '', real: false};
    deck.splice(index, 1);
    return carta;
}

function carta_tema(tema) {
    // return a random card with the given tema and remove it from deck
    const cartas = deck.filter(c => c.tema === tema);
    if (!cartas.length) return null;
    const sel = cartas[Math.floor(Math.random() * cartas.length)];
    // remove the selected card from original deck
    const idx = deck.indexOf(sel);
    if (idx !== -1) deck.splice(idx, 1);
    return sel;
}

function mostra_carta(carta) {
    if ($cartaTexto) $cartaTexto.innerHTML = carta?.texto ?? '';
}

function verifica(chute) {
    if (carta_atual.real === chute) {
        rato_firula();
        jogadores[jogador_atual].score++;
        console.log('Jogador ' + (jogador_atual + 1) + ' acertou! Pontos:', jogadores[jogador_atual].score);
    }
    else {
        jogadores[jogador_atual].posicao -= valor;
    }
    proximoTurno();
}
let valor = 0
function turno(){
    let movimento = rodarDado();
    jogadores[jogador_atual].posicao += movimento;

    trocaTela($jogo);
    console.log(jogadores[jogador_atual].posicao)
    carta_atual = carta_tema(jogadores[jogador_atual].posicao);
    valor = movimento;
    mostra_carta(carta_atual);


}

function proximoTurno(){
    jogador_atual = jogadores_ativos[(jogadores_ativos.indexOf(jogador_atual) + 1) % jogadores_ativos.length];
    trocaTela($tabuleiro);
    turno();
}

function clicarCopo() {
    $copo.classList.add('tremendo');
    setTimeout(() => $copo.classList.remove('tremendo'), 2000);
    $copo.classList.remove('levantando');
    setTimeout(() => $copo.classList.add('levantando'), 2000);
    // setTimeout(() => $baralho.classList.add('upando'), 4000);
    let dado = rodarDado()
    $dado.setAttribute('src', `imagens/dado${dado}.png`)
    
}

function rato_firula() {
    const rato = document.getElementById('rato');
    if (!rato) return;
    rato.classList.remove('spinner');
    setTimeout(() => rato.classList.add('spinner'), 100);
}

/* ======= Cursor / drag logic ======= */
/**
 * Add selectors to each `.cursor` container and make them draggable.
 * Each selector gets a `player` attribute indicating its player index.
 */
function cursores() {
    document.querySelectorAll('.cursor').forEach((elemento, index) => {
        const seletor = document.createElement('div');
        seletor.classList.add('seletor');
        seletor.classList.add('player' + (index + 1));
        seletor.setAttribute('player', index + 1);
        elemento.appendChild(seletor);
        dragElement(seletor);
    });

    function dragElement(elmnt) {
        // track last client coordinates so we can use elementFromPoint on release
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

        // start drag from the element itself
        elmnt.onmousedown = dragMouseDown;

        function dragMouseDown(e) {
            e = e || window.event;
            e.preventDefault();
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
        }

        function elementDrag(e) {
            e = e || window.event;
            e.preventDefault();
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            elmnt.style.top = (elmnt.offsetTop - pos2) + 'px';
            elmnt.style.left = (elmnt.offsetLeft - pos1) + 'px';
        }

        function closeDragElement() {
            // Use the last recorded cursor client coordinates (pos3, pos4)
            // Temporarily disable pointerEvents on the dragged element so
            // elementFromPoint returns the element underneath.
            const lastClientX = pos3;
            const lastClientY = pos4;
            const prevPointerEvents = elmnt.style.pointerEvents;
            try {
                elmnt.style.pointerEvents = 'none';
                const target = document.elementFromPoint(lastClientX, lastClientY);
                if (target) {
                    // If dropped over a character, log it (or handle selection)
                    const personagem = target.getAttribute('character') || target.closest('[character]')?.getAttribute('character');
                    // console.log('Player ' + elmnt.getAttribute('player') + ' selected:', personagem || target);
                    elmnt.setAttribute('character', personagem || '');
                    let info_personagem = Personagens.find(p => p.character === personagem) || null;
                    if (info_personagem) {
                        const imgUrl = info_personagem.imagem;
                        elmnt.parentElement.style.backgroundImage = `url("${imgUrl}")`;
                        elmnt.parentElement.style.backgroundSize = 'cover';
                        elmnt.parentElement.style.backgroundRepeat = 'no-repeat';
                        elmnt.parentElement.style.backgroundPosition = 'center';
                    }
                    else{
                        elmnt.parentElement.style.backgroundImage = '';
                    }
                }
            } finally {
                elmnt.style.pointerEvents = prevPointerEvents || '';
            }
            document.onmouseup = null;
            document.onmousemove = null;
        }
    }
}

/* ======= Startup / wiring ======= */
function init() {
    // wire buttons

    trocaTela($entrada);
    if ($feiki) $feiki.addEventListener('click', () => verifica(false));
    if ($real) $real.addEventListener('click', () => verifica(true));
    if ($confirmaPersonagens) $confirmaPersonagens.addEventListener('click', () => confirmaPersonagens());
    if ($iniciar_jogo) $iniciar_jogo.addEventListener('click', () => trocaTela($selecao));
    if ($copo) $copo.addEventListener('click', () => clicarCopo());
    if ($baralho) $baralho.addEventListener('click', () => trocaTela($jogo));
    // initial card
    carta_atual = deck_pull();
    mostra_carta(carta_atual);

    // setup cursors
    cursores();
}

// start the app
init();

