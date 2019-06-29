const electron = require('electron');
const { ipcRenderer } = electron;

const salidaSerial = document.getElementById("salidaSerial");
const cmdEnviar = document.getElementById("cmdEnviar");
const btnEnviarCmd = document.getElementById("btnEnviarCmd");
const btnLimpiar = document.getElementById("btnLimpiar");
const txtComandoGuardar = document.getElementById("txtComandoGuardar");
const txtParametrosGuardar = document.getElementById("txtParametrosGuardar");
const txtNombreGuardar = document.getElementById("txtNombreGuardar");
const txtDescripcionGuardar = document.getElementById("txtDescripcionGuardar");
const btnGuardarComando = document.getElementById("btnGuardarComando");
const listaComandos = document.getElementById("listaComandos");
//const socket = io.connect('http://localhost:4000', { 'forceNew': true });
var arregloComandos = [];
var arregloBotones = document.getElementsByClassName("comando");

function agregarComando(index, comando) {

    listaComandos.innerHTML +=
        `<a class="waves-effect waves-light btn comando" name=${index} >${comando.nombre}</a><br>`;

}

function agregarLinea(quienEs, texto) {
    salidaSerial.innerHTML +=
        "<br> <span class='purple-text text-lighten-5'><b>" + quienEs + "></b>" + texto + "</span>";
    salidaSerial.scrollTop = salidaSerial.scrollHeight
}

function limpiarSalida() {
    salidaSerial.innerHTML = "";
}

function enviarComando() {
    agregarLinea("Comando Enviado", cmdEnviar.value);
    ipcRenderer.send('comando', cmdEnviar.value);
    cmdEnviar.value = "";
}

function actualizarGuardarComandos(comando){
    let split = comando.split("=");
    txtNombreGuardar.value = split[0];
    txtComandoGuardar.value = split[0];
    if(comando.includes("=")){
        txtParametrosGuardar.value = split[1];
    }
}

ipcRenderer.on("linea", (e, texto) => {
    agregarLinea("Serial Dice", texto);
});


ipcRenderer.on('comandos', (e, comandos) => {
    //console.log(comandos.comandos);
    arregloComandos = comandos.comandos;
    console.log(arregloComandos.length);

    listaComandos.innerHTML = "";
    for (let i = 0; i < arregloComandos.length; i++) {
        const comando = arregloComandos[i];
        agregarComando(i, comando);
    }
    arregloBotones = document.getElementsByClassName("comando");
    for (let i = 0; i < arregloBotones.length; i++) {
        const boton = arregloBotones[i];
        boton.onclick = (e) => {
            e.preventDefault();
            let comando = arregloComandos[boton.name];
            console.log(comando);
            cmdEnviar.value = comando.comando;
            if (comando.parametros.length > 0) {
                cmdEnviar.value += `=${comando.parametros}`;
            }
            cmdEnviar.focus();
            actualizarGuardarComandos(cmdEnviar.value);

        }
    }
});
btnGuardarComando.onclick = () => {
    let comandoNuevo = {
        nombre : txtNombreGuardar.value,
        descripcion : txtDescripcionGuardar.value,
        comando : txtComandoGuardar.value,
        parametros : txtParametrosGuardar.value

    }
    arregloComandos.push(comandoNuevo);

    ipcRenderer.send("comando nuevo", {comandos: arregloComandos} );
}

btnEnviarCmd.onclick = (e) => {
    enviarComando();
}

cmdEnviar.onkeypress = (e) => {

    if (e.keyCode == 13) {
        enviarComando();
    } else {
        actualizarGuardarComandos(cmdEnviar.value);
    }

};



btnLimpiar.onclick = () => {
    limpiarSalida();
}

setTimeout(() => {
    ipcRenderer.send("lista comandos", {comandos: arregloComandos} );
}, 1000);